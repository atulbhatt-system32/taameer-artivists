"use client";

import { useState, useEffect, useRef } from "react";
import { getRegistrations, resendConfirmationEmail } from "@/app/actions/booking";
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
  Mail
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [filterPass, setFilterPass] = useState<string>("All");
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
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
        setNotification({ type: "success", message: "Welcome back, Admin!" });
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
      const data = await getRegistrations();
      setRegistrations(data as Registration[]);
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to fetch bookings." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResendingEmail(id);
    try {
      await resendConfirmationEmail(id);
      setNotification({ type: "success", message: "Email resent successfully!" });
    } catch (err: unknown) {
      const error = err as Error;
      setNotification({ type: "error", message: error.message || "Failed to resend email." });
    } finally {
      setResendingEmail(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setAuthLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setNotification({ type: "error", message: authError.message });
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

  const stats = {
    total: registrations.filter(r => r.payment_status === 'paid').length,
    pax: registrations.filter(r => r.payment_status === 'paid').reduce((acc, curr) => acc + (curr.quantity || 0), 0),
    revenue: registrations.filter(r => r.payment_status === 'paid').reduce((acc, curr) => {
      const prices: Record<string, number> = { "Student Pass": 349, "Regular Pass": 449, "VIP Pass": 649 };
      const bulkPrices: Record<string, number> = { "Student Pass": 299, "Regular Pass": 399, "VIP Pass": 599 };
      const qty = curr.quantity || 1;
      const unitPrice = qty >= 5 ? bulkPrices[curr.pass_type] : prices[curr.pass_type];
      return acc + (unitPrice || 0) * qty;
    }, 0)
  };

  const filtered = registrations.filter(reg => {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Admin <span className="text-yellow-500">Panel</span></h1>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-2">Kumaon Fest 2025 Bookings</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-3 w-full md:w-auto">
            <Button onClick={() => setShowScanner(true)} className="col-span-2 sm:col-span-1 h-12 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-bold"><Camera className="w-4 h-4 mr-2" /> Scan Ticket</Button>
            <Button onClick={handleExportCSV} className="h-12 rounded-xl bg-gray-950 border border-gray-800 text-white hover:bg-gray-800 transition-colors"><Download className="w-4 h-4 mr-2" /> Export</Button>
            <Button onClick={fetchData} className="h-12 rounded-xl bg-gray-950 border border-gray-800 text-white hover:text-yellow-500 transition-colors"><RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
            <Button onClick={handleLogout} variant="ghost" className="col-span-2 sm:col-span-1 h-12 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10">Logout</Button>
          </div>
        </div>

        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl flex items-center gap-4 border ${notification.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
          >
            {notification.type === "success" ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <p className="font-bold">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="ml-auto opacity-50"><X className="w-5 h-5" /></button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Paid Bookings" value={stats.total} icon={Ticket} color="text-yellow-500" />
          <StatCard label="Confirmed Pax" value={stats.pax} icon={Users} color="text-blue-500" />
          <StatCard label="Net Revenue" value={`₹${stats.revenue}`} icon={IndianRupee} color="text-green-500" />
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search attendee, email or payment id..." 
                className="pl-12 h-14 rounded-2xl bg-gray-950 border-gray-800 focus:border-yellow-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {["All", "Student Pass", "Regular Pass", "VIP Pass"].map((pass) => (
                <Button
                  key={pass}
                  onClick={() => setFilterPass(pass)}
                  className={`h-12 rounded-xl font-bold border-gray-800 whitespace-nowrap transition-all ${
                    filterPass === pass 
                      ? "bg-yellow-500 text-gray-950" 
                      : "bg-gray-950 text-white border border-gray-800 hover:bg-gray-800"
                  }`}
                >
                  {pass}
                </Button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left">
              <thead>
                <tr className="bg-gray-950/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  <th className="p-4 md:p-8">Attendee</th>
                  <th className="p-4 md:p-8">Pass Details</th>
                  <th className="p-4 md:p-8">Payment ID</th>
                  <th className="p-4 md:p-8 text-center">Status</th>
                  <th className="p-4 md:p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(reg => (
                  <tr 
                    key={reg.id} 
                    className="hover:bg-gray-800/30 transition-colors cursor-pointer group"
                    onClick={() => window.location.href = `/kumaon-fest/verify/${reg.id}`}
                  >
                    <td className="p-4 md:p-8">
                      <div className="font-bold text-base md:text-lg">{reg.full_name}</div>
                      <div className="text-xs text-gray-500">{reg.email}</div>
                    </td>
                    <td className="p-4 md:p-8">
                      <div className="text-xs md:text-sm font-black text-yellow-500 uppercase tracking-wider">{reg.pass_type}</div>
                      <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-bold">Quantity: {reg.quantity}</div>
                    </td>
                    <td className="p-4 md:p-8">
                      <code className="text-[10px] md:text-xs text-gray-500 bg-gray-950 px-2 py-1 rounded-md">{reg.payment_id || "N/A"}</code>
                    </td>
                    <td className="p-4 md:p-8 text-center">
                      {reg.checked_in_at ? (
                        <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] md:text-[10px] font-black uppercase border border-yellow-500/20">ENTERED</span>
                      ) : reg.payment_status === "paid" ? (
                        <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-green-500/10 text-green-500 text-[9px] md:text-[10px] font-black uppercase border border-green-500/20">PAID</span>
                      ) : (
                        <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-red-500/10 text-red-500 text-[9px] md:text-[10px] font-black uppercase border border-red-500/20">PENDING</span>
                      )}
                    </td>
                    <td className="p-4 md:p-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reg.payment_status === "paid" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-lg text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                            onClick={(e) => handleResendEmail(reg.id, e)}
                            disabled={resendingEmail === reg.id}
                          >
                            {resendingEmail === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                          </Button>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-yellow-500 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-gray-800">
              {filtered.map(reg => (
                <div 
                  key={reg.id} 
                  className="p-5 hover:bg-gray-800/30 transition-colors cursor-pointer active:bg-gray-800/50"
                  onClick={() => window.location.href = `/kumaon-fest/verify/${reg.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg text-white leading-tight">{reg.full_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{reg.email}</div>
                    </div>
                    <div>
                      {reg.checked_in_at ? (
                        <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase border border-yellow-500/20">ENTERED</span>
                      ) : reg.payment_status === "paid" ? (
                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase border border-green-500/20">PAID</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase border border-red-500/20">PENDING</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-yellow-500 uppercase tracking-wider">{reg.pass_type} <span className="text-gray-500">(x{reg.quantity})</span></div>
                      <code className="text-[10px] text-gray-500 bg-gray-950 px-2 py-0.5 rounded inline-block">{reg.payment_id || "N/A"}</code>
                    </div>
                    <div className="flex items-center gap-1">
                      {reg.payment_status === "paid" && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-lg text-gray-400 hover:text-yellow-500"
                          onClick={(e) => handleResendEmail(reg.id, e)}
                          disabled={resendingEmail === reg.id}
                        >
                          {resendingEmail === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </Button>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No bookings found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl"
          >
            <div className="relative w-full max-w-lg aspect-square bg-black rounded-[3rem] border-2 border-yellow-500/50 overflow-hidden shadow-2xl shadow-yellow-500/20">
              <div id="admin-reader" className="w-full h-full" />
              <div className="absolute inset-0 border-8 border-black/40 pointer-events-none" />
            </div>
            <p className="mt-8 text-2xl font-black text-yellow-500 animate-pulse">Scanning Ticket...</p>
            <Button onClick={() => setShowScanner(false)} className="mt-12 h-16 px-12 rounded-2xl bg-white text-black font-black text-lg">Cancel Scan</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 shadow-xl group hover:border-yellow-500/30 transition-colors">
      <div className={`w-14 h-14 rounded-2xl bg-gray-950 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-4xl font-black mt-2 tracking-tighter">{value}</p>
    </div>
  );
}
