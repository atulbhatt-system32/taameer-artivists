"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {  MapPin, Users, Leaf, Camera } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { AllEventsCarousel } from "@/components/all-events-carousel"
// import { PaymentModal } from "@/components/payment-modal"
// import { useState } from "react"
import organizationData from "@/data/organization.json"
// import eventsData from "@/data/events.json"

export default function HomePage() {
  const { name, tagline, description, mission, locations, volunteers, impact, focusAreas } = organizationData
  // const { featuredEvent } = eventsData
  // const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  // const formatDate = (startDate: string, endDate: string) => {
  //   const start = new Date(startDate)
  //   const end = new Date(endDate)
  //   const startFormatted = start.toLocaleDateString("en-US", {
  //     month: "long",
  //     day: "numeric",
  //   })
  //   const endFormatted = end.toLocaleDateString("en-US", {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //   })

  //   return `${startFormatted} - ${endFormatted}`
  // }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/90 border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                <span className="text-xs font-bold text-gray-900">TA</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-yellow-400">Taameer</span> <span className="text-white">Artivists</span>
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
            <Link href="#impact" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              Our Work
            </Link>
            <Link href="#contact" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              Contact
            </Link>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">Support Us</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:gap-12 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
                    {tagline}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="text-yellow-400">Taameer</span> <span className="text-white">Artivists Foundation</span>
                  </h1>
                  
                  <p className="max-w-[600px] text-gray-300 md:text-xl break-words overflow-x-auto">{description}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row w-full">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto">
                    Join Our Mission
                  </Button>
                  <Link href="/kumaon-fest" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent w-full sm:w-auto"
                    >
                      View Events
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    <span>{locations.join(" • ")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-yellow-400" />
                    <span>{volunteers} Volunteers</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-8 md:mt-0">
                <Image
                  src="/home.jpg"
                  width={400}
                  height={400}
                  alt="Taameer Artivists community work"
                  className="aspect-square overflow-hidden rounded-xl object-cover border-2 border-yellow-500/20 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Our Mission</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {mission}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {focusAreas.map((area, index) => (
                <Card key={index} className="border-gray-200 hover:border-yellow-400/50 transition-colors">
                  <CardHeader>
                    {area.icon === "Leaf" && <Leaf className="h-8 w-8 text-yellow-500" />}
                    {area.icon === "Camera" && <Camera className="h-8 w-8 text-yellow-500" />}
                    {area.icon === "Users" && <Users className="h-8 w-8 text-yellow-500" />}
                    <CardTitle className="text-gray-900">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{area.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Event */}
        {/* <section id="events" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Featured Event</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Don&apos;t miss our signature annual celebration of Kumaoni culture and traditions
              </p>
            </div>
            <div className="mx-auto max-w-4xl">
              <Card className="overflow-hidden border-yellow-400/20 shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <Image
                      src={featuredEvent.image || "/placeholder.svg"}
                      width={400}
                      height={300}
                      alt={featuredEvent.title}
                      className="h-48 w-full object-cover md:h-full"
                    />
                  </div>
                  <div className="p-6 md:w-1/2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Annual Event</Badge>
                      <Badge variant="outline" className="border-gray-300">
                        September 2024
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{featuredEvent.title}</h3>
                    <p className="text-gray-600 mb-4">{featuredEvent.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CalendarDays className="h-4 w-4 text-yellow-500" />
                        <span>{formatDate(featuredEvent.startDate, featuredEvent.endDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-yellow-500" />
                        <span>{featuredEvent.location}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                        onClick={() => setIsPaymentOpen(true)}
                      >
                        Book Tickets
                      </Button>
                      <PaymentModal
                        eventTitle={featuredEvent.title}
                        eventPrice={`₹${featuredEvent.pricing.singleDay.price} - ₹${featuredEvent.pricing.vipExperience.price}`}
                        eventId={featuredEvent.id}
                        isOpen={isPaymentOpen}
                        onOpenChange={setIsPaymentOpen}
                      />
                      <Link href="/kumaon-fest">
                        <Button
                          variant="outline"
                          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section> */}

        {/* All Events Carousel */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Our Events</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Discover our diverse range of community events, cultural celebrations, and social initiatives
              </p>
            </div>
            <AllEventsCarousel />
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">Our Impact</h2>
              <p className="max-w-[600px] text-gray-300 md:text-xl">
                See how we&apos;re making a difference in communities across {locations.join(" and ")}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Cleanliness Drives</h3>
                <p className="text-gray-300">
                  Our regular cleanliness drives have transformed public spaces across {locations.join(" and ")}. We
                  organize monthly community clean-up events, bringing together volunteers of all ages to maintain the
                  beauty of our hill stations.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{impact.cleanlinessdrives.count}</div>
                    <div className="text-sm text-gray-400">{impact.cleanlinessdrives.label}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{impact.volunteers.count}</div>
                    <div className="text-sm text-gray-400">{impact.volunteers.label}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Community Events</h3>
                <p className="text-gray-300">
                  Beyond cleanliness, we organize various community events that bring people together, celebrate local culture, and create lasting bonds. From cultural festivals to awareness campaigns, we&apos;re building stronger communities.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{impact.events.count}</div>
                    <div className="text-sm text-gray-400">{impact.events.label}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg border border-yellow-500/20">
                    <div className="text-2xl font-bold text-yellow-400">{impact.peopleReached.count}</div>
                    <div className="text-sm text-gray-400">{impact.peopleReached.label}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-yellow-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Get Involved</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Join our mission to build better communities. Whether you want to volunteer, partner with us, or attend our events, we&apos;d love to hear from you.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                  Become a Volunteer
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
          <p className="text-xs text-gray-400">© 2024 {name}. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Terms of Service
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
