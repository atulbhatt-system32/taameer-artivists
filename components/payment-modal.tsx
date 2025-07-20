"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, QrCode, CreditCard, Phone, Mail, MessageCircle, CheckCircle } from "lucide-react"
import Image from "next/image"
import paymentData from "@/data/payment.json"

interface PaymentModalProps {
  eventTitle: string
  eventPrice: string | number
  eventId: string
  children: React.ReactNode
}

export function PaymentModal({ eventTitle, eventPrice, eventId, children }: PaymentModalProps) {
  const [copiedUPI, setCopiedUPI] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)

  const copyToClipboard = (text: string, type: "upi" | "account") => {
    navigator.clipboard.writeText(text)
    if (type === "upi") {
      setCopiedUPI(true)
      setTimeout(() => setCopiedUPI(false), 2000)
    } else {
      setCopiedAccount(true)
      setTimeout(() => setCopiedAccount(false), 2000)
    }
  }

  const { paymentMethods, paymentNote } = paymentData

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] p-3 sm:p-4 md:p-6 max-h-[90vh] flex flex-col rounded-lg z-50">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Payment</DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-700">{eventTitle}</p>
              <p className="text-xs sm:text-sm text-gray-500">Event ID: {eventId}</p>
            </div>
            <Badge className="bg-yellow-500 text-gray-900 text-sm sm:text-lg px-2 sm:px-3 py-1 w-fit">
              {typeof eventPrice === "number" ? `₹${eventPrice}` : eventPrice}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <Tabs defaultValue="upi" className="w-full">
            <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm mb-4">
              <TabsTrigger value="upi" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">UPI Payment</span>
                <span className="sm:hidden">UPI</span>
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Bank Transfer</span>
                <span className="sm:hidden">Bank</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="space-y-4">
              <Card className="w-full p-3 sm:p-4 md:p-6 rounded-lg">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    UPI Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  {/* QR Code */}
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <div className="p-2 sm:p-4 bg-white border-2 border-yellow-200 rounded-lg">
                      <Image
                        src={paymentMethods.upi.qrCodeImage || "/placeholder.svg"}
                        width={200}
                        height={200}
                        alt="UPI QR Code"
                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">Scan this QR code with any UPI app</p>
                  </div>

                  {/* UPI ID */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Or copy UPI ID:</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 p-2 sm:p-3 bg-gray-50 border rounded-lg font-mono text-xs sm:text-sm break-all">
                        {paymentMethods.upi.upiId}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(paymentMethods.upi.upiId, "upi")}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        {copiedUPI ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                        <span className="hidden sm:inline">{copiedUPI ? "Copied!" : "Copy"}</span>
                        <span className="sm:hidden">{copiedUPI ? "✓" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Payment Instructions:</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {paymentMethods.upi.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card className="w-full p-3 sm:p-4 md:p-6 rounded-lg">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    Bank Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Account Name</label>
                      <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg text-xs sm:text-sm">
                        {paymentMethods.bankTransfer.accountName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Account Number</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 p-2 sm:p-3 bg-gray-50 border rounded-lg font-mono text-xs sm:text-sm">
                          {paymentMethods.bankTransfer.accountNumber}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentMethods.bankTransfer.accountNumber, "account")}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                        >
                          {copiedAccount ? (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          )}
                          <span className="hidden sm:inline">{copiedAccount ? "Copied!" : "Copy"}</span>
                          <span className="sm:hidden">{copiedAccount ? "✓" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">IFSC Code</label>
                      <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg font-mono text-xs sm:text-sm">
                        {paymentMethods.bankTransfer.ifscCode}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Bank Name</label>
                      <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg text-xs sm:text-sm">
                        {paymentMethods.bankTransfer.bankName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Branch</label>
                    <div className="p-2 sm:p-3 bg-gray-50 border rounded-lg text-xs sm:text-sm">{paymentMethods.bankTransfer.branch}</div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Transfer Instructions:</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {paymentMethods.bankTransfer.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky Contact Information */}
        <div className="flex-shrink-0 mt-4 space-y-3">
          <Card className="bg-yellow-50 border-yellow-200 w-full p-3 sm:p-4 md:p-6 rounded-lg">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="text-sm sm:text-base md:text-lg text-gray-900">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <a
                  href={`https://wa.me/${paymentMethods.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 sm:p-3 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">WhatsApp</p>
                    <p className="text-xs text-gray-600">{paymentMethods.contact.whatsapp}</p>
                  </div>
                </a>
                <a
                  href={`mailto:${paymentMethods.contact.email}`}
                  className="flex items-center gap-2 p-2 sm:p-3 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Email</p>
                    <p className="text-xs text-gray-600">{paymentMethods.contact.email}</p>
                  </div>
                </a>
                <a
                  href={`tel:${paymentMethods.contact.phone}`}
                  className="flex items-center gap-2 p-2 sm:p-3 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Call</p>
                    <p className="text-xs text-gray-600">{paymentMethods.contact.phone}</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Payment Note */}
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Note:</strong> {paymentNote}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
