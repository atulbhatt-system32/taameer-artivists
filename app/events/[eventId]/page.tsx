import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import eventsData from "@/data/events.json";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const { allEvents } = eventsData;
  const event = allEvents.find((e) => e.id === eventId);

  if (!event) {
    notFound();
  }

  // Determine if there is a specific ticketing page.
  const hasTickets = event.id === "kf-2026-summer" || event.pricing?.display === "Paid";
  const ticketLink = event.id === "kf-2026-summer" ? "/kumaon-fest/tickets" : "#";
  const gallery = (event as any).gallery || [];

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/events" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-lg">
              <Image
                src="/new-images/IMG_6419.PNG"
                fill
                alt="Logo"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-none hidden sm:flex">
              <span className="font-black text-xs tracking-wider uppercase text-gray-900">Taameer</span>
              <span className="font-black text-[10px] tracking-[0.2em] uppercase text-yellow-500">Artivists</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="pt-28">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Hero Image Section */}
          <div className="relative w-full h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl mb-12 group">
            <Image 
              src={event.image || "/placeholder.svg"} 
              fill 
              alt={event.name} 
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div>
                <Badge className="bg-black/40 backdrop-blur-md text-white border-white/30 mb-3 px-4 py-1.5">
                  {event.category}
                </Badge>
                {event.featured && (
                  <Badge className="bg-yellow-400 text-gray-900 ml-2 font-black border-none shadow-lg px-4 py-1.5">
                    <Sparkles className="w-3 h-3 mr-2 inline-block" /> FEATURED
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[2fr_1fr] gap-12">
            {/* Main Content */}
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">
                {event.name}
              </h1>
              
              <div className="prose prose-lg text-gray-600 mb-10">
                <p>{event.description}</p>
                {event.id === "kf-2026-summer" && (
                  <p className="mt-4">
                    The Kumaon Fest is back with its Summer Carnival edition! Experience the vibrant spirit of Kumaon through live music, traditional arts, and a community like no other. This year we are bringing together 10+ artists for a 5-hour non-stop celebration of creativity and joy.
                  </p>
                )}
              </div>
              
              {/* Event Tags/Highlights */}
              <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                {event.status === "past" ? (
                  <Badge variant="outline" className="text-gray-500 border-gray-200">Past Event</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Upcoming</Badge>
                )}
                <Badge variant="outline" className="text-gray-500 border-gray-200">{event.pricing?.display || "Free Entry"}</Badge>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-6">Event Details</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <CalendarDays className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-900">{event.date}</p>
                      {event.id === "kf-2026-summer" && <p className="text-sm text-gray-500">5:00 PM onwards</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{event.venue}</p>
                      <p className="text-sm text-gray-500">{event.city}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  {event.status !== "past" ? (
                    hasTickets ? (
                      <Button asChild size="lg" className="w-full h-14 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black rounded-xl shadow-xl shadow-yellow-400/20">
                        <Link href={ticketLink}>Book Passes Now</Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-black rounded-xl">
                        <Link href="/#contact">RSVP / Contact Us</Link>
                      </Button>
                    )
                  ) : (
                    <Button disabled size="lg" className="w-full h-14 bg-gray-200 text-gray-500 font-bold rounded-xl">
                      Event Concluded
                    </Button>
                  )}
                </div>
              </div>
              
              <Button variant="outline" className="w-full h-14 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" /> Share Event
              </Button>
            </div>
          </div>

          {/* ── GALLERY ──────────────────────────────────────────────────── */}
          {gallery.length > 0 && (
            <section className="mt-20 pt-16 border-t border-gray-100">
              <div className="mb-10">
                <p className="text-xs font-black text-yellow-500 tracking-[0.3em] uppercase mb-2">Visual Highlights</p>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Event Gallery</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {gallery.slice(0, 2).map((img: any, idx: number) => (
                  <div key={idx} className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl group">
                    <Image
                      src={img.src}
                      fill
                      alt={img.alt}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.slice(2).map((img: any, idx: number) => (
                  <div key={idx} className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg group">
                    <Image
                      src={img.src}
                      fill
                      alt={img.alt}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
