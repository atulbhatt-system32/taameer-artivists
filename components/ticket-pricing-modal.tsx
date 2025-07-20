"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Calendar, Users, Crown } from "lucide-react"
import { TicketSelectionModal } from "./ticket-selection-modal"

interface TicketPricingModalProps {
  children: React.ReactNode
}

export function TicketPricingModal({ children }: TicketPricingModalProps) {
  const ticketTiers = [
    {
      id: "single-day",
      name: "Single Day Pass",
      price: 299,
      originalPrice: 399,
      description: "Perfect for those who want to experience one day of the festival",
      features: [
        "Access to all events on your chosen day",
        "Food court access",
        "Basic seating arrangements",
        "Festival merchandise (limited)",
        "Photo opportunities"
      ],
      badge: "Most Popular",
      popular: true,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: "festival-pass",
      name: "3-Day Festival Pass",
      price: 799,
      originalPrice: 999,
      description: "Complete festival experience across all three days",
      features: [
        "Access to all events across 3 days",
        "Priority seating at main events",
        "Exclusive food court access",
        "Complete festival merchandise kit",
        "Meet & greet with artists",
        "Workshop participation",
        "Festival souvenir"
      ],
      badge: "Best Value",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "vip-experience",
      name: "VIP Experience",
      price: 1299,
      originalPrice: 1599,
      description: "Ultimate festival experience with premium perks and exclusive access",
      features: [
        "All 3-Day Festival Pass benefits",
        "VIP seating at all events",
        "Exclusive VIP lounge access",
        "Complimentary food & beverages",
        "Artist meet & greet sessions",
        "Backstage tour",
        "Premium festival merchandise",
        "Priority parking",
        "Dedicated VIP support"
      ],
      badge: "Premium",
      icon: <Crown className="h-4 w-4" />
    }
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] max-w-[95vw] p-3 sm:p-4 md:p-6 max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Kumaon Fest 2025 - Ticket Pricing</DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-700">Choose the perfect pass for your festival experience</p>
              <p className="text-xs sm:text-sm text-gray-500">September 15-17, 2025 • Haldwani, Uttarakhand</p>
            </div>
            <Badge className="bg-yellow-500 text-gray-900 text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
              Early Bird Pricing
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Pricing Tabs */}
          <Tabs defaultValue="single-day" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1">
              {ticketTiers.map((tier) => (
                <TabsTrigger
                  key={tier.id}
                  value={tier.id}
                  className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-3 px-1 sm:px-2"
                >
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full text-yellow-600">
                    {tier.icon}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-center leading-tight">
                      {tier.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                    {tier.popular && (
                      <Badge className="bg-yellow-500 text-gray-900 text-xs mt-1">
                        {tier.badge}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {ticketTiers.map((tier) => (
              <TabsContent key={tier.id} value={tier.id} className="space-y-4">
                <Card className="border-2 border-yellow-200 bg-yellow-50/30">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        {tier.icon}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-yellow-600">₹{tier.price}</span>
                      {tier.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{tier.originalPrice}</span>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{tier.name}</CardTitle>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                    {tier.badge && (
                      <Badge className="mt-2 bg-yellow-500 text-gray-900">
                        {tier.badge}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Included:</h4>
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Call to Action */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Ready to Book Your Tickets?</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Choose your preferred pass and complete your booking to secure your spot at Kumaon Fest 2025!
              </p>
              <TicketSelectionModal>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm sm:text-base">
                  Book Tickets Now
                </Button>
              </TicketSelectionModal>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Important Information</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
                <li>• All passes are non-refundable and non-transferable</li>
                <li>• Children under 5 years enter free</li>
                <li>• Photography and videography allowed for personal use</li>
                <li>• Food and beverages available for purchase</li>
                <li>• Parking available on-site</li>
                <li>• Early bird pricing valid until August 31, 2025</li>
              </ul>
            </div>
            
            <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">COVID-19 Safety</h4>
              <p className="text-xs sm:text-sm text-green-800">
                We follow all government guidelines for safe gatherings. Masks and sanitization stations will be available throughout the venue.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 