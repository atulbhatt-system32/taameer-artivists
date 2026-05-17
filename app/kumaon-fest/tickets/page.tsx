"use client";

import { BookingWizard } from "@/components/booking-wizard";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin, Clock, ShieldCheck, Ticket, ChevronRight, ShoppingBasket } from "lucide-react";
import { useState } from "react";

export default function TicketsPage() {
  const [step, setStep] = useState(0);

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
            
            {/* Booking Wizard (Top on Desktop, Bottom on Mobile if Map is at top) */}
            <div className="order-2 lg:order-1">
              <BookingWizard variant="full" onStepChange={setStep} />
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
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] w-full shadow-2xl shadow-black/60">
            <Image
              src="/new-images/uniyal.png"
              fill
              alt="Kumaon Fest 2026 Poster"
              className="object-cover"
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
