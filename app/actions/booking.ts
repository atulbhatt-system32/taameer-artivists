"use server"

import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import dns from "dns/promises";

async function hasMxRecord(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function validateEmailAddress(email: string): Promise<{ valid: boolean; error?: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: "Enter a valid email address." };
  const valid = await hasMxRecord(email);
  if (!valid) return { valid: false, error: "Email address not found. Check and try again." };
  return { valid: true };
}

export interface RegistrationData {
  fullName: string;
  age: string;
  gender: string;
  whatsappNo: string;
  contactNo: string;
  email: string;
  passType: string;
  quantity: string;
  address: string;
  willPlayDandiya?: string;
  instagramHandle?: string;
  additionalAttendees?: { fullName: string; age: string; gender: string }[];
  agreed: boolean;
}

export interface PaymentConfirmationData {
  registrationId: string;
  paymentId: string;
  orderId: string;
  signature: string;
}

// Initialize Cashfree
const cashfreeAppId = process.env.CASHFREE_APP_ID || "";
const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY || "";

async function getCashfreeClient() {
  if (!cashfreeAppId || !cashfreeSecretKey) {
    throw new Error("Cashfree API keys are missing! Check your .env file.");
  }
  const { Cashfree, CFEnvironment } = await import("cashfree-pg");
  const env = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;
  return new Cashfree(env, cashfreeAppId, cashfreeSecretKey);
}

export async function createCashfreeOrder(amount: number, customerDetails: { name: string; email: string; phone: string }) {
  if (!amount || amount <= 0) {
    throw new Error("Invalid order amount. Cannot create a ₹0 order.");
  }

  const cashfree = await getCashfreeClient();

  const orderId = `KF_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const request = {
    order_amount: amount,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: `cust_${Date.now()}`,
      customer_name: customerDetails.name,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
    },
    order_meta: {
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/kumaon-fest/tickets?order_id={order_id}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cashfree/webhook`,
    },
  };

  // Retry up to 2 times for transient errors (e.g. 504 gateway timeout)
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await cashfree.PGCreateOrder(request);
      return {
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        orderStatus: response.data.order_status,
      };
    } catch (error: any) {
      lastError = error;
      const status = error?.response?.status || error?.status;
      console.error(`Cashfree Order Error (attempt ${attempt}/3, status: ${status}):`, error?.message || error);
      // Only retry on 5xx server errors
      if (status && status >= 500 && attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // backoff
        continue;
      }
      break;
    }
  }
  console.error("Cashfree Order Error (all retries failed):", lastError);
  throw new Error("Failed to create payment order. Please try again.");
}

// Link the Cashfree order_id to the registration row(s) so webhook can find them
export async function linkOrderToRegistration(registrationId: string, orderId: string) {
  // Fetch the registration to get the group_id
  const { data: reg, error: fetchError } = await supabase
    .from("registrations")
    .select("group_id")
    .eq("id", registrationId)
    .single();

  if (fetchError || !reg) {
    console.error("linkOrderToRegistration: registration not found", registrationId);
    return;
  }

  const groupId = reg.group_id;
  const isGroup = !!groupId;

  // Update all rows in the group (or just the single row) with the pending order id
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ pending_order_id: orderId })
    .filter(isGroup ? "group_id" : "id", "eq", isGroup ? groupId : registrationId);

  if (updateError) {
    console.error("linkOrderToRegistration: update failed", updateError);
  }
}

export async function preRegisterUser(data: RegistrationData) {
  console.log("SERVER: preRegisterUser hit with email:", data.email);

  // Reject registration if bookings are closed
  const config = await getEventConfig();
  const isBookingsClosed = config?.bookings_closed === "true" || config?.bookings_closed === true;

  if (isBookingsClosed) {
    throw new Error("Online bookings for Kumaon Fest 2026 are now closed.");
  }

  // Clean up stale pending rows for this email before creating new ones.
  // Rows with no pending_order_id = user never reached payment, safe to delete.
  // Rows with a pending_order_id older than 1 hour = payment session expired.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  await supabase
    .from("registrations")
    .delete()
    .eq("email", data.email)
    .eq("payment_status", "pending")
    .or(`pending_order_id.is.null,created_at.lt.${oneHourAgo}`);

  const attendees = [
    { fullName: data.fullName, age: data.age, gender: data.gender },
    ...(data.additionalAttendees || [])
  ];

  const groupId = `GROUP_${crypto.randomUUID().slice(0, 8)}`;
  
  const insertData = attendees.map(attendee => ({
    full_name: attendee.fullName,
    age: attendee.age,
    gender: attendee.gender,
    whatsapp_no: data.whatsappNo,
    contact_no: data.contactNo,
    email: data.email,
    pass_type: data.passType,
    quantity: 1, // Individual ticket
    address: data.address,
    will_play_dandiya: data.willPlayDandiya || "No",
    instagram_handle: data.instagramHandle || null,
    group_id: groupId,
    agreed: data.agreed,
    payment_status: "pending",
  }));

  const { data: regDataList, error } = await supabase
    .from("registrations")
    .insert(insertData)
    .select();

  if (error || !regDataList || regDataList.length === 0) {
    console.error("Supabase Error:", error);
    throw new Error(`Failed to pre-register: ${error?.message || "Unknown error"}`);
  }

  // Return the ID of the first one for the payment initiation
  return { success: true, registrationId: regDataList[0].id };
}

export async function confirmPayment(data: PaymentConfirmationData) {
  console.log("SERVER: confirmPayment hit for registrationId:", data.registrationId, "orderId:", data.orderId);

  // 1. SECURITY: Verify payment with Cashfree API
  try {
    const cashfree = await getCashfreeClient();
    const orderResponse = await cashfree.PGOrderFetchPayments(data.orderId);
    const payments = orderResponse.data;
    
    if (!payments || payments.length === 0) {
      throw new Error("No payments found for this order.");
    }

    const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");
    if (!successfulPayment) {
      throw new Error("Payment not completed successfully.");
    }
    if (!successfulPayment.payment_amount || successfulPayment.payment_amount <= 0) {
      throw new Error("Invalid payment amount. Zero-value payments are not accepted.");
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cashfree verification error:", error.message);
    throw new Error("Payment verification failed.");
  }

  // 2. Fetch primary registration to get Group ID
  //    Try by registrationId first, fallback to pending_order_id if not found
  let primaryReg: any = null;
  
  const { data: regById, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", data.registrationId)
    .single();

  if (!fetchError && regById) {
    primaryReg = regById;
  } else if (data.orderId) {
    // Fallback: find by pending_order_id (covers cases where registrationId is stale)
    const { data: regByOrder } = await supabase
      .from("registrations")
      .select("*")
      .eq("pending_order_id", data.orderId)
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    primaryReg = regByOrder;
  }

  if (!primaryReg) {
    // Check if already paid (idempotent — payment may have already been confirmed by webhook)
    const { data: alreadyPaid } = await supabase
      .from("registrations")
      .select("id")
      .eq("order_id", data.orderId)
      .eq("payment_status", "paid")
      .limit(1);
    
    if (alreadyPaid && alreadyPaid.length > 0) {
      console.log("confirmPayment: already confirmed by webhook for order", data.orderId);
      return { success: true, emailError: null };
    }
    throw new Error("Registration not found.");
  }

  // Already paid check (idempotent)
  if (primaryReg.payment_status === "paid") {
    console.log("confirmPayment: already paid for registration", primaryReg.id);
    return { success: true, emailError: null };
  }

  const groupId = primaryReg.group_id;
  const isGroup = !!groupId;

  // 3. Update status to paid for the whole group
  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      payment_id: data.paymentId,
      order_id: data.orderId,
      payment_status: "paid",
    })
    .filter(isGroup ? 'group_id' : 'id', 'eq', isGroup ? groupId : data.registrationId);

  if (updateError) {
    throw new Error("Failed to update payment status.");
  }

  // 3b. Fetch all tickets in the group for the email
  const { data: allTickets } = await supabase
    .from("registrations")
    .select("*")
    .eq(isGroup ? "group_id" : "id", isGroup ? groupId : data.registrationId);

  if (!allTickets || allTickets.length === 0) {
    throw new Error("Tickets not found after update.");
  }

  // 4. Send Email
  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;

  let emailError: string | null = null;
  let emailSent = false;

  const mxValid = await hasMxRecord(primaryReg.email);
  if (!mxValid) {
    emailError = `Email address not reachable — domain has no mail server: ${primaryReg.email}`;
    await supabase
      .from("registrations")
      .update({ email_sent: false })
      .filter(isGroup ? "group_id" : "id", "eq", isGroup ? groupId : data.registrationId);
    return { success: true, emailSent: false, emailError };
  }

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Generate individual ticket sections
    const ticketSections = allTickets.map(ticket => {
      const verifyUrl = `${domain}/kumaon-fest/verify/${ticket.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;
      
      return `
        <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 35px; page-break-inside: avoid;">
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
      const info = await transporter.sendMail({
        from: `"The Kumaon Fest" <${smtpUser}>`,
        to: primaryReg.email,
        subject: `Booking Confirmation (${allTickets.length} Tickets) - The Kumaon Fest`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
              <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 40px 20px; text-align: center; color: #000000;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">The Kumaon Fest 2026</h1>
                <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Your Entry Passes Are Ready</p>
              </div>
              <div style="padding: 40px; color: #1f2937;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${primaryReg.full_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                  Your booking for <strong>The Kumaon Fest 2026</strong> is confirmed! We've generated <strong>${allTickets.length} separate tickets</strong> for your group. Each attendee must present their own QR code at the gate.
                </p>
                
                ${ticketSections}

                <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7;">
                  <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">
                    Tip: You can forward this email to other attendees or save the screenshots of individual QR codes.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #94a3b8; font-size: 11px; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    30 May 2026 &middot; <a href="https://www.google.com/maps/search/?api=1&query=Kripa+Sindhu+Banquet+Haldwani" style="color: #EAB308; text-decoration: none;">Haldwani, Uttarakhand</a>
                  </p>
                  <div style="margin-bottom: 16px;">
                    <a href="https://www.google.com/maps/search/?api=1&query=Kripa+Sindhu+Banquet+Haldwani" style="display: inline-block; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 99px;">
                      📍 Kripa Sindhu Banquet, Haldwani — View on Map
                    </a>
                  </div>
                  <p style="color: #cbd5e1; font-size: 10px; margin: 0; font-weight: 500;">
                    © 2026 Taameer Artivists Foundation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
      });
      emailSent = info.rejected.length === 0;
      if (!emailSent) emailError = `Rejected by SMTP: ${info.rejected.join(", ")}`;
      console.log("Email sent:", info.messageId, "| accepted:", info.accepted, "| rejected:", info.rejected);
    } catch (err) {
      emailError = String(err);
    }

    // Persist email delivery status back to DB
    await supabase
      .from("registrations")
      .update({ email_sent: emailSent })
      .filter(isGroup ? "group_id" : "id", "eq", isGroup ? groupId : data.registrationId);
  }

  return { success: true, emailSent, emailError };
}

export async function sendCheckInEmail(id: string) {
  const { data: ticket, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) return { success: false };

  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;
  if (!smtpUser || !smtpPass) return { success: false };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  const checkedInDate = ticket.checked_in_at ? new Date(ticket.checked_in_at) : null;
  const checkedInAt = checkedInDate
    ? checkedInDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })
    : "";
  const checkedInDay = checkedInDate
    ? checkedInDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
    : "";

  try {
    await transporter.sendMail({
      from: `"The Kumaon Fest" <${smtpUser}>`,
      to: ticket.email,
      subject: `You're Checked In! 🎉 — Kumaon Fest 2026`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;padding:40px 10px;">
            <tr><td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">

                <!-- Header -->
                <tr>
                  <td align="center" style="background-color:#16a34a;padding:44px 40px 36px;">
                    <div style="width:72px;height:72px;background-color:#ffffff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
                      <span style="font-size:36px;">✅</span>
                    </div>
                    <h1 style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.04em;margin:0;line-height:1.1;">You're Checked In!</h1>
                    <p style="color:#bbf7d0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:10px 0 0;">Kumaon Fest 2026 · Summer Carnival</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Hi ${ticket.full_name},</p>
                    <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 32px;">Your entry has been verified by our team. Welcome to the biggest night in Haldwani — enjoy every moment! 🎶</p>

                    <!-- Entry card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:24px 28px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-bottom:16px;border-bottom:1px solid #e2e8f0;">
                                <span style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:4px;">Pass Type</span>
                                <span style="font-size:17px;font-weight:800;color:#0f172a;">${ticket.pass_type}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top:16px;">
                                <span style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:4px;">Entry Time</span>
                                <span style="font-size:17px;font-weight:800;color:#16a34a;">${checkedInAt} · ${checkedInDay}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Venue note -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fefce8;border:1px solid #fef9c3;border-radius:16px;margin-bottom:32px;">
                      <tr>
                        <td style="padding:18px 22px;">
                          <p style="margin:0;font-size:13px;color:#854d0e;font-weight:600;">📍 Kripa Sindhu Lawn, Haldwani &nbsp;·&nbsp; Gates open 5:00 PM onwards</p>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0;">
                      © 2026 Taameer Artivists Foundation
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(`Failed to fetch registrations: ${error.message}`);
  }

  return data;
}

export async function checkInUser(id: string) {
  const { data, error } = await supabase
    .from("registrations")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(`Failed to check in: ${error.message}`);
  }

  return data;
}

export async function resendConfirmationEmail(id: string) {
  // 1. Fetch the ticket to get group info
  const { data: triggerTicket, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !triggerTicket) {
    throw new Error("Registration not found.");
  }

  if (triggerTicket.payment_status !== "paid") {
    throw new Error("Cannot send confirmation for unpaid registration.");
  }

  const groupId = triggerTicket.group_id;
  const isGroup = !!groupId;

  // 2. Fetch all tickets in the group
  const { data: allTickets } = await supabase
    .from("registrations")
    .select("*")
    .eq(isGroup ? "group_id" : "id", isGroup ? groupId : id);

  if (!allTickets || allTickets.length === 0) {
    throw new Error("Tickets not found.");
  }

  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials missing.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Generate individual ticket sections
  const ticketSections = allTickets.map(ticket => {
    const verifyUrl = `${domain}/kumaon-fest/verify/${ticket.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}`;
    
    return `
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 28px; padding: 32px; margin-bottom: 30px; border-left: 4px solid #EAB308;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" style="padding-bottom: 20px;">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Attendee Name</span>
              <span style="font-size: 18px; font-weight: 800; color: #ffffff;">${ticket.full_name}</span>
            </td>
            <td align="right" style="padding-bottom: 20px;">
              <span style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Pass Type</span>
              <span style="background-color: rgba(234, 179, 8, 0.1); color: #EAB308; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(234, 179, 8, 0.2);">${ticket.pass_type}</span>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #ffffff; border-radius: 20px; padding: 25px; text-align: center; margin: 15px 0 25px 0;">
          <img src="${qrCodeUrl}" alt="Ticket QR Code" width="200" height="200" style="display: block; margin: 0 auto; border: 0;" />
          <p style="font-size: 10px; color: #94a3b8; margin: 15px 0 0 0; font-family: 'Courier New', Courier, monospace; font-weight: 700;">TICKET ID: ${ticket.id}</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <a href="${verifyUrl}" style="display: inline-block; background-color: #EAB308; color: #020617; padding: 14px 32px; border-radius: 14px; font-size: 14px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.2);">View Full Ticket</a>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join("");

  try {
    await transporter.sendMail({
      from: `"The Kumaon Fest" <${smtpUser}>`,
      to: triggerTicket.email,
      subject: `Booking Confirmed! (${allTickets.length} Tickets) - The Kumaon Fest 2026`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Booking is Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; min-height: 100vh; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="100%" maxWidth="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color: #EAB308; padding: 50px 40px;">
                      <img src="https://czhimmclvuvbamybpgmy.supabase.co/storage/v1/object/public/event-assets/logo.png" width="80" height="80" alt="Kumaon Fest Logo" style="display: block; margin-bottom: 24px; border: 0;" />
                      <h1 style="color: #000000; font-size: 32px; font-weight: 900; letter-spacing: -0.04em; margin: 0; text-transform: uppercase; line-height: 1;">
                        KUMAON <span style="color: #000000; opacity: 0.7;">FEST</span>
                      </h1>
                      <p style="color: #000000; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; margin: 12px 0 0 0; opacity: 0.8;">Summer Carnival 2026</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 45px;">
                      <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 15px 0;">Hi ${triggerTicket.full_name},</h2>
                      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 35px 0;">
                        Your entry passes are ready! We&apos;ve confirmed your booking for <strong>${allTickets.length} attendees</strong>. Please present these QR codes at the gate for entry.
                      </p>
                      
                      ${ticketSections}

                      <!-- Important Notes -->
                      <div style="background-color: #fffbeb; border: 2px dashed #fef3c7; border-radius: 24px; padding: 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="left">
                              <h3 style="color: #92400e; font-size: 14px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Entry Protocol</h3>
                              <p style="color: #b45309; font-size: 13px; line-height: 1.5; margin: 0;">
                                • Screenshots are allowed for offline use.<br />
                                • Each QR is unique to an attendee.<br />
                                • Carry a valid ID for age verification at the gate.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 0 45px 45px 45px;">
                      <p style="color: #94a3b8; font-size: 11px; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        30 May 2026 · <a href="https://www.google.com/maps/search/?api=1&query=Kripa+Sindhu+Banquet+Haldwani" style="color: #EAB308; text-decoration: none;">Haldwani, Uttarakhand</a>
                      </p>
                      <div style="margin-bottom: 20px;">
                        <a href="https://www.google.com/maps/search/?api=1&query=Kripa+Sindhu+Banquet+Haldwani" style="display: inline-flex; align-items: center; color: #64748b; font-size: 12px; font-weight: 700; text-decoration: none; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 99px;">
                          📍 View Location on Map
                        </a>
                      </div>
                      <p style="color: #cbd5e1; font-size: 10px; margin: 0; font-weight: 500;">
                        © 2026 Taameer Artivists Foundation.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (err) {
    throw new Error("Failed to send email: " + String(err));
  }
}

// Keep legacy for backward compatibility if needed, but updated to use new flow
export async function registerUser(data: RegistrationData & { paymentId: string; orderId: string; signature: string }) {
  const preResult = await preRegisterUser(data as RegistrationData);
  return confirmPayment({
    registrationId: preResult.registrationId,
    paymentId: data.paymentId,
    orderId: data.orderId,
    signature: data.signature,
  });
}

export async function recoverPaymentByOrderId(orderId: string) {
  const cashfree = await getCashfreeClient();

  // 1. Verify payment succeeded
  const orderResponse = await cashfree.PGOrderFetchPayments(orderId);
  const payments = orderResponse.data;

  if (!payments || payments.length === 0) {
    throw new Error("No payments found for this order.");
  }

  const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");
  if (!successfulPayment) {
    throw new Error("Payment not completed successfully.");
  }

  // 2. Get the order to find the customer email
  const orderDetails = await cashfree.PGFetchOrder(orderId);
  const customerEmail = orderDetails.data?.customer_details?.customer_email;

  if (!customerEmail) {
    throw new Error("Could not retrieve customer email from order.");
  }

  // 3. Find the most recent pending registration matching this email
  const { data: pendingRegs, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("email", customerEmail)
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  if (fetchError || !pendingRegs || pendingRegs.length === 0) {
    throw new Error("No pending registration found for this payment. It may already be confirmed.");
  }

  // Use the group_id of the most recent pending registration
  const primaryReg = pendingRegs[0];
  const groupId = primaryReg.group_id;
  const isGroup = !!groupId;

  // 4. Update all registrations in the group to paid
  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      payment_id: successfulPayment.cf_payment_id?.toString() || "",
      order_id: orderId,
      payment_status: "paid",
    })
    .filter(isGroup ? "group_id" : "id", "eq", isGroup ? groupId : primaryReg.id);

  if (updateError) {
    throw new Error("Failed to update payment status.");
  }

  // 5. Fetch all confirmed tickets
  const { data: allTickets } = await supabase
    .from("registrations")
    .select("*")
    .eq(isGroup ? "group_id" : "id", isGroup ? groupId : primaryReg.id);

  if (!allTickets || allTickets.length === 0) {
    throw new Error("Tickets not found after update.");
  }

  // 6. Send confirmation email
  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const ticketSections = allTickets.map(ticket => {
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
                  Your booking for <strong>The Kumaon Fest 2026</strong> is confirmed!
                </p>
                ${ticketSections}
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Recovery email error:", err);
    }
  }

  return { success: true, registrationId: primaryReg.id, ticketCount: allTickets.length };
}

export async function getEventConfig() {
  noStore(); // Prevent Next.js from caching this server action
  try {
    const { data, error } = await supabase
      .from("event_config")
      .select("*");
      
    if (error) {
      console.error("Supabase config error:", error);
      throw error;
    }
    
    return data.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  } catch (err) {
    console.warn("Event config fetch failed, using local defaults");
    return null;
  }
}

export async function getEventPricing() {
  noStore();
  try {
    const { data, error } = await supabase
      .from("event_pricing")
      .select("*")
      .order("created_at", { ascending: true });
      
    if (error) throw error;
    
    // Map snake_case to camelCase for the frontend
    return data.map((tier: any) => ({
      ...tier,
      earlyBirdPrice: tier.early_bird_price,
      regularPrice: tier.regular_price,
      features: Array.isArray(tier.features) ? tier.features : [],
      highlightFeatures: Array.isArray(tier.highlight_features) ? tier.highlight_features : [],
      offlineOnly: tier.offline_only === true,
      enquirePhone: tier.enquire_phone ?? null,
      enquireText: tier.enquire_text ?? null,
      bookingFormLink: tier.booking_form_link ?? null,
    }));
  } catch (err) {
    console.warn("Event pricing fetch failed, using local defaults");
    return null;
  }
}
