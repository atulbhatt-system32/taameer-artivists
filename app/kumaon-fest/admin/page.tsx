"use client";

import React, { useState, useEffect, useRef } from "react";
import { getRegistrations, getEventPricing, getEventConfig, recoverPaymentByOrderId } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import {
  Users,
  Ticket,
  IndianRupee,
  Search,
  Camera,
  X,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  MailX,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
// Event data is fully dynamic from Supabase — no local JSON fallback

// Remove static tiers constant
// const tiers = eventsData.featuredEvent.pricing;

interface GroupMember {
  id: string;
  full_name: string;
  gender?: string;
  checked_in_at: string | null;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  pass_type: string;
  quantity: number;
  payment_id: string;
  order_id?: string;
  payment_status: string;
  checked_in_at: string | null;
  created_at: string;
  gender?: string;
  age?: string;
  whatsapp_no?: string;
  contact_no?: string;
  address?: string;
  instagram_handle?: string;
  group_id?: string;
  email_sent?: boolean;
  additional_attendees?: { fullName: string; age: string; gender: string }[];
  _groupMembers?: GroupMember[];
  _groupSize?: number;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dbPricing, setDbPricing] = useState<any[]>([]);
  const [dbConfig, setDbConfig] = useState<any>(null);
  
  // All data comes from Supabase — no local fallbacks
  const tiers = dbPricing;
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [filterPass, setFilterPass] = useState<string>("All");
  const [recoveryOrderId, setRecoveryOrderId] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const scanProcessingRef = useRef(false);
  const [scanStatus, setScanStatus] = useState<null | "loading" | "success" | "error">(null);
  const [scanMessage, setScanMessage] = useState("");
  const scanCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scanGroupInfo, setScanGroupInfo] = useState<{
    groupId: string;
    total: number;
    checkedIn: number;
    remaining: { id: string; full_name: string }[];
  } | null>(null);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthorized(true);
        fetchData();
      }
      setAuthLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setIsAuthorized(true);
        fetchData();
      } else if (event === "SIGNED_OUT") {
        setIsAuthorized(false);
        setRegistrations([]);
        setNotification({ type: "info", message: "Logged out successfully" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regs, pricing, config] = await Promise.all([
        getRegistrations(),
        getEventPricing(),
        getEventConfig()
      ]);
      setRegistrations(regs as Registration[]);
      if (pricing) setDbPricing(pricing);
      if (config) setDbConfig(config);
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to fetch bookings." });
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setAuthLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setNotification({ type: "error", message: authError.message });
    } else {
      setNotification({ type: "success", message: "Welcome back, Admin!" });
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ["S.No", "Name", "Email", "WhatsApp", "Pass", "Group Size", "Amount Paid (INR)", "Order ID", "Payment ID", "Status", "Booked On"];
    const rows: (string | number)[][] = [];
    let serial = 0;

    for (const reg of filtered) {
      const groupSize = reg._groupSize ?? reg.quantity ?? 1;
      const amountPaid = reg.payment_status === "paid" ? getTotalPaid(reg) : "";
      const orderId = reg.order_id || "";
      const paymentId = reg.payment_id || "";
      const date = new Date(reg.created_at).toLocaleDateString("en-IN");
      const status = (checked: string | null, payStatus: string) =>
        checked ? "Entered" : payStatus;

      // Lead buyer row
      rows.push([
        ++serial,
        `"${reg.full_name}"`,
        reg.email,
        reg.whatsapp_no || reg.contact_no || "",
        reg.pass_type,
        groupSize,
        amountPaid,
        orderId,
        paymentId,
        status(reg.checked_in_at, reg.payment_status),
        date,
      ]);

      // Group member rows — same booking, individual check-in status
      if (reg._groupMembers?.length) {
        for (const member of reg._groupMembers) {
          rows.push([
            ++serial,
            `"${member.full_name}"`,
            "",
            "",
            reg.pass_type,
            "",
            "",
            orderId,
            paymentId,
            status(member.checked_in_at, reg.payment_status),
            date,
          ]);
        }
      }
    }

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taameer_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleRecoverPayment = async () => {
    if (!recoveryOrderId.trim()) return;
    setIsRecovering(true);
    setNotification(null);
    try {
      const result = await recoverPaymentByOrderId(recoveryOrderId.trim());
      setNotification({ type: "success", message: `Payment recovered! ${result.ticketCount} ticket(s) confirmed and email sent.` });
      setRecoveryOrderId("");
      fetchData();
    } catch (err: any) {
      setNotification({ type: "error", message: `Recovery failed: ${err.message}` });
    } finally {
      setIsRecovering(false);
    }
  };

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    if (showScanner) {
      scanProcessingRef.current = false;
      setScanStatus(null);
      setScanMessage("");
      setScanGroupInfo(null);
      if (scanCloseTimerRef.current) clearTimeout(scanCloseTimerRef.current);

      // useBarCodeDetectorIfSupported: uses the native browser BarcodeDetector API on
      // Chrome/Edge/Android where available — far more reliable than the WASM fallback.
      scanner = new Html5Qrcode("admin-reader", {
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      } as any);

      scanner.start(
        { facingMode: "environment" },
        {
          fps: 25,
          qrbox: { width: 300, height: 300 },
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        } as any,
        async (decodedText) => {
          if (scanProcessingRef.current) return;
          scanProcessingRef.current = true;

          try {
            if (scanner && scanner.isScanning) await scanner.stop();
          } catch (e) {
            console.error("Scanner stop error:", e);
          }

          setScanStatus("loading");
          setScanMessage("Checking ticket…");

          let id = "";
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split("/").filter(Boolean);
            id = pathParts[pathParts.length - 1] || "";
          } catch {
            id = decodedText.trim();
          }

          const scheduleClose = (ms: number) => {
            scanCloseTimerRef.current = setTimeout(() => {
              setShowScanner(false);
              setScanStatus(null);
              setScanGroupInfo(null);
            }, ms);
          };

          if (id && id.length > 10) {
            try {
              const { data: existingTicket, error: fetchError } = await supabase
                .from("registrations")
                .select("checked_in_at, full_name, group_id")
                .eq("id", id)
                .single();

              if (fetchError || !existingTicket) {
                throw new Error("Ticket not found.");
              }

              if (existingTicket.checked_in_at) {
                throw new Error(`Already checked in at ${new Date(existingTicket.checked_in_at).toLocaleTimeString()}`);
              }

              const { data, error: updateError } = await supabase
                .from("registrations")
                .update({ checked_in_at: new Date().toISOString() })
                .eq("id", id)
                .select("full_name, pass_type, quantity, checked_in_at")
                .single();

              if (updateError) throw new Error(updateError.message);

              setScanStatus("success");
              setScanMessage(`${data.full_name}\n${data.pass_type} · x${data.quantity}`);
              setNotification({ type: "success", message: `✅ ${data.full_name} checked in — ${data.pass_type} (x${data.quantity})` });
              fetchData();

              // For group bookings: show remaining members and offer bulk check-in
              if (existingTicket.group_id) {
                const { data: groupMembers } = await supabase
                  .from("registrations")
                  .select("id, full_name, checked_in_at")
                  .eq("group_id", existingTicket.group_id);

                if (groupMembers && groupMembers.length > 1) {
                  const remaining = groupMembers.filter(m => m.id !== id && !m.checked_in_at);
                  const checkedIn = groupMembers.length - remaining.length;
                  if (remaining.length > 0) {
                    setScanGroupInfo({
                      groupId: existingTicket.group_id,
                      total: groupMembers.length,
                      checkedIn,
                      remaining: remaining.map(m => ({ id: m.id, full_name: m.full_name })),
                    });
                    return; // Don't auto-close — let admin decide
                  }
                }
              }
              scheduleClose(2200);
            } catch (err: unknown) {
              const error = err as Error;
              setScanStatus("error");
              setScanMessage(error.message);
              setNotification({ type: "error", message: `Scan failed: ${error.message}` });
              scheduleClose(2800);
            }
          } else {
            setScanStatus("error");
            setScanMessage("Invalid QR code");
            setNotification({ type: "error", message: `Invalid QR code — could not extract ticket ID.` });
            scheduleClose(2800);
          }
        },
        () => {}
      ).catch((err) => {
        console.error("Scanner start error:", err);
        setNotification({ type: "error", message: "Camera access denied or unavailable." });
        setShowScanner(false);
      });
    }
    return () => {
      scanProcessingRef.current = false;
      if (scanCloseTimerRef.current) clearTimeout(scanCloseTimerRef.current);
      if (scanner && scanner.isScanning) scanner.stop().catch(console.error);
    };
  }, [showScanner]);

  // Detect zoom capability from the camera track once the scanner has initialised
  useEffect(() => {
    if (!showScanner) {
      videoTrackRef.current = null;
      setZoomRange(null);
      setZoomLevel(1);
      return;
    }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      const video = document.querySelector("#admin-reader video") as HTMLVideoElement | null;
      if (video?.srcObject) {
        clearInterval(poll);
        const track = (video.srcObject as MediaStream).getVideoTracks()[0];
        if (track) {
          videoTrackRef.current = track;
          const caps = track.getCapabilities() as any;
          if (caps?.zoom) {
            setZoomRange({ min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step ?? 0.1 });
            setZoomLevel(caps.zoom.min);
          }
        }
      }
      if (attempts > 30) clearInterval(poll);
    }, 100);
    return () => clearInterval(poll);
  }, [showScanner]);

  const handleZoom = (value: number) => {
    setZoomLevel(value);
    videoTrackRef.current?.applyConstraints({ advanced: [{ zoom: value } as any] });
  };

  const handleResetAllCheckIns = async () => {
    const { error } = await supabase
      .from("registrations")
      .update({ checked_in_at: null })
      .not("checked_in_at", "is", null);
    setShowResetConfirm(false);
    if (!error) {
      fetchData();
      setNotification({ type: "success", message: "All check-ins have been reset." });
    } else {
      setNotification({ type: "error", message: "Failed to reset check-ins." });
    }
  };

  const handleGroupMemberCheckIn = async (memberId: string) => {
    const { error } = await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", memberId);
    if (!error) fetchData();
    else setNotification({ type: "error", message: "Failed to check in member." });
  };

  const handleCheckInAllGroup = async (groupId: string) => {
    const { error } = await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("group_id", groupId)
      .is("checked_in_at", null);
    if (!error) {
      fetchData();
      setNotification({ type: "success", message: "All group members checked in!" });
    } else {
      setNotification({ type: "error", message: "Failed to check in group." });
    }
  };

  const handleScannerGroupCheckIn = async () => {
    if (!scanGroupInfo) return;
    await supabase
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .in("id", scanGroupInfo.remaining.map(m => m.id));
    setScanMessage(`All ${scanGroupInfo.total} members checked in`);
    setScanGroupInfo(null);
    fetchData();
    if (scanCloseTimerRef.current) clearTimeout(scanCloseTimerRef.current);
    scanCloseTimerRef.current = setTimeout(() => {
      setShowScanner(false);
      setScanStatus(null);
    }, 1800);
  };

  // Early bird window from Supabase config
  const ebStart = dbConfig?.early_bird_start ? new Date(dbConfig.early_bird_start) : null;
  const ebEnd   = dbConfig?.early_bird_end   ? new Date(dbConfig.early_bird_end)   : null;

  // Collapse GROUP_ rows: one lead row with _groupMembers attached
  const displayRegistrations: Registration[] = (() => {
    const groupMap = new Map<string, Registration[]>();
    const result: Registration[] = [];

    for (const reg of registrations) {
      const gid = reg.group_id;
      if (gid) {
        if (!groupMap.has(gid)) groupMap.set(gid, []);
        groupMap.get(gid)!.push(reg);
      } else {
        result.push(reg);
      }
    }

    for (const members of groupMap.values()) {
      // Last in desc-order array = earliest created = main buyer
      const sorted = [...members].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lead = sorted[0];
      const rest = sorted.slice(1);
      result.push({
        ...lead,
        _groupSize: sorted.length,
        _groupMembers: rest.map(m => ({
          id: m.id,
          full_name: m.full_name,
          gender: m.gender,
          checked_in_at: m.checked_in_at,
        })),
      });
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  })();

  const paidRegs = displayRegistrations.filter(r => r.payment_status === 'paid');

  // Returns the unit price a registration actually paid based on booking date
  const getPricePaid = (reg: Registration): number => {
    const passTypeLower = reg.pass_type?.toLowerCase().trim() ?? "";
    const tier = tiers.find((t: any) =>
      t.name?.toLowerCase().trim() === passTypeLower
    ) ?? tiers.find((t: any) => {
      const tName = t.name?.toLowerCase().trim() ?? "";
      return tName.includes(passTypeLower) || passTypeLower.includes(tName.replace(/[^a-z0-9 ]/g, "").trim());
    });
    if (!tier) return 0;
    const bookingDate = new Date(reg.created_at);
    const wasEarlyBird = ebStart && ebEnd && bookingDate >= ebStart && bookingDate <= ebEnd;
    return wasEarlyBird ? (tier as any).earlyBirdPrice : (tier as any).regularPrice;
  };

  const getTotalPaid = (reg: Registration): number => {
    const unitPrice = getPricePaid(reg);
    // "Group of 4" tier price covers the whole group — don't multiply
    if (reg.pass_type?.toLowerCase().includes("group of 4")) return unitPrice;
    return unitPrice * (reg._groupSize ?? reg.quantity ?? 1);
  };

  const stats = {
    total: paidRegs.length,
    pax: paidRegs.reduce((acc, curr) => acc + (curr._groupSize ?? curr.quantity ?? 1), 0),
    revenue: paidRegs.reduce((acc, curr) => acc + getTotalPaid(curr), 0),
  };

  const filtered = displayRegistrations.filter(reg => {
    const searchLower = searchTerm.toLowerCase();
    const matchesGroupMember = reg._groupMembers?.some(m =>
      (m.full_name?.toLowerCase() || "").includes(searchLower)
    ) ?? false;
    const matchesSearch =
      (reg.full_name?.toLowerCase() || "").includes(searchLower) ||
      (reg.email?.toLowerCase() || "").includes(searchLower) ||
      (reg.payment_id?.toLowerCase() || "").includes(searchLower) ||
      matchesGroupMember;
    const matchesFilter = filterPass === "All" || reg.pass_type === filterPass;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black text-center mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-center mb-8 text-sm">Restricted Access</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Email</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@taameer.org"
                className="h-14 rounded-2xl bg-gray-950 border-gray-800 focus:border-yellow-500 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 rounded-2xl bg-gray-950 border-gray-800 focus:border-yellow-500 pr-12 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button disabled={authLoading} className="w-full h-14 rounded-2xl font-black text-lg bg-yellow-500 hover:bg-yellow-600 text-gray-950 mt-4">
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Login"}
            </Button>
          </form>
          
          {notification?.type === "error" && (
            <p className="mt-4 text-center text-red-500 text-sm font-bold">{notification.message}</p>
          )}
        </div>
      </div>
    );
  }

  const checkedInCount = displayRegistrations.filter(r => r.payment_status === "paid" && r.checked_in_at).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-tight leading-none">Admin <span className="text-yellow-500">Panel</span></h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kumaon Fest 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} size="icon" className="h-9 w-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-yellow-500">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleExportCSV} size="icon" className="h-9 w-9 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-yellow-500">
            <Download className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowScanner(true)} className="hidden md:flex h-9 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-sm">
            <Camera className="w-4 h-4 mr-1.5" /> Scan
          </Button>
          <Button onClick={handleLogout} size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4 pb-32 md:pb-5">

        {/* ── NOTIFICATION ── */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold ${
                notification.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : notification.type === "info"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {notification.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="flex-1">{notification.message}</span>
              <button onClick={() => setNotification(null)}><X className="w-4 h-4 opacity-50" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EMAIL FAILURE ALERT ── */}
        {(() => {
          const failedEmails = displayRegistrations.filter(r => r.payment_status === "paid" && r.email_sent === false);
          if (failedEmails.length === 0) return null;
          return (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <MailX className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-black text-red-400">
                  {failedEmails.length} ticket{failedEmails.length > 1 ? "s" : ""} paid but email not delivered
                </p>
                <p className="text-[11px] text-red-400/70 mt-0.5">
                  {failedEmails.map(r => r.email).join(", ")}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 gap-3">
          <StatCard label="Paid Bookings"   value={stats.total}           icon={Ticket}       color="bg-yellow-500/10 text-yellow-500" />
          <StatCard label="Confirmed Pax"   value={stats.pax}             icon={Users}        color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Checked In"      value={checkedInCount}        icon={CheckCircle2} color="bg-green-500/10 text-green-400" />
          <StatCard label="Net Revenue"     value={`₹${stats.revenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="bg-emerald-500/10 text-emerald-400" />
        </div>

        {/* ── RECOVER PAYMENT ── */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-orange-400">Recover Missed Payment</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">If a payment succeeded but no ticket was issued (e.g. redirect), paste the Cashfree Order ID here to confirm and send the email.</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. KF_1779106248384_uvaxvd"
              className="h-10 rounded-xl bg-gray-900 border-gray-800 text-white text-xs flex-1 font-mono"
              value={recoveryOrderId}
              onChange={(e) => setRecoveryOrderId(e.target.value)}
            />
            <Button
              onClick={handleRecoverPayment}
              disabled={isRecovering || !recoveryOrderId.trim()}
              className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shrink-0"
            >
              {isRecovering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recover"}
            </Button>
          </div>
        </div>

        {/* ── SEARCH + FILTER ── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search name, email or payment ID..."
              className="pl-11 h-12 rounded-2xl bg-gray-900 border-gray-800 focus:border-yellow-500 text-white text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", ...tiers.map((t: any) => t.name)].map((pass) => (
              <button
                key={pass}
                onClick={() => setFilterPass(pass)}
                className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${
                  filterPass === pass
                    ? "bg-yellow-500 text-gray-950"
                    : "bg-gray-900 border border-gray-800 text-gray-400"
                }`}
              >
                {pass}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-600 font-bold">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        {/* ── ATTENDEE LIST ── */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">

          {/* Desktop table */}
          <table className="hidden md:table w-full text-left">
            <thead>
              <tr className="bg-gray-950/60 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
                <th className="px-6 py-4">Attendee</th>
                <th className="px-6 py-4">Pass</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(reg => {
                const groupMembers: { id?: string; full_name?: string; fullName?: string; gender?: string; age?: string; checked_in_at?: string | null }[] =
                  reg._groupMembers?.length ? reg._groupMembers :
                  reg.additional_attendees?.length ? reg.additional_attendees : [];
                const hasGroup = groupMembers.length > 0;
                return (
                  <React.Fragment key={reg.id}>
                    <tr
                      className="hover:bg-gray-800/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedReg(reg)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-base">{reg.full_name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">{reg.email}</span>
                          {reg.payment_status === "paid" && reg.email_sent === false && (
                            <span className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              <MailX className="w-3 h-3" /> Ticket Not Sent — Address Not Found
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          {new Date(reg.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                        </div>
                        {hasGroup && (
                          <div className="text-[10px] text-gray-600 mt-0.5 font-medium">+{groupMembers.length} members below</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-black text-yellow-500 uppercase tracking-wider">{reg.pass_type}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {hasGroup ? `Group of ${groupMembers.length + 1}` : `×${reg.quantity}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reg.payment_status === "paid" ? (
                          <div className="text-sm font-black text-white">₹{getTotalPaid(reg).toLocaleString("en-IN")}</div>
                        ) : (
                          <span className="text-[10px] text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge reg={reg} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasGroup && reg.group_id && (() => {
                            const anyUnchecked = !reg.checked_in_at || (reg._groupMembers?.some(m => !m.checked_in_at) ?? false);
                            return anyUnchecked ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCheckInAllGroup(reg.group_id!); }}
                                className="text-[11px] font-black text-yellow-500 hover:text-yellow-400 px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Check In All
                              </button>
                            ) : null;
                          })()}
                          <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-yellow-500 transition-colors" />
                        </div>
                      </td>
                    </tr>
                    {hasGroup && groupMembers.map((m, i) => (
                      <tr
                        key={`${reg.id}-member-${i}`}
                        className="bg-gray-950/50 hover:bg-gray-800/20 cursor-pointer transition-colors"
                        onClick={() => m.id && (window.location.href = `/kumaon-fest/verify/${m.id}`)}
                      >
                        <td colSpan={4} className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">{i + 2}</span>
                            <span className="font-bold text-sm text-gray-300 flex-1">{m.full_name ?? m.fullName}</span>
                            {m.gender && <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">{m.gender}</span>}
                            {m.checked_in_at
                              ? <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full uppercase">Entered</span>
                              : <span className="text-[10px] font-black text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full uppercase">Not yet</span>
                            }
                            {m.id && <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {!m.checked_in_at && m.id ? (
                            <button
                              onClick={() => handleGroupMemberCheckIn(m.id!)}
                              className="text-[11px] font-black text-yellow-500 hover:text-yellow-400 px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Check In
                            </button>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-600 text-sm">No bookings found.</td></tr>
              )}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="md:hidden divide-y divide-gray-800">
            {filtered.map(reg => {
              const groupMembers: { id?: string; full_name?: string; fullName?: string; gender?: string; age?: string; checked_in_at?: string | null }[] =
                reg._groupMembers?.length ? reg._groupMembers :
                reg.additional_attendees?.length ? reg.additional_attendees : [];
              const hasGroup = groupMembers.length > 0;
              return (
                <div key={reg.id}>
                  {/* Lead buyer row */}
                  <div
                    className="flex items-center gap-3 px-4 py-4 active:bg-gray-800/40 cursor-pointer"
                    onClick={() => setSelectedReg(reg)}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gray-800 flex items-center justify-center shrink-0 font-black text-base text-white">
                      {reg.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{reg.full_name}</div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider">{reg.pass_type}</span>
                        {hasGroup
                          ? <span className="text-[10px] text-gray-600">Group of {groupMembers.length + 1}</span>
                          : <span className="text-[10px] text-gray-600">×{reg.quantity}</span>
                        }
                        {reg.payment_status === "paid" && (
                          <span className="text-[10px] font-black text-white">· ₹{getTotalPaid(reg).toLocaleString("en-IN")}</span>
                        )}
                        {reg.payment_status === "paid" && reg.email_sent === false && (
                          <span className="inline-flex items-center gap-0.5 bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            <MailX className="w-2.5 h-2.5" /> Ticket Not Sent
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5">
                        {new Date(reg.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge reg={reg} />
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>

                  {/* Group members — always visible, each tappable */}
                  {hasGroup && (
                    <div className="border-t border-gray-800/50 bg-gray-950/40">
                      {/* Check-in all button when any member is unchecked */}
                      {reg.group_id && (() => {
                        const anyUnchecked = !reg.checked_in_at || (reg._groupMembers?.some(m => !m.checked_in_at) ?? false);
                        return anyUnchecked ? (
                          <div className="px-4 pt-2 pb-1">
                            <button
                              onClick={() => handleCheckInAllGroup(reg.group_id!)}
                              className="w-full text-[11px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-xl py-2 active:bg-yellow-500/20"
                            >
                              Check In All Members
                            </button>
                          </div>
                        ) : null;
                      })()}
                      {groupMembers.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/30 last:border-b-0"
                        >
                          <div
                            className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0 cursor-pointer"
                            onClick={() => m.id && (window.location.href = `/kumaon-fest/verify/${m.id}`)}
                          >
                            {i + 2}
                          </div>
                          <span
                            className="text-sm font-bold text-gray-300 flex-1 cursor-pointer"
                            onClick={() => m.id && (window.location.href = `/kumaon-fest/verify/${m.id}`)}
                          >
                            {m.full_name ?? m.fullName}
                          </span>
                          {m.checked_in_at
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                            : m.id && (
                              <button
                                onClick={() => handleGroupMemberCheckIn(m.id!)}
                                className="text-[11px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg active:bg-yellow-500/20"
                              >
                                Check In
                              </button>
                            )
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-sm">No bookings found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY SCAN FAB ── */}
      <div className="fixed bottom-0 inset-x-0 md:hidden z-50">
        <div className="h-20 bg-gray-950/95 backdrop-blur-xl border-t border-white/5 flex flex-col items-center justify-center gap-1 pb-2">
          <button
            onClick={() => setShowScanner(true)}
            className="w-12 h-12 rounded-full bg-yellow-500 active:bg-yellow-600 text-gray-950 flex items-center justify-center shadow-lg shadow-yellow-500/30 transition-transform active:scale-95"
          >
            <Camera className="w-5 h-5" />
          </button>
          <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">Scan</span>
        </div>
      </div>

      {/* ── CUSTOMER DETAILS SHEET (bottom on mobile, modal on desktop) ── */}
      <AnimatePresence>
        {selectedReg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSelectedReg(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-50 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[480px] bg-gray-900 rounded-t-3xl md:rounded-3xl border-t md:border border-gray-800 max-h-[85vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-700" />
              </div>

              <div className="px-5 pb-8 pt-3 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-black text-xl text-yellow-500 shrink-0">
                    {selectedReg.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-lg text-white leading-tight">{selectedReg.full_name}</div>
                    <div className="text-xs font-black text-yellow-500 uppercase tracking-wider mt-0.5">{selectedReg.pass_type}</div>
                  </div>
                  <StatusBadge reg={selectedReg} />
                </div>

                {/* Details grid */}
                <div className="bg-gray-950 rounded-2xl divide-y divide-gray-800">
                  {[
                    { label: "Email", value: selectedReg.email },
                    { label: "WhatsApp", value: selectedReg.whatsapp_no || selectedReg.contact_no || "—" },
                    { label: "Gender", value: selectedReg.gender || "—" },
                    { label: "Age", value: selectedReg.age || "—" },
                    { label: "Amount Paid", value: selectedReg.payment_status === "paid" ? `₹${getTotalPaid(selectedReg).toLocaleString("en-IN")}` : "—" },
                    { label: "Booked On", value: new Date(selectedReg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + " at " + new Date(selectedReg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) },
                    ...(selectedReg.instagram_handle ? [{ label: "Instagram", value: selectedReg.instagram_handle }] : []),
                    ...(selectedReg.address ? [{ label: "Address", value: selectedReg.address }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3 gap-4">
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 shrink-0">{label}</span>
                      <span className="text-sm text-white text-right truncate">{value}</span>
                    </div>
                  ))}
                  {selectedReg.email_sent === false && (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <MailX className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-xs font-black text-red-400">Ticket email not delivered</span>
                    </div>
                  )}
                </div>

                {/* Group members */}
                {(selectedReg._groupMembers?.length ?? 0) > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">Group Members</p>
                      {selectedReg.group_id && selectedReg._groupMembers!.some(m => !m.checked_in_at) && (
                        <button
                          onClick={() => handleCheckInAllGroup(selectedReg.group_id!)}
                          className="text-[11px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg"
                        >
                          Check In All
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-950 rounded-2xl divide-y divide-gray-800">
                      {selectedReg._groupMembers!.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-400 shrink-0">{i + 2}</span>
                          <span className="text-sm font-bold text-white flex-1">{m.full_name}</span>
                          {m.gender && <span className="text-[9px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">{m.gender}</span>}
                          {m.checked_in_at
                            ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                            : m.id && (
                              <button
                                onClick={() => { handleGroupMemberCheckIn(m.id!); setSelectedReg(null); }}
                                className="text-[11px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg shrink-0"
                              >
                                Check In
                              </button>
                            )
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.location.href = `/kumaon-fest/verify/${selectedReg.id}`}
                    className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-2xl text-sm"
                  >
                    <Ticket className="w-4 h-4 mr-1.5" /> Show Ticket
                  </Button>
                  <Button
                    onClick={() => setSelectedReg(null)}
                    variant="ghost"
                    className="h-12 px-5 rounded-2xl border border-gray-800 text-gray-400 font-bold text-sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── QR SCANNER ── */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-full max-w-sm aspect-square bg-black rounded-[2.5rem] border-2 border-yellow-500/60 overflow-hidden shadow-2xl shadow-yellow-500/20">
              <div id="admin-reader" className="w-full h-full" />

              {/* Scanning guide — hidden once a result is in */}
              {!scanStatus && (
                <>
                  {/* Corner brackets */}
                  <div className="absolute top-7 left-7 w-9 h-9 border-t-[3px] border-l-[3px] border-yellow-400 pointer-events-none" />
                  <div className="absolute top-7 right-7 w-9 h-9 border-t-[3px] border-r-[3px] border-yellow-400 pointer-events-none" />
                  <div className="absolute bottom-7 left-7 w-9 h-9 border-b-[3px] border-l-[3px] border-yellow-400 pointer-events-none" />
                  <div className="absolute bottom-7 right-7 w-9 h-9 border-b-[3px] border-r-[3px] border-yellow-400 pointer-events-none" />
                  {/* Sweep line */}
                  <div
                    className="absolute inset-x-7 h-0.5 bg-yellow-400/80 animate-scan-line pointer-events-none"
                    style={{ boxShadow: "0 0 8px 2px rgba(234,179,8,0.5)" }}
                  />
                </>
              )}

              {/* Result overlay */}
              <AnimatePresence>
                {scanStatus && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 ${
                      scanStatus === "success" ? "bg-green-950/95" :
                      scanStatus === "error"   ? "bg-red-950/95"   :
                      "bg-black/85"
                    }`}
                  >
                    {scanStatus === "loading" && (
                      <>
                        <Loader2 className="w-14 h-14 text-yellow-400 animate-spin" />
                        <p className="text-yellow-400 font-black text-base tracking-tight">Checking…</p>
                      </>
                    )}
                    {scanStatus === "success" && (
                      <>
                        <CheckCircle2 className="w-14 h-14 text-green-400" />
                        <p className="text-green-300 font-black text-lg text-center tracking-tight whitespace-pre-line">{scanMessage}</p>
                        {scanGroupInfo && (
                          <div className="flex flex-col items-center gap-2 mt-1">
                            <p className="text-green-200/70 text-xs text-center">
                              {scanGroupInfo.checkedIn}/{scanGroupInfo.total} group members in
                            </p>
                            <button
                              onClick={handleScannerGroupCheckIn}
                              className="bg-green-600 active:bg-green-700 text-white font-black text-sm px-5 py-2.5 rounded-xl"
                            >
                              Check in {scanGroupInfo.remaining.length} more →
                            </button>
                            <button
                              onClick={() => { setShowScanner(false); setScanStatus(null); setScanGroupInfo(null); }}
                              className="text-green-400/60 text-xs py-1"
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {scanStatus === "error" && (
                      <>
                        <AlertCircle className="w-16 h-16 text-red-400" />
                        <p className="text-red-300 font-black text-sm text-center tracking-tight">{scanMessage}</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!scanStatus && (
              <>
                <p className="mt-6 text-lg font-black text-yellow-500 tracking-tight">Point camera at a ticket QR code</p>

                {/* Zoom slider — only shown when the device supports camera zoom */}
                {zoomRange && (
                  <div className="flex items-center gap-3 mt-4 w-full max-w-sm">
                    <ZoomOut className="w-5 h-5 text-yellow-500 shrink-0" />
                    <input
                      type="range"
                      min={zoomRange.min}
                      max={zoomRange.max}
                      step={zoomRange.step}
                      value={zoomLevel}
                      onChange={(e) => handleZoom(Number(e.target.value))}
                      className="flex-1 accent-yellow-400 h-1.5 rounded-full"
                    />
                    <ZoomIn className="w-5 h-5 text-yellow-500 shrink-0" />
                  </div>
                )}

                <Button onClick={() => setShowScanner(false)} className="mt-6 h-14 px-10 rounded-2xl bg-white text-black font-black text-base">Cancel</Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESET ALL CHECK-INS CONFIRMATION ── */}
      <AnimatePresence>
        {showResetConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md"
              onClick={() => setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 bottom-6 z-[110] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-gray-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
                <RotateCcw className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-center mb-1">Reset All Check-Ins?</h3>
              <p className="text-gray-400 text-center text-sm mb-6">
                This will clear the entry status for every attendee. This cannot be undone.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handleResetAllCheckIns} className="h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white">
                  Yes, Reset Everything
                </Button>
                <Button variant="ghost" onClick={() => setShowResetConfirm(false)} className="h-12 rounded-xl font-black text-gray-400">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ reg }: { reg: { checked_in_at: string | null; payment_status: string } }) {
  if (reg.checked_in_at)
    return <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase border border-yellow-500/20 whitespace-nowrap">Entered</span>;
  if (reg.payment_status === "paid")
    return <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase border border-green-500/20 whitespace-nowrap">Paid</span>;
  return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-black uppercase border border-red-500/20 whitespace-nowrap">Pending</span>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="text-2xl font-black tracking-tighter shrink-0">{value}</p>
    </div>
  );
}
