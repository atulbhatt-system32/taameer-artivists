"use client";

import { BookingWizard } from "@/components/booking-wizard";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin, Clock, ShieldCheck, Ticket, ChevronRight, ShoppingBasket } from "lucide-react";
import { useState, useEffect } from "react";
import { getEventConfig } from "@/app/actions/booking";
import { motion } from "framer-motion";

export default function TicketsPage() {
  const [step, setStep] = useState(0);
  const [bookingsClosed, setBookingsClosed] = useState(false);

  useEffect(() => {
    getEventConfig().then((config) => {
      setBookingsClosed(config?.bookings_closed === "true" || config?.bookings_closed === true);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">

      {/* ── TOPBAR ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/kumaon-fest"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.15em]">Back</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8">
              <Image src="/new-images/IMG_6419.PNG" fill alt="Logo" className="object-contain" />
            </div>
            <span className="text-sm font-black tracking-tighter">
              KUMAON <span className="text-yellow-500">FEST</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-16 min-h-screen lg:grid lg:grid-cols-[380px_1fr] lg:gap-0">
        
        {/* ── RIGHT: BOOKING WIZARD (Top on Mobile) ────────────────────── */}
        <main className="py-10 lg:pl-10 lg:order-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-8">
            <Link href="/kumaon-fest" className="hover:text-yellow-500 transition-colors">Festival</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-400">Book Tickets</span>
          </div>

          {/* Ambient glow */}
          <div className="relative flex flex-col">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Booking Wizard or Closed Screen */}
            <div className="order-2 lg:order-1">
              {bookingsClosed ? (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-xl mx-auto space-y-8"
                >
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-center shadow-2xl">
                      <Ticket className="w-11 h-11 text-yellow-500" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-black">!</span>
                    </div>
                  </div>

                  {/* Badge + Heading */}
                  <div className="space-y-4">
                    <span className="inline-block border border-gray-600 text-gray-300 text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                      Ticket Sales Closed
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                      Online Bookings <span className="text-yellow-500">Ended</span>
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed max-w-md mx-auto">
                      Thank you Haldwani for the incredible support! Ticket bookings for the Kumaon Fest 2026 are now officially closed.
                    </p>
                  </div>

                  {/* Info card */}
                  <div className="w-full bg-gray-900/80 border border-gray-800 rounded-2xl p-6 text-left space-y-4">
                    <p className="text-white text-xs font-black uppercase tracking-widest">Already Purchased a Ticket?</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Your ticket was sent via email to your registered address. You can show the PDF or QR code at the entry gate.
                    </p>
                    <div className="border-t border-gray-800 pt-4">
                      <p className="text-yellow-400 text-sm leading-relaxed">
                        ⚠️ <span className="font-semibold">Note:</span> If you don&apos;t see it in your inbox, please make sure to check your{" "}
                        <span className="underline font-semibold">Spam, Promotions, or Junk</span> folders.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        💬 Contact Support
                      </a>
                      <Link
                        href="/kumaon-fest"
                        className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm flex items-center justify-center transition-all active:scale-95"
                      >
                        Back to Festival
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <BookingWizard variant="full" onStepChange={setStep} />
              )}
            </div>

            {/* Venue Map (Bottom on Desktop, Top on Mobile) */}
            <div className="order-1 lg:order-2 mt-0 lg:mt-12 mb-10 lg:mb-0 group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Venue Layout</h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-auto italic opacity-0 group-hover:opacity-100 transition-opacity">Know Your Zone</span>
              </div>
              <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-gray-900/40 shadow-2xl transition-all duration-500 hover:border-yellow-500/30">
                <Image
                  src="/venue-map.jpg"
                  width={1440}
                  height={810}
                  alt="Venue Map"
                  className="w-full h-auto object-contain scale-100 hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </main>

        {/* ── LEFT: EVENT INFO PANEL (Last on Mobile) ────────────────── */}
        <aside className={`lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto py-10 lg:pr-10 lg:border-r border-white/5 flex flex-col gap-6 lg:order-1 transition-all duration-500 ${step > 0 ? "hidden lg:flex" : "flex"}`}>

          {/* Poster */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] w-full shadow-2xl shadow-black/60 bg-gray-950">
            <Image
              src="/new-images/uniyal.png"
              fill
              alt="Kumaon Fest 2026 Poster"
              className="object-contain"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
            {/* Badge on poster */}
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-gray-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Summer Carnival 2026
              </span>
            </div>
          </div>

          {/* Event Title */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              The Kumaon Fest<br />
              <span className="text-yellow-500">Summer Carnival</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
              An unforgettable night of music, art & culture
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {[
              { icon: CalendarDays, label: "Date", value: "30 May 2026, Saturday" },
              { icon: Clock,        label: "Time", value: "5:00 PM – 10:00 PM" },
              { icon: MapPin,       label: "Venue", value: "Kripa Sindhu Banquet, Haldwani" },
              { icon: ShoppingBasket,       label: "Stalls", value: "15+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</div>
                  <div className="text-sm text-white font-semibold">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/5" />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "2000+", label: "Expected" },
              { num: "10+",   label: "Artists" },
              { num: "5 hrs", label: "Non-stop" },
            ].map(({ num, label }) => (
              <div key={label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-yellow-500">{num}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{label}</div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="space-y-2 mt-auto">
            {[
              { icon: ShieldCheck, text: "100% Secure — Powered by Cashfree" },
              { icon: Ticket,      text: "E-ticket sent instantly to your email" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[10px] text-gray-600 font-semibold">
                <Icon className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-white/5 bg-gray-950 text-center">
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Taameer Artivists Foundation · Kumaon Fest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
