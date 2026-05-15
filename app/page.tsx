"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Leaf, Camera, Users, CalendarDays, Sparkles, ArrowRight, MapPin, Instagram, Youtube, Facebook, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import organizationData from "@/data/organization.json";
import eventsData from "@/data/events.json";
import { getEventConfig, getEventPricing } from "@/app/actions/booking";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const { name, tagline, description, mission, locations, region, founded, volunteers, impact, focusAreas, contact, social } = organizationData;
  const { featuredEvent } = eventsData;

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      setShowSticky(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const stats = [
    { value: impact.cleanlinessdrives.count, label: impact.cleanlinessdrives.label },
    { value: impact.events.count, label: impact.events.label },
    { value: impact.peopleReached.count, label: impact.peopleReached.label },
  ];

  const [dbConfig, setDbConfig] = useState<any>(null);
  const [dbPricing, setDbPricing] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, pricing] = await Promise.all([
          getEventConfig(),
          getEventPricing()
        ]);
        if (config) setDbConfig(config);
        if (pricing) setDbPricing(pricing);
      } catch (e) {
        console.error("Failed to fetch event data", e);
      }
    };
    fetchData();
  }, []);

  // All data comes from Supabase — no local fallbacks
  const tiers = dbPricing;

  const isEarlyBird = dbConfig?.early_bird_active === "true" || dbConfig?.early_bird_active === true;

  // Find the tier with the minimum price (guard against empty array while Supabase is loading)
  const minTier = tiers.length > 0 ? [...tiers].sort((a, b) => {
    const priceA = isEarlyBird ? (a as any).earlyBirdPrice : (a as any).regularPrice;
    const priceB = isEarlyBird ? (b as any).earlyBirdPrice : (b as any).regularPrice;
    return priceA - priceB;
  })[0] : null;

  const minPrice = minTier ? (isEarlyBird ? (minTier as any).earlyBirdPrice : (minTier as any).regularPrice) : null;
  const originalPrice = minTier ? (minTier as any).regularPrice : null;

  // Format early bird dates from Supabase
  const formatEarlyBirdDate = (dateStr: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };
  const earlyBirdStart = formatEarlyBirdDate(dbConfig?.early_bird_start);
  const earlyBirdEnd = formatEarlyBirdDate(dbConfig?.early_bird_end);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 py-4"
          : "bg-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 group-hover:scale-105 transition-transform drop-shadow-xl">
              <Image
                src="/new-images/IMG_6419.PNG"
                fill
                alt="Logo"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`font-black text-sm tracking-wider uppercase transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Taameer</span>
              <span className="font-black text-xs tracking-[0.3em] uppercase text-yellow-400">Artivists</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "About", href: "#about" },
              { label: "Mission", href: "#mission" },
              { label: "Impact", href: "#impact" },
              { label: "Events", href: "/events" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-yellow-400 ${scrolled ? "text-gray-600" : "text-white/80"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>


        </div>
      </header>

      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">

          {/* Full-bleed Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/home.jpg"
              fill
              alt="Taameer Artivists community"
              className="object-cover object-center"
              priority
            />
            {/* Darker gradient overlay for better text contrast on mobile and desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-black/20 lg:bg-transparent" /> {/* Extra darkening for mobile */}
          </div>

          {/* Hero Content – sits at the bottom */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">

            {/* Tag */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-yellow-400" />
              <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">{tagline}</span>
            </div>

            {/* Headline with shadow */}
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8 max-w-5xl drop-shadow-2xl">
              Taameer<br />
              <span className="text-yellow-400">Artivists</span>
            </h1>

            {/* Sub + CTA row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <p className="text-white/90 text-lg max-w-xl leading-relaxed font-semibold drop-shadow-lg line-clamp-3 md:line-clamp-none">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-4 shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl shadow-xl transition-all hover:scale-105"
                >
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer">Join The Movement</a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white rounded-xl font-bold transition-all"
                >
                  <Link href="/kumaon-fest/">Kumaon Summer Fest <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>

            {/* Location strip */}
            <div className="flex items-center gap-2 mt-10 text-gray-400">
              <MapPin className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{region} · Est. {founded}</span>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-10 bg-white animate-pulse" />
            <span className="text-white text-[9px] tracking-[0.3em] uppercase">Scroll</span>
          </div>
        </section>

        {/* ── STATS BAND ───────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((s, i) => (
                <div key={i} className="px-8 py-4 md:first:pl-0 md:last:pr-0 text-center md:py-4 py-8">
                  <div className="text-4xl font-black text-yellow-400 tracking-tighter">{s.value}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT / MISSION ──────────────────────────────────────────── */}
        <section id="about" className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: Text */}
              <div>
                <span className="text-xs font-black text-yellow-500 tracking-[0.3em] uppercase">Who We Are</span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none mt-4 mb-8">
                  Art meets<br /><span className="text-yellow-400">Activism.</span>
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
                  {mission}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-px w-10 bg-yellow-400" />
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Haldwani & Nainital, Uttarakhand</span>
                </div>
              </div>

              {/* Right: Focus Area Cards */}
              <div id="mission" className="grid gap-5">
                {focusAreas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-5 p-6 rounded-3xl border border-gray-100 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-yellow-400 transition-colors shrink-0">
                      {area.icon === "Leaf" && <Leaf className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />}
                      {area.icon === "Camera" && <Camera className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />}
                      {area.icon === "Users" && <Users className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg mb-1">{area.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </section>

        {/* ── IMPACT ───────────────────────────────────────────────────── */}
        <section id="impact" className="py-28 bg-gray-950 text-white relative overflow-hidden">

          {/* Ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.08),transparent_60%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <span className="text-xs font-black text-yellow-400 tracking-[0.3em] uppercase">Our Footprint</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none mt-3">
                  Real.<br /><span className="text-yellow-400">Impact.</span>
                </h2>
              </div>
              <p className="text-gray-400 max-w-sm text-base leading-relaxed md:text-right">
                From organizing community clean-ups to staging cultural celebrations — every number represents real people and real change.
              </p>
            </div>

            {/* Two big cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-yellow-400/30 transition-all">
                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Leaf className="w-48 h-48 text-white" />
                </div>
                <div className="relative">
                  <div className="text-xs font-black text-yellow-400 tracking-[0.3em] uppercase mb-4">Environment</div>
                  <h3 className="text-3xl font-black mb-4 leading-tight">Cleanliness Drives</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                    Transforming public spaces across {locations.join(" and ")} through regular community clean-ups.
                  </p>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <div className="text-5xl font-black text-yellow-400 tracking-tight">{impact.cleanlinessdrives.count}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{impact.cleanlinessdrives.label}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group hover:border-yellow-400/30 transition-all">
                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-48 h-48 text-white" />
                </div>
                <div className="relative">
                  <div className="text-xs font-black text-yellow-400 tracking-[0.3em] uppercase mb-4">Community</div>
                  <h3 className="text-3xl font-black mb-4 leading-tight">Cultural Events</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                    Hosting events that bring communities together, celebrate local culture, and create lasting connections.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-5xl font-black text-yellow-400 tracking-tight">{impact.events.count}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{impact.events.label}</div>
                    </div>
                    <div>
                      <div className="text-5xl font-black text-yellow-400 tracking-tight">{impact.peopleReached.count}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{impact.peopleReached.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED EVENT ───────────────────────────────────────────── */}
        <section id="events" className="py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <span className="text-xs font-black text-yellow-500 tracking-[0.3em] uppercase">Annual Flagship</span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-none mt-3">
                  Summer<br /><span className="text-yellow-400">Event.</span>
                </h2>
              </div>
              <Link href="/events" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-yellow-500 transition-colors group">
                View All Events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Event Card */}
            <div className="rounded-[3rem] overflow-hidden border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group">
              <div className="grid lg:grid-cols-2">

                {/* Image */}
                <div className="relative h-80 lg:h-auto min-h-[500px] bg-[#fbf3db]">
                  <Image
                    src={featuredEvent.image || "/placeholder.svg"}
                    fill
                    alt={featuredEvent.name}
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Content */}
                <div className="bg-gray-950 p-8 lg:p-16 flex flex-col justify-center">
                  <div>
                    <Badge className="bg-yellow-400 text-gray-900 font-black text-[10px] px-3 py-1 rounded-full mb-6 uppercase tracking-widest shadow-lg shadow-yellow-400/20">Annual Event</Badge>

                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                      <CalendarDays className="w-4 h-4 text-yellow-400" />
                      <span>{featuredEvent.date}</span>
                    </div>

                    <h3 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter mb-6">
                      {featuredEvent.name}
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                      {featuredEvent.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg" className="h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-yellow-400/20">
                      <Link href="/kumaon-fest/tickets">Get Your Pass <ArrowRight className="w-5 h-5 ml-2" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost" className="h-14 px-8 text-gray-400 hover:text-white hover:bg-white/5 rounded-full font-bold transition-all">
                      <Link href="#events">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT / CTA ────────────────────────────────────────────── */}
        <section id="contact" className="py-28 bg-yellow-400">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              <div>
                <span className="text-xs font-black text-gray-700 tracking-[0.3em] uppercase">Join the Movement</span>
                <h2 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mt-4 mb-6">
                  Let&apos;s build<br />something<br />together.
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed max-w-md">
                  Volunteer, partner with us, or simply show up. Every hand makes our community stronger.
                </p>
              </div>

              <div className="space-y-5">
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Email Us</div>
                  <a href={`mailto:${contact.email}`} className="text-gray-900 font-bold text-lg hover:underline">{contact.email}</a>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Call / WhatsApp</div>
                  <a href={`tel:${contact.phone}`} className="text-gray-900 font-bold text-lg hover:underline">{contact.phone}</a>
                </div>
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Follow Along</div>
                  <div className="flex gap-4">
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all group">
                      <Instagram className="w-4 h-4 text-gray-700 group-hover:text-white" />
                    </a>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">

            {/* Brand */}
            <div className="space-y-4 max-w-xs">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 drop-shadow-xl">
                  <Image
                    src="/new-images/IMG_6419.PNG"
                    fill
                    alt="Logo"
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-black text-lg tracking-tight">Taameer <span className="text-yellow-400">Artivists</span></span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering communities through the fusion of art and activism since {founded}.
              </p>
              <p className="text-gray-600 text-xs">{contact.address}</p>
              
              {/* Founder Details for KYC */}
              {organizationData.founder_details && (
                <div className="pt-4 mt-2 border-t border-white/10">
                  <p className="text-gray-500 text-xs font-semibold mb-2">Founder & Contact Info</p>
                  <p className="text-gray-400 text-sm">{organizationData.founder_details.name}</p>
                  <p className="text-gray-400 text-sm">{organizationData.founder_details.phone}</p>
                  <p className="text-gray-400 text-sm">{organizationData.founder_details.email}</p>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="grid grid-cols-3 gap-12">
              <div>
                <h5 className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-5">Navigate</h5>
                <nav className="flex flex-col gap-3">
                    {[
                      { label: "About", href: "#about" },
                      { label: "Mission", href: "#mission" },
                      { label: "Impact", href: "#impact" },
                      { label: "Events", href: "/events" },
                    ].map((l) => (
                      <Link key={l.label} href={l.href} className="text-gray-400 text-sm font-medium hover:text-white transition-colors">{l.label}</Link>
                    ))}
                </nav>
              </div>
              <div>
                <h5 className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-5">Legal</h5>
                <nav className="flex flex-col gap-3">
                  {[
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Cancellation & Refund", href: "/cancellation-and-refund" },
                    { label: "Terms & Conditions", href: "/terms-and-conditions" },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="text-gray-400 text-sm font-medium hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </nav>
              </div>
              <div>
                <h5 className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-5">Connect</h5>
                <nav className="flex flex-col gap-3">
                  {[
                    { label: "Instagram", href: social.instagram }
                  ].map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm font-medium hover:text-white transition-colors">{l.label}</a>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p className="text-gray-700 text-xs font-semibold tracking-widest uppercase">Made for the Culture.</p>
          </div>
        </div>
      </footer>

      {/* ── STICKY CTA BAR ───────────────────────────────────────────── */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: showSticky ? 0 : 100,
          opacity: showSticky ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-6 left-4 right-4 z-[100] flex justify-center"
      >
        <div className="w-full max-w-lg bg-gray-950/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              {isEarlyBird ? (
                <>
                  <span className="text-gray-500 text-[10px] line-through font-bold">₹{originalPrice}</span>
                  <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em] bg-red-500/10 px-2 py-0.5 rounded-full">Early Bird</span>
                </>
              ) : (
                <span className="text-yellow-500 text-[9px] font-black uppercase tracking-[0.15em] bg-yellow-500/10 px-2 py-0.5 rounded-full">Booking Open</span>
              )}
            </div>
            <div className="text-white text-2xl font-black tracking-tighter leading-none flex items-baseline gap-1">
              ₹{minPrice}<span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-0.5">onwards</span>
            </div>
            {isEarlyBird && earlyBirdEnd && (
              <div className="text-[9px] text-red-400 font-bold mt-0.5 tracking-wide">
                Ends {earlyBirdEnd}
              </div>
            )}
          </div>
          
          <Button asChild className="h-12 md:h-14 px-6 md:px-8 bg-yellow-600 hover:bg-yellow-700 text-white font-black rounded-full text-sm md:text-base shadow-lg shadow-red-600/20 group transition-all active:scale-95 shrink-0">
            <Link href="/kumaon-fest/tickets" className="flex items-center gap-2">
              <span>Book Now</span> 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
