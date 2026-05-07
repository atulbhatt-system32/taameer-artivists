"use client";

import { BookingWizard } from "@/components/booking-wizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between px-4 max-w-7xl mx-auto">
          <Link href="/kumaon-fest" className="flex items-center space-x-3 group text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Festival</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500 shadow-lg shadow-yellow-500/20">
              <span className="text-sm font-black text-gray-950">KF</span>
            </div>
            <span className="text-xl font-black tracking-tighter">
              KUMAON <span className="text-yellow-500">FEST</span>
            </span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="container px-4 max-w-7xl mx-auto">
          <BookingWizard variant="full" />
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 bg-gray-950 text-center">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
          © 2025 Kumaon Fest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
