"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, QrCode, CreditCard, Phone, Mail, MessageCircle, CheckCircle, Download, ExternalLink } from "lucide-react"
import Image from "next/image"
import paymentData from "@/data/payment.json"
import { 
  generateUPIQRCode, 
  generateUPIUrl, 
  generatePaytmUrl, 
  generatePhonePeUrl, 
  generateGooglePayUrl,
  generateWhatsAppPaymentLink,
  generateEmailPaymentLink,
  formatAmount,
  type PaymentDetails 
} from "@/lib/payment-utils"

interface PaymentModalProps {
  eventTitle: string
  eventPrice: string | number
  eventId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentModal({ eventTitle, eventPrice, eventId, isOpen, onOpenChange }: PaymentModalProps) {
  const [copiedUPI, setCopiedUPI] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const { paymentMethods, paymentNote } = paymentData

  // Generate dynamic UPI URL and QR code when component mounts
  useEffect(() => {
    if (eventPrice && paymentMethods.upi.upiId) {
      const amount = typeof eventPrice === "number" ? eventPrice : parseInt(eventPrice.toString().replace(/[^\d]/g, ''))
      
      const paymentDetails: PaymentDetails = {
        amount,
        upiId: paymentMethods.upi.upiId,
        eventName: eventTitle,
        eventId
      }

      const generateQR = async () => {
        setIsGeneratingQR(true)
        try {
          const qrDataUrl = await generateUPIQRCode(paymentDetails)
          setQrCodeDataUrl(qrDataUrl)
        } catch (error) {
          console.error('Error generating QR code:', error)
          setQrCodeDataUrl("/placeholder.svg")
        } finally {
          setIsGeneratingQR(false)
        }
      }

      generateQR()
    }
  }, [eventPrice, eventTitle, eventId, paymentMethods.upi.upiId])

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

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.download = `payment-qr-${eventId}.png`
      link.href = qrCodeDataUrl
      link.click()
    }
  }

  const amount = typeof eventPrice === "number" ? eventPrice : parseInt(eventPrice.toString().replace(/[^\d]/g, ''))
  const paymentDetails: PaymentDetails = {
    amount,
    upiId: paymentMethods.upi.upiId,
    eventName: eventTitle,
    eventId
  }

  const upiUrl = generateUPIUrl(paymentDetails)
  const paytmUrl = generatePaytmUrl(paymentDetails)
  const phonePeUrl = generatePhonePeUrl(paymentDetails)
  const googlePayUrl = generateGooglePayUrl(paymentDetails)
  const whatsappLink = generateWhatsAppPaymentLink(paymentDetails)
  const emailLink = generateEmailPaymentLink(paymentDetails)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] p-3 sm:p-4 md:p-6 max-h-[90vh] flex flex-col rounded-lg z-50">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Payment</DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-700">{eventTitle}</p>
              <p className="text-xs sm:text-sm text-gray-500">Event ID: {eventId}</p>
            </div>
            <Badge className="bg-yellow-500 text-gray-900 text-sm sm:text-lg px-2 sm:px-3 py-1 w-fit">
              {formatAmount(amount)}
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
                    UPI Payment - {formatAmount(amount)}
                </CardTitle>
              </CardHeader>
                <CardContent className="space-y-4 p-0">
                  {/* Dynamic QR Code */}
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                    <div className="p-2 sm:p-4 bg-white border-2 border-yellow-200 rounded-lg relative">
                      {isGeneratingQR ? (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        </div>
                      ) : (
                    <Image
                          src={qrCodeDataUrl || "/placeholder.svg"}
                      width={200}
                      height={200}
                          alt="Dynamic UPI QR Code"
                          className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48"
                    />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                      Scan this QR code with any UPI app to pay {formatAmount(amount)}
                    </p>
                  </div>

                  {/* Quick Payment Apps */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">Quick Payment Apps:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <a
                        href={upiUrl}
                        className="flex flex-col items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                          <QrCode className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">Any UPI App</span>
                      </a>
                      <a
                        href={paytmUrl}
                        className="flex flex-col items-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">Paytm</span>
                      </a>
                      <a
                        href={phonePeUrl}
                        className="flex flex-col items-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">PhonePe</span>
                      </a>
                      <a
                        href={googlePayUrl}
                        className="flex flex-col items-center p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">Google Pay</span>
                      </a>
                    </div>
                  </div>

                  {/* UPI Intent URL */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Or copy UPI Intent URL:</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 p-2 sm:p-3 bg-gray-50 border rounded-lg font-mono text-xs sm:text-sm break-all">
                        {upiUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(upiUrl, "upi")}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        {copiedUPI ? <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
                        <span className="hidden sm:inline">{copiedUPI ? "Copied!" : "Copy"}</span>
                        <span className="sm:hidden">{copiedUPI ? "✓" : "Copy"}</span>
                      </Button>
                    </div>
                    <a
                      href={upiUrl}
                      className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg"
                    >
                      Open UPI App
                    </a>
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
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Scan the QR code or click any payment app to pay {formatAmount(amount)}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Enter event name: &quot;{eventTitle}&quot; in payment description
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Take a screenshot of payment confirmation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Send confirmation to our WhatsApp: {paymentMethods.contact.whatsapp}
                      </li>
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
                    Bank Transfer Details - {formatAmount(amount)}
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
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Transfer {formatAmount(amount)} to the above bank account
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Use event name: &quot;{eventTitle}&quot; as reference in transaction
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Send payment proof to {paymentMethods.contact.email}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        Include your name, phone number, and event details
                      </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          {/* Contact Information - Now part of normal scroll */}
          <div className="space-y-3">
            <Card className="bg-yellow-50 border-yellow-200 w-full p-3 sm:p-4 md:p-6 rounded-lg">
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-sm sm:text-base md:text-lg text-gray-900">Need Help?</CardTitle>
          </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <a
                    href={whatsappLink}
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
                    href={emailLink}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
