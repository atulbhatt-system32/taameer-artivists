"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const events = [
  {
    id: 1,
    title: "Traditional Folk Music Concert",
    description: "Experience the soulful melodies of Kumaoni folk songs performed by renowned local artists.",
    image: "/placeholder.svg?height=300&width=400",
    time: "7:00 PM - 9:00 PM",
    venue: "Main Stage",
  },
  {
    id: 2,
    title: "Contemporary Art Exhibition",
    description: "Discover modern interpretations of traditional Kumaoni themes by emerging artists.",
    image: "/placeholder.svg?height=300&width=400",
    time: "10:00 AM - 6:00 PM",
    venue: "Art Gallery",
  },
  {
    id: 3,
    title: "Poetry & Literature Session",
    description: "Join celebrated poets and authors for readings and discussions about Kumaoni literature.",
    image: "/placeholder.svg?height=300&width=400",
    time: "2:00 PM - 4:00 PM",
    venue: "Literary Corner",
  },
  {
    id: 4,
    title: "Traditional Dance Performance",
    description: "Watch mesmerizing performances of classical Kumaoni dance forms.",
    image: "/placeholder.svg?height=300&width=400",
    time: "6:00 PM - 7:30 PM",
    venue: "Cultural Stage",
  },
  {
    id: 5,
    title: "Handicraft Workshop",
    description: "Learn traditional Kumaoni crafts from master artisans in hands-on sessions.",
    image: "/placeholder.svg?height=300&width=400",
    time: "11:00 AM - 1:00 PM",
    venue: "Workshop Area",
  },
]

export function EventCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }
    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  const maxIndex = Math.max(0, events.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Featured Events</h3>
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
          {events.map((event) => (
            <div
              key={event.id}
              className="flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/3"
            >
              <Card className="mx-2">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      width={400}
                      height={300}
                      alt={event.title}
                      className="h-48 w-full object-cover md:h-full"
                    />
                  </div>
                  <div className="p-6 md:w-1/2">
                    <h4 className="text-xl font-bold mb-2">{event.title}</h4>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>
                        <strong>Time:</strong> {event.time}
                      </p>
                      <p>
                        <strong>Venue:</strong> {event.venue}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: Math.ceil(events.length / itemsPerView) }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index * itemsPerView)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsPerView) === index ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
