"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock } from "lucide-react"
import Image from "next/image"

const upcomingEvents = [
  {
    id: 1,
    title: "Kumaon Fest 2024",
    date: "Sep 15-17",
    time: "10:00 AM onwards",
    location: "Haldwani",
    image: "/placeholder.svg?height=200&width=300",
    category: "Festival",
    daysLeft: 45,
  },
  {
    id: 2,
    title: "Community Cleanup Drive",
    date: "Aug 10",
    time: "7:00 AM - 11:00 AM",
    location: "Mall Road, Haldwani",
    image: "/placeholder.svg?height=200&width=300",
    category: "Community",
    daysLeft: 12,
  },
  {
    id: 3,
    title: "Art Workshop for Kids",
    date: "Aug 15",
    time: "2:00 PM - 5:00 PM",
    location: "Community Center",
    image: "/placeholder.svg?height=200&width=300",
    category: "Workshop",
    daysLeft: 17,
  },
  {
    id: 4,
    title: "Environmental Awareness Talk",
    date: "Aug 20",
    time: "6:00 PM - 8:00 PM",
    location: "Nainital Lake",
    image: "/placeholder.svg?height=200&width=300",
    category: "Education",
    daysLeft: 22,
  },
  {
    id: 5,
    title: "Traditional Music Evening",
    date: "Aug 25",
    time: "7:00 PM - 10:00 PM",
    location: "Cultural Center",
    image: "/placeholder.svg?height=200&width=300",
    category: "Cultural",
    daysLeft: 27,
  },
]

export function UpcomingEventsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 4

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerView >= upcomingEvents.length ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, upcomingEvents.length - itemsPerView) : prevIndex - 1,
    )
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
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
          {upcomingEvents.map((event) => (
            <div key={event.id} className="w-1/4 flex-shrink-0 px-2">
              <Card className="h-full border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-md">
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    width={300}
                    height={150}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-gray-900">{event.daysLeft} days</Badge>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h4>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="h-3 w-3 text-yellow-500" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-yellow-500" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-xs"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
