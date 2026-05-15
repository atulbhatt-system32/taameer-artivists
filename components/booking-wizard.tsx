"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import eventsData from "@/data/events.json";

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

export function BookingWizard({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const [step, setStep] = useState(0); 
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [dbPricing, setDbPricing] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const tiers = dbPricing.length > 0 ? dbPricing : eventsData.featuredEvent.pricing;

  const isEarlyBird = dbConfig?.early_bird_active !== undefined 
    ? (dbConfig.early_bird_active === "true" || dbConfig.early_bird_active === true)
    : eventsData.featuredEvent.earlyBirdActive;

  const minPrice = isEarlyBird 
    ? Math.min(...tiers.map(p => (p as any).earlyBirdPrice))
    : Math.min(...tiers.map(p => (p as any).regularPrice));

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
    const currentCount = fields.length;
    const targetCount = Math.max(0, selectedQuantity - 1);

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        append({ fullName: "", age: "", gender: "Female" });
      }
    } else if (targetCount < currentCount) {
      for (let i = currentCount - 1; i >= targetCount; i--) {
        remove(i);
      }
    }
  }, [selectedQuantity, append, remove, fields.length]);

  const selectPass = (type: string) => {
    form.setValue("passType", type as any);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedPass = form.watch("passType");

  const getPrice = () => {
    const pass = tiers.find(t => t.id === (selectedPass as any));
    if (!pass) return 0;
    const price = isEarlyBird ? (pass as any).earlyBirdPrice : (pass as any).regularPrice;
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

      const cashfree = window.Cashfree({ mode: "sandbox" }); // Change to "production" for live

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
                      <span className="text-gray-500 text-[10px] line-through font-bold">₹999</span>
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
              <div className="space-y-3">
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
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <button onClick={() => setStep(0)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <div className="mb-2">
                <h3 className="text-lg font-bold text-white">Your Details</h3>
                <p className="text-[10px] text-gray-400">Booking <span className="text-yellow-500 font-bold">{selectedPass}</span></p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              </div>
              <Button onClick={() => window.location.href = `/kumaon-fest/verify/${registrationId}`} className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all active:scale-95">View Ticket</Button>
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
          <motion.div key="full-sel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 py-4">
            <div className="text-center space-y-3">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Limited Passes</Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                Select Your <span className="text-yellow-500 underline decoration-yellow-500/30 underline-offset-8">Pass</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">Choose the pass that suits you best. All passes cover both days.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              {tiers.map((tier) => (
                <div key={tier.id} className={`group relative h-full rounded-3xl p-6 border transition-all duration-500 hover:border-yellow-500/50 ${tier.popular ? "border-yellow-500 bg-yellow-500/5 shadow-2xl shadow-yellow-500/20" : "border-gray-800 bg-gray-900/50"} flex flex-col`}>
                  {tier.popular && <span className="absolute -top-3 left-6 bg-yellow-500 text-gray-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Popular Choice</span>}
                  <div className="text-xl font-bold text-yellow-500 mb-1">{tier.name}</div>
                  <div className="flex flex-col mb-3">
                    <div className="text-4xl font-black tracking-tighter flex items-baseline gap-1 text-white">
                      <span className="text-xl font-normal text-gray-500">₹</span>
                      {isEarlyBird ? (tier as any).earlyBirdPrice : (tier as any).regularPrice}
                    </div>
                    {isEarlyBird && (tier as any).regularPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">₹{(tier as any).regularPrice}</span>
                        <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-500 h-5 px-1.5 font-bold">EARLY BIRD</Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed flex-1">{tier.description}</p>
                  <div className="space-y-3 mb-6">
                    {tier.features?.map((p: string) => (
                      <div key={p} className="flex items-center gap-2 text-sm text-gray-300">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => selectPass(tier.id)} className="w-full h-12 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black transition-transform active:scale-95 shadow-xl shadow-yellow-500/10">Book Now</Button>
                  <div className="mt-3 text-center">
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="full-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors font-bold uppercase text-xs tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Go Back
              </button>
              
              <div className="bg-gray-900/50 border border-gray-800 p-5 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
                <div className="mb-8 md:mb-10 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Registration Details</h2>
                  <p className="text-sm text-gray-400">Booking <span className="text-yellow-500 font-bold">{selectedPass}</span></p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    <div className="space-y-8">
                      <div className="flex items-center gap-4 text-yellow-500">
                        <Users className="w-6 h-6" />
                        <h3 className="text-xl font-bold tracking-tight">Personal Information</h3>
                        <div className="h-px bg-gray-800 flex-1" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem className="space-y-4"><FormLabel className="text-white mb-3 block font-semibold">Full Name *</FormLabel><FormControl><Input placeholder="John Doe" required className="h-14 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="age" render={({ field }) => (
                          <FormItem className="space-y-4"><FormLabel className="text-white mb-3 block font-semibold">Age *</FormLabel><FormControl><Input type="number" required placeholder="20" className="h-14 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem className="space-y-5">
                            <FormLabel className="text-white mb-4 block font-semibold text-lg">Gender</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-wrap gap-6"
                              >
                                {["Female", "Male", "Transgender", "I prefer not to say", "Other"].map((opt) => {
                                  const id = `gender-${opt.toLowerCase().replace(/\s+/g, "-")}`;
                                  return (
                                    <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem
                                          value={opt}
                                          id={id}
                                          className="border-gray-700 text-yellow-500"
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor={id} className="font-normal cursor-pointer text-gray-300">
                                        {opt}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                })}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField control={form.control} name="whatsappNo" render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-white font-bold text-lg">WhatsApp Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" required className="h-16 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-2xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="contactNo" render={({ field }) => (
                          <FormItem className="space-y-6">
                            <FormLabel className="text-white font-bold text-lg">Contact Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" required className="h-16 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-2xl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem className="space-y-6">
                          <FormLabel className="text-white font-bold text-lg">Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" required className="h-16 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-2xl" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-4 text-yellow-500">
                        <Ticket className="w-6 h-6" />
                        <h3 className="text-xl font-bold tracking-tight">Booking Info</h3>
                        <div className="h-px bg-gray-800 flex-1" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-10">
                        <FormField control={form.control} name="passType" render={({ field }) => (
                          <FormItem className="space-y-4"><FormLabel className="text-white mb-3 block font-semibold">Pass Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-14 bg-gray-950 border-gray-800 text-white rounded-xl"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-gray-900 border-gray-800 text-white">{tiers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></FormItem>
                        )} />
                        <FormField control={form.control} name="quantity" render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-white mb-3 block font-semibold">Number of People (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="5" 
                                required 
                                className="h-14 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-xl" 
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
                            <FormDescription className="text-[10px] md:text-xs text-gray-500">Max 5 people. Select 5 for bulk discount.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Additional Attendees */}
                      {fields.length > 0 && (
                        <div className="space-y-8 pt-4">
                          <div className="flex items-center gap-4 text-yellow-500">
                            <Users className="w-6 h-6" />
                            <h3 className="text-xl font-bold tracking-tight">Other Persons Details</h3>
                            <div className="h-px bg-gray-800 flex-1" />
                          </div>
                          <div className="space-y-10">
                            {fields.map((field, index) => (
                              <div key={field.id} className="p-4 md:p-6 bg-white/5 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 space-y-4 md:space-y-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-500 text-gray-950 flex items-center justify-center font-bold text-xs md:text-sm">
                                    {index + 2}
                                  </div>
                                  <span className="font-bold text-white uppercase tracking-widest text-[10px] md:text-xs">Person {index + 2}</span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-10">
                                  <FormField
                                    control={form.control}
                                    name={`additionalAttendees.${index}.fullName` as any}
                                    render={({ field }) => (
                                      <FormItem className="space-y-4">
                                        <FormLabel className="text-white mb-3 block font-semibold">Full Name *</FormLabel>
                                        <FormControl>
                                          <Input placeholder={`Person ${index + 2} Name`} required className="h-14 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`additionalAttendees.${index}.age` as any}
                                    render={({ field }) => (
                                      <FormItem className="space-y-4">
                                        <FormLabel className="text-white mb-3 block font-semibold">Age *</FormLabel>
                                        <FormControl>
                                          <Input type="number" required placeholder="20" className="h-14 bg-gray-950 border-gray-800 text-white focus:border-yellow-500 rounded-xl" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={form.control}
                                  name={`additionalAttendees.${index}.gender` as any}
                                  render={({ field }) => (
                                    <FormItem className="space-y-4">
                                      <FormLabel className="text-white">Gender</FormLabel>
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value}
                                          className="flex flex-wrap gap-6"
                                        >
                                          {["Female", "Male", "Transgender", "I prefer not to say", "Other"].map((opt) => {
                                            const id = `gender-${index}-${opt.toLowerCase().replace(/\s+/g, "-")}`;
                                            return (
                                              <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={opt}
                                                    id={id}
                                                    className="border-gray-700 text-yellow-500"
                                                  />
                                                </FormControl>
                                                <FormLabel htmlFor={id} className="font-normal cursor-pointer text-gray-300">
                                                  {opt}
                                                </FormLabel>
                                              </FormItem>
                                            );
                                          })}
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="space-y-4"><FormLabel className="text-white mb-3 block font-semibold">Complete Address</FormLabel><FormControl><Textarea placeholder="Street, City, State, PIN" className="bg-gray-950 border-gray-800 text-white focus:border-yellow-500 min-h-[120px] rounded-2xl p-4" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="agreed" render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/10"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 border-gray-700 data-[state=checked]:bg-yellow-500" /></FormControl><FormLabel className="text-sm text-gray-400 cursor-pointer leading-relaxed">I agree to the terms and conditions.</FormLabel></FormItem>
                      )} />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-[0.98]">
                      {isSubmitting ? "Processing Payment..." : `Proceed to Pay ₹${getPrice()}`}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[2.5rem] sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-yellow-500" /> Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-400 text-sm"><span>{selectedPass} x {selectedQuantity}</span><span>₹{getPrice()}</span></div>
                  <div className="h-px bg-gray-800" />
                  <div className="flex justify-between text-xl md:text-2xl font-bold text-white"><span>Total</span><span className="text-yellow-500">₹{getPrice()}</span></div>
                  <div className="pt-6 space-y-4">
                    <div className="flex items-start gap-3 text-xs text-gray-500 leading-relaxed"><CreditCard className="w-4 h-4 shrink-0 text-yellow-500" /> Secure payment via Cashfree. Multiple options available (UPI, Card, NetBanking).</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[2.5rem]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-500" /> Rules & Regulations</h3>
                <ul className="space-y-3">
                  {eventsData.featuredEvent.rules.map((rule, idx) => (
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
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white italic tracking-tighter">BOOM! YOU&apos;RE IN.</h2>
              <p className="text-gray-400 text-xl">Your ticket for Kumaon Fest 2026 has been sent to <span className="text-white font-bold">{form.getValues("email")}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = `/kumaon-fest/verify/${registrationId}`} className="h-14 px-10 bg-white hover:bg-gray-100 text-gray-950 font-black rounded-2xl text-lg">View Digital Ticket</Button>
              <Button onClick={() => window.location.href = "/"} className="h-14 px-10 border border-gray-800 bg-transparent text-white hover:bg-gray-800 rounded-2xl font-bold transition-all">Back to Home</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
