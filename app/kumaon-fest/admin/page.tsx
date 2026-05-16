"use client";

import React, { useState, useEffect, useRef } from "react";
import { getRegistrations, getEventPricing, getEventConfig } from "@/app/actions/booking";
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
  ChevronRight
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
  payment_status: string;
  checked_in_at: string | null;
  created_at: string;
  gender?: string;
  instagram_handle?: string;
  group_id?: string;
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
  const scanProcessingRef = useRef(false);

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
    const headers = ["Name", "Email", "Pass", "Qty", "Payment ID", "Status", "Date"];
    const rows = filtered.map(reg => [
      reg.full_name,
      reg.email,
      reg.pass_type,
      reg.quantity,
      reg.payment_id,
      reg.checked_in_at ? "Entered" : reg.payment_status,
      new Date(reg.created_at).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `taameer_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    if (showScanner) {
      scanProcessingRef.current = false;
      scanner = new Html5Qrcode("admin-reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Guard: prevent duplicate processing from rapid callbacks
          if (scanProcessingRef.current) return;
          scanProcessingRef.current = true;

          // Stop scanner immediately to prevent further callbacks
          try {
            if (scanner && scanner.isScanning) {
              await scanner.stop();
            }
          } catch (e) {
            console.error("Scanner stop error:", e);
          }

          // Extract ID from URL, handling trailing slashes
          let id = "";
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split("/").filter(Boolean);
            id = pathParts[pathParts.length - 1] || "";
          } catch {
            id = decodedText.trim();
          }

          if (id && id.length > 10) {
            try {
              // Fetch the ticket first to check if it's already used
              const { data: existingTicket, error: fetchError } = await supabase
                .from("registrations")
                .select("checked_in_at, full_name")
                .eq("id", id)
                .single();

              if (fetchError || !existingTicket) {
                throw new Error("Ticket not found in the database.");
              }

              if (existingTicket.checked_in_at) {
                throw new Error(`TICKET ALREADY USED! Scanned previously at ${new Date(existingTicket.checked_in_at).toLocaleTimeString()}`);
              }

              // If not used, proceed to check-in
              const { data, error: updateError } = await supabase
                .from("registrations")
                .update({ checked_in_at: new Date().toISOString() })
                .eq("id", id)
                .select("full_name, pass_type, quantity, checked_in_at")
                .single();

              if (updateError) {
                throw new Error(updateError.message);
              }

              setNotification({ 
                type: "success", 
                message: `✅ ${data.full_name} checked in — ${data.pass_type} (x${data.quantity})` 
              });
              fetchData();
            } catch (err: unknown) {
              const error = err as Error;
              setNotification({ type: "error", message: `Scan failed: ${error.message}` });
            }
          } else {
            setNotification({ type: "error", message: `Invalid QR code — could not extract ticket ID. Scanned: "${decodedText.slice(0, 50)}"` });
          }

          setShowScanner(false);
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
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [showScanner]);

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

  const getTotalPaid = (reg: Registration): number => getPricePaid(reg);

  const stats = {
    total: paidRegs.length,
    pax: paidRegs.reduce((acc, curr) => acc + (curr._groupSize ?? curr.quantity ?? 1), 0),
    revenue: paidRegs.reduce((acc, curr) => acc + getTotalPaid(curr), 0),
  };

  const filtered = displayRegistrations.filter(reg => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (reg.full_name?.toLowerCase() || "").includes(searchLower) ||
      (reg.email?.toLowerCase() || "").includes(searchLower) ||
      (reg.payment_id?.toLowerCase() || "").includes(searchLower);
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

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 gap-3">
          <StatCard label="Paid Bookings"   value={stats.total}           icon={Ticket}       color="bg-yellow-500/10 text-yellow-500" />
          <StatCard label="Confirmed Pax"   value={stats.pax}             icon={Users}        color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Checked In"      value={checkedInCount}        icon={CheckCircle2} color="bg-green-500/10 text-green-400" />
          <StatCard label="Net Revenue"     value={`₹${stats.revenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="bg-emerald-500/10 text-emerald-400" />
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
                      onClick={() => window.location.href = `/kumaon-fest/verify/${reg.id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-base">{reg.full_name}</div>
                        <div className="text-xs text-gray-500">{reg.email}</div>
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
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-yellow-500 transition-colors ml-auto" />
                      </td>
                    </tr>
                    {hasGroup && groupMembers.map((m, i) => (
                      <tr
                        key={`${reg.id}-member-${i}`}
                        className="bg-gray-950/50 hover:bg-gray-800/20 cursor-pointer transition-colors"
                        onClick={() => m.id && (window.location.href = `/kumaon-fest/verify/${m.id}`)}
                      >
                        <td colSpan={5} className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">{i + 2}</span>
                            <span className="font-bold text-sm text-gray-300 flex-1">{m.full_name ?? m.fullName}</span>
                            {m.gender && <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">{m.gender}</span>}
                            {m.id && <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
                          </div>
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
                    onClick={() => window.location.href = `/kumaon-fest/verify/${reg.id}`}
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
                      {groupMembers.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/30 last:border-b-0 active:bg-gray-800/30 cursor-pointer"
                          onClick={() => m.id && (window.location.href = `/kumaon-fest/verify/${m.id}`)}
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0">
                            {i + 2}
                          </div>
                          <span className="text-sm font-bold text-gray-300 flex-1">{m.full_name ?? m.fullName}</span>
                          {m.gender && <span className="text-[9px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">{m.gender}</span>}
                          {m.id && <ChevronRight className="w-3.5 h-3.5 text-gray-700 shrink-0" />}
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
              <div className="absolute inset-0 border-8 border-black/40 pointer-events-none" />
            </div>
            <p className="mt-6 text-xl font-black text-yellow-500 animate-pulse tracking-tight">Scanning Ticket...</p>
            <Button onClick={() => setShowScanner(false)} className="mt-8 h-14 px-10 rounded-2xl bg-white text-black font-black text-base">Cancel</Button>
          </motion.div>
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
