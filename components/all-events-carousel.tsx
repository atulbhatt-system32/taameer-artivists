"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Users } from "lucide-react"
import Image from "next/image"
import { PaymentModal } from "@/components/payment-modal"
import eventsData from "@/data/events.json"

const categoryColors = {
  "Cultural Festival": "bg-orange-100 text-orange-800 border-orange-200",
  "Community Service": "bg-green-100 text-green-800 border-green-200",
  Environmental: "bg-blue-100 text-blue-800 border-blue-200",
  "Art & Culture": "bg-purple-100 text-purple-800 border-purple-200",
  Leadership: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Social Service": "bg-pink-100 text-pink-800 border-pink-200",
}

const statusColors = {
  upcoming: "bg-green-100 text-green-800",
  recurring: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
}

export function AllEventsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const allEvents = eventsData.allEvents
  const categories = ["All", ...Array.from(new Set(allEvents.map((event) => event.category)))]

  const filteredEvents =
    selectedCategory === "All" ? allEvents : allEvents.filter((event) => event.category === selectedCategory)

  const itemsPerView = 3
  const maxIndex = Math.max(0, filteredEvents.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentIndex(0)
  }

  const formatDate = (startDate: string, endDate: string | null) => {
    if (startDate === "recurring") return "Every 2nd Saturday"

    const start = new Date(startDate)
    const startFormatted = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    if (!endDate || startDate === endDate) {
      return `${startFormatted}, ${start.getFullYear()}`
    }

    const end = new Date(endDate)
    const endFormatted = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    return `${startFormatted} - ${endFormatted}, ${start.getFullYear()}`
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            className={
              selectedCategory === category
                ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                : "border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedCategory === "All" ? "All Events" : selectedCategory}
          </h3>
          <p className="text-gray-600">{filteredEvents.length} events available</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="h-8 w-8 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="h-8 w-8 bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel Content */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {filteredEvents.map((event) => (
            <div key={event.id} className="w-1/3 flex-shrink-0 px-3">
              <Card className="h-full border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    width={400}
                    height={200}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={categoryColors[event.category as keyof typeof categoryColors]}>
                      {event.category}
                    </Badge>
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>{event.status}</Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-900 line-clamp-2">{event.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4 text-yellow-500" />
                      <span>{formatDate(event.startDate, event.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-yellow-500" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-yellow-500" />
                      <span>{event.expectedAttendees} expected</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-yellow-600">{event.pricing.display}</div>
                    {event.pricing.min === 0 ? (
                      <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        Join Event
                      </Button>
                    ) : (
                      <PaymentModal eventTitle={event.title} eventPrice={event.pricing.display} eventId={event.id}>
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                          Book Now
                        </Button>
                      </PaymentModal>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: Math.ceil(filteredEvents.length / itemsPerView) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsPerView) === index ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent">
          View All Events
        </Button>
      </div>
    </div>
  )
}
