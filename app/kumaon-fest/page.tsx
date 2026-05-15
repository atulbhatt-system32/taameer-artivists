"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Music, 
  Palette, 
  BookOpen, 
  Camera, 
  Ticket, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import kumaonFestData from "@/data/kumaon-fest.json";
import organizationData from "@/data/organization.json";

export default function KumaonFestLandingPage() {
  const { hero, about, events, schedule, gallery, community, tickets } = kumaonFestData;
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "CalendarDays": return <CalendarDays className="w-5 h-5" />;
      case "MapPin": return <MapPin className="w-5 h-5" />;
      case "Users": return <Users className="w-5 h-5" />;
      case "Music": return <Music className="w-6 h-6" />;
      case "Palette": return <Palette className="w-6 h-6" />;
      case "BookOpen": return <BookOpen className="w-6 h-6" />;
      case "Camera": return <Camera className="w-6 h-6" />;
      case "Ticket": return <Ticket className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
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
              <span className="font-black text-sm tracking-wider uppercase text-white">Kumaon</span>
              <span className="font-black text-xs tracking-[0.3em] uppercase text-yellow-500">Fest 2026</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            <Link href="#about" className="hover:text-yellow-500 transition-colors">About</Link>
            <Link href="#schedule" className="hover:text-yellow-500 transition-colors">Schedule</Link>
            <Link href="/kumaon-fest/gallery/2024" className="hover:text-yellow-500 transition-colors">Gallery</Link>
          </div>
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-xl px-6 h-11 shadow-lg shadow-yellow-500/20">
            <Link href="/kumaon-fest/tickets">Book Tickets</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black uppercase tracking-[0.2em] mb-6 px-4 py-1.5">
                {hero.badge}
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                {hero.title.split(' ').slice(0, -1).join(' ')}<br />
                <span className="text-yellow-500">{hero.title.split(' ').pop()}</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed mb-10 max-w-xl font-medium">
                {hero.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-10 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-2xl text-base md:text-lg shadow-2xl shadow-yellow-500/30 group">
                  <Link href="/kumaon-fest/tickets">
                    {hero.buttons.primary.text} <Ticket className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl text-base md:text-lg">
                   <Link href="#schedule">{hero.buttons.secondary.text}</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-white/5">
                {hero.details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-tight">
                    <div className="text-yellow-500">{getIcon(detail.icon)}</div>
                    {detail.text}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] md:aspect-[3/4] w-full max-w-[500px] mx-auto lg:ml-auto"
            >
              <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-gray-900">
                <Image
                  src={hero.image}
                  fill
                  alt="The Kumaon Fest Summer Carnival"
                  className="object-contain lg:object-cover"
                  priority
                />
                {/* Floating Logo Badge */}
                <div className="absolute top-6 right-6 w-32 h-32 md:w-40 md:h-40 z-20 drop-shadow-2xl animate-bounce-slow">
                  <Image
                    src="/new-images/IMG_6419.PNG"
                    fill
                    alt="Summer Carnival Logo"
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────────────────────────── */}
        <section id="about" className="py-28 bg-white text-gray-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl rotate-[-2deg]">
                    <Image src={about.images[0].src} fill alt="Gallery 1" className="object-cover" />
                  </div>
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl translate-x-4">
                    <Image src={about.images[1].src} fill alt="Gallery 2" className="object-cover" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl translate-x-[-10px]">
                    <Image src={about.images[2].src} fill alt="Gallery 3" className="object-cover" />
                  </div>
                   <div className="bg-yellow-500 p-8 rounded-3xl flex flex-col justify-center rotate-[2deg] shadow-2xl">
                    <div className="text-4xl font-black tracking-tighter mb-1">5+</div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-80">Years of Magic</div>
                  </div>
                </div>
              </div>

              <div>
                <Badge className="bg-yellow-500 text-gray-950 font-black uppercase mb-6">{about.title}</Badge>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
                  The Biggest <br />
                  <span className="text-yellow-600">Summer Carnival.</span>
                </h2>
                <p className="text-gray-600 text-lg font-medium leading-relaxed mb-6">
                  {about.description}
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 italic">Star-studded Lineup</h4>
                  <p className="text-gray-900 font-bold text-lg leading-relaxed">
                    Kartikey Uniyal <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Rakesh Manral <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Arti <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Hendrix <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Tristv <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Aryan <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Rohan Pangtey <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Sagar Bisht <span className="text-yellow-600 text-sm mx-2">●</span> 
                    Surprise Artist
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl mb-10">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-red-900 text-sm font-bold">Safety First: Alcohol is strictly not allowed at the venue.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                  {about.stats.map((stat, i) => (
                    <div key={i}>
                      <div className="text-4xl font-black text-gray-900 tracking-tighter">{stat.number}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HIGHLIGHTS ───────────────────────────────────────────────── */}
        <section className="py-28 bg-gray-950">
          <div className="max-w-7xl mx-auto px-6 text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{events.title}</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">{events.subtitle}</p>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.highlights.map((h, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-yellow-500 hover:border-yellow-500 transition-all group cursor-default">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-950 transition-colors">
                  <div className="text-yellow-500 group-hover:text-yellow-500">{getIcon(h.icon)}</div>
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-gray-950 transition-colors">{h.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-950/80 transition-colors">{h.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCHEDULE ─────────────────────────────────────────────────── */}
        <section id="schedule" className="py-28 bg-gray-900 relative">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
              <div>
                <span className="text-xs font-black text-yellow-500 tracking-[0.3em] uppercase">{schedule.title}</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none mt-3">
                  Festival<br /><span className="text-yellow-500">Timeline.</span>
                </h2>
              </div>
              <p className="text-gray-400 max-w-sm text-base leading-relaxed">
                {schedule.subtitle}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {schedule.days.map((day, i) => (
                <div key={i} className="bg-gray-950 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] group-hover:bg-yellow-500/10 transition-all" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center font-black text-gray-950">
                      {day.day.split(' ')[1]}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black">{day.theme}</h4>
                      <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">{day.date}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {day.events.map((e, j) => (
                      <div key={j} className="flex gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-tighter whitespace-nowrap pt-1">
                          {e.time.split(' - ')[0]}
                        </div>
                        <div>
                          <h5 className="font-black text-white mb-1">{e.time.split(' - ')[1]}</h5>
                          <p className="text-gray-500 text-xs leading-relaxed">{e.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ────────────────────────────────────────────────── */}
        <section className="py-28 bg-yellow-500 text-gray-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">{community.title}</h2>
                <p className="text-gray-900/70 text-lg font-medium leading-relaxed mb-10 max-w-xl">
                  {community.description}
                </p>
                <div className="space-y-6 mb-12">
                  {community.opportunities.map((o, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 bg-white/20 rounded-2xl border border-white/30 hover:bg-white/40 transition-all">
                      <div className="w-10 h-10 bg-gray-950 rounded-xl flex items-center justify-center text-yellow-500 shrink-0">
                        {getIcon(o.icon)}
                      </div>
                      <div>
                        <h4 className="font-black text-lg mb-1">{o.title}</h4>
                        <p className="text-gray-900/60 text-sm font-medium">{o.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button className="h-14 px-8 bg-gray-950 text-white font-black rounded-xl hover:bg-gray-800 transition-all">
                    {community.buttons[0].text}
                  </Button>
                  <Button variant="outline" className="h-14 px-8 border-gray-950/20 text-gray-950 font-black rounded-xl hover:bg-gray-950 hover:text-white transition-all">
                    {community.buttons[1].text}
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
                <Image src={community.images[0].src} fill alt="Community" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKETS CTA ─────────────────────────────────────────────── */}
        <section className="py-32 bg-red-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <Sparkles className="w-12 h-12 text-white mx-auto mb-8 animate-bounce" />
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 text-white leading-none">
              {tickets.title}
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-xl mx-auto font-medium">
              {tickets.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="h-16 md:h-20 px-10 md:px-12 bg-white hover:bg-gray-50 text-red-600 font-black rounded-2xl text-xl md:text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                <Link href="/kumaon-fest/tickets">Reserve My Spot <ArrowRight className="ml-2 w-6 h-6 md:w-7 md:h-7" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

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
              <span className="text-gray-500 text-[10px] line-through font-bold">₹999</span>
              <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em] bg-red-500/10 px-2 py-0.5 rounded-full">Early Bird</span>
            </div>
            <div className="text-white text-2xl font-black tracking-tighter leading-none flex items-baseline gap-1">
              ₹299<span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider ml-0.5">onwards</span>
            </div>
          </div>
          
          <Button asChild className="h-12 md:h-14 px-6 md:px-8 bg-red-600 hover:bg-red-700 text-white font-black rounded-full text-sm md:text-base shadow-lg shadow-red-600/20 group transition-all active:scale-95 shrink-0">
            <Link href="/kumaon-fest/tickets" className="flex items-center gap-2">
              <span>Reserve Now</span> 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <footer className="bg-gray-950 border-t border-white/5 py-20 pb-40 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                <span className="text-sm font-black text-gray-950">KF</span>
              </div>
              <div>
                <div className="font-black text-xl leading-none">Kumaon</div>
                <div className="text-yellow-500 font-bold text-xs tracking-widest uppercase">Fest 2026</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Organized by {organizationData.name}</p>
            <div className="flex gap-6">
              <Link href={organizationData.social.instagram} className="text-gray-500 hover:text-yellow-500 transition-colors font-bold text-xs uppercase tracking-widest">Instagram</Link>
              <Link href={organizationData.social.facebook} className="text-gray-500 hover:text-yellow-500 transition-colors font-bold text-xs uppercase tracking-widest">Facebook</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
