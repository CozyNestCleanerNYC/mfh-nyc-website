import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { CheckCircle, Clock, MapPin, Users, DollarSign, Star, Shield, Sparkles, CreditCard, AlertCircle } from 'lucide-react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    serviceType: '',
    homeSize: '',
    frequency: '',
    address: '',
    distance: 0,
    specialRequests: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  })
  
  const [quote, setQuote] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Service types with base pricing
  const serviceTypes = {
    'standard': {
      name: 'Standard Cleaning',
      description: 'Regular cleaning of all rooms, dusting, vacuuming, mopping',
      baseRate: 50,
      icon: <Sparkles className="w-5 h-5" />
    },
    'deep': {
      name: 'Deep Cleaning',
      description: 'Thorough cleaning including baseboards, inside appliances, detailed work',
      baseRate: 55,
      icon: <Star className="w-5 h-5" />
    },
    'moveout': {
      name: 'Move-Out Cleaning',
      description: 'Complete cleaning for moving out, includes inside cabinets, oven, fridge',
      baseRate: 60,
      icon: <Shield className="w-5 h-5" />
    }
  }

  // Home sizes with hour estimates
  const homeSizes = {
    'studio': { name: 'Studio/1BR', hours: 2 },
    '2br': { name: '2 Bedroom', hours: 3 },
    '3br': { name: '3 Bedroom', hours: 4 },
    '4br': { name: '4+ Bedroom', hours: 5 },
    'large': { name: 'Large Home (5+ BR)', hours: 6 }
  }

  // Frequency discounts
  const frequencies = {
    'one-time': { name: 'One-time', discount: 0 },
    'weekly': { name: 'Weekly', discount: 0.15 },
    'biweekly': { name: 'Bi-weekly', discount: 0.10 },
    'monthly': { name: 'Monthly', discount: 0.05 }
  }

  // Calculate quote based on form data
  const calculateQuote = () => {
    if (!formData.serviceType || !formData.homeSize || !formData.frequency) return null

    const service = serviceTypes[formData.serviceType]
    const size = homeSizes[formData.homeSize]
    const frequency = frequencies[formData.frequency]
    
    // Base calculation
    const baseHours = size.hours
    const hourlyRate = service.baseRate
    const basePrice = baseHours * hourlyRate
    
    // Distance surcharge (for jobs over 15 miles)
    let distanceSurcharge = 0
    if (formData.distance > 15) {
      const extraMiles = formData.distance - 15
      distanceSurcharge = Math.ceil(extraMiles / 10) * 15 // $15 per 10-mile increment
    }
    
    // Frequency discount
    const discountAmount = basePrice * frequency.discount
    
    // Final calculations
    const subtotal = basePrice + distanceSurcharge - discountAmount
    
    // Team approach calculations (always use team for efficiency)
    const teamHours = Math.ceil(baseHours / 2) // Team completes in half the time
    const laborCost = teamHours * 22 // Only pay for one person ($22/hour)
    const gasCost = (formData.distance * 2 / 25) * 3.20 // Estimated gas cost
    const tollEstimate = formData.distance > 30 ? 15 : (formData.distance > 20 ? 10 : 0)
    const supplies = 15
    const totalCosts = laborCost + gasCost + tollEstimate + supplies
    const profit = subtotal - totalCosts
    const profitMargin = subtotal > 0 ? profit / subtotal : 0
    
    // Travel time estimation
    const travelTime = formData.distance > 0 ? Math.ceil(formData.distance / 20) * 2 : 1 // Round trip
    const totalTime = teamHours + travelTime
    
    return {
      basePrice,
      distanceSurcharge,
      discountAmount,
      subtotal,
      teamHours,
      totalTime,
      profitMargin: profitMargin * 100,
      worthIt: profitMargin >= 0.35,
      breakdown: {
        baseHours,
        teamHours,
        hourlyRate,
        gasCost,
        tollEstimate,
        totalCosts,
        profit,
        laborCost,
        supplies,
        travelTime
      }
    }
  }

  // Update quote when form data changes
  useEffect(() => {
    const newQuote = calculateQuote()
    setQuote(newQuote)
  }, [formData])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAddressChange = (address) => {
    // Simple distance estimation based on address length (in real app, would use Google Maps API)
    let estimatedDistance = 0
    if (address.length > 0) {
      // Mock distance calculation based on address characteristics
      const addressLower = address.toLowerCase()
      if (addressLower.includes('downtown') || addressLower.includes('city')) {
        estimatedDistance = Math.floor(Math.random() * 15) + 5 // 5-20 miles
      } else if (addressLower.includes('suburb') || addressLower.includes('ave') || addressLower.includes('street')) {
        estimatedDistance = Math.floor(Math.random() * 25) + 10 // 10-35 miles
      } else {
        estimatedDistance = Math.floor(Math.random() * 40) + 15 // 15-55 miles
      }
    }
    
    setFormData(prev => ({
      ...prev,
      address,
      distance: estimatedDistance
    }))
  }

  const handleBookNow = async () => {
    setIsSubmitting(true)
    
    // Simulate API call to backend
    try {
      const bookingData = {
        ...formData,
        quote,
        timestamp: new Date().toISOString()
      }
      
      // In real implementation, this would call your Flask backend
      console.log('Booking data:', bookingData)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowPayment(true)
    } catch (error) {
      console.error('Booking error:', error)
      alert('There was an error processing your booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async (paymentMethod) => {
    setIsSubmitting(true)
    
    try {
      // In real implementation, this would integrate with Stripe, Square, etc.
      const paymentData = {
        amount: quote.subtotal,
        method: paymentMethod,
        booking: formData,
        quote
      }
      
      console.log('Processing payment:', paymentData)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message
      alert(`Payment successful! Your cleaning is booked for ${formData.address}. You'll receive a confirmation email shortly.`)
      
      // Reset form
      setFormData({
        serviceType: '',
        homeSize: '',
        frequency: '',
        address: '',
        distance: 0,
        specialRequests: '',
        contactInfo: { name: '', email: '', phone: '' }
      })
      setShowPayment(false)
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again or contact support.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Maid For Heaven NYC</h1>
                <p className="text-sm text-gray-600">Professional cleaning services in New York City</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">HOME</a>
                <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">SERVICES</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">ABOUT</a>
                <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">FAQ</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">CONTACT</a>
              </nav>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>2-Person Team</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Insured</span>
                </Badge>
                <div className="text-lg font-bold text-blue-600">(347) 759-2000</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Book Your Cleaning Service</span>
                </CardTitle>
                <CardDescription>
                  Get instant pricing with no hidden fees. Professional husband & wife team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Service Type</Label>
                  <div className="grid gap-3">
                    {Object.entries(serviceTypes).map(([key, service]) => (
                      <div
                        key={key}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.serviceType === key 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('serviceType', key)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {service.icon}
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${service.baseRate}/hr</p>
                            <p className="text-xs text-gray-500">base rate</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home Size */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Home Size</Label>
                  <Select value={formData.homeSize} onValueChange={(value) => handleInputChange('homeSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your home size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(homeSizes).map(([key, size]) => (
                        <SelectItem key={key} value={key}>
                          {size.name} (~{size.hours} hours)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Cleaning Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How often do you need cleaning?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(frequencies).map(([key, freq]) => (
                        <SelectItem key={key} value={key}>
                          {freq.name} {freq.discount > 0 && `(${Math.round(freq.discount * 100)}% discount)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Service Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {formData.distance > 0 && (
                    <p className="text-sm text-gray-600">
                      Estimated distance: {formData.distance} miles
                      {formData.distance > 15 && (
                        <span className="text-amber-600 ml-2">
                          (Distance surcharge applies)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Special Requests */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Special Requests (Optional)</Label>
                  <Textarea
                    placeholder="Any specific areas of focus, special instructions, or additional services needed?"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Contact Information</Label>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Full Name"
                      value={formData.contactInfo.name}
                      onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Display */}
          <div className="space-y-6">
            {quote ? (
              <Card className={`${quote.worthIt ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Instant Quote</span>
                    </span>
                    <Badge variant={quote.worthIt ? "default" : "secondary"}>
                      {quote.worthIt ? "✅ Profitable Job" : "⚠️ Needs Review"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Professional 2-person team • Transparent pricing • No hidden fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Service ({quote.breakdown.baseHours} hrs × ${quote.breakdown.hourlyRate}/hr)</span>
                      <span>${quote.basePrice}</span>
                    </div>
                    
                    {quote.distanceSurcharge > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Distance Surcharge ({formData.distance} miles)</span>
                        <span>+${quote.distanceSurcharge}</span>
                      </div>
                    )}
                    
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Frequency Discount</span>
                        <span>-${quote.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Price</span>
                      <span>${quote.subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Service Details</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Team Size</p>
                        <p className="font-medium">2 Professional Cleaners</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Estimated Time</p>
                        <p className="font-medium">{quote.totalTime} hours total</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Work Time</p>
                        <p className="font-medium">{quote.teamHours} hours cleaning</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Profit Margin</p>
                        <p className={`font-medium ${quote.worthIt ? 'text-green-600' : 'text-amber-600'}`}>
                          {quote.profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown (for transparency) */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Labor ({quote.breakdown.teamHours} hrs × $22)</span>
                        <span>${quote.breakdown.laborCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas & Travel</span>
                        <span>${quote.breakdown.gasCost.toFixed(2)}</span>
                      </div>
                      {quote.breakdown.tollEstimate > 0 && (
                        <div className="flex justify-between">
                          <span>Tolls (estimated)</span>
                          <span>${quote.breakdown.tollEstimate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Supplies</span>
                        <span>${quote.breakdown.supplies}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Our Profit</span>
                        <span>${quote.breakdown.profit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium mb-3">What's Included</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Professional husband & wife team</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>All cleaning supplies included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Insured and bonded service</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Satisfaction guarantee</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Travel time and gas included</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  {formData.contactInfo.name && formData.contactInfo.email && formData.contactInfo.phone ? (
                    <Button 
                      onClick={handleBookNow}
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                      size="lg"
                    >
                      {isSubmitting ? 'Processing...' : `Book Now & Pay Online - $${quote.subtotal.toFixed(2)}`}
                    </Button>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Please fill in your contact information to book</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Get Your Instant Quote</h3>
                  <p className="text-gray-600">
                    Select your service type, home size, and frequency to see transparent pricing
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Why Choose Our Service?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Professional Husband & Wife Team</p>
                      <p className="text-sm text-gray-600">Consistent, reliable service you can trust</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Faster Service</p>
                      <p className="text-sm text-gray-600">2-person team completes jobs in half the time</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Transparent Pricing</p>
                      <p className="text-sm text-gray-600">No hidden fees, see exact costs upfront</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium">Fully Insured</p>
                      <p className="text-sm text-gray-600">Licensed, bonded, and insured for your peace of mind</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Secure Payment</span>
              </CardTitle>
              <CardDescription>
                Complete your booking with secure online payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-xl font-bold">${quote?.subtotal.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{serviceTypes[formData.serviceType]?.name} • {homeSizes[formData.homeSize]?.name}</p>
                  <p>{formData.address}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handlePayment('card')}
                    disabled={isSubmitting}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Credit/Debit Card
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handlePayment('bank')}
                    disabled={isSubmitting}
                  >
                    🏦 Bank Transfer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => handlePayment('paypal')}
                    disabled={isSubmitting}
                  >
                    📱 PayPal
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure payment processing with 256-bit SSL encryption</span>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPayment(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handlePayment('card')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App

