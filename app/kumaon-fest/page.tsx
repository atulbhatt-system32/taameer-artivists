import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Users, Music, Palette, BookOpen, Camera, Clock, Ticket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { EventCarousel } from "@/components/event-carousel"
import { GalleryCarousel } from "@/components/gallery-carousel"
import { RelatedEventsCarousel } from "@/components/related-events-carousel"

export default function KumaonFestPage() {
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
                    Annual Cultural Celebration
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                    <span className="text-yellow-400">Kumaon</span> <span className="text-white">Fest</span>{" "}
                    <span className="text-yellow-400">2024</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl leading-relaxed break-words overflow-x-auto">
                    Experience the vibrant culture of Kumaon through music, art, literature, and traditional performances. Join us in celebrating the rich heritage of Uttarakhand&apos;s hill region.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row w-full">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold w-full sm:w-auto">
                    <Ticket className="mr-2 h-4 w-4" />
                    Book Your Tickets
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent w-full sm:w-auto"
                  >
                    View Schedule
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <CalendarDays className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">Sept 15-17, 2024</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">Haldwani, Uttarakhand</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Users className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">3 Days of Culture</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center mt-8 md:mt-0">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <Image
                    src="/placeholder.svg?height=500&width=500"
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
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">About Kumaon Fest</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Kumaon Fest is an annual celebration that brings together the diverse cultural tapestry of the
                    Kumaon region. Organized by Taameer Artivists Foundation, this festival serves as a vibrant platform
                    for artists, musicians, writers, and cultural enthusiasts to showcase and celebrate our rich
                    heritage.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Set against the backdrop of the beautiful Himalayan foothills in Haldwani, the festival creates a unique space where traditional Kumaoni culture meets contemporary artistic expression. It&apos;s more than just an event—it&apos;s a movement to preserve, promote, and pass on our cultural identity to future generations.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">5+</div>
                    <div className="text-sm text-gray-600">Years Running</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">100+</div>
                    <div className="text-sm text-gray-600">Artists Featured</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  width={500}
                  height={300}
                  alt="Kumaoni cultural performance"
                  className="w-full rounded-lg object-cover border border-yellow-200"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Image
                    src="/placeholder.svg?height=150&width=240"
                    width={240}
                    height={150}
                    alt="Traditional Kumaoni art"
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                  <Image
                    src="/placeholder.svg?height=150&width=240"
                    width={240}
                    height={150}
                    alt="Folk music performance"
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Festival Highlights</h2>
              <p className="max-w-[800px] text-gray-600 md:text-xl">
                Immerse yourself in the diverse cultural experiences that make Kumaon Fest unique
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
              <Card className="text-center border-yellow-200 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <Music className="h-12 w-12 text-yellow-500 mx-auto" />
                  <CardTitle className="text-gray-900">Music Concerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Traditional Kumaoni folk music, contemporary fusion, and classical performances by renowned artists.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-yellow-200 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <Palette className="h-12 w-12 text-yellow-500 mx-auto" />
                  <CardTitle className="text-gray-900">Art Exhibitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Showcase of traditional Kumaoni art, contemporary paintings, sculptures, and handicrafts.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-yellow-200 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-yellow-500 mx-auto" />
                  <CardTitle className="text-gray-900">Literature Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Poetry readings, book launches, and discussions with prominent Kumaoni and Hindi authors.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-yellow-200 hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <Camera className="h-12 w-12 text-yellow-500 mx-auto" />
                  <CardTitle className="text-gray-900">Cultural Performances</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Traditional dance forms, theater performances, and storytelling sessions celebrating our heritage.
                  </p>
                </CardContent>
              </Card>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Festival Schedule</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Three days packed with cultural experiences and artistic celebrations
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Day 1 */}
              <Card className="border-yellow-200">
                <CardHeader className="text-center">
                  <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 w-fit mx-auto">Day 1</Badge>
                  <CardTitle className="text-xl text-gray-900">September 15, 2024</CardTitle>
                  <p className="text-gray-600">Opening Ceremony & Music</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">10:00 AM - Opening Ceremony</p>
                      <p className="text-sm text-gray-600">Welcome address and cultural inauguration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">2:00 PM - Folk Music Concert</p>
                      <p className="text-sm text-gray-600">Traditional Kumaoni musicians</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">7:00 PM - Evening Performances</p>
                      <p className="text-sm text-gray-600">Dance and cultural shows</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 2 */}
              <Card className="border-yellow-200">
                <CardHeader className="text-center">
                  <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 w-fit mx-auto">Day 2</Badge>
                  <CardTitle className="text-xl text-gray-900">September 16, 2024</CardTitle>
                  <p className="text-gray-600">Art & Literature</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">10:00 AM - Art Exhibition Opening</p>
                      <p className="text-sm text-gray-600">Contemporary and traditional art</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">2:00 PM - Literature Panel</p>
                      <p className="text-sm text-gray-600">Authors and poets discussion</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">6:00 PM - Poetry Evening</p>
                      <p className="text-sm text-gray-600">Kumaoni and Hindi poetry</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 3 */}
              <Card className="border-yellow-200">
                <CardHeader className="text-center">
                  <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 w-fit mx-auto">Day 3</Badge>
                  <CardTitle className="text-xl text-gray-900">September 17, 2024</CardTitle>
                  <p className="text-gray-600">Grand Finale</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">11:00 AM - Cultural Workshops</p>
                      <p className="text-sm text-gray-600">Hands-on traditional crafts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">4:00 PM - Community Celebration</p>
                      <p className="text-sm text-gray-600">Local food and performances</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">8:00 PM - Grand Finale Concert</p>
                      <p className="text-sm text-gray-600">Closing ceremony and performances</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Past Editions</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Relive the magical moments from previous Kumaon Fest celebrations
              </p>
            </div>

            <GalleryCarousel />
          </div>
        </section>

        {/* Community Involvement */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Join Our Community</h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Kumaon Fest thrives on community participation. We believe that culture is best celebrated when
                  everyone comes together to share, learn, and create memories.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Volunteer Opportunities</p>
                      <p className="text-sm text-gray-600">Help us organize and run the festival</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Palette className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Artist Participation</p>
                      <p className="text-sm text-gray-600">Showcase your talent on our platform</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Cultural Workshops</p>
                      <p className="text-sm text-gray-600">Learn traditional arts and crafts</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                    Become a Volunteer
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                  >
                    Submit Your Art
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  width={500}
                  height={300}
                  alt="Community participation at Kumaon Fest"
                  className="w-full rounded-lg object-cover border border-yellow-200"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Image
                    src="/placeholder.svg?height=150&width=240"
                    width={240}
                    height={150}
                    alt="Volunteers at work"
                    className="w-full rounded-lg object-cover border border-yellow-200"
                  />
                  <Image
                    src="/placeholder.svg?height=150&width=240"
                    width={240}
                    height={150}
                    alt="Community workshop"
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
                Don&apos;t Miss <span className="text-yellow-400">Kumaon Fest 2024</span>
              </h2>
              <p className="max-w-[600px] md:text-xl text-gray-300">
                Secure your spot at the most anticipated cultural celebration of the year. Early bird tickets are now
                available!
              </p>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                  <Ticket className="mr-2 h-4 w-4" />
                  Book Tickets Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  View Pricing
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-center">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">₹299</div>
                  <div className="text-sm text-gray-300">Single Day Pass</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">₹799</div>
                  <div className="text-sm text-gray-300">3-Day Festival Pass</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">₹1299</div>
                  <div className="text-sm text-gray-300">VIP Experience</div>
                </div>
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
