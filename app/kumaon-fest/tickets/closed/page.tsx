export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Ticket } from "lucide-react";
import { getEventConfig } from "@/app/actions/booking";
import { redirect } from "next/navigation";

export default async function ClosedPage() {
  const config = await getEventConfig();
  const bookingsClosed = config?.bookings_closed === "true" || config?.bookings_closed === true;

  // If bookings re-opened, send them back to the tickets page
  if (!bookingsClosed) {
    redirect("/kumaon-fest/tickets");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
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
            <span className="text-sm font-black tracking-tighter">KUMAON <span className="text-yellow-500">FEST</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center text-center max-w-xl w-full space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-900 rounded-[2rem] border border-gray-800 flex items-center justify-center shadow-2xl">
              <Ticket className="w-11 h-11 text-yellow-500" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
}
