"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

const galleryImages = [
  {
    id: 1,
    src: "/2024main.jpg",
    alt: "Kumaon Fest 2024 Opening Ceremony",
    caption: "Grand opening ceremony with traditional welcome",
  },
  {
    id: 2,
    src: "/music.png",
    alt: "Folk musicians performing",
    caption: "Local artists performing traditional Kumaoni songs",
  },
  {
    id: 3,
    src: "/exhibition.jpg",
    alt: "Art exhibition",
    caption: "Contemporary art exhibition showcasing local talent",
  },
  {
    id: 4,
    src: "/dance.jpg",
    alt: "Cultural dance performance",
    caption: "Traditional dance performance by local groups",
  },
  {
    id: 5,
    src: "/poetry.jpg",
    alt: "Poetry session",
    caption: "Intimate poetry reading session with renowned authors",
  },
  {
    id: 6,
    src: "/folk.png",
    alt: "Community participation",
    caption: "Families enjoying the festival together",
  },
]

export function GalleryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerView >= galleryImages.length ? 0 : prevIndex + itemsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, galleryImages.length - itemsPerView) : Math.max(0, prevIndex - itemsPerView),
    )
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Festival Memories</h3>
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
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-2 sm:px-3"
            >
              <div className="relative group cursor-pointer">
                <Image
                  src={image.src || "/placeholder.svg"}
                  width={600}
                  height={400}
                  alt={image.alt}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end">
                  <p className="text-white p-3 sm:p-4 text-xs sm:text-sm">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="text-center mt-8">
        <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent">
          View All Photos
        </Button>
      </div>
    </div>
  )
}
