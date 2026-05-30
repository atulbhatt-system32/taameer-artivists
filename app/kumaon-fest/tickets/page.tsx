export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getEventConfig } from "@/app/actions/booking";
import { redirect } from "next/navigation";
import TicketsClient from "./tickets-client";

export default async function TicketsPage() {
  const config = await getEventConfig();
  const bookingsClosed = config?.bookings_closed === "true" || config?.bookings_closed === true;

  if (bookingsClosed) {
    redirect("/kumaon-fest/tickets/closed");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">

      {/* ── TOPBAR ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/kumaon-fest" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
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

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <TicketsClient />

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-white/5 bg-gray-950 text-center">
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Taameer Artivists Foundation · Kumaon Fest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
