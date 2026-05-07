"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Ticket, Users, Music, Palette, BookOpen, Camera, ArrowRight, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import kumaonFestData from "@/data/kumaon-fest.json";

export default function KumaonFestPage() {
  const { hero, about, events, schedule, gallery, community, tickets } = kumaonFestData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between px-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500 shadow-lg shadow-yellow-500/20 group-hover:rotate-6 transition-transform">
              <span className="text-sm font-black text-gray-950">KF</span>
            </div>
            <span className="text-xl font-black tracking-tighter">
              KUMAON <span className="text-yellow-500">FEST</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {["About", "Events", "Schedule", "Gallery"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-xs font-black text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase"
              >
                {item}
              </Link>
            ))}
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-full px-8 h-12 shadow-xl shadow-yellow-500/10 transition-all active:scale-95">
              <Link href="/kumaon-fest/tickets">BOOK TICKETS</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="container px-4 max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                    {hero.badge}
                  </Badge>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                    <span className="text-yellow-500">{hero.title.split(' ')[0]}</span> <br />
                    {hero.title.split(' ').slice(1).join(' ')}.
                  </h1>
                  <p className="max-w-[540px] text-gray-400 text-xl leading-relaxed font-medium">
                    {hero.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                  {hero.details.map((detail, index) => (
                    <div key={index} className="space-y-2">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                        {detail.icon === "CalendarDays" && <CalendarDays className="w-5 h-5 text-yellow-500" />}
                        {detail.icon === "MapPin" && <MapPin className="w-5 h-5 text-yellow-500" />}
                        {detail.icon === "Users" && <Users className="w-5 h-5 text-yellow-500" />}
                      </div>
                      <div className="text-xs font-black text-white uppercase tracking-widest leading-tight">{detail.text}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button asChild size="lg" className="h-16 px-12 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-yellow-500/20 group">
                    <Link href="/kumaon-fest/tickets">
                      <Ticket className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                     BOOK YOUR PASS
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-yellow-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
                <div className="relative aspect-square rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                  <Image
                    src={hero.image}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Festival Hero"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                    <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                      <p className="text-white font-black italic tracking-tight text-xl italic">"The Soul of the Hills"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 bg-white text-gray-950 relative overflow-hidden">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge className="bg-yellow-500 text-gray-950 font-black">CULTURAL HERITAGE</Badge>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                    ABOUT <br />
                    <span className="text-yellow-600">KUMAON FEST.</span>
                  </h2>
                </div>
                <div className="space-y-6">
                  <p className="text-2xl font-bold leading-snug text-gray-900">{about.description}</p>
                  <p className="text-gray-500 leading-relaxed text-lg">{about.subDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {about.stats.map((stat, index) => (
                    <div key={index} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <div className="text-5xl font-black text-yellow-600 mb-2">{stat.number}</div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative space-y-6">
                <div className="aspect-video rounded-[3rem] overflow-hidden relative shadow-2xl transform lg:-rotate-2">
                  <Image src={about.images[0].src} fill alt="A" className="object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden relative shadow-xl transform lg:rotate-3">
                    <Image src={about.images[1].src} fill alt="A" className="object-cover" />
                  </div>
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden relative shadow-xl transform lg:-rotate-3">
                    <Image src={about.images[2].src} fill alt="A" className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section id="events" className="py-32 bg-gray-50 border-y border-gray-100">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter uppercase">Festival Highlights</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">{events.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.highlights.map((item, index) => (
                <div key={index} className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-yellow-500 transition-all hover:shadow-xl hover:-translate-y-2">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-500 transition-all duration-300 shadow-sm">
                    {item.icon === "Music" && <Music className="w-7 h-7 text-gray-950 group-hover:text-white transition-colors" />}
                    {item.icon === "Palette" && <Palette className="w-7 h-7 text-gray-950 group-hover:text-white transition-colors" />}
                    {item.icon === "BookOpen" && <BookOpen className="w-7 h-7 text-gray-950 group-hover:text-white transition-colors" />}
                    {item.icon === "Camera" && <Camera className="w-7 h-7 text-gray-950 group-hover:text-white transition-colors" />}
                  </div>
                  <h4 className="text-2xl font-black text-gray-950 mb-4 tracking-tight leading-none uppercase">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="py-32 bg-gray-950 text-white">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
              <div className="space-y-4">
                <Badge className="bg-yellow-500 text-gray-950 font-black">PROGRAM FLOW</Badge>
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">THE SCHEDULE.</h2>
              </div>
              <p className="max-w-[400px] text-gray-500 font-bold uppercase tracking-widest text-sm">{schedule.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              {schedule.days.map((day, index) => (
                <div key={index} className="relative p-10 rounded-[3rem] bg-gray-900 border border-white/5 hover:border-yellow-500/30 transition-all">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                      <div className="text-5xl font-black text-yellow-500 tracking-tighter uppercase">{day.day}</div>
                      <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{day.date}</div>
                    </div>
                    <Badge variant="outline" className="border-gray-700 text-gray-400">{day.theme}</Badge>
                  </div>
                  <div className="space-y-8">
                    {day.events.map((event, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{event.time}</div>
                        <div className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors uppercase leading-none">{event.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-32 bg-white">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter uppercase">Past Editions</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">{gallery.subtitle}</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {gallery.images.map((img, index) => (
                <div key={index} className="relative group rounded-[2.5rem] overflow-hidden break-inside-avoid shadow-xl">
                  <Image src={img.src} width={600} height={400} alt={img.alt} className="w-full transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-all flex items-end p-8">
                    <p className="text-white font-black uppercase text-sm tracking-widest">{img.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 bg-yellow-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10"><Star className="w-20 h-20 fill-gray-950 text-gray-950 rotate-12" /></div>
            <div className="absolute bottom-10 right-10"><Star className="w-32 h-32 fill-gray-950 text-gray-950 -rotate-12" /></div>
          </div>
          <div className="container px-4 max-w-7xl mx-auto text-center space-y-12 relative z-10 text-gray-950">
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase">DON'T MISS <br />KUMAON FEST 2025.</h2>
            <p className="max-w-[700px] mx-auto text-2xl font-bold leading-relaxed">{tickets.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="h-20 px-16 bg-gray-950 hover:bg-gray-800 text-white font-black text-2xl rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 group">
                <Link href="/kumaon-fest/tickets">
                  BOOK NOW <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 py-20 border-t border-white/5">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 shadow-xl shadow-yellow-500/20">
                <span className="text-sm font-black text-gray-950">KF</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                KUMAON <span className="text-yellow-600">FEST</span>
              </span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-10">
              {["About", "Events", "Schedule", "Gallery"].map(item => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">{item}</Link>
              ))}
            </nav>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">© 2025 Kumaon Fest by Taameer Artivists Foundation.</p>
            <div className="flex gap-8">
              <Link href="/" className="text-xs font-black text-gray-500 hover:text-yellow-500 transition-colors uppercase tracking-widest">Back to Main Site</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
