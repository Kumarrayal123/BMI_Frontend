import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, Menu, X, Activity, Users, Stethoscope, Calendar, Award, 
  ChevronRight, ArrowRight, Sparkles, Target, Zap, Globe, Shield, 
  TrendingUp, CheckCircle, HelpCircle, ChevronDown, Mail, Phone, 
  MapPin, ArrowUp, Star, Maximize2, RefreshCw, Check
} from 'lucide-react'
import h1 from '../assets/img1.jpg'
import h2 from '../assets/h3.jpg'
import h3 from '../assets/img3.jpg'
import h4 from "../assets/img4.jpg"
import h5 from "../assets/img5.jpg"
import h6 from "../assets/img6.jpg"
import h7 from "../assets/h1.jpg";
import h8 from "../assets/h2.jpg";
import h9 from "../assets/h4.jpg"

/* ─── Scroll Fade-in Intersection Observer Hook ─────── */
function useFadeIn(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setVisible(true)
          observer.disconnect() 
        } 
      },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

/* ─── FadeIn wrapper component ─────────────────────────────────────── */
function FadeIn({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const [ref, visible] = useFadeIn()

  const translate = {
    up:    'translateY(32px)',
    down:  'translateY(-32px)',
    left:  'translateX(32px)',
    right: 'translateX(-32px)',
    none:  'none',
  }[direction] ?? 'translateY(32px)'

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'none' : translate,
        transition: `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [activeToolTab, setActiveToolTab] = useState('bmi') // 'bmi' or 'bp'

  // Hero entrance on mount
  const [heroReady, setHeroReady] = useState(false)
  useEffect(() => { 
    const t = setTimeout(() => setHeroReady(true), 50) 
    return () => clearTimeout(t) 
  }, [])

  // Window scroll listener for Back-To-Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── 1. Interactive BMI Calculator State ──
  const [bmiWeight, setBmiWeight] = useState(68) // kg
  const [bmiHeight, setBmiHeight] = useState(172) // cm
  const [bmiResult, setBmiResult] = useState(23.0)
  const [bmiCategory, setBmiCategory] = useState('Normal Weight')
  const [bmiColor, setBmiColor] = useState('text-emerald-600')
  const [bmiBgColor, setBmiBgColor] = useState('bg-emerald-50/80 border-emerald-200 text-emerald-800')
  const [bmiTip, setBmiTip] = useState('Great job! Keep maintaining a balanced diet and regular physical activity.')

  useEffect(() => {
    if (bmiHeight > 0 && bmiWeight > 0) {
      const heightInMeters = bmiHeight / 100
      const bmiVal = parseFloat((bmiWeight / (heightInMeters * heightInMeters)).toFixed(1))
      setBmiResult(bmiVal)

      if (bmiVal < 18.5) {
        setBmiCategory('Underweight')
        setBmiColor('text-blue-600')
        setBmiBgColor('bg-blue-50/80 border-blue-200 text-blue-800')
        setBmiTip('Consider consulting a nutritionist to help create a nutrient-dense weight gain plan.')
      } else if (bmiVal >= 18.5 && bmiVal < 25) {
        setBmiCategory('Normal Weight')
        setBmiColor('text-emerald-600')
        setBmiBgColor('bg-emerald-50/80 border-emerald-200 text-emerald-800')
        setBmiTip('Great job! Keep maintaining a balanced diet and regular physical activity.')
      } else if (bmiVal >= 25 && bmiVal < 30) {
        setBmiCategory('Overweight')
        setBmiColor('text-amber-600')
        setBmiBgColor('bg-amber-50/80 border-amber-200 text-amber-800')
        setBmiTip('A combination of active living and balanced nutrition can help manage weight effectively.')
      } else {
        setBmiCategory('Obese')
        setBmiColor('text-rose-600')
        setBmiBgColor('bg-rose-50/80 border-rose-200 text-rose-800')
        setBmiTip('We suggest speaking with a healthcare professional to guide you safely on health goals.')
      }
    }
  }, [bmiWeight, bmiHeight])

  const bmiPercentage = Math.min(Math.max(((bmiResult - 15) / (40 - 15)) * 100, 0), 100)

  // ── 2. Interactive Blood Pressure Assessor State ──
  const [systolic, setSystolic] = useState(118)
  const [diastolic, setDiastolic] = useState(78)
  const [bpCategory, setBpCategory] = useState('Normal')
  const [bpBgColor, setBpBgColor] = useState('bg-emerald-50/80 border-emerald-200 text-emerald-800')
  const [bpAdvice, setBpAdvice] = useState('Your blood pressure is in the normal healthy range. Keep up your healthy lifestyle!')

  useEffect(() => {
    if (systolic >= 180 || diastolic >= 120) {
      setBpCategory('Hypertensive Crisis')
      setBpBgColor('bg-rose-100 border-rose-300 text-rose-900 animate-pulse')
      setBpAdvice('Consult a doctor immediately! This level requires immediate medical evaluation.')
    } else if (systolic >= 140 || diastolic >= 90) {
      setBpCategory('High BP (Stage 2)')
      setBpBgColor('bg-rose-50/80 border-rose-200 text-rose-800')
      setBpAdvice('Consult a doctor for guidance on lifestyle alterations or medication management.')
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      setBpCategory('High BP (Stage 1)')
      setBpBgColor('bg-amber-50/80 border-amber-200 text-amber-800')
      setBpAdvice('Consider lifestyle modifications, sodium reduction, and regular monitoring.')
    } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      setBpCategory('Elevated BP')
      setBpBgColor('bg-blue-50/80 border-blue-200 text-blue-800')
      setBpAdvice('Adopting healthy habits now can prevent your blood pressure from rising further.')
    } else {
      setBpCategory('Normal BP')
      setBpBgColor('bg-emerald-50/80 border-emerald-200 text-emerald-800')
      setBpAdvice('Your blood pressure is in the normal healthy range. Keep up your healthy lifestyle!')
    }
  }, [systolic, diastolic])

  // ── 3. Gallery Category Filter & Lightbox ──
  const [galleryFilter, setGalleryFilter] = useState('all')
  const [activeLightboxImg, setActiveLightboxImg] = useState(null)

  const galleryItems = [
    { id: 1, src: h1, category: 'camps', title: 'Community Mobile Camp', desc: 'Providing free health screenings to over 300 residents in Hyderabad.' },
    { id: 2, src: h2, category: 'care', title: 'Pediatric Checkup Drive', desc: 'Specialized healthcare and nutritional support for children.' },
    { id: 3, src: h3, category: 'camps', title: 'Doctor Diagnostic Camp', desc: 'Senior physicians offering primary health consultations.' },
    { id: 4, src: h4, category: 'awareness', title: 'Health Awareness Workshop', desc: 'Interactive workshop on preventive hygiene and dietary health.' },
    { id: 5, src: h5, category: 'volunteers', title: 'Volunteer Recognition Event', desc: 'Celebrating dedicated medical and non-medical volunteers.' },
    { id: 6, src: h6, category: 'care', title: 'Elderly Care & BP Check', desc: 'Dedicated vitals monitoring and medication advice for senior citizens.' },
    { id: 7, src: h7, category: 'awareness', title: 'Hygiene & Cleanliness Seminar', desc: 'Promoting sanitation standards and health awareness in rural communities.' },
    { id: 8, src: h8, category: 'awareness', title: 'Nutrition & Wellness Drive', desc: 'Spreading awareness about balanced nutrition and active lifestyle choices.' },
    { id: 9, src: h9, category: 'volunteers', title: 'Community Support Program', desc: 'Dedicated volunteers organizing local health outreach and registrations.' },
  ]

  const filteredGallery = galleryFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === galleryFilter)

  // ── 4. Testimonials Tab Switcher ──
  const [activeTestimonialTab, setActiveTestimonialTab] = useState(0)
  const testimonials = [
    {
      quote: "IRYAX Health made it possible for our village elders to get professional health consultations and vitals checkups without traveling miles. The digital record system keeps all our reports accessible!",
      name: "Rajesh Kumar",
      role: "Community Representative",
      location: "Secunderabad",
      avatar: "RK",
      bg: "from-blue-600 to-indigo-600",
      rating: 5
    },
    {
      quote: "Volunteering with IRYAX Health camps has been immensely rewarding. The platform's streamlined patient registration and live reporting tools make managing hundreds of patients smooth and efficient.",
      name: "Dr. Ananya Sharma",
      role: "Volunteering Cardiologist",
      location: "Hyderabad",
      avatar: "AS",
      bg: "from-emerald-600 to-teal-600",
      rating: 5
    },
    {
      quote: "As an NGO coordinator, finding a transparent and technology-driven healthcare partner was crucial. IRYAX Health seamlessly tracks health camp impact and connects us with top medical professionals.",
      name: "Meera Patel",
      role: "Healthcare NGO Director",
      location: "Telangana",
      avatar: "MP",
      bg: "from-purple-600 to-indigo-600",
      rating: 5
    }
  ]

  // ── 5. FAQ Accordion State ──
  const [openFaq, setOpenFaq] = useState(0)
  const faqs = [
    {
      q: "What is IRYAX Health and how does it work?",
      a: "IRYAX Health is an integrated healthcare management platform that organizes free health checkup camps, digitizes patient medical records, tracks BMI & vital statistics, and connects underserved communities with certified doctors and healthcare volunteers."
    },
    {
      q: "Are the health checkup camps free of charge?",
      a: "Yes! All health checkup camps organized under IRYAX Health initiatives are completely free for patients, including primary consultation, vitals recording (BP, BMI, Blood Sugar), and report generation."
    },
    {
      q: "How do I register as a Doctor or Volunteer?",
      a: "You can click on 'Become a Volunteer' or navigate to our Volunteer page. Simply fill in your medical credentials or volunteer interest, and our administration team will approve your account within 24 hours."
    },
    {
      q: "Is my personal health data kept safe and confidential?",
      a: "Absolutely. We follow stringent data privacy protocols and encryption standards to ensure that patient records, vital statistics, and medical diagnostic reports remain strictly confidential and accessible only to authorized healthcare personnel."
    },
    {
      q: "How can I access my past health reports?",
      a: "Once registered or examined at any IRYAX Health camp, patients receive a unique ID or can log in via their phone number to instantly view, download, and print their digital health reports anytime."
    }
  ]

  // ── 6. Newsletter Subscription State ──
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail) {
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSubscribed(false), 5000)
    }
  }

  const heroItem = (delay) => ({
    opacity:    heroReady ? 1 : 0,
    transform:  heroReady ? 'none' : 'translateY(28px)',
    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* ── 1. Glassmorphic Sticky Header / Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Brand Logo */}
            <Link to="/landing" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Heart className="h-6 w-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                  IRYAX<span className="text-indigo-600">.</span>Health
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Healthcare Platform</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#home" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">Home</a>
              <a href="#about" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">About</a>
              <a href="#services" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">Services</a>
              <a href="#metrics" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">Metrics</a>
              <a href="#gallery" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">Gallery</a>
              <a href="#faq" className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">FAQ</a>
            </div>

            {/* Header Right Action Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-slate-700 hover:text-indigo-600 font-semibold text-sm px-4 py-2 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 font-semibold text-sm shadow-md hover:shadow-indigo-200 transition duration-200 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-fade-in">
            <a 
              href="#home" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              About Us
            </a>
            <a 
              href="#services" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              Services
            </a>
            <a 
              href="#metrics" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              Health Metrics
            </a>
            <a 
              href="#gallery" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              Gallery
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 font-semibold hover:text-indigo-600 hover:bg-slate-50 transition"
            >
              FAQ
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link 
                to="/login" 
                className="w-full text-center py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold shadow-md transition"
              >
                Register Account
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── 2. Hero Section ── */}
      <section id="home" className="pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50/40 relative overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-[100px] animate-blob"></div>
          <div className="absolute top-1/3 right-5 w-96 h-96 bg-cyan-400/20 rounded-full filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-indigo-400/20 rounded-full filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Column (Content) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              {/* Trust Badge */}
              <div style={heroItem(0)} className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-indigo-100 shadow-sm px-4 py-2 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                  Empowering Community Health Across Telangana & Beyond
                </span>
              </div>

              {/* Main Headline */}
              <h1 style={heroItem(100)} className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Transforming Healthcare Access, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  One Patient at a Time
                </span>
              </h1>

              {/* Subtext */}
              <p style={heroItem(200)} className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                IRYAX Health provides a comprehensive digital platform to conduct mobile health camps, track live patient vitals, manage electronic health records, and deliver quality medical support directly to underserved communities.
              </p>

              {/* Action Buttons */}
              <div style={heroItem(300)} className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-bold text-base shadow-lg hover:shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#about" 
                  className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition duration-300 font-bold text-base shadow-sm flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  Explore Platform
                </a>
              </div>

              {/* Highlight Features Grid */}
              <div style={heroItem(400)} className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="bg-emerald-100 text-emerald-600 rounded-xl p-2"><Zap className="h-4 w-4" /></div>
                  <span className="text-xs sm:text-sm font-semibold">Real-time BMI Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="bg-blue-100 text-blue-600 rounded-xl p-2"><Stethoscope className="h-4 w-4" /></div>
                  <span className="text-xs sm:text-sm font-semibold">Mobile Health Camps</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="bg-cyan-100 text-cyan-600 rounded-xl p-2"><Shield className="h-4 w-4" /></div>
                  <span className="text-xs sm:text-sm font-semibold">Secure Digital Records</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="bg-indigo-100 text-indigo-600 rounded-xl p-2"><Users className="h-4 w-4" /></div>
                  <span className="text-xs sm:text-sm font-semibold">Certified Doctor Network</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column (Dual-Mode Interactive Health Tool Widget) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              
              {/* Backing glow gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-cyan-400/20 rounded-[2.5rem] transform rotate-2 blur-md"></div>
              
              {/* Floating Doctor Badge (Top Right) */}
              <div className="absolute -top-4 -right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 animate-float">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white">AS</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white">RK</div>
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white">MP</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-bold text-slate-800">Doctors Online</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">14 specialists ready</p>
                </div>
              </div>

              {/* Main Interactive Health Assessment Card */}
              <div style={heroItem(250)} className="relative z-10 bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2rem] p-6 sm:p-8">
                
                {/* Tool Selector Header Tabs */}
                <div className="flex items-center justify-between mb-6 bg-slate-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setActiveToolTab('bmi')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      activeToolTab === 'bmi' 
                        ? 'bg-white text-indigo-600 shadow-md' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    BMI Calculator
                  </button>
                  <button 
                    onClick={() => setActiveToolTab('bp')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      activeToolTab === 'bp' 
                        ? 'bg-white text-indigo-600 shadow-md' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    Blood Pressure
                  </button>
                </div>

                {/* ── TAB 1: BMI CALCULATOR ── */}
                {activeToolTab === 'bmi' && (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Weight Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-700">Body Weight</label>
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{bmiWeight} kg</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="140"
                        value={bmiWeight}
                        onChange={(e) => setBmiWeight(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Height Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-700">Height</label>
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{bmiHeight} cm</span>
                      </div>
                      <input
                        type="range"
                        min="110"
                        max="210"
                        value={bmiHeight}
                        onChange={(e) => setBmiHeight(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Result Output */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calculated BMI</p>
                          <p className="text-3xl font-black text-slate-900 mt-0.5">{bmiResult}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 border shadow-xs ${bmiBgColor}`}>
                            {bmiCategory}
                          </span>
                        </div>
                      </div>

                      {/* Visual Gauge */}
                      <div className="relative pt-2">
                        <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
                          <div className="w-[14%] bg-blue-400" title="Underweight (< 18.5)"></div>
                          <div className="w-[26%] bg-emerald-400" title="Normal (18.5 - 24.9)"></div>
                          <div className="w-[20%] bg-amber-400" title="Overweight (25 - 29.9)"></div>
                          <div className="w-[40%] bg-rose-400" title="Obese (≥ 30)"></div>
                        </div>
                        {/* Gauge Pointer */}
                        <div 
                          className="absolute top-1 transition-all duration-300 ease-out" 
                          style={{ left: `${bmiPercentage}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="w-0.5 h-4 bg-slate-900 mx-auto"></div>
                          <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-md border-2 border-white -mt-1"></div>
                        </div>
                      </div>

                      {/* Clinical Tip Box */}
                      <div className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed border transition-all duration-300 ${bmiBgColor}`}>
                        💡 {bmiTip}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: BLOOD PRESSURE EVALUATOR ── */}
                {activeToolTab === 'bp' && (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Systolic Control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-700">Systolic (Top Number)</label>
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{systolic} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="190"
                        value={systolic}
                        onChange={(e) => setSystolic(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Diastolic Control */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-700">Diastolic (Bottom Number)</label>
                        <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{diastolic} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="130"
                        value={diastolic}
                        onChange={(e) => setDiastolic(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* BP Output */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reading</p>
                          <p className="text-3xl font-black text-slate-900 mt-0.5">{systolic} / {diastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 border shadow-xs ${bpBgColor}`}>
                            {bpCategory}
                          </span>
                        </div>
                      </div>

                      {/* Clinical Advice Box */}
                      <div className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed border transition-all duration-300 ${bpBgColor}`}>
                        🩺 {bpAdvice}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Heart Vitals Card (Bottom Left) */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 hidden sm:flex items-center gap-4 animate-float">
                <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 text-rose-500">
                  <Heart className="h-6 w-6 fill-rose-500 animate-heartbeat" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Vitals</p>
                  <p className="text-lg font-black text-slate-900 flex items-baseline gap-1">
                    72 <span className="text-xs text-slate-400 font-bold">BPM</span>
                  </p>
                  <div className="w-24 h-4 overflow-hidden mt-0.5">
                    <svg viewBox="0 0 100 20" className="w-full h-full text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path 
                        d="M0,10 L30,10 L35,2 L40,18 L45,10 L50,10 L55,5 L60,15 L65,10 L100,10" 
                        className="animate-ecg"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Health Camp Card (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-100 hidden sm:block">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">Next Health Camp</span>
                </div>
                <h4 className="text-xs font-black text-slate-900">Hyderabad Mega Camp</h4>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Accepting Volunteers
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Impact Statistics Counter Section ── */}
      <section className="py-16 bg-white border-y border-slate-200/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '5,000+', label: 'Patients Treated', sub: 'Across 12 Districts', icon: <Users className="h-6 w-6 text-blue-600" /> },
              { value: '200+',   label: 'Health Camps',    sub: 'Free Medical Drives', icon: <Calendar className="h-6 w-6 text-indigo-600" /> },
              { value: '150+',   label: 'Volunteers & Doctors', sub: 'Certified Specialists', icon: <Stethoscope className="h-6 w-6 text-cyan-600" /> },
              { value: '50+',    label: 'Partner Clinics', sub: 'Hospitals & NGOs', icon: <Award className="h-6 w-6 text-emerald-600" /> },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100} direction="up">
                <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/70 hover:border-indigo-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-bold bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-900">{stat.label}</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. About Us & Core Mission Section ── */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">About IRYAX Health</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Bridging Healthcare Gaps with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Technology & Compassion</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mt-4 font-normal leading-relaxed">
                We combine digital record management with community health outreach to empower doctors, volunteers, and patients with instant health insights and continuous care.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Mission & Vision Cards */}
            <div className="space-y-6">
              <FadeIn direction="left" delay={0}>
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 border-l-8 border-l-blue-600">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-600 rounded-2xl p-3">
                      <Target className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        To bring accessible, affordable, and high-quality preventive healthcare services to underserved communities through health camps, digitized medical records, and expert medical networks.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={150}>
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 border-l-8 border-l-indigo-600">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 text-indigo-600 rounded-2xl p-3">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        A world where geographic location or socioeconomic standing never stands in the way of essential health monitoring and medical assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={300}>
                <Link 
                  to="/our-volunteers" 
                  className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700 text-sm group pt-2"
                >
                  <span>Meet Our Healthcare Volunteers</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeIn>
            </div>

            {/* Right Column: Values Graphic Grid */}
            <FadeIn direction="right" delay={100}>
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <h3 className="text-2xl font-black mb-6">Why Work With IRYAX Health?</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: 'Compassionate Care', desc: 'Patient-first healthcare delivery' },
                    { title: 'Data Privacy',        desc: 'Encrypted patient health records' },
                    { title: 'Expert Team', desc: 'Verified doctors & specialists' },
                    { title: 'Community Focus', desc: 'Direct impact at grassroots level' },
                  ].map((item) => (
                    <div key={item.title} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/20 transition duration-200">
                      <CheckCircle className="h-6 w-6 text-cyan-300 mb-2" />
                      <h4 className="font-bold text-base mb-1">{item.title}</h4>
                      <p className="text-xs text-white/80 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── 5. Platform Services & Solutions ── */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Comprehensive Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Our Core <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Healthcare Services</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mt-4 font-normal">
                Everything required to conduct, manage, and monitor health checkup programs seamlessly.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Stethoscope className="h-7 w-7 text-white" />,
                title: 'Mobile Health Camps',
                desc: 'Organizing structured health screening camps in rural & urban centers with qualified medical staff.',
                bullets: ['Vitals checkups', 'Doctor consultations', 'On-site triage'],
                link: '/user-camps',
                cta: 'View Health Camps'
              },
              {
                icon: <Activity className="h-7 w-7 text-white" />,
                title: 'Digital Health Records',
                desc: 'Centralized health profile management to track patient history, BP metrics, and BMI trends over time.',
                bullets: ['PDF report export', 'Real-time charts', 'Secure database'],
                link: '/dashboard',
                cta: 'Access Portal'
              },
              {
                icon: <Users className="h-7 w-7 text-white" />,
                title: 'Volunteer Network',
                desc: 'Empowering doctors, nurses, and youth volunteers to register and participate in community service.',
                bullets: ['Easy onboarding', 'Camp assignment', 'Certificate of service'],
                link: '/our-volunteers',
                cta: 'Join Volunteer Team'
              },
              {
                icon: <Calendar className="h-7 w-7 text-white" />,
                title: 'Awareness Programs',
                desc: 'Interactive health workshops focused on preventive hygiene, nutrition, and early disease detection.',
                bullets: ['Dietary guidance', 'Hygiene kits', 'Community outreach'],
                link: '/partners',
                cta: 'Explore Programs'
              },
              {
                icon: <Globe className="h-7 w-7 text-white" />,
                title: 'Institutional Partnerships',
                desc: 'Partnering with corporate CSRs, hospitals, and NGOs to expand medical coverage and resources.',
                bullets: ['CSR alignment', 'Resource sharing', 'Impact analytics'],
                link: '/partners',
                cta: 'Partner With Us'
              },
              {
                icon: <Heart className="h-7 w-7 text-white" />,
                title: 'Patient Diagnostic Support',
                desc: 'End-to-end patient profile management, patient registration, and continuous health monitoring.',
                bullets: ['Quick registration', 'Follow-up alerts', 'Doctor referrals'],
                link: '/add-patient',
                cta: 'Register Patient'
              },
            ].map((svc, i) => (
              <FadeIn key={svc.title} delay={i * 80} direction="up">
                <div className="group bg-slate-50/80 hover:bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform mb-6">
                      {svc.icon}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{svc.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">{svc.desc}</p>
                    
                    <ul className="space-y-2 mb-8 border-t border-slate-200/60 pt-4">
                      {svc.bullets.map((b) => (
                        <li key={b} className="flex items-center text-xs font-semibold text-slate-700 gap-2">
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    to={svc.link} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:gap-3 transition-all"
                  >
                    <span>{svc.cta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Interactive Health Reference & Standards Section ── */}
      <section id="metrics" className="py-24 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-4">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Medical Benchmarks</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Understanding Key <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Health Metrics</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mt-4 font-normal">
                Standard reference ranges recommended by the World Health Organization for vital monitoring.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* BMI Standards Card */}
            <FadeIn direction="left">
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Activity className="h-6 w-6 text-indigo-600" />
                    BMI Categories (WHO)
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Adult Standard</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border-l-4 border-blue-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Underweight</p>
                      <p className="text-xs text-slate-500">BMI &lt; 18.5</p>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Low Range</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50/80 rounded-2xl border-l-4 border-emerald-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Normal Weight</p>
                      <p className="text-xs text-slate-500">BMI 18.5 – 24.9</p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Optimal Range</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50/80 rounded-2xl border-l-4 border-amber-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Overweight</p>
                      <p className="text-xs text-slate-500">BMI 25.0 – 29.9</p>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Moderate Risk</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50/80 rounded-2xl border-l-4 border-rose-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Obese Class</p>
                      <p className="text-xs text-slate-500">BMI ≥ 30.0</p>
                    </div>
                    <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full">High Clinical Risk</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Blood Pressure Standards Card */}
            <FadeIn direction="right">
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Heart className="h-6 w-6 text-rose-500" />
                    Blood Pressure Categories
                  </h3>
                  <span className="text-xs font-bold text-slate-400">AHA Guidelines</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50/80 rounded-2xl border-l-4 border-emerald-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Normal</p>
                      <p className="text-xs text-slate-500">Systolic &lt; 120 AND Diastolic &lt; 80</p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">✓ Healthy</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border-l-4 border-blue-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Elevated</p>
                      <p className="text-xs text-slate-500">Systolic 120–129 AND Diastolic &lt; 80</p>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">⚠ Caution</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50/80 rounded-2xl border-l-4 border-amber-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Stage 1 Hypertension</p>
                      <p className="text-xs text-slate-500">Systolic 130–139 OR Diastolic 80–89</p>
                    </div>
                    <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">⚠ Stage 1</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50/80 rounded-2xl border-l-4 border-rose-500">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Stage 2 Hypertension</p>
                      <p className="text-xs text-slate-500">Systolic ≥ 140 OR Diastolic ≥ 90</p>
                    </div>
                    <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full">✗ Action Needed</span>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Aggregate Community Health Breakdown Banner */}
          <FadeIn direction="up">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="text-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-black mb-3">Aggregate Camp Health Statistics</h3>
                <p className="text-slate-300 text-sm max-w-2xl mx-auto">
                  Consolidated health outcomes compiled across 5,000+ patient examinations in IRYAX Health camps.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { pct: '68%', label: 'Normal Weight', color: 'bg-emerald-400', w: 'w-[68%]' },
                  { pct: '21%', label: 'Overweight', color: 'bg-amber-400', w: 'w-[21%]' },
                  { pct: '8%',  label: 'Obese', color: 'bg-rose-400', w: 'w-[8%]' },
                  { pct: '3%',  label: 'Underweight', color: 'bg-blue-400', w: 'w-[3%]' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/10">
                    <div className="text-3xl font-black text-white mb-1">{s.pct}</div>
                    <div className="text-xs text-slate-300 font-semibold mb-3">{s.label}</div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} ${s.w}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ── 7. Filterable Impact Gallery Section ── */}
      <section id="gallery" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-4">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Our Gallery</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Impact in <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mt-4 font-normal">
                Real moments captured during health camps, volunteer drives, and patient care initiatives.
              </p>
            </div>
          </FadeIn>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'camps', label: 'Health Camps' },
              { id: 'care', label: 'Patient Care' },
              { id: 'awareness', label: 'Awareness Drives' },
              { id: 'volunteers', label: 'Volunteers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGalleryFilter(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  galleryFilter === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Gallery Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGallery.map((img, i) => (
              <FadeIn key={img.id} delay={i * 60} direction="up">
                <div 
                  onClick={() => setActiveLightboxImg(img)}
                  className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-slate-100"
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 mb-1">{img.category}</span>
                    <h4 className="font-bold text-lg leading-tight mb-1">{img.title}</h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">{img.desc}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Click to expand</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition"
            >
              <X size={20} />
            </button>
            <img 
              src={activeLightboxImg.src} 
              alt={activeLightboxImg.title} 
              className="w-full max-h-[60vh] object-cover"
            />
            <div className="p-6 bg-white">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{activeLightboxImg.category}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-3 mb-2">{activeLightboxImg.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{activeLightboxImg.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Testimonials & Field Experience ── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-4">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Testimonials</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Stories from the <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Ground</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mt-4 font-normal">
                Hear how IRYAX Health is positively impacting patients, healthcare providers, and partner organizations.
              </p>
            </div>
          </FadeIn>

          {/* Testimonial Active Display */}
          <FadeIn direction="up">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-xl border border-slate-200/80 transition-all duration-300 max-w-4xl mx-auto">
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                {[...Array(testimonials[activeTestimonialTab].rating)].map((_, idx) => (
                  <Star key={idx} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>

              <blockquote className="text-lg sm:text-xl font-medium text-slate-800 italic leading-relaxed mb-8">
                "{testimonials[activeTestimonialTab].quote}"
              </blockquote>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${testimonials[activeTestimonialTab].bg} text-white font-black flex items-center justify-center text-sm shadow-md`}>
                    {testimonials[activeTestimonialTab].avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{testimonials[activeTestimonialTab].name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{testimonials[activeTestimonialTab].role} • {testimonials[activeTestimonialTab].location}</p>
                  </div>
                </div>

                {/* Tab Switcher Buttons */}
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonialTab(i)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        activeTestimonialTab === i ? 'w-8 bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ── 9. Frequently Asked Questions Accordion ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Got Questions?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Frequently Asked <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Questions</span>
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 60} direction="up">
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-base sm:text-lg focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-300 flex-shrink-0 ${openFaq === i ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-200/40 animate-fade-in font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>

      {/* ── 10. Call-to-Action & Newsletter ── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold tracking-wide">Join Our Health Movement</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight leading-tight">
              Ready to Make a Real Impact in Community Healthcare?
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Whether you are a patient looking for care, a doctor willing to volunteer, or an organization wanting to partner, we welcome you to IRYAX Health.
            </p>
          </FadeIn>

          {/* Action Buttons */}
          <FadeIn direction="up" delay={150}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/register" 
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl hover:bg-slate-100 font-bold text-base shadow-xl transition transform hover:-translate-y-0.5"
              >
                Register as Patient / Doctor
              </Link>
              <Link 
                to="/our-volunteers" 
                className="border-2 border-white/80 text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-indigo-600 font-bold text-base transition transform hover:-translate-y-0.5"
              >
                Become a Volunteer
              </Link>
            </div>
          </FadeIn>

          {/* Newsletter Input Box */}
          <FadeIn direction="up" delay={250}>
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
              {newsletterSubscribed ? (
                <div className="py-3 px-4 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Thank you! You are subscribed to health camp updates.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for camp alerts..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-white/20 text-white placeholder-white/70 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:bg-white/30 text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-white text-indigo-600 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <span>Subscribe</span>
                    <Mail className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ── 11. Enterprise Multi-Column Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Col 1: Brand Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Heart className="h-5 w-5 fill-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">IRYAX Health</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                Connecting communities with accessible healthcare services, health camp management, and digital vitals tracking.
              </p>
              <div className="flex space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer">
                  <Users className="h-4 w-4" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Navigation</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#home" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Home</a></li>
                <li><a href="#about" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> About Us</a></li>
                <li><a href="#services" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Our Services</a></li>
                <li><a href="#metrics" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Health Metrics</a></li>
                <li><a href="#gallery" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Photo Gallery</a></li>
                <li><a href="#faq" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> FAQ</a></li>
              </ul>
            </div>

            {/* Col 3: Portal Services */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Portal Modules</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/user-camps" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Active Health Camps</Link></li>
                <li><Link to="/dashboard" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Patient Health Records</Link></li>
                <li><Link to="/our-volunteers" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Volunteer Network</Link></li>
                <li><Link to="/partners" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Medical Partners</Link></li>
                <li><Link to="/add-patient" className="hover:text-indigo-400 transition flex items-center gap-1.5"><ArrowRight className="h-3.5 w-3.5 text-slate-600" /> Register New Patient</Link></li>
              </ul>
            </div>

            {/* Col 4: Direct Contact */}
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Contact Info</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-slate-500 font-semibold">Email</p>
                    <p className="text-white font-medium">sk@iryax.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-slate-500 font-semibold">Phone</p>
                    <p className="text-white font-medium">+91 9010481048</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-slate-500 font-semibold">Location</p>
                    <p className="text-white font-medium">Hyderabad, Telangana, India</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} IRYAX Health. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition">Security & HIPAA</a>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Back-To-Top Control */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-indigo-300 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

    </div>
  )
}

export default LandingPage