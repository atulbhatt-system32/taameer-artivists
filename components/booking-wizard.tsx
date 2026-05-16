"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { preRegisterUser, createCashfreeOrder, confirmPayment, getEventConfig, getEventPricing } from "@/app/actions/booking";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Ticket, Users, Sparkles, ChevronLeft, CreditCard, ShoppingBag } from "lucide-react";
import confetti from "canvas-confetti";
import { Badge } from "@/components/ui/badge";
// Event data is fully dynamic from Supabase — no local JSON fallback

// Remove static tiers definition
// const tiers = eventsData.featuredEvent.pricing;

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.string().min(1, { message: "Age is required." }),
  gender: z.enum(["Female", "Male", "Transgender", "I prefer not to say", "Other"]),
  whatsappNo: z.string().min(10, { message: "Enter a valid WhatsApp number." }),
  contactNo: z.string().min(10, { message: "Enter a valid contact number." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  passType: z.enum(["Student Pass", "Regular Pass", "Premium Pass", "Fanpit", "Group of 4"]),
  quantity: z.string().min(1, { message: "Quantity is required." }).refine((val) => parseInt(val) <= 5, { message: "Maximum 5 people allowed per booking." }),
  address: z.string().min(5, { message: "Please provide a complete address." }),
  instagramHandle: z.string().optional(),
  additionalAttendees: z.array(z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
    age: z.string().min(1, { message: "Age is required." }),
    gender: z.enum(["Female", "Male", "Transgender", "I prefer not to say", "Other"]),
  })).optional(),
  agreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms.",
  }),
});

declare global {
  interface Window {
    Cashfree: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export function BookingWizard({ 
  variant = "compact",
  onStepChange
}: { 
  variant?: "compact" | "full";
  onStepChange?: (step: number) => void;
}) {
  const [step, setStepInternal] = useState(0); 

  const setStep = (newStep: number) => {
    setStepInternal(newStep);
    onStepChange?.(newStep);
  };  const [dbConfig, setDbConfig] = useState<any>(null);
  const [dbPricing, setDbPricing] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTicket = async () => {
    if (!registrationId) return;
    setIsDownloading(true);
    try {
      const QRCode = await import("qrcode");
      const verifyUrl = `${window.location.origin}/kumaon-fest/verify/${registrationId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 2, color: { dark: "#000000", light: "#ffffff" } });

      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 860;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#111827";
      ctx.roundRect(0, 0, 600, 860, 24);
      ctx.fill();

      // Yellow header band
      ctx.fillStyle = "#EAB308";
      ctx.roundRect(0, 0, 600, 160, [24, 24, 0, 0]);
      ctx.fill();

      // Header text
      ctx.fillStyle = "#000000";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("KUMAON FEST 2026", 300, 70);
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("SUMMER CARNIVAL · OFFICIAL ENTRY PASS", 300, 108);
      ctx.font = "14px sans-serif";
      ctx.fillText("30 May 2026  ·  Kripa Sindhu Lawn, Haldwani", 300, 140);

      // Dashed divider
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 180);
      ctx.lineTo(560, 180);
      ctx.stroke();
      ctx.setLineDash([]);

      // Attendee name
      const name = form.getValues("email") ? form.getValues("fullName") || "Attendee" : "Attendee";
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ATTENDEE", 300, 215);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(name, 300, 248);

      // QR code
      const qrImg = new Image();
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
        qrImg.src = qrDataUrl;
      });
      ctx.fillStyle = "#FFFFFF";
      ctx.roundRect(175, 270, 250, 250, 16);
      ctx.fill();
      ctx.drawImage(qrImg, 185, 280, 230, 230);

      // Ticket ID
      ctx.fillStyle = "#6B7280";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`TICKET ID: ${registrationId}`, 300, 550);

      // Bottom dashed divider
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = "#374151";
      ctx.beginPath();
      ctx.moveTo(40, 575);
      ctx.lineTo(560, 575);
      ctx.stroke();
      ctx.setLineDash([]);

      // Instructions
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Present this QR code at the gate for entry", 300, 615);
      ctx.fillText("Carry a valid ID for age verification", 300, 640);

      // Footer
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.fillText("taameerartivists.org  ·  © 2026 Taameer Artivists Foundation", 300, 820);

      // Trigger download
      const link = document.createElement("a");
      link.download = `kumaon-fest-ticket-${registrationId.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setIsDownloading(false);
    }
  };

  // All data comes from Supabase — no local fallbacks
  const tiers = dbPricing;

  const isEarlyBird = dbConfig?.early_bird_active === "true" || dbConfig?.early_bird_active === true;

  const minPrice = tiers.length > 0
    ? (isEarlyBird 
        ? Math.min(...tiers.map(p => (p as any).earlyBirdPrice))
        : Math.min(...tiers.map(p => (p as any).regularPrice)))
    : null;

  const maxRegularPrice = tiers.length > 0
    ? Math.max(...tiers.map(p => (p as any).regularPrice))
    : null;

  // Format early bird dates from Supabase
  const formatEarlyBirdDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };
  const earlyBirdStart = formatEarlyBirdDate(dbConfig?.early_bird_start);
  const earlyBirdEnd = formatEarlyBirdDate(dbConfig?.early_bird_end);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, pricing] = await Promise.all([
          getEventConfig(),
          getEventPricing()
        ]);
        if (config) setDbConfig(config);
        if (pricing) setDbPricing(pricing);
      } catch (err) {
        console.error("Failed to load DB data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "Female",
      whatsappNo: "",
      contactNo: "",
      email: "",
      passType: "Regular Pass",
      quantity: "1",
      address: "",
      instagramHandle: "",
      additionalAttendees: [],
      agreed: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalAttendees" as never,
  });

  const selectedQuantity = parseInt(form.watch("quantity") || "1");

  useEffect(() => {
    const targetCount = Math.max(0, selectedQuantity - 1);
    const currentCount = fields.length;

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        append({ fullName: "", age: "", gender: "Female" });
      }
    } else if (targetCount < currentCount) {
      for (let i = currentCount - 1; i >= targetCount; i--) {
        remove(i);
      }
    }
  }, [selectedQuantity, append, remove]);

  const selectPass = (type: string) => {
    form.setValue("passType", type as any);
    form.setValue("quantity", type === "Group of 4" ? "4" : "1");
    setStep(1);
  };

  const selectedPass = form.watch("passType");
  const isGroupOf4 = selectedPass === "Group of 4";

  useEffect(() => {
    if (isGroupOf4) {
      form.setValue("quantity", "4");
    } else {
      form.setValue("quantity", "1");
    }
  }, [isGroupOf4, form]);

  const getPrice = () => {
    const pass = tiers.find(t => t.id === (selectedPass as any));
    if (!pass) return 0;
    const price = isEarlyBird ? (pass as any).earlyBirdPrice : (pass as any).regularPrice;
    // Group pass price is for the whole group — do not multiply by quantity
    if (isGroupOf4) return price;
    return price * selectedQuantity;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setNotification(null);
    try {
      const preRegResult = await preRegisterUser(values);
      if (!preRegResult.success || !preRegResult.registrationId) throw new Error("Failed to save details.");
      
      const regId = preRegResult.registrationId;
      setRegistrationId(regId);

      const amount = getPrice();
      if (!amount || amount <= 0) {
        setNotification({ type: "error", message: "Invalid pass pricing. Please contact support." });
        setIsSubmitting(false);
        return;
      }
      const order = await createCashfreeOrder(amount, {
        name: values.fullName,
        email: values.email,
        phone: values.contactNo,
      });
      
      if (!window.Cashfree) {
        setNotification({ type: "error", message: "Payment system loading... Please try again." });
        setIsSubmitting(false);
        return;
      }

      const cashfree = window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "PRODUCTION" ? "production" : "sandbox" });

      cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      }).then(async (result: any) => {
        if (result.error) {
          setNotification({ type: "error", message: result.error.message || "Payment cancelled." });
          setIsSubmitting(false);
        } else if (result.paymentDetails) {
          try {
              await confirmPayment({
                registrationId: regId,
                paymentId: result.paymentDetails.paymentMessage || "",
                orderId: order.orderId || "",
                signature: "", // Cashfree verifies server-side via API
              });
            setStep(2);
          } catch (err: unknown) {
            const error = err as Error;
            setNotification({ type: "error", message: `Verification failed: ${error.message}` });
          }
        } else {
          // Payment may have been redirected, verify via server
          try {
            await confirmPayment({
              registrationId: regId,
              paymentId: "",
              orderId: order.orderId || "",
              signature: "",
            });
            setStep(2);
          } catch (err: unknown) {
            const error = err as Error;
            setNotification({ type: "error", message: `Verification failed: ${error.message}` });
            setIsSubmitting(false);
          }
        }
      }).catch((err: any) => {
        setNotification({ type: "error", message: err.message || "Payment failed." });
        setIsSubmitting(false);
      });
    } catch (error: unknown) {
      const err = error as Error;
      setNotification({ type: "error", message: err.message || "Payment failed." });
      setIsSubmitting(false);
    }
  }

  // --- RENDERING HELPERS ---

  if (variant === "compact") {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl max-w-md w-full mx-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  {isEarlyBird ? (
                    <>
                      {maxRegularPrice && <span className="text-gray-500 text-[10px] line-through font-bold">₹{maxRegularPrice}</span>}
                      <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em] bg-red-500/10 px-2 py-0.5 rounded-full">Early Bird</span>
                    </>
                  ) : (
                    <span className="text-yellow-500 text-[9px] font-black uppercase tracking-[0.15em] bg-yellow-500/10 px-2 py-0.5 rounded-full">Booking Open</span>
                  )}
                </div>
                <div className="text-white text-2xl font-black tracking-tighter leading-none flex items-baseline gap-1">
                  ₹{minPrice}<span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-0.5">onwards</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">Book Your Pass</h3>
                <p className="text-xs text-gray-400">Select a pass to get started</p>
              </div>
              <div className="space-y-2">
                {tiers.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => selectPass(tier.id)}
                    className="w-full p-4 rounded-2xl border border-gray-800 bg-gray-950 hover:border-yellow-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="text-left">
                      <div className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors">{tier.name}</div>
                      <div className="text-[10px] text-gray-500">{tier.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-500 font-black">
                        ₹{isEarlyBird ? (tier as any).earlyBirdPrice : (tier as any).regularPrice}
                      </div>
                      {isEarlyBird && (tier as any).regularPrice && (
                        <div className="text-[10px] text-gray-500 line-through">
                          ₹{(tier as any).regularPrice}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <button onClick={() => setStep(0)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Your Details</h3>
                <p className="text-[10px] text-gray-400">Booking <span className="text-yellow-500 font-bold">{selectedPass}</span></p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Full Name *" required className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors" {...field} /></FormControl></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormControl><Input type="email" placeholder="Email *" required className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="whatsappNo" render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="WhatsApp *" required className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem><FormControl><Input placeholder="Age" type="number" required className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Qty" 
                            type="number" 
                            min="1" 
                            max="5" 
                            required 
                            className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors" 
                            {...field} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 5) {
                                field.onChange("5");
                              } else if (val < 1) {
                                field.onChange("1");
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormControl><Textarea placeholder="Address" className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500/50 transition-colors min-h-[60px]" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="agreed" render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-700 data-[state=checked]:bg-yellow-500" /></FormControl>
                      <FormLabel className="text-[10px] text-gray-400 leading-tight cursor-pointer hover:text-gray-300 transition-colors">I agree to the terms and conditions.</FormLabel>
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-bold h-12 rounded-xl transition-all active:scale-95">
                    {isSubmitting ? "Processing..." : `Pay ₹${getPrice()}`}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="succ" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8" onViewportEnter={() => confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#EAB308", "#000000"] })}>
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/20">
                <CheckCircle2 className="w-10 h-10 text-gray-950" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Success!</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Your ticket has been sent to your email.</p>
                <p className="text-xs text-yellow-500/80 max-w-[220px] mx-auto">📬 Can&apos;t find it? Check your spam / junk folder.</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={downloadTicket} disabled={isDownloading} className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-950 rounded-xl font-black transition-all active:scale-95">{isDownloading ? "Generating..." : "⬇ Download Ticket"}</Button>
                <Button onClick={() => window.location.href = `/kumaon-fest/verify/${registrationId}`} className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all active:scale-95">View Ticket</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {notification && (
          <div className={`mt-4 p-2 rounded text-[10px] text-center ${notification.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {notification.message}
          </div>
        )}
      </div>
    );
  }

  // --- FULL PAGE VARIANT ---
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="full-sel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 py-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-2">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Limited Passes</Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                Select Your <span className="text-yellow-500">Pass</span>
              </h1>
              <p className="text-gray-500 text-sm">Choose the pass that suits you best.</p>
            </div>

            {/* Early Bird Banner */}
            {isEarlyBird ? (
              <div className="flex flex-wrap items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-2.5 text-center">
                <span className="text-red-400 text-xs font-black uppercase tracking-widest">🔥 Early Bird Active</span>
                {earlyBirdStart && earlyBirdEnd && (
                  <span className="text-gray-300 text-xs font-semibold">{earlyBirdStart} → <span className="text-red-400 font-black">{earlyBirdEnd}</span></span>
                )}
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Book before prices go up!</span>
              </div>
            ) : (earlyBirdStart || earlyBirdEnd) ? (
              <div className="flex flex-wrap items-center justify-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-2.5 text-center">
                <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">🎟 Booking Open</span>
                {earlyBirdStart && earlyBirdEnd && (
                  <span className="text-gray-400 text-xs">Early Bird was: <span className="line-through text-gray-500">{earlyBirdStart} → {earlyBirdEnd}</span></span>
                )}
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Regular pricing applies</span>
              </div>
            ) : null}

            {/* Compact Pass List */}
            <div className="space-y-2">
              {[...tiers]
                .sort((a, b) => {
                  const aOffline = (a as any).offlineOnly === true;
                  const bOffline = (b as any).offlineOnly === true;
                  if (aOffline && !bOffline) return 1;
                  if (!aOffline && bOffline) return -1;
                  return (a as any).regularPrice - (b as any).regularPrice;
                })
                .map((tier) => {
                const price = isEarlyBird ? (tier as any).earlyBirdPrice : (tier as any).regularPrice;
                const regularPrice = (tier as any).regularPrice;
                const highlightSet: string[] = (tier as any).highlightFeatures ?? (tier as any).highlight_features ?? [];
                const features: string[] = (tier as any).features ?? [];
                const isOffline = (tier as any).offlineOnly === true;
                const enquirePhone: string | null = (tier as any).enquirePhone ?? null;
                const enquireText: string | null = (tier as any).enquireText ?? null;

                if (isOffline) {
                  return (
                    <div key={tier.id} className="relative rounded-2xl border border-dashed border-gray-700 bg-gray-900/20 opacity-80">
                      <div className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-gray-300 text-sm">{tier.name}</span>
                              <Badge className="text-[9px] bg-orange-500/20 text-orange-400 border-orange-500/30 h-4 px-1.5 font-bold">OFFLINE ONLY</Badge>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{tier.description}</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {features.slice(0, 4).map((f: string) => (
                                <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-500">{f}</span>
                              ))}
                            </div>
                            {enquireText && (
                              <p className="text-[11px] text-orange-400/80 font-medium leading-relaxed">{enquireText}</p>
                            )}
                          </div>
                          <div className="shrink-0">
                            {enquirePhone ? (
                              <Button
                                onClick={() => window.open(`https://wa.me/91${enquirePhone}`, "_blank")}
                                className="h-9 px-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xs shadow-lg shadow-green-900/30"
                              >
                                Enquire
                              </Button>
                            ) : (
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Not Available Online</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={tier.id}
                    className={`relative group rounded-2xl border transition-all duration-300 cursor-pointer hover:border-yellow-500/60 hover:bg-gray-900 ${
                      tier.popular
                        ? "border-yellow-500 bg-yellow-500/5 shadow-lg shadow-yellow-500/10"
                        : "border-gray-800 bg-gray-900/40"
                    }`}
                    onClick={() => selectPass(tier.id)}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 left-4 bg-yellow-500 text-gray-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-white text-sm">{tier.name}</span>
                          {isEarlyBird && <Badge variant="outline" className="text-[9px] border-yellow-500/40 text-yellow-500 h-4 px-1.5 font-bold">EARLY BIRD</Badge>}
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2 leading-relaxed font-medium">{tier.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {features.slice(0, 3).map((f: string) => {
                            const isHighlight = highlightSet.includes(f);
                            return (
                              <span key={f} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isHighlight ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20" : "bg-gray-800 text-gray-400"}`}>
                                {isHighlight && "★ "}{f}
                              </span>
                            );
                          })}
                          {features.length > 3 && <span className="text-[10px] text-gray-600 font-semibold px-2 py-0.5">+{features.length - 3} more</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xl font-black text-white tracking-tighter">₹{price}</div>
                          {isEarlyBird && regularPrice && <div className="text-[10px] text-gray-500 line-through">₹{regularPrice}</div>}
                        </div>
                        <Button
                          onClick={(e) => { e.stopPropagation(); selectPass(tier.id); }}
                          className="h-9 px-5 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-black rounded-xl text-xs shadow-lg shadow-yellow-500/20 shrink-0"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loading state */}
            {tiers.length === 0 && (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-900/50 border border-gray-800 animate-pulse" />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="full-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors font-bold uppercase text-xs tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Change Pass
              </button>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                  {/* ── PASS TYPE ──────────────────────────────────────────── */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Ticket className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider">Pass Type</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">{selectedQuantity} Attendee{selectedQuantity > 1 ? "s" : ""}</span>
                    </div>
                    <div className={`grid gap-4 ${isGroupOf4 ? "grid-cols-1" : "grid-cols-2"}`}>
                      <FormField control={form.control} name="passType" render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Selected Pass</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-11 bg-gray-950 border-gray-800 text-white text-sm rounded-lg"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">{tiers.filter(t => !(t as any).offlineOnly).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      {!isGroupOf4 && (
                        <FormField control={form.control} name="quantity" render={({ field }) => {
                          const qty = parseInt(field.value || "1");
                          return (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">No. of Attendees (max 5)</FormLabel>
                              <div className="flex items-center gap-2 h-11">
                                <button type="button" onClick={() => qty > 1 && field.onChange(String(qty - 1))} disabled={qty <= 1}
                                  className="w-11 h-11 rounded-lg bg-gray-950 border border-gray-800 text-white text-lg font-bold flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0">−</button>
                                <div className="flex-1 h-11 bg-gray-950 border border-gray-800 rounded-lg flex items-center justify-center text-white font-black text-base">{qty}</div>
                                <button type="button" onClick={() => qty < 5 && field.onChange(String(qty + 1))} disabled={qty >= 5}
                                  className="w-11 h-11 rounded-lg bg-gray-950 border border-gray-800 text-white text-lg font-bold flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0">+</button>
                              </div>
                            </FormItem>
                          );
                        }} />
                      )}
                    </div>
                    {isGroupOf4 && (
                      <div className="mt-3 flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" /> Fill details for all 4 group members below
                      </div>
                    )}
                  </div>

                  {/* ── PASSENGER 1 (YOU) ──────────────────────────────────── */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
                      <div className="w-7 h-7 rounded-full bg-yellow-500 text-gray-950 flex items-center justify-center font-black text-xs shrink-0">1</div>
                      <span className="text-yellow-400 text-sm font-bold">Attendee 1 <span className="text-yellow-600 font-normal">(You)</span></span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Full Name *</FormLabel>
                            <FormControl><Input placeholder="John Doe" required className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="age" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Age *</FormLabel>
                            <FormControl><Input type="number" required placeholder="20" className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Gender</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {["Female", "Male", "Transgender", "I prefer not to say", "Other"].map(opt => (
                              <button key={opt} type="button" onClick={() => field.onChange(opt)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${field.value === opt ? "bg-yellow-500 border-yellow-500 text-gray-950" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* ── ADDITIONAL PASSENGERS ──────────────────────────────── */}
                  {fields.map((fieldItem, index) => (
                    <div key={fieldItem.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center font-black text-xs shrink-0">{index + 2}</div>
                          <span className="text-gray-300 text-sm font-bold">Attendee {index + 2}</span>
                        </div>
                        {!isGroupOf4 && (
                          <button type="button" onClick={() => form.setValue("quantity", String(selectedQuantity - 1))}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10">
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name={`additionalAttendees.${index}.fullName` as any} render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Full Name *</FormLabel>
                              <FormControl><Input placeholder={`Attendee ${index + 2} name`} required className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`additionalAttendees.${index}.age` as any} render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Age *</FormLabel>
                              <FormControl><Input type="number" required placeholder="20" className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name={`additionalAttendees.${index}.gender` as any} render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Gender</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {["Female", "Male", "Transgender", "I prefer not to say", "Other"].map(opt => (
                                <button key={opt} type="button" onClick={() => field.onChange(opt)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${field.value === opt ? "bg-yellow-500 border-yellow-500 text-gray-950" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"}`}>
                                  {opt}
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  ))}

                  {/* Add Attendee button */}
                  {!isGroupOf4 && selectedQuantity < 5 && (
                    <button type="button" onClick={() => form.setValue("quantity", String(selectedQuantity + 1))}
                      className="w-full h-11 border border-dashed border-gray-700 rounded-2xl text-gray-400 hover:text-yellow-500 hover:border-yellow-500/50 transition-all text-sm font-semibold flex items-center justify-center gap-2">
                      <span className="text-lg leading-none">+</span> Add Attendee <span className="text-gray-600">({selectedQuantity}/5)</span>
                    </button>
                  )}

                  {/* ── CONTACT DETAILS ────────────────────────────────────── */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 bg-white/5 border-b border-white/5">
                      <span className="text-gray-300 text-sm font-bold uppercase tracking-wider">Contact Details</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="whatsappNo" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">WhatsApp *</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" required className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="contactNo" render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Contact *</FormLabel>
                            <FormControl><Input placeholder="+91 XXXXX XXXXX" required className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Email Address *</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" required className="h-11 bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 rounded-lg px-4" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Address</FormLabel>
                          <FormControl><Textarea placeholder="Street, City, State, PIN" className="bg-gray-950 border-gray-800 text-white text-sm focus:border-yellow-500/60 min-h-[80px] rounded-lg p-4" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* ── TERMS + SUBMIT ─────────────────────────────────────── */}
                  <FormField control={form.control} name="agreed" render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5 border-gray-700 data-[state=checked]:bg-yellow-500" /></FormControl>
                      <FormLabel className="text-sm text-gray-400 cursor-pointer leading-relaxed">I agree to the terms and conditions.</FormLabel>
                    </FormItem>
                  )} />

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-lg rounded-2xl shadow-2xl transition-all active:scale-[0.98]">
                    {isSubmitting ? "Processing Payment..." : `Proceed to Pay ₹${getPrice()}`}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="sticky top-8 space-y-8">
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-yellow-500" /> Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>{selectedPass}{isGroupOf4 ? " (4 people)" : ` × ${selectedQuantity}`}</span>
                    <span>₹{getPrice()}</span>
                  </div>
                  <div className="h-px bg-gray-800" />
                  <div className="flex justify-between text-xl md:text-2xl font-bold text-white"><span>Total</span><span className="text-yellow-500">₹{getPrice()}</span></div>
                  <div className="pt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs text-gray-500 leading-relaxed"><CreditCard className="w-4 h-4 shrink-0 text-yellow-500" /> Secure payment via Cashfree. Multiple options available (UPI, Card, NetBanking).</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" /> Rules & Regulations</h3>
                <ul className="space-y-2">
                  {[
                    "Alcohol is strictly not allowed",
                    "Valid ID proof required for entry",
                    "Student ID mandatory for Student Pass",
                    "No outside food or drinks",
                  ].map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="full-succ" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center space-y-8 py-20" onViewportEnter={() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ["#EAB308", "#000000"] })}>
            <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/20">
              <CheckCircle2 className="w-16 h-16 text-gray-950" />
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black text-white italic tracking-tighter">BOOM! YOU&apos;RE IN.</h2>
              <p className="text-gray-400 text-xl">Your ticket for Summer Carnival - The Kumaon Fest has been sent <span className="text-white font-bold">{form.getValues("email")}</span></p>
              <p className="text-yellow-500/80 text-sm font-medium">📬 Can&apos;t find it? Check your spam / junk folder.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={downloadTicket} disabled={isDownloading} className="h-14 px-10 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-2xl text-lg">{isDownloading ? "Generating..." : "⬇ Download Ticket"}</Button>
              <Button onClick={() => window.location.href = `/kumaon-fest/verify/${registrationId}`} className="h-14 px-10 bg-white hover:bg-gray-100 text-gray-950 font-black rounded-2xl text-lg">View Digital Ticket</Button>
              <Button onClick={() => window.location.href = "/"} className="h-14 px-10 border border-gray-800 bg-transparent text-white hover:bg-gray-800 rounded-2xl font-bold transition-all">Back to Home</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
