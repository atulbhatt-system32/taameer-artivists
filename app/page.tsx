"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Camera, Users, CalendarDays, Sparkles, ArrowRight, MapPin, Instagram, Youtube, Facebook, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import organizationData from "@/data/organization.json";
import eventsData from "@/data/events.json";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const { name, tagline, description, mission, locations, region, founded, volunteers, impact, focusAreas, contact, social } = organizationData;
  const { featuredEvent } = eventsData;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
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
    { value: impact.volunteers.count, label: impact.volunteers.label },
    { value: impact.events.count, label: impact.events.label },
    { value: impact.peopleReached.count, label: impact.peopleReached.label },
  ];

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
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xs font-black text-gray-900">TA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className={`font-black text-sm tracking-wider uppercase transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Taameer</span>
              <span className="font-black text-xs tracking-[0.3em] uppercase text-yellow-400">Artivists</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["About", "Mission", "Impact", "Events"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-yellow-400 ${scrolled ? "text-gray-600" : "text-white/80"}`}
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Button
            asChild
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl px-6 h-11 shadow-lg shadow-yellow-400/20 transition-all hover:shadow-yellow-400/30 hover:scale-105"
          >
            <Link href="#contact">Get Involved</Link>
          </Button>
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
            {/* Dark gradient overlay – bottom-heavy so text pops, top-light so nav is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          </div>

          {/* Hero Content – sits at the bottom */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full">

            {/* Tag */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-yellow-400" />
              <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">{tagline}</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8 max-w-5xl">
              Taameer<br />
              <span className="text-yellow-400">Artivists</span>
            </h1>

            {/* Sub + CTA row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
              <p className="text-gray-300 text-lg max-w-xl leading-relaxed font-medium">
                {description}
              </p>
              <div className="flex items-center gap-4 shrink-0">
                <Button
                  size="lg"
                  className="h-14 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl shadow-xl transition-all hover:scale-105"
                >
                  Join The Movement
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white rounded-xl font-bold transition-all"
                >
                  <Link href="/kumaon-fest">Our Events <ArrowRight className="w-4 h-4 ml-2" /></Link>
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
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              {stats.map((s, i) => (
                <div key={i} className="px-8 py-4 first:pl-0 last:pr-0 text-center">
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
                    className="flex items-start gap-5 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-yellow-300 hover:bg-yellow-50 transition-all group"
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
              <div className="bg-white/5 border border-white/8 rounded-3xl p-10 relative overflow-hidden group hover:border-yellow-400/30 transition-all">
                <div className="absolute -top-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Leaf className="w-48 h-48 text-white" />
                </div>
                <div className="relative">
                  <div className="text-xs font-black text-yellow-400 tracking-[0.3em] uppercase mb-4">Environment</div>
                  <h3 className="text-3xl font-black mb-4 leading-tight">Cleanliness Drives</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                    Transforming public spaces across {locations.join(" and ")} through regular community clean-ups.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-5xl font-black text-yellow-400 tracking-tight">{impact.cleanlinessdrives.count}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{impact.cleanlinessdrives.label}</div>
                    </div>
                    <div>
                      <div className="text-5xl font-black text-yellow-400 tracking-tight">{impact.volunteers.count}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{impact.volunteers.label}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/8 rounded-3xl p-10 relative overflow-hidden group hover:border-yellow-400/30 transition-all">
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
                  Featured<br /><span className="text-yellow-400">Event.</span>
                </h2>
              </div>
              <Link href="/kumaon-fest" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-yellow-500 transition-colors group">
                View All Events <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Event Card */}
            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200 group">
              <div className="grid lg:grid-cols-[3fr_2fr]">

                {/* Image */}
                <div className="relative h-80 lg:h-auto min-h-[450px]">
                  <Image
                    src={featuredEvent.image || "/placeholder.svg"}
                    fill
                    alt={featuredEvent.title}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 lg:bg-none" />
                </div>

                {/* Content */}
                <div className="bg-gray-900 p-10 lg:p-14 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1 rounded-lg mb-6">Annual Event</Badge>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <CalendarDays className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">{formatDate(featuredEvent.startDate, featuredEvent.endDate)}</span>
                    </div>

                    <h3 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed">
                      {featuredEvent.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-10">
                    <Button asChild className="h-13 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-all hover:scale-[1.02] py-3">
                      <Link href="/kumaon-fest/tickets">Get Your Pass →</Link>
                    </Button>
                    <Button asChild variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-semibold py-3">
                      <Link href="/kumaon-fest">Learn More</Link>
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
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Email Us</div>
                  <a href={`mailto:${contact.email}`} className="text-gray-900 font-bold text-lg hover:underline">{contact.email}</a>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Call / WhatsApp</div>
                  <a href={`tel:${contact.phone}`} className="text-gray-900 font-bold text-lg hover:underline">{contact.phone}</a>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
                  <div className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Follow Along</div>
                  <div className="flex gap-4">
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all group">
                      <Instagram className="w-4 h-4 text-gray-700 group-hover:text-white" />
                    </a>
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all group">
                      <Youtube className="w-4 h-4 text-gray-700 group-hover:text-white" />
                    </a>
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all group">
                      <Facebook className="w-4 h-4 text-gray-700 group-hover:text-white" />
                    </a>
                    <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all group">
                      <Twitter className="w-4 h-4 text-gray-700 group-hover:text-white" />
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
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <span className="text-xs font-black text-gray-900">TA</span>
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
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h5 className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-5">Navigate</h5>
                <nav className="flex flex-col gap-3">
                  {[
                    { label: "About", href: "#about" },
                    { label: "Mission", href: "#mission" },
                    { label: "Impact", href: "#impact" },
                    { label: "Kumaon Fest", href: "/kumaon-fest" },
                  ].map((l) => (
                    <Link key={l.label} href={l.href} className="text-gray-400 text-sm font-medium hover:text-white transition-colors">{l.label}</Link>
                  ))}
                </nav>
              </div>
              <div>
                <h5 className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-5">Connect</h5>
                <nav className="flex flex-col gap-3">
                  {[
                    { label: "Instagram", href: social.instagram },
                    { label: "YouTube", href: social.youtube },
                    { label: "Facebook", href: social.facebook },
                    { label: "Twitter", href: social.twitter },
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

    </div>
  );
}
