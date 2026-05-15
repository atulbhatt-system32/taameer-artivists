"use server"

import { supabase } from "@/lib/supabase";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { unstable_noStore as noStore } from "next/cache";

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
const cashfreeEnv = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION"
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

function getCashfreeClient() {
  if (!cashfreeAppId || !cashfreeSecretKey) {
    throw new Error("Cashfree API keys are missing! Check your .env file.");
  }
  return new Cashfree(cashfreeEnv, cashfreeAppId, cashfreeSecretKey);
}

export async function createCashfreeOrder(amount: number, customerDetails: { name: string; email: string; phone: string }) {
  const cashfree = getCashfreeClient();

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
    },
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    return {
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
      orderStatus: response.data.order_status,
    };
  } catch (error) {
    console.error("Cashfree Order Error:", error);
    throw new Error("Failed to create payment order");
  }
}

export async function preRegisterUser(data: RegistrationData) {
  console.log("SERVER: preRegisterUser hit with email:", data.email);

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
    instagram_handle: groupId, // Using this as group_id
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
  console.log("SERVER: confirmPayment hit for registrationId:", data.registrationId);

  // 1. SECURITY: Verify payment with Cashfree API
  try {
    const cashfree = getCashfreeClient();
    const orderResponse = await cashfree.PGOrderFetchPayments(data.orderId);
    const payments = orderResponse.data;
    
    if (!payments || payments.length === 0) {
      throw new Error("No payments found for this order.");
    }

    const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");
    if (!successfulPayment) {
      throw new Error("Payment not completed successfully.");
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cashfree verification error:", error.message);
    throw new Error("Payment verification failed.");
  }

  // 2. Fetch primary registration to get Group ID
  const { data: primaryReg, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", data.registrationId)
    .single();

  if (fetchError || !primaryReg) {
    throw new Error("Registration not found.");
  }

  const groupId = primaryReg.instagram_handle;
  const isGroup = groupId?.startsWith("GROUP_");

  // 3. Update status to paid for the whole group
  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      payment_id: data.paymentId,
      order_id: data.orderId,
      payment_status: "paid",
    })
    .filter(isGroup ? 'instagram_handle' : 'id', 'eq', isGroup ? groupId : data.registrationId);

  if (updateError) {
    throw new Error("Failed to update payment status.");
  }

  // 3b. Fetch all tickets in the group for the email
  const { data: allTickets } = await supabase
    .from("registrations")
    .select("*")
    .eq(isGroup ? "instagram_handle" : "id", isGroup ? groupId : data.registrationId);

  if (!allTickets || allTickets.length === 0) {
    throw new Error("Tickets not found after update.");
  }

  // 4. Send Email
  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;

  let emailError: string | null = null;

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
              </div>
            </div>
          </div>
        `,
      });
      console.log("Email sent:", info.messageId);
    } catch (err) {
      emailError = String(err);
    }
  }

  return { success: true, emailError };
}

export async function getRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
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

  const groupId = triggerTicket.instagram_handle;
  const isGroup = groupId?.startsWith("GROUP_");

  // 2. Fetch all tickets in the group
  const { data: allTickets } = await supabase
    .from("registrations")
    .select("*")
    .eq(isGroup ? "instagram_handle" : "id", isGroup ? groupId : id);

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
    await transporter.sendMail({
      from: `"The Kumaon Fest" <${smtpUser}>`,
      to: triggerTicket.email,
      subject: `Booking Confirmation (${allTickets.length} Tickets) - The Kumaon Fest`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 40px 20px; text-align: center; color: #000000;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">The Kumaon Fest 2026</h1>
              <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Your Entry Passes Are Ready</p>
            </div>
            <div style="padding: 40px; color: #1f2937;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${triggerTicket.full_name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                As requested, here are your booking details for <strong>The Kumaon Fest 2026</strong>. Each attendee must present their own QR code at the gate.
              </p>
              
              ${ticketSections}

              <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7;">
                <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">
                  Tip: You can forward this email to other attendees or save the screenshots of individual QR codes.
                </p>
              </div>
            </div>
          </div>
        </div>
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
    return data;
  } catch (err) {
    console.warn("Event pricing fetch failed, using local defaults");
    return null;
  }
}
