import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";

const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY || "";

function verifyWebhookSignature(payload: string, timestamp: string, signature: string): boolean {
  const data = timestamp + payload;
  const computed = crypto
    .createHmac("sha256", cashfreeSecretKey)
    .update(data)
    .digest("base64");
  return computed === signature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const signature = req.headers.get("x-webhook-signature") || "";

    // Verify signature
    if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
      console.error("Webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const type = event?.type;

    // Only handle successful payments
    if (type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({ received: true });
    }

    const orderId: string = event?.data?.order?.order_id;
    const cfPaymentId: string = String(event?.data?.payment?.cf_payment_id || "");
    const paymentStatus: string = event?.data?.payment?.payment_status;

    if (!orderId || paymentStatus !== "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    // Check if already confirmed (idempotency)
    const { data: alreadyPaid } = await supabase
      .from("registrations")
      .select("id")
      .eq("order_id", orderId)
      .eq("payment_status", "paid")
      .limit(1);

    if (alreadyPaid && alreadyPaid.length > 0) {
      return NextResponse.json({ received: true, note: "already confirmed" });
    }

    // Find the pending registration by order_id stored during pre-registration
    // First try direct order_id match (set when order was linked)
    let pendingRegs: any[] | null = null;
    const { data: byOrderId } = await supabase
      .from("registrations")
      .select("*")
      .eq("pending_order_id", orderId)
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (byOrderId && byOrderId.length > 0) {
      pendingRegs = byOrderId;
    } else {
      // Fallback: match by customer email from webhook payload.
      // Only look within the last hour to avoid matching stale abandoned rows.
      const customerEmail: string = event?.data?.customer_details?.customer_email;
      if (customerEmail) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: byEmail } = await supabase
          .from("registrations")
          .select("*")
          .eq("email", customerEmail)
          .eq("payment_status", "pending")
          .gte("created_at", oneHourAgo)
          .order("created_at", { ascending: false })
          .limit(10);
        pendingRegs = byEmail;
      }
    }

    if (!pendingRegs || pendingRegs.length === 0) {
      console.error("Webhook: no pending registration found for order", orderId);
      return NextResponse.json({ received: true, note: "no pending registration found" });
    }

    const primaryReg = pendingRegs[0];
    const groupId = primaryReg.group_id;
    const isGroup = !!groupId;

    // Confirm payment
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ payment_id: cfPaymentId, order_id: orderId, payment_status: "paid" })
      .filter(isGroup ? "group_id" : "id", "eq", isGroup ? groupId : primaryReg.id);

    if (updateError) {
      console.error("Webhook: update error", updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    const { data: allTickets } = await supabase
      .from("registrations")
      .select("*")
      .eq(isGroup ? "group_id" : "id", isGroup ? groupId : primaryReg.id);

    if (!allTickets || allTickets.length === 0) {
      return NextResponse.json({ received: true, note: "tickets not found after update" });
    }

    // Send confirmation email
    const smtpUser = process.env.GOOGLE_SMTP_USER;
    const smtpPass = process.env.GOOGLE_SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });

      const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const ticketSections = allTickets.map((ticket: any) => {
        const verifyUrl = `${domain}/kumaon-fest/verify/${ticket.id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;
        return `
          <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 35px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 15px;">
                  <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Attendee</span>
                  <strong style="font-size: 18px; color: #1e293b;">${ticket.full_name}</strong>
                </td>
                <td style="padding-bottom: 15px; text-align: right;">
                  <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Pass Type</span>
                  <strong style="font-size: 14px; color: #1e293b;">${ticket.pass_type}</strong>
                </td>
              </tr>
            </table>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${qrCodeUrl}" alt="Ticket QR Code" style="display: block; width: 180px; height: 180px; margin: 0 auto;" />
              <p style="font-size: 10px; color: #94a3b8; margin-top: 10px; font-family: monospace;">TICKET ID: ${ticket.id}</p>
            </div>
            <div style="text-align: center;">
              <a href="${verifyUrl}" style="display: inline-block; background-color: #EAB308; color: #000000; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;">View Digital Ticket</a>
            </div>
          </div>
        `;
      }).join("");

      try {
        await transporter.sendMail({
          from: `"The Kumaon Fest" <${smtpUser}>`,
          to: primaryReg.email,
          subject: `Booking Confirmation (${allTickets.length} Tickets) - The Kumaon Fest`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 40px 20px; text-align: center; color: #000000;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800;">The Kumaon Fest 2026</h1>
                  <p style="margin: 10px 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Your Entry Passes Are Ready</p>
                </div>
                <div style="padding: 40px; color: #1f2937;">
                  <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${primaryReg.full_name}</strong>,</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                    Your booking for <strong>The Kumaon Fest 2026</strong> is confirmed! We've generated <strong>${allTickets.length} separate ticket(s)</strong> for your group.
                  </p>
                  ${ticketSections}
                  <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">
                      Tip: You can forward this email to other attendees or save screenshots of individual QR codes.
                    </p>
                  </div>
                  <div style="text-align: center; margin-top: 30px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 11px; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      30 May 2026 &middot; Haldwani, Uttarakhand
                    </p>
                    <p style="color: #cbd5e1; font-size: 10px; margin: 0; font-weight: 500;">
                      © 2026 Taameer Artivists Foundation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Webhook: email send failed", emailErr);
        // Don't fail the webhook — payment is already confirmed
      }
    }

    return NextResponse.json({ received: true, confirmed: true, tickets: allTickets.length });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
