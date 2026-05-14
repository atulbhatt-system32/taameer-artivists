"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Users, Calendar, Gift, Crown, Music, Palette, BookOpen } from "lucide-react"
import { PaymentModal } from "./payment-modal"

interface TicketPass {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  features: string[]
  badge?: string
  popular?: boolean
  icon: React.ReactNode
}

interface TicketSelectionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketSelectionModal({ isOpen, onOpenChange }: TicketSelectionModalProps) {
  const [selectedPass, setSelectedPass] = useState<TicketPass | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const ticketPasses: TicketPass[] = useMemo(() => [
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
      name: "2-Day Festival Pass",
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
  ], [])

  // Set Single Day Pass as default selected pass
  useEffect(() => {
    if (!selectedPass) {
      setSelectedPass(ticketPasses[0]) // Single Day Pass
    }
  }, [selectedPass, ticketPasses])

  const handlePassSelection = (pass: TicketPass) => {
    setSelectedPass(pass)
  }

  const handleProceedToPayment = () => {
    if (selectedPass) {
      console.log("Opening payment modal for:", selectedPass.name)
      setIsPaymentOpen(true)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] p-3 sm:p-4 md:p-6 max-h-[90vh] flex flex-col rounded-lg">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Kumaon Fest Pass</DialogTitle>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-700">Kumaon Fest 2025</p>
                <p className="text-xs sm:text-sm text-gray-500">September 27-28, 2025 • Haldwani, Uttarakhand</p>
              </div>
              <Badge className="bg-yellow-500 text-gray-900 text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
                Early Bird Pricing
              </Badge>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mt-4 space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Select Pass</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-xs text-gray-400">Payment</span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            <Tabs defaultValue="single-day" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1">
                {ticketPasses.map((pass) => (
                  <TabsTrigger
                    key={pass.id}
                    value={pass.id}
                    className="flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm h-auto py-2 sm:py-3 px-1 sm:px-2 transition-all duration-200 hover:bg-yellow-50"
                    onClick={() => handlePassSelection(pass)}
                  >
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full text-yellow-600">
                      {pass.icon}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-center leading-tight">
                        {pass.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      {pass.popular && (
                        <Badge className="bg-yellow-500 text-gray-900 text-xs mt-1">
                          {pass.badge}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {ticketPasses.map((pass) => (
                <TabsContent key={pass.id} value={pass.id} className="space-y-4">
                  <Card className="border-2 border-yellow-200 bg-yellow-50/30 hover:border-yellow-300 transition-colors">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                          {pass.icon}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl font-bold text-yellow-600">₹{pass.price}</span>
                        {pass.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">₹{pass.originalPrice}</span>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">{pass.name}</CardTitle>
                      <p className="text-sm text-gray-600">{pass.description}</p>
                      {pass.badge && (
                        <Badge className="mt-2 bg-yellow-500 text-gray-900">
                          {pass.badge}
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Included:</h4>
                        {pass.features.map((feature, index) => (
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

            {/* Festival Highlights */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">What&apos;s Included in Your Festival Experience</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <Music className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">Live Music</p>
                      <p className="text-xs sm:text-sm text-gray-600">Traditional & fusion performances</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">Art Exhibitions</p>
                      <p className="text-xs sm:text-sm text-gray-600">Local & contemporary art</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">Literature</p>
                      <p className="text-xs sm:text-sm text-gray-600">Poetry & discussions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900">Workshops</p>
                      <p className="text-xs sm:text-sm text-gray-600">Hands-on learning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Important Information</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
                  <li>• All passes are non-refundable and non-transferable</li>
                  <li>• Children under 5 years enter free</li>
                  <li>• Photography and videography allowed for personal use</li>
                  <li>• Food and beverages available for purchase</li>
                  <li>• Parking available on-site</li>
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

          {/* Compact Sticky Payment Section */}
          {selectedPass && (
            <div className="flex-shrink-0 mt-3 sm:mt-4">
              <div className="bg-yellow-50 border-yellow-200 border-t rounded-b-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{selectedPass.name}</p>
                    <p className="text-xs text-gray-600">₹{selectedPass.price}</p>
                  </div>
                  <Button
                    onClick={handleProceedToPayment}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm px-4 py-2 ml-3"
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>

        {/* Payment Modal - Direct rendering when state is true */}
        {isPaymentOpen && selectedPass && (
          <PaymentModal
            eventTitle={`Kumaon Fest 2026 - ${selectedPass.name}`}
            eventPrice={selectedPass.price}
            eventId={`KF2025-${selectedPass.id.toUpperCase()}`}
            isOpen={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
          />
        )}
      </Dialog>
    )
  }