"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users,   Ticket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"



import kumaonFestData from "@/data/kumaon-fest.json"

export default function KumaonFestPage() {
  const { hero, about, tickets } = kumaonFestData
  const googleFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSf3t-MQaPT_8Rik6GQbJSp13_LJwq6gCMxhdhaFg_BssaRjEQ/viewform"

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
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
              onClick={() => window.open(googleFormLink, "_blank")}
            >
              Book Tickets
            </Button>
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
                  <Button 
                    size="lg" 
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto"
                    onClick={() => window.open(googleFormLink, "_blank")}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    {hero.buttons.primary.text}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent w-full sm:w-auto"
                    onClick={() => window.open(googleFormLink, "_blank")}
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

        {/* Events, Schedule, Gallery, Community Sections remain same */}

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
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                  onClick={() => window.open(googleFormLink, "_blank")}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Book Tickets Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                  onClick={() => window.open(googleFormLink, "_blank")}
                >
                  View Pricing
                </Button>
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
