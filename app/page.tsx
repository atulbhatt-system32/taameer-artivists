"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Leaf, Camera, CalendarDays, Sparkles, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AllEventsCarousel } from "@/components/all-events-carousel";
import organizationData from "@/data/organization.json";
import eventsData from "@/data/events.json";

export default function HomePage() {
  const { name, tagline, description, mission, locations, volunteers, impact, focusAreas } = organizationData;
  const { featuredEvent } = eventsData;

  const formatDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white selection:bg-yellow-500/30 selection:text-yellow-500">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between px-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500 shadow-lg shadow-yellow-500/20 group-hover:rotate-6 transition-transform">
              <span className="text-sm font-black text-gray-950">TA</span>
            </div>
            <span className="text-xl font-black tracking-tighter">
              TAAMEER <span className="text-yellow-500">ARTIVISTS</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {["About", "Events", "Impact", "Contact"].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase">{item}</Link>
            ))}
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black rounded-full px-6 h-10 shadow-xl shadow-yellow-500/10">Support Us</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gray-950">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="container px-4 max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col justify-center space-y-10">
                <div className="space-y-6">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                    {tagline}
                  </Badge>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                    {name.split(' ').map((word, i) => (
                      <span key={i} className={i === 0 ? "text-yellow-500 block" : "block"}>{word} </span>
                    ))}
                  </h1>
                  <p className="max-w-[540px] text-gray-400 text-xl leading-relaxed font-medium">
                    {description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-16 px-10 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-yellow-500/20">Join Our Mission</Button>
                  <Button asChild size="lg" className="h-16 px-10 border border-gray-800 bg-transparent text-white hover:bg-gray-900 rounded-2xl font-bold text-xl transition-all">
                    <Link href="/kumaon-fest">View Events</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{locations.join(" • ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{volunteers} Volunteers</span>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-yellow-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                  <Image
                    src="/home.jpg"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Taameer Artivists community work"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                    <p className="text-white font-black italic tracking-tight text-lg">Connecting Culture, Art & Heritage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-32 bg-white">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-6 mb-20">
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">OUR MISSION</Badge>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-950 leading-none">OUR MISSION.</h2>
              <p className="max-w-[800px] text-gray-500 text-xl font-medium leading-relaxed">
                {mission}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {focusAreas.map((area, index) => (
                <div key={index} className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 group hover:border-yellow-500 transition-all">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-yellow-500 transition-all duration-300">
                        {area.icon === "Leaf" && <Leaf className="w-6 h-6 text-gray-950 group-hover:text-white transition-colors" />}
                        {area.icon === "Camera" && <Camera className="w-6 h-6 text-gray-950 group-hover:text-white transition-colors" />}
                        {area.icon === "Users" && <Users className="w-6 h-6 text-gray-950 group-hover:text-white transition-colors" />}
                      </div>
                  <h3 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">{area.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Event */}
        <section id="events" className="w-full py-32 bg-gray-50 border-y border-gray-100">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter uppercase">Featured Event</h2>
              <p className="max-w-[600px] text-gray-500 text-lg">Don't miss our signature annual celebration of Kumaoni culture and traditions</p>
            </div>
            <Card className="overflow-hidden border-none shadow-2xl bg-white rounded-[3rem]">
              <div className="md:flex min-h-[500px]">
                <div className="md:w-1/2 relative group">
                  <Image
                    src={featuredEvent.image || "/placeholder.svg"}
                    fill
                    alt={featuredEvent.title}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-12 md:w-1/2 flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Annual Event</Badge>
                    <div className="flex items-center text-xs font-black text-gray-400 tracking-widest uppercase gap-1">
                      <CalendarDays className="w-3 h-3" /> {formatDate(featuredEvent.startDate, featuredEvent.endDate)}
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black mb-4 text-gray-950 tracking-tighter">{featuredEvent.title}</h3>
                  <p className="text-gray-500 text-lg mb-8 leading-relaxed">{featuredEvent.description}</p>
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <Button asChild className="h-14 px-8 bg-yellow-500 hover:bg-yellow-600 text-gray-950 font-black text-lg rounded-2xl shadow-xl shadow-yellow-500/10">
                      <Link href="/kumaon-fest">Book Tickets</Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-14 px-8 text-gray-950 font-black text-lg rounded-2xl hover:bg-gray-100">
                      <Link href="/kumaon-fest">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* All Events Carousel */}
        <section className="w-full py-32 bg-white">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter uppercase">Our Events</h2>
              <p className="text-gray-500 max-w-2xl mx-auto font-medium">Discover our diverse range of community events, cultural celebrations, and social initiatives</p>
            </div>
            <AllEventsCarousel />
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="w-full py-32 bg-gray-950 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="container px-4 max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 mb-24">
              <Badge className="bg-yellow-500 text-gray-950 font-black">OUR IMPACT</Badge>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">Our Impact.</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="p-10 rounded-[2.5rem] bg-gray-900 border border-white/5 hover:border-yellow-500/50 transition-all">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-yellow-500/10 rounded-2xl"><Leaf className="w-8 h-8 text-yellow-500" /></div>
                  <h3 className="text-3xl font-black tracking-tight">Cleanliness Drives</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">Our regular cleanliness drives have transformed public spaces across {locations.join(" and ")}. We organize monthly events bringing together volunteers of all ages.</p>
                <div className="grid grid-cols-2 gap-6 mt-auto">
                  <div className="p-8 bg-gray-950 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                    <div className="text-4xl font-black text-yellow-500 mb-2">{impact.cleanlinessdrives.count}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-tight">{impact.cleanlinessdrives.label}</div>
                  </div>
                  <div className="p-8 bg-gray-950 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                    <div className="text-4xl font-black text-yellow-500 mb-2">{impact.volunteers.count}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-tight">{impact.volunteers.label}</div>
                  </div>
                </div>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-gray-900 border border-white/5 hover:border-yellow-500/50 transition-all">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-yellow-500/10 rounded-2xl"><Sparkles className="w-8 h-8 text-yellow-500" /></div>
                  <h3 className="text-3xl font-black tracking-tight">Community Events</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">Beyond cleanliness, we organize various community events that bring people together, celebrate local culture, and create lasting bonds.</p>
                <div className="grid grid-cols-2 gap-6 mt-auto">
                  <div className="p-8 bg-gray-950 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                    <div className="text-4xl font-black text-yellow-500 mb-2">{impact.events.count}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-tight">{impact.events.label}</div>
                  </div>
                  <div className="p-8 bg-gray-950 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                    <div className="text-4xl font-black text-yellow-500 mb-2">{impact.peopleReached.count}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-tight">{impact.peopleReached.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-32 bg-yellow-500">
          <div className="container px-4 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8 text-gray-950">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">Get Involved</h2>
              <p className="max-w-[700px] text-xl font-bold leading-relaxed">Join our mission to build better communities. Whether you want to volunteer, partner with us, or attend our events, we'd love to hear from you.</p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <Button size="lg" className="h-16 px-12 bg-gray-950 hover:bg-gray-800 text-white font-black text-xl rounded-2xl shadow-2xl">Become a Volunteer</Button>
                <Button size="lg" className="h-16 px-12 border border-gray-950 bg-transparent text-gray-950 hover:bg-gray-950 hover:text-white rounded-2xl font-black text-xl transition-colors">Contact Us</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-100 text-gray-950">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-500 shadow-xl shadow-yellow-500/20">
                <span className="text-xs font-black text-gray-950">TA</span>
              </div>
              <span className="text-xl font-black tracking-tighter">TAAMEER <span className="text-yellow-600">ARTIVISTS</span></span>
            </Link>
            <nav className="flex gap-8 text-sm font-black uppercase tracking-widest text-gray-400">
              <Link href="#" className="hover:text-gray-950">Privacy</Link>
              <Link href="#" className="hover:text-gray-950">Terms</Link>
              <Link href="#" className="hover:text-gray-950">Contact</Link>
            </nav>
          </div>
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest">© 2024 {name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
