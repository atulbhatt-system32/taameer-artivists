"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, AlertTriangle, Camera, ChevronLeft, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { sendCheckInEmail } from "@/app/actions/booking";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  pass_type: string;
  quantity: number;
  checked_in_at: string | null;
  additional_attendees?: { fullName: string; age: string; gender: string }[];
}

interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const scanProcessingRef = useRef(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
      try {
        const { data, error: fetchError } = await supabase
          .from("registrations")
          .select("*")
          .eq("id", id)
          .single();
        if (fetchError || !data) throw fetchError;
        setRegistration(data as Registration);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) init();
  }, [id]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    if (showScanner) {
      scanProcessingRef.current = false;
      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader-verify");
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              if (scanProcessingRef.current) return;
              scanProcessingRef.current = true;
              try {
                if (html5QrCode && html5QrCode.isScanning) await html5QrCode.stop();
              } catch (e) { console.error(e); }
              let newId = "";
              try {
                const url = new URL(decodedText);
                const pathParts = url.pathname.split("/").filter(Boolean);
                newId = pathParts[pathParts.length - 1] || "";
              } catch { newId = decodedText.trim(); }
              if (newId && newId.length > 10) {
                setShowScanner(false);
                window.location.replace(`/kumaon-fest/verify/${newId}`);
              } else {
                scanProcessingRef.current = false;
                setShowScanner(false);
              }
            },
            () => {}
          );
        } catch (err) {
          console.error(err);
          setShowScanner(false);
        }
      };
      startScanner();
    }
    return () => {
      scanProcessingRef.current = false;
      if (html5QrCode && html5QrCode.isScanning) html5QrCode.stop().catch(console.error);
    };
  }, [showScanner]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      alert("Failed to check in: " + updateError.message);
    } else {
      const { data } = await supabase.from("registrations").select("*").eq("id", id).single();
      setRegistration(data as Registration);
      sendCheckInEmail(id);
    }
    setCheckInLoading(false);
  };

  const handleResetCheckIn = async () => {
    if (!registration) return;
    setConfirmAction({
      title: "Undo Check-In?",
      message: `Reset entry status for ${registration.full_name}?`,
      onConfirm: async () => {
        setCheckInLoading(true);
        const { error: resetError } = await supabase
          .from("registrations")
          .update({ checked_in_at: null })
          .eq("id", id);
        if (resetError) {
          alert("Failed to reset: " + resetError.message);
        } else {
          const { data } = await supabase.from("registrations").select("*").eq("id", id).single();
          setRegistration(data as Registration);
        }
        setCheckInLoading(false);
        setConfirmAction(null);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-yellow-500 font-black uppercase tracking-widest text-[10px]">Validating Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black mb-2 text-center tracking-tighter">Pass Not Found</h1>
        <p className="text-gray-400 text-center text-sm leading-relaxed mb-8">This ticket is invalid or has been revoked.</p>
        <Link href="/kumaon-fest/tickets">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black px-8 h-12 rounded-xl">Book New Ticket</Button>
        </Link>
      </div>
    );
  }

  const isCheckedIn = !!registration.checked_in_at;
  const accentColor = isCheckedIn ? "bg-amber-500" : "bg-yellow-400";
  const accentText = isCheckedIn ? "text-amber-500" : "text-yellow-400";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 bg-gray-950/95 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white active:opacity-70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </button>
        <p className="text-sm font-black uppercase tracking-widest text-white">My Ticket</p>
        <div className="w-16" /> {/* spacer */}
      </header>

      {/* ── TICKET CARD ── */}
      <div className="flex-1 px-4 py-4 pb-32 max-w-lg mx-auto w-full">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5">

          {/* Top: yellow/amber section */}
          <div className={`${accentColor} px-5 pt-4 pb-5 text-gray-950`}>
            {/* Status badge */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-950/10 border border-gray-950/15 text-[9px] font-black uppercase tracking-widest">
                {isCheckedIn ? (
                  <><AlertTriangle className="w-3 h-3" /> Already Checked In</>
                ) : (
                  <><CheckCircle2 className="w-3 h-3" /> Valid Digital Pass</>
                )}
              </div>
            </div>

            {/* Event name */}
            <div className="text-center mb-3">
              <h1 className="text-2xl font-black tracking-tight uppercase leading-none">Kumaon Fest</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mt-0.5">2026</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-xl shadow-xl">
                <QRCodeSVG
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  size={190}
                  level="H"
                />
              </div>
            </div>

            {/* Event details */}
            <div className="flex items-center justify-center gap-3 mt-3 opacity-70">
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <Calendar className="w-3 h-3" />
                30 May 2026
              </div>
              <div className="w-px h-3 bg-gray-950/30" />
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <MapPin className="w-3 h-3" />
                Haldwani
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative bg-gray-900 flex items-center">
            <div className={`absolute -left-3 w-6 h-6 rounded-full bg-gray-950`} />
            <div className="flex-1 border-t-2 border-dashed border-gray-700 mx-3" />
            <div className={`absolute -right-3 w-6 h-6 rounded-full bg-gray-950`} />
          </div>

          {/* Bottom: dark section — attendee details */}
          <div className="bg-gray-900 px-5 py-4 space-y-3">

            {/* Attendee name */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Attendee</p>
              <p className="text-xl font-black tracking-tight">{registration.full_name}</p>
            </div>

            <div className="h-px bg-gray-800" />

            {/* Pass type + checked-in time */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Pass</p>
                <p className={`text-base font-black uppercase ${accentText}`}>{registration.pass_type}</p>
              </div>
              {isCheckedIn && registration.checked_in_at && (
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Entered At</p>
                  <p className="text-sm font-bold text-amber-400">
                    {new Date(registration.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>

            {/* Ticket ID */}
            <p className="text-[8px] font-mono text-gray-700 uppercase tracking-wider">{registration.id}</p>
          </div>
        </div>
      </div>

      {/* ── FIXED BOTTOM ACTIONS ── */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-950/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-2 print:hidden">
        {isAdmin ? (
          <>
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="w-full h-14 rounded-2xl text-lg font-black bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30"
              >
                {checkInLoading ? "Processing..." : "✓  Verify & Entry"}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleResetCheckIn}
                disabled={checkInLoading}
                className="w-full h-11 rounded-xl text-xs font-bold text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/5 uppercase tracking-widest"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Undo Check-In
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="w-full h-12 rounded-2xl font-bold border-gray-800 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Camera className="w-4 h-4 mr-2" /> Scan Next Ticket
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => window.print()}
              className="w-full h-14 rounded-2xl font-black bg-yellow-400 hover:bg-yellow-500 text-gray-950 text-base shadow-lg shadow-yellow-500/20"
            >
              ⬇  Save as PDF
            </Button>
            <p className="text-center text-[10px] text-gray-600 font-medium pb-1">
              Choose &quot;Save as PDF&quot; in the print dialog
            </p>
          </>
        )}
      </div>

      {/* ── QR SCANNER OVERLAY ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-6 backdrop-blur-3xl bg-black/90"
          >
            <div className="w-full max-w-sm aspect-square bg-black rounded-3xl border-2 border-yellow-500/50 overflow-hidden relative shadow-2xl">
              <div id="reader-verify" className="w-full h-full" />
            </div>
            <p className="mt-6 text-white font-black text-lg tracking-tight">Scanning...</p>
            <Button onClick={() => setShowScanner(false)} className="mt-8 h-13 px-10 rounded-2xl bg-white text-black font-black">Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFIRM DIALOG ── */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 backdrop-blur-md bg-black/60">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-black text-center mb-1">{confirmAction.title}</h3>
              <p className="text-gray-400 text-center text-sm mb-6">{confirmAction.message}</p>
              <div className="flex flex-col gap-2">
                <Button onClick={confirmAction.onConfirm} disabled={checkInLoading} className="h-13 rounded-xl font-black bg-amber-500 text-gray-950">
                  Confirm Reset
                </Button>
                <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
