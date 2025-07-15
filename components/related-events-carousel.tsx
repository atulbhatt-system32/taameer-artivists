"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Users } from "lucide-react"
import Image from "next/image"

const relatedEvents = [
  {
    id: 1,
    title: "Haldwani Heritage Walk",
    description: "Explore the historical landmarks and cultural heritage of Haldwani city.",
    date: "October 8, 2024",
    location: "Old Haldwani",
    image: "/placeholder.svg?height=200&width=350",
    price: "Free",
    attendees: "50+",
    category: "Heritage",
  },
  {
    id: 2,
    title: "Mountain Photography Workshop",
    description: "Learn landscape photography techniques in the beautiful Kumaon hills.",
    date: "October 22, 2024",
    location: "Nainital Hills",
    image: "/placeholder.svg?height=200&width=350",
    price: "₹499",
    attendees: "25+",
    category: "Workshop",
  },
  {
    id: 3,
    title: "Folk Dance Competition",
    description: "Showcase traditional Kumaoni dance forms in this exciting competition.",
    date: "November 5, 2024",
    location: "Cultural Center",
    image: "/placeholder.svg?height=200&width=350",
    price: "₹100",
    attendees: "200+",
    category: "Competition",
  },
  {
    id: 4,
    title: "Local Cuisine Festival",
    description: "Taste authentic Kumaoni dishes prepared by local chefs and home cooks.",
    date: "November 18, 2024",
    location: "Food Court, Haldwani",
    image: "/placeholder.svg?height=200&width=350",
    price: "₹150",
    attendees: "300+",
    category: "Food",
  },
  {
    id: 5,
    title: "Winter Storytelling Night",
    description: "Listen to traditional Kumaoni folk tales around a cozy bonfire.",
    date: "December 15, 2024",
    location: "Community Garden",
    image: "/placeholder.svg?height=200&width=350",
    price: "₹75",
    attendees: "80+",
    category: "Cultural",
  },
]

export function RelatedEventsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerView >= relatedEvents.length ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? Math.max(0, relatedEvents.length - itemsPerView) : prevIndex - 1))
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevSlide} className="h-8 w-8 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} className="h-8 w-8 bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {relatedEvents.map((event) => (
            <div key={event.id} className="w-1/3 flex-shrink-0 px-3">
              <Card className="h-full border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    width={350}
                    height={200}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-3 right-3 bg-yellow-500 text-gray-900">{event.category}</Badge>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4 text-yellow-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-yellow-500" />
                      <span>{event.attendees} expected</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-yellow-600">{event.price}</div>
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                      {event.price === "Free" ? "Join" : "Book"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: Math.ceil(relatedEvents.length / itemsPerView) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsPerView) === index ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
