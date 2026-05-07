"use server"

import { supabase } from "@/lib/supabase";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
  willPlayDandiya: string;
  instagramHandle?: string;
  agreed: boolean;
}

export interface PaymentConfirmationData {
  registrationId: string;
  paymentId: string;
  orderId: string;
  signature: string;
}

export async function createRazorpayOrder(amount: number) {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    console.error("Razorpay API keys are missing! Check your .env file.");
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    return order;
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw new Error("Failed to create payment order");
  }
}

export async function preRegisterUser(data: RegistrationData) {
  console.log("SERVER: preRegisterUser hit with email:", data.email);

  const { data: regData, error } = await supabase
    .from("registrations")
    .insert([
      {
        full_name: data.fullName,
        age: data.age,
        gender: data.gender,
        whatsapp_no: data.whatsappNo,
        contact_no: data.contactNo,
        email: data.email,
        pass_type: data.passType,
        quantity: parseInt(data.quantity) || 1,
        address: data.address,
        will_play_dandiya: data.willPlayDandiya,
        instagram_handle: data.instagramHandle,
        agreed: data.agreed,
        payment_status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error);
    throw new Error(`Failed to pre-register: ${error.message}`);
  }

  return { success: true, registrationId: regData.id };
}

export async function confirmPayment(data: PaymentConfirmationData) {
  console.log("SERVER: confirmPayment hit for registrationId:", data.registrationId);

  // 1. SECURITY: Verify Razorpay Signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  
  if (keySecret) {
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(data.orderId + "|" + data.paymentId)
      .digest("hex");

    if (generated_signature !== data.signature) {
      console.error("FRAUD ATTEMPT: Invalid payment signature detected for registrationId:", data.registrationId);
      throw new Error("Payment verification failed.");
    }
  }

  // 2. Fetch user details for email
  const { data: regData, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", data.registrationId)
    .single();

  if (fetchError || !regData) {
    throw new Error("Registration not found.");
  }

  // 3. Update status to paid
  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      payment_id: data.paymentId,
      order_id: data.orderId,
      payment_status: "paid",
    })
    .eq("id", data.registrationId);

  if (updateError) {
    throw new Error("Failed to update payment status.");
  }

  // 4. Send Email
  const smtpUser = process.env.GOOGLE_SMTP_USER;
  const smtpPass = process.env.GOOGLE_SMTP_PASS;

  let emailError: string | null = null;
  let emailMessageId: string | null = null;

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${domain}/kumaon-fest/verify/${regData.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;

    try {
      const info = await transporter.sendMail({
        from: `"The Kumaon Fest" <${smtpUser}>`,
        to: regData.email,
        subject: "Booking Confirmation - The Kumaon Fest",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
              <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 40px 20px; text-align: center; color: #000000;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">The Kumaon Fest 2025</h1>
                <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Official Entry Pass</p>
              </div>
              <div style="padding: 40px; color: #1f2937;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${regData.full_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                  Your booking for <strong>The Kumaon Fest 2025</strong> is confirmed! Here is your entry ticket. 
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 35px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding-bottom: 15px;">
                        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Pass Type</span>
                        <strong style="font-size: 16px; color: #1e293b;">${regData.pass_type}</strong>
                      </td>
                      <td style="padding-bottom: 15px; text-align: right;">
                        <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Quantity</span>
                        <strong style="font-size: 16px; color: #1e293b;">${regData.quantity} Pax</strong>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="text-align: center; margin-bottom: 35px;">
                  <img src="${qrCodeUrl}" alt="Ticket QR Code" style="display: block; width: 200px; height: 200px; margin: 0 auto;" />
                </div>
                <div style="text-align: center;">
                  <a href="${verifyUrl}" style="display: inline-block; background-color: #EAB308; color: #000000; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none;">View Digital Ticket</a>
                </div>
              </div>
            </div>
          </div>
        `,
      });
      emailMessageId = info.messageId;
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
  const { data: regData, error: fetchError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !regData) {
    throw new Error("Registration not found.");
  }

  if (regData.payment_status !== "paid") {
    throw new Error("Cannot send confirmation for unpaid registration.");
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
  const verifyUrl = `${domain}/kumaon-fest/verify/${regData.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;

  try {
    await transporter.sendMail({
      from: `"The Kumaon Fest" <${smtpUser}>`,
      to: regData.email,
      subject: "Booking Confirmation - The Kumaon Fest",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 40px 20px; text-align: center; color: #000000;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">The Kumaon Fest 2025</h1>
              <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;">Official Entry Pass</p>
            </div>
            <div style="padding: 40px; color: #1f2937;">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${regData.full_name}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                As requested, here is your booking confirmation for <strong>The Kumaon Fest 2025</strong>. 
              </p>
              <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 35px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 15px;">
                      <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Pass Type</span>
                      <strong style="font-size: 16px; color: #1e293b;">${regData.pass_type}</strong>
                    </td>
                    <td style="padding-bottom: 15px; text-align: right;">
                      <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Quantity</span>
                      <strong style="font-size: 16px; color: #1e293b;">${regData.quantity} Pax</strong>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="text-align: center; margin-bottom: 35px;">
                <img src="${qrCodeUrl}" alt="Ticket QR Code" style="display: block; width: 200px; height: 200px; margin: 0 auto;" />
              </div>
              <div style="text-align: center;">
                <a href="${verifyUrl}" style="display: inline-block; background-color: #EAB308; color: #000000; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none;">View Digital Ticket</a>
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
export async function registerUser(data: any) {
  const preResult = await preRegisterUser(data);
  return confirmPayment({
    registrationId: preResult.registrationId,
    paymentId: data.paymentId,
    orderId: data.orderId,
    signature: data.signature,
  });
}
