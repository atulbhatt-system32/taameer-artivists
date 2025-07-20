import QRCode from "qrcode"

export interface PaymentDetails {
  amount: number
  upiId: string
  eventName: string
  eventId: string
  customerName?: string
  customerPhone?: string
}

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark: string
    light: string
  }
}

// Generate UPI Intent URL
export const generateUPIUrl = (details: PaymentDetails): string => {
  const { amount, upiId, eventName } = details
  const encodedEventName = encodeURIComponent(eventName)
  const encodedUpiId = encodeURIComponent(upiId)
  
  return `upi://pay?pa=${encodedUpiId}&pn=${encodedEventName}&am=${amount}&cu=INR&tn=${encodedEventName}`
}

// Generate Paytm Intent URL
export const generatePaytmUrl = (details: PaymentDetails): string => {
  const { amount, eventName } = details
  const encodedEventName = encodeURIComponent(eventName)
  
  return `paytmmp://pay?pa=taameerartivists@paytm&pn=${encodedEventName}&am=${amount}&cu=INR&tn=${encodedEventName}`
}

// Generate PhonePe Intent URL
export const generatePhonePeUrl = (details: PaymentDetails): string => {
  const { amount, eventName } = details
  const encodedEventName = encodeURIComponent(eventName)
  
  return `phonepe://pay?pa=taameerartivists@paytm&pn=${encodedEventName}&am=${amount}&cu=INR&tn=${encodedEventName}`
}

// Generate Google Pay Intent URL
export const generateGooglePayUrl = (details: PaymentDetails): string => {
  const { amount, eventName } = details
  const encodedEventName = encodeURIComponent(eventName)
  
  return `googleplay://pay?pa=taameerartivists@paytm&pn=${encodedEventName}&am=${amount}&cu=INR&tn=${encodedEventName}`
}

// Generate QR Code Data URL
export const generateQRCodeDataUrl = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions: QRCodeOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }
  
  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    return await QRCode.toDataURL(text, {
      width: finalOptions.width!,
      margin: finalOptions.margin!,
      color: finalOptions.color!
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

// Generate UPI QR Code
export const generateUPIQRCode = async (
  details: PaymentDetails,
  options?: QRCodeOptions
): Promise<string> => {
  const upiUrl = generateUPIUrl(details)
  return generateQRCodeDataUrl(upiUrl, options)
}

// Generate Payment Link for WhatsApp
export const generateWhatsAppPaymentLink = (details: PaymentDetails): string => {
  const { amount, eventName, eventId } = details
  const message = encodeURIComponent(
    `Hi! I want to book tickets for ${eventName} (Event ID: ${eventId}). Amount: ₹${amount}`
  )
  return `https://wa.me/919876543210?text=${message}`
}

// Generate SMS Payment Link
export const generateSMSPaymentLink = (details: PaymentDetails): string => {
  const { amount, eventName, eventId } = details
  const message = encodeURIComponent(
    `Book ${eventName} (${eventId}) - ₹${amount}`
  )
  return `sms:919876543210?body=${message}`
}

// Generate Email Payment Link
export const generateEmailPaymentLink = (details: PaymentDetails): string => {
  const { amount, eventName, eventId } = details
  const subject = encodeURIComponent(`Ticket Booking - ${eventName}`)
  const body = encodeURIComponent(
    `Hi,\n\nI would like to book tickets for ${eventName}.\nEvent ID: ${eventId}\nAmount: ₹${amount}\n\nPlease provide payment details.\n\nThanks!`
  )
  return `mailto:taameerartivists@gmail.com?subject=${subject}&body=${body}`
}

// Validate Payment Details
export const validatePaymentDetails = (details: PaymentDetails): boolean => {
  return (
    details.amount > 0 &&
    details.upiId.length > 0 &&
    details.eventName.length > 0 &&
    details.eventId.length > 0
  )
}

// Format Amount for Display
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Generate Payment Summary
export const generatePaymentSummary = (details: PaymentDetails): string => {
  return `${details.eventName} - ${formatAmount(details.amount)}`
} 