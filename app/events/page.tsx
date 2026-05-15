"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Search, Filter, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import organizationData from "@/data/organization.json";
import eventsData from "@/data/events.json";

export default function EventsPage() {
  const { allEvents } = eventsData;
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(allEvents.map((e) => e.category)))];

  const filteredEvents = filter === "All" 
    ? allEvents 
    : allEvents.filter((e) => e.category === filter);

  const upcomingEvents = filteredEvents.filter(e => e.status !== "past");
  const pastEvents = filteredEvents.filter(e => e.status === "past");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4">
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
              <span className="font-black text-sm tracking-wider uppercase text-gray-900">Taameer</span>
              <span className="font-black text-xs tracking-[0.3em] uppercase text-yellow-400">Artivists</span>
            </div>
          </Link>
          <Button
            asChild
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl px-6 h-11 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105"
          >
            <Link href="/#contact">Get Involved</Link>
          </Button>
        </div>
      </header>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="max-w-3xl mb-16">
            <Badge className="bg-yellow-400 text-gray-900 font-bold mb-4">Our Calendar</Badge>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-6">
              Events for the<br />
              <span className="text-yellow-400 text-glow">Community.</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              Discover workshops, festivals, and campaigns that bring us together. From cultural celebrations to environmental action, there&apos;s something for everyone.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                  filter === cat
                    ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/10"
                    : "bg-white text-gray-500 border-gray-100 hover:border-yellow-400 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Upcoming Events Grid */}
          {upcomingEvents.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-yellow-400 rounded-full" />
                Upcoming Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event, index) => (
                  <Link 
                    href={`/events/${event.id}`} 
                    key={event.id}
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-3xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all hover:-translate-y-1 h-full"
                    >
                    <div className="relative h-64 w-full overflow-hidden bg-white">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        fill
                        alt={event.name}
                        className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-gray-900 font-bold border-none shadow-sm">
                          {event.category}
                        </Badge>
                      </div>
                      {event.featured && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3" /> FEATURED
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-yellow-600 text-xs font-bold uppercase tracking-widest mb-3">
                        <CalendarDays className="w-4 h-4" />
                        {event.date}
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}, {event.city}
                        </div>
                        <div className="font-bold text-gray-900 group-hover:text-yellow-600 flex items-center transition-colors">
                          {event.pricing?.display === "Free" ? "Join Now" : "Book Pass"} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past Events Grid */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-gray-400">
                <div className="w-2 h-8 bg-gray-200 rounded-full" />
                Past Memories
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pastEvents.map((event, index) => (
                  <Link href={`/events/${event.id}`} key={event.id} className="block outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-3xl">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="group bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 grayscale hover:grayscale-0 transition-all duration-500 h-full"
                    >
                    <div className="relative h-48 w-full">
                      <Image src={event.image} fill alt={event.name} className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                          {event.date.split(',')[1] || event.date}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-black text-lg text-gray-900 mb-1">{event.name}</h4>
                      <p className="text-gray-500 text-xs font-medium">{event.city}</p>
                    </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[3rem]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Try a different category or check back later.</p>
              <Button onClick={() => setFilter("All")} variant="link" className="mt-4 text-yellow-600 font-bold">
                View all events
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
                <span className="text-sm font-black text-gray-900">TA</span>
              </div>
              <div>
                <div className="font-black text-xl leading-none">Taameer</div>
                <div className="text-yellow-400 font-bold text-xs tracking-widest uppercase">Artivists</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {organizationData.name}. All rights reserved.</p>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl font-bold">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
