import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users, Music, Palette, BookOpen, Camera, Clock, Ticket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EventCarousel } from "@/components/event-carousel"
import { GalleryCarousel } from "@/components/gallery-carousel"
import { RelatedEventsCarousel } from "@/components/related-events-carousel"
import kumaonFestData from "@/data/kumaon-fest.json"

export default function KumaonFestPage() {
  const { hero, about, events, schedule, gallery, community, tickets } = kumaonFestData

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/90 border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                <span className="text-xs font-bold text-gray-900">KF</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-yellow-400">Kumaon</span> <span className="text-white">Fest</span>
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#about" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              About
            </Link>
            <Link href="#events" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              Events
            </Link>
            <Link
              href="#schedule"
              className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors"
            >
              Schedule
            </Link>
            <Link href="#gallery" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              Gallery
            </Link>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">Book Tickets</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[1fr_500px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30 w-fit">
                    {hero.badge}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                    <span className="text-yellow-400">Kumaon</span> <span className="text-white">Fest</span>{" "}
                    <span className="text-yellow-400">2025</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl leading-relaxed break-words overflow-x-auto">
                    {hero.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row w-full">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto">
                    <Ticket className="mr-2 h-4 w-4" />
                    {hero.buttons.primary.text}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent w-full sm:w-auto"
                  >
                    {hero.buttons.secondary.text}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4">
                  {hero.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      {detail.icon === "CalendarDays" && <CalendarDays className="h-4 w-4 text-yellow-400" />}
                      {detail.icon === "MapPin" && <MapPin className="h-4 w-4 text-yellow-400" />}
                      {detail.icon === "Users" && <Users className="h-4 w-4 text-yellow-400" />}
                      <span className="font-medium">{detail.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center mt-8 md:mt-0">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <Image
                    src={hero.image}
                    width={500}
                    height={500}
                    alt="Kumaon Fest celebration"
                    className="aspect-square overflow-hidden rounded-2xl object-cover shadow-2xl border-2 border-yellow-500/20 w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">{about.title}</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {about.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {about.subDescription}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {about.stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Image
                  src={about.images[0].src}
                  width={500}
                  height={300}
                  alt={about.images[0].alt}
                  className="w-full rounded-lg object-cover border border-yellow-200"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Image
                    src={about.images[1].src}
                    width={240}
                    height={150}
                    alt={about.images[1].alt}
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                  <Image
                    src={about.images[2].src}
                    width={240}
                    height={150}
                    alt={about.images[2].alt}
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Events & Activities */}
        <section id="events" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">{events.title}</h2>
              <p className="max-w-[800px] text-gray-600 md:text-xl">
                {events.subtitle}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
              {events.highlights.map((highlight, index) => (
                <Card key={index} className="text-center border-yellow-200 hover:border-yellow-400 transition-colors">
                  <CardHeader>
                    {highlight.icon === "Music" && <Music className="h-12 w-12 text-yellow-500 mx-auto" />}
                    {highlight.icon === "Palette" && <Palette className="h-12 w-12 text-yellow-500 mx-auto" />}
                    {highlight.icon === "BookOpen" && <BookOpen className="h-12 w-12 text-yellow-500 mx-auto" />}
                    {highlight.icon === "Camera" && <Camera className="h-12 w-12 text-yellow-500 mx-auto" />}
                    <CardTitle className="text-gray-900">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Event Carousel */}
            <EventCarousel />

            {/* Related Events Carousel */}
            <div className="mt-16">
              <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Other Events You Might Like</h3>
                <p className="max-w-[600px] text-gray-600">
                  Discover more cultural and community events organized by Taameer Artivists
                </p>
              </div>
              <RelatedEventsCarousel />
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">{schedule.title}</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                {schedule.subtitle}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {schedule.days.map((day, index) => (
                <Card key={index} className="border-yellow-200">
                  <CardHeader className="text-center">
                    <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 w-fit mx-auto">{day.day}</Badge>
                    <CardTitle className="text-xl text-gray-900">{day.date}</CardTitle>
                    <p className="text-gray-600">{day.theme}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-start space-x-3">
                        <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">{event.time}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">{gallery.title}</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                {gallery.subtitle}
              </p>
            </div>

            <GalleryCarousel />

            {/* Gallery Navigation */}
            <div className="mt-16">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900">Explore Past Editions</h3>
                <p className="max-w-[600px] text-gray-600">
                  Relive the magical moments from previous Kumaon Fest celebrations
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link href="/kumaon-fest/gallery/2022">
                    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">2022</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Inaugural Edition</h4>
                      <p className="text-sm text-gray-600">The first celebration of Kumaoni culture and heritage</p>
                    </div>
                  </Link>
                  <Link href="/kumaon-fest/gallery/2023">
                    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">2023</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Growing Strong</h4>
                      <p className="text-sm text-gray-600">Expanding horizons and celebrating growth</p>
                    </div>
                  </Link>
                  <Link href="/kumaon-fest/gallery/2024">
                    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg p-6 text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">2024</div>
                      <h4 className="font-semibold text-gray-900 mb-2">Latest Edition</h4>
                      <p className="text-sm text-gray-600">A decade of cultural excellence and innovation</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Involvement */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">{community.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {community.description}
                </p>
                <div className="space-y-4">
                  {community.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {opportunity.icon === "Users" && <Users className="h-5 w-5 text-yellow-500 mt-1" />}
                      {opportunity.icon === "Palette" && <Palette className="h-5 w-5 text-yellow-500 mt-1" />}
                      {opportunity.icon === "BookOpen" && <BookOpen className="h-5 w-5 text-yellow-500 mt-1" />}
                      <div>
                        <p className="font-medium text-gray-900">{opportunity.title}</p>
                        <p className="text-sm text-gray-600">{opportunity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {community.buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant={button.variant as "default" | "outline"}
                      className={button.variant === "default" 
                        ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                        : "border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                      }
                    >
                      {button.text}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Image
                  src={community.images[0].src}
                  width={500}
                  height={300}
                  alt={community.images[0].alt}
                  className="w-full rounded-lg object-cover border border-yellow-200"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Image
                    src={community.images[1].src}
                    width={240}
                    height={150}
                    alt={community.images[1].alt}
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                  <Image
                    src={community.images[2].src}
                    width={240}
                    height={150}
                    alt={community.images[2].alt}
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticket Booking CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                {tickets.title}
              </h2>
              <p className="max-w-[600px] md:text-xl text-gray-300">
                {tickets.subtitle}
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                {tickets.buttons.map((button, index) => (
                  <Button
                    key={index}
                    size="lg"
                    variant={button.variant as "default" | "outline"}
                    className={button.variant === "default"
                      ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                      : "border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                    }
                  >
                    {button.icon === "Ticket" && <Ticket className="mr-2 h-4 w-4" />}
                    {button.text}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-center">
                {tickets.pricing.map((tier, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{tier.price}</div>
                    <div className="text-sm text-gray-300">{tier.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
          <p className="text-xs text-gray-400">
            © 2024 Kumaon Fest by Taameer Artivists Foundation. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Back to Main Site
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
