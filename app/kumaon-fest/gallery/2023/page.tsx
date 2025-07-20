import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users, Music, Palette, BookOpen, Camera, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import kumaonFestGalleries from "@/data/kumaon-fest-galleries.json"

export default function KumaonFest2023Gallery() {
  const data = kumaonFestGalleries.kumaonFest2023

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/90 border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/kumaon-fest" className="flex items-center space-x-3">
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
            <Link href="/kumaon-fest/gallery/2022" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              2022
            </Link>
            <Link href="/kumaon-fest/gallery/2023" className="text-sm font-medium text-yellow-400">
              2023
            </Link>
            <Link href="/kumaon-fest/gallery/2024" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              2024
            </Link>
            <Link href="/kumaon-fest" className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors">
              Back to Fest
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center text-white">
              <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30">
                Growing Strong
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                {data.title}
              </h1>
              <p className="max-w-[600px] text-gray-300 md:text-xl leading-relaxed">
                {data.subtitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                  <CalendarDays className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{data.date}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                  <MapPin className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{data.location}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                  <Users className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{data.stats.attendees} Attendees</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">About the 2023 Edition</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {data.description}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{data.stats.attendees}</div>
                    <div className="text-sm text-gray-600">Attendees</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{data.stats.artists}</div>
                    <div className="text-sm text-gray-600">Artists</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{data.stats.events}</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Highlights</h3>
                <div className="space-y-3">
                  {data.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 mt-0.5">
                        <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-600">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Gallery</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Experience the growth and evolution of Kumaon Fest in 2023
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.gallery.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={image.src}
                      width={400}
                      height={300}
                      alt={image.alt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <Badge className="mb-2 bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
                      {image.category}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 mb-2">{image.alt}</h3>
                    <p className="text-sm text-gray-600">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Explore Other Editions</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Discover the evolution of Kumaon Fest through the years
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Link href="/kumaon-fest/gallery/2022">
                  <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent">
                    Kumaon Fest 2022
                  </Button>
                </Link>
                <Link href="/kumaon-fest/gallery/2024">
                  <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent">
                    Kumaon Fest 2024
                  </Button>
                </Link>
                <Link href="/kumaon-fest">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                    Back to Kumaon Fest
                  </Button>
                </Link>
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
            <Link href="/kumaon-fest" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Back to Kumaon Fest
            </Link>
            <Link href="/" className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-yellow-400">
              Main Site
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
} 