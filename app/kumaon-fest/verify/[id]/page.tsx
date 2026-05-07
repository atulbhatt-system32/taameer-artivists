"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, User, Ticket, XCircle, AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  pass_type: string;
  quantity: number;
  checked_in_at: string | null;
}

interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

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
      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader-verify");
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              let newId = "";
              try {
                const url = new URL(decodedText);
                const pathParts = url.pathname.split("/");
                newId = pathParts[pathParts.length - 1];
              } catch (e) {
                newId = decodedText;
              }

              if (newId && newId.length > 10) {
                html5QrCode?.stop().then(() => {
                  setShowScanner(false);
                  window.location.replace(`/kumaon-fest/verify/${newId}`);
                });
              }
            },
            () => {}
          );
        } catch (err) {
          console.error("Scanner start error:", err);
          setShowScanner(false);
        }
      };
      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
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
      const { data } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .single();
      setRegistration(data as Registration);
    }
    setCheckInLoading(false);
  };

  const handleResetCheckIn = async () => {
    if (!registration) return;
    setConfirmAction({
      title: "Undo Check-In?",
      message: `Are you sure you want to RESET the entry status for ${registration.full_name}?`,
      onConfirm: async () => {
        setCheckInLoading(true);
        const { error: resetError } = await supabase
          .from("registrations")
          .update({ checked_in_at: null })
          .eq("id", id);

        if (resetError) {
          alert("Failed to reset: " + resetError.message);
        } else {
          const { data } = await supabase
            .from("registrations")
            .select("*")
            .eq("id", id)
            .single();
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
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Validating Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-6 text-white">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
           <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-black mb-2 text-center tracking-tighter">Pass Not Found</h1>
        <p className="text-gray-400 text-center max-w-xs leading-relaxed font-bold mb-8">
          This digital ticket is either invalid or has been revoked.
        </p>
        <Link href="/kumaon-fest/tickets">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black px-8 h-12 rounded-xl">Book New Ticket</Button>
        </Link>
      </div>
    );
  }

  const isCheckedIn = !!registration.checked_in_at;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <main className="max-w-xl mx-auto py-10">
        <div className="bg-gray-900 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className={`p-10 text-center space-y-6 ${isCheckedIn ? "bg-amber-500 text-gray-950" : "bg-yellow-500 text-gray-950"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] border border-gray-950/20 bg-gray-950/5">
              {isCheckedIn ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> Already Checked In
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid Digital Pass
                </>
              )}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter uppercase">Kumaon Fest</h1>
              <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-60">Official Entry Ticket</p>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-2xl border-4 border-gray-950/5">
              <QRCodeSVG 
                value={typeof window !== "undefined" ? window.location.href : ""} 
                size={180}
                level="H"
              />
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid gap-6">
              <div className="flex items-center gap-5 p-6 bg-gray-950/50 border border-gray-800 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800">
                   <User className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-0.5">Attendee</p>
                  <p className="font-bold text-xl">{registration.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-6 bg-gray-950/50 border border-gray-800 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center border border-gray-800">
                   <Ticket className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-0.5">Pass Details</p>
                  <p className="font-bold text-xl uppercase">{registration.pass_type} (x{registration.quantity})</p>
                </div>
              </div>

              {isCheckedIn && registration.checked_in_at && (
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
                   <p className="text-xs text-amber-500 font-bold leading-relaxed text-center">
                     ⚠️ Used for entry at {new Date(registration.checked_in_at).toLocaleTimeString()}
                   </p>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-4 pt-4">
                {!isCheckedIn ? (
                  <Button 
                    onClick={handleCheckIn}
                    disabled={checkInLoading}
                    className="w-full h-16 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 text-white shadow-2xl"
                  >
                    {checkInLoading ? "Processing..." : "Verify & Entry"}
                  </Button>
                ) : (
                  <Button 
                    variant="ghost"
                    onClick={handleResetCheckIn}
                    disabled={checkInLoading}
                    className="w-full h-12 rounded-xl text-xs font-bold text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/5 uppercase tracking-widest"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" /> Undo Check-In
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="w-full h-14 rounded-2xl font-bold border-gray-800 text-gray-400 hover:text-white"
                >
                  <Camera className="w-4 h-4 mr-2" /> Scan Next
                </Button>
              </div>
            )}
            
            <div className="text-center opacity-30">
               <p className="text-[9px] font-black uppercase tracking-widest">Ticket ID: {registration.id}</p>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-6 backdrop-blur-3xl bg-black/90"
          >
            <div className="w-full max-w-lg aspect-square bg-black rounded-[2.5rem] border-2 border-yellow-500/50 overflow-hidden relative shadow-2xl">
              <div id="reader-verify" className="w-full h-full" />
              <div className="absolute inset-0 border-8 border-black/40 pointer-events-none" />
            </div>
            <p className="mt-8 text-white font-black text-xl tracking-tight text-center">Scanning...</p>
            <Button onClick={() => setShowScanner(false)} className="mt-12 h-14 px-10 rounded-2xl bg-white text-black font-black">Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-center mb-2">{confirmAction.title}</h3>
              <p className="text-gray-400 text-center text-sm mb-8">{confirmAction.message}</p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={confirmAction.onConfirm}
                  disabled={checkInLoading}
                  className="h-14 rounded-xl font-black bg-amber-500 text-gray-950"
                >
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
