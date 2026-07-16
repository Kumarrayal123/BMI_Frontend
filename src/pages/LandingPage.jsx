import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Menu, X, Activity, Users, Stethoscope, Calendar, Award, ChevronRight, ArrowRight, Sparkles, Target, Zap, Globe, Shield, TrendingUp } from 'lucide-react'
import h1 from '../assets/img1.jpg'
import h2 from '../assets/img2.jpg'
import h3 from '../assets/img3.jpg'
import h4 from "../assets/img4.jpg"
import h5 from "../assets/img5.jpg"
import h6 from "../assets/img6.jpg"

/* ─── Fade-in hook (scroll-triggered via IntersectionObserver) ─────── */
function useFadeIn(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
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
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────────── */
function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Hero items animate on mount (no scroll needed — they're above the fold)
  const [heroReady, setHeroReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t) }, [])

  // BMI Interactive Calculator States
  const [bmiWeight, setBmiWeight] = useState(70) // kg
  const [bmiHeight, setBmiHeight] = useState(170) // cm
  const [bmiResult, setBmiResult] = useState(24.2)
  const [bmiCategory, setBmiCategory] = useState('Normal Weight')
  const [bmiColor, setBmiColor] = useState('text-emerald-600')
  const [bmiBgColor, setBmiBgColor] = useState('bg-emerald-50/60 border-emerald-100')
  const [bmiTip, setBmiTip] = useState('Great job! Keep maintaining a balanced diet and regular physical activity.')

  // Calculate automatically when height/weight changes
  useEffect(() => {
    if (bmiHeight > 0 && bmiWeight > 0) {
      const heightInMeters = bmiHeight / 100
      const bmiVal = parseFloat((bmiWeight / (heightInMeters * heightInMeters)).toFixed(1))
      setBmiResult(bmiVal)

      if (bmiVal < 18.5) {
        setBmiCategory('Underweight')
        setBmiColor('text-blue-600')
        setBmiBgColor('bg-blue-50/60 border-blue-100')
        setBmiTip('Consider consulting a nutritionist to help create a healthy weight gain plan.')
      } else if (bmiVal >= 18.5 && bmiVal < 25) {
        setBmiCategory('Normal Weight')
        setBmiColor('text-emerald-600')
        setBmiBgColor('bg-emerald-50/60 border-emerald-100')
        setBmiTip('Great job! Keep maintaining a balanced diet and regular physical activity.')
      } else if (bmiVal >= 25 && bmiVal < 30) {
        setBmiCategory('Overweight')
        setBmiColor('text-amber-600')
        setBmiBgColor('bg-amber-50/60 border-amber-100')
        setBmiTip('A combination of active living and balanced nutrition can help manage weight.')
      } else {
        setBmiCategory('Obese')
        setBmiColor('text-rose-600')
        setBmiBgColor('bg-rose-50/60 border-rose-100')
        setBmiTip('We suggest speaking with a healthcare professional to guide you safely.')
      }
    }
  }, [bmiWeight, bmiHeight])

  const heroItem = (delay) => ({
    opacity:    heroReady ? 1 : 0,
    transform:  heroReady ? 'none' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  })

  // Gauge calculation: map BMI value to progress percentage
  // Normal BMI is 18.5 to 25. Let's map from 15 to 40
  const bmiPercentage = Math.min(Math.max(((bmiResult - 15) / (40 - 15)) * 100, 0), 100)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/landing" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-800">IRYAX Health</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home"       className="text-gray-700 hover:text-indigo-600 transition font-medium">Home</a>
              <a href="#about"      className="text-gray-700 hover:text-indigo-600 transition font-medium">About</a>
              <a href="#gallery"    className="text-gray-700 hover:text-indigo-600 transition font-medium">Gallery</a>
              <a href="#what-we-do" className="text-gray-700 hover:text-indigo-600 transition font-medium">What We Do</a>
              <Link to="/" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-sm hover:shadow-md hover:shadow-indigo-100">
                Login
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#home"       className="block text-gray-700 hover:text-indigo-600 py-2">Home</a>
              <a href="#about"      className="block text-gray-700 hover:text-indigo-600 py-2">About</a>
              <a href="#gallery"    className="block text-gray-700 hover:text-indigo-600 py-2">Gallery</a>
              <a href="#what-we-do" className="block text-gray-700 hover:text-indigo-600 py-2">What We Do</a>
              <Link to="/" className="block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-center hover:from-blue-700 hover:to-indigo-700 transition">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section id="home" className="pt-16 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50/50 relative overflow-hidden">
        {/* Animated Background Mesh Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 left-10 w-72 h-72 md:w-96 md:h-96 bg-blue-400/25 rounded-full filter blur-[80px] animate-blob"></div>
          <div className="absolute top-1/3 right-10 w-72 h-72 md:w-96 md:h-96 bg-cyan-400/20 rounded-full filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-indigo-400/20 rounded-full filter blur-[80px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16 md:pt-4 md:pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (Hero Content) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Heading */}
              <h1 style={heroItem(0)} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Empowering Healthy Lives, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  One Patient at a Time
                </span>
              </h1>

              {/* Subtext */}
              <p style={heroItem(100)} className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                IRYAX Health provides a comprehensive digital platform to conduct healthcare camps, track vital patient statistics, manage digital medical records, and make medical assistance accessible to underserved areas.
              </p>

              {/* Call-to-actions */}
              <div style={heroItem(200)} className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-full hover:from-blue-700 hover:to-indigo-700 transition duration-300 font-semibold text-base shadow-lg hover:shadow-xl hover:shadow-indigo-100 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#about" className="border-2 border-gray-200 text-gray-700 px-8 py-3.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition duration-300 font-semibold text-base flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  Learn More
                </a>
              </div>

              {/* Feature Points */}
              <div style={heroItem(300)} className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200/60">
                <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                  <div className="bg-emerald-100 text-emerald-600 rounded-full p-1.5"><Zap className="h-4 w-4" /></div>
                  <span className="text-sm">Real-time BMI Analysis</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-1.5"><Stethoscope className="h-4 w-4" /></div>
                  <span className="text-sm">Mobile Health Camps</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                  <div className="bg-cyan-100 text-cyan-600 rounded-full p-1.5"><Shield className="h-4 w-4" /></div>
                  <span className="text-sm">Secure Health Records</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600 font-medium">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full p-1.5"><Users className="h-4 w-4" /></div>
                  <span className="text-sm">Medical Professionals Network</span>
                </div>
              </div>
            </div>

            {/* Right Column (Interactive Glassmorphic Mockup) */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              {/* Backing decorative element */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-[2.5rem] transform rotate-3 blur-sm"></div>
              
              {/* Floating Doctors Badge (Top Right) */}
              <div className="absolute -top-2 -right-4 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-100 flex items-center gap-3 animate-pulse-slow">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs border-2 border-white">AS</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs border-2 border-white">RK</div>
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center text-xs border-2 border-white">MP</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-semibold text-gray-800">Doctors Online</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">12 active now</p>
                </div>
              </div>

              {/* Main Interactive BMI Widget */}
              <div style={heroItem(250)} className="relative z-10 bg-white/80 backdrop-blur-lg border border-white/60 shadow-xl rounded-[2rem] p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600 animate-pulse-fast" />
                    BMI Quick Calculator
                  </h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full border border-indigo-100">Live Demo</span>
                </div>

                <div className="space-y-5">
                  {/* Weight Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-semibold text-gray-700">Weight</label>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{bmiWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="150"
                      value={bmiWeight}
                      onChange={(e) => setBmiWeight(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Height Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-semibold text-gray-700">Height</label>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{bmiHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="220"
                      value={bmiHeight}
                      onChange={(e) => setBmiHeight(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* BMI Score & Status Gauge */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your BMI Score</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-1">{bmiResult}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1.5 border ${bmiBgColor} ${bmiColor}`}>
                          {bmiCategory}
                        </span>
                      </div>
                    </div>

                    {/* Progress Gauge */}
                    <div className="relative pt-2">
                      <div className="h-2.5 w-full bg-gray-100 rounded-full flex overflow-hidden">
                        <div className="w-[14%] bg-blue-400" title="Underweight"></div>
                        <div className="w-[26%] bg-emerald-400" title="Normal"></div>
                        <div className="w-[20%] bg-amber-400" title="Overweight"></div>
                        <div className="w-[40%] bg-rose-400" title="Obese"></div>
                      </div>
                      {/* Indicator Arrow */}
                      <div 
                        className="absolute top-1.5 transition-all duration-300 ease-out" 
                        style={{ left: `${bmiPercentage}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="w-0.5 h-3.5 bg-gray-900 mx-auto"></div>
                        <div className="w-2.5 h-2.5 bg-gray-900 rounded-full shadow border-2 border-white -mt-0.5"></div>
                      </div>
                    </div>

                    {/* Recommendation Card */}
                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed text-gray-600 transition-all duration-300 ${bmiBgColor}`}>
                      {bmiTip}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Heart Vitals Card (Bottom Left) */}
              <div className="absolute -bottom-8 -left-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-100 hidden sm:flex items-center gap-4.5 animate-pulse-slow">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100/50 animate-heartbeat text-rose-500">
                  <Heart className="h-6 w-6 fill-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Live Vitals</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-0.5 flex items-baseline gap-1">
                    72 <span className="text-xs text-gray-500 font-bold">BPM</span>
                  </p>
                  <div className="w-24 h-5 mt-1 overflow-hidden">
                    <svg viewBox="0 0 100 20" className="w-full h-full text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path 
                        d="M0,10 L30,10 L35,2 L40,18 L45,10 L50,10 L55,5 L60,15 L65,10 L100,10" 
                        strokeDasharray="120"
                        strokeDashoffset="0"
                        className="animate-pulse-ring"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Health Camp Info (Bottom Right) */}
              <div className="absolute -bottom-6 -right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-gray-100 hidden sm:block">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-800">Active Health Camp</span>
                </div>
                <h4 className="text-sm font-extrabold text-gray-900 leading-tight">Hyderabad Camp</h4>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Happening Now
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '5000+', label: 'Patients Helped' },
              { value: '200+',  label: 'Health Camps'    },
              { value: '150+',  label: 'Volunteers'      },
              { value: '50+',   label: 'Partner Organizations' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100} direction="up">
                <div className="text-center group">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">About Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Transforming Healthcare <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Access</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We are dedicated to bridging the gap in healthcare accessibility through innovative solutions and community-driven initiatives.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <FadeIn direction="left" delay={0}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-3 text-white">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                      <p className="text-gray-600 leading-relaxed">
                        To provide quality healthcare services to underserved communities through health camps,
                        digital health records, and partnerships with healthcare professionals and organizations.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={150}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-cyan-50 rounded-xl p-3 text-white">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                      <p className="text-gray-600 leading-relaxed">
                        A world where everyone has access to essential healthcare services regardless of their
                        socioeconomic status or geographic location.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" delay={300}>
                <Link to="/our-volunteers" className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition group">
                  <span className="border-b-2 border-indigo-200 group-hover:border-indigo-500 transition-colors">Meet Our Team</span>
                  <ArrowRight className="h-5 w-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </FadeIn>
            </div>

            <FadeIn direction="right" delay={100}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl transform rotate-3 opacity-10"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: <Heart className="h-10 w-10 mb-3" />,       title: 'Compassionate Care', desc: 'Patient-first approach'   },
                      { icon: <Users className="h-10 w-10 mb-3" />,       title: 'Community Focus',    desc: 'Local engagement'         },
                      { icon: <Stethoscope className="h-10 w-10 mb-3" />, title: 'Expert Team',        desc: 'Qualified professionals'  },
                      { icon: <Award className="h-10 w-10 mb-3" />,       title: 'Trusted Service',    desc: 'Proven track record'      },
                    ].map((card) => (
                      <div key={card.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                        {card.icon}
                        <h4 className="font-bold text-lg mb-1">{card.title}</h4>
                        <p className="text-white/80 text-sm">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Gallery Section ── */}
      <section id="gallery" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">Our Gallery</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Impact in <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A glimpse into our health camps, community events, and the impact we're making together.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { src: h1, alt: 'Health Camps'       },
              { src: h2, alt: 'Community Events'   },
              { src: h3, alt: 'Medical Services'   },
              { src: h4, alt: 'Awareness Programs' },
              { src: h5, alt: 'Achievements'       },
              { src: h6, alt: 'Patient Care'       },
            ].map((img, i) => (
              <FadeIn key={img.alt} delay={i * 80} direction="up">
                <div className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Do Section ── */}
      <section id="what-we-do" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">What We Do</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Our <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Services</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive approach to healthcare delivery ensures that communities receive the support they need.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Stethoscope className="h-8 w-8 text-white" />, title: 'Health Camps',       desc: 'Organizing free health checkup camps in underserved areas with volunteer doctors and healthcare professionals.',       link: '/user-camps',      cta: 'View Camps'        },
              { icon: <Activity      className="h-8 w-8 text-white" />, title: 'Health Records',     desc: 'Digital health record management system to track patient history and provide continuous care.',                      link: '/dashboard',       cta: 'Access Records'    },
              { icon: <Users         className="h-8 w-8 text-white" />, title: 'Volunteer Network', desc: 'Building a network of dedicated volunteers and healthcare professionals to serve communities.',                       link: '/our-volunteers',  cta: 'Join Us'           },
              { icon: <Calendar      className="h-8 w-8 text-white" />, title: 'Awareness Programs',desc: 'Educational programs on health awareness, disease prevention, and healthy lifestyle practices.',                     link: '/partners',        cta: 'Our Partners'      },
              { icon: <Globe         className="h-8 w-8 text-white" />, title: 'Partnerships',      desc: 'Collaborating with hospitals, NGOs, and corporate organizations to maximize our impact.',                          link: '/partners',        cta: 'Partner With Us'   },
              { icon: <Heart         className="h-8 w-8 text-white" />, title: 'Patient Support',   desc: 'Comprehensive patient support services including follow-up care and medication assistance.',                         link: '/add-patient',     cta: 'Register Patient'  },
            ].map((svc, i) => (
              <FadeIn key={svc.title} delay={i * 80} direction="up">
                <div className="group bg-gradient-to-br from-white to-blue-50/40 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-150 h-full">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {svc.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{svc.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">{svc.desc}</p>
                  <Link to={svc.link} className="inline-flex items-center gap-2 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:gap-3 transition-all">
                    {svc.cta} <ArrowRight className="h-5 w-5 text-indigo-600" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Health Metrics Section ── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <FadeIn direction="up">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">Health Metrics</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Understanding Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Health</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Monitor your health with our comprehensive BMI calculator and health tracking system.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* BMI Chart */}
            <FadeIn direction="left">
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Activity className="h-8 w-8 text-indigo-650" />
                  BMI Reference Chart
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <div><p className="font-bold text-gray-900">Underweight</p><p className="text-sm text-gray-600">BMI &lt; 18.5</p></div>
                    <div className="w-24 h-3 bg-blue-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-1/4"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <div><p className="font-bold text-gray-900">Normal Weight</p><p className="text-sm text-gray-600">BMI 18.5 - 24.9</p></div>
                    <div className="w-24 h-3 bg-green-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-1/2"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                    <div><p className="font-bold text-gray-900">Overweight</p><p className="text-sm text-gray-600">BMI 25 - 29.9</p></div>
                    <div className="w-24 h-3 bg-yellow-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-3/4"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                    <div><p className="font-bold text-gray-900">Obesity</p><p className="text-sm text-gray-600">BMI ≥ 30</p></div>
                    <div className="w-24 h-3 bg-red-200 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-full"></div></div>
                  </div>
                </div>
                <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-md hover:shadow-lg hover:shadow-indigo-100">
                  Calculate Your BMI <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>

            {/* Blood Pressure */}
            <FadeIn direction="right">
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Heart className="h-8 w-8 text-rose-500" />
                  Blood Pressure Categories
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <div><p className="font-bold text-gray-900">Normal</p><p className="text-sm text-gray-600">&lt; 120/80 mmHg</p></div>
                    <div className="text-green-600 font-bold">✓ Healthy</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                    <div><p className="font-bold text-gray-900">Elevated</p><p className="text-sm text-gray-600">120-129 / &lt; 80 mmHg</p></div>
                    <div className="text-yellow-600 font-bold">⚠ Warning</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                    <div><p className="font-bold text-gray-900">High BP Stage 1</p><p className="text-sm text-gray-600">130-139 / 80-89 mmHg</p></div>
                    <div className="text-orange-600 font-bold">⚠ Alert</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                    <div><p className="font-bold text-gray-900">High BP Stage 2</p><p className="text-sm text-gray-600">≥ 140 / ≥ 90 mmHg</p></div>
                    <div className="text-red-600 font-bold">✗ Critical</div>
                  </div>
                </div>
                <Link to="/add-patient" className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-650 text-white px-6 py-3 rounded-full hover:from-rose-600 hover:to-red-705 transition font-semibold shadow-md hover:shadow-lg hover:shadow-red-100">
                  Check Your BP <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Health Stats Overview */}
          <FadeIn direction="up">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold mb-4">Community Health Overview</h3>
                <p className="text-white/80 max-w-2xl mx-auto">
                  Real-time health metrics from our community health camps and patient records
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { pct: '68%', label: 'Normal BMI',   color: 'bg-green-400',  w: 'w-[68%]' },
                  { pct: '22%', label: 'Overweight',   color: 'bg-yellow-400', w: 'w-[22%]' },
                  { pct: '8%',  label: 'Obesity',      color: 'bg-red-400',    w: 'w-[8%]'  },
                  { pct: '2%',  label: 'Underweight',  color: 'bg-blue-400',   w: 'w-[2%]'  },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <div className="text-4xl font-bold mb-2">{s.pct}</div>
                    <div className="text-white/80 text-sm">{s.label}</div>
                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} ${s.w}`}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3"><Shield className="h-6 w-6 text-green-300" /><span className="font-semibold">Blood Pressure Control</span></div>
                  <div className="text-3xl font-bold mb-2">74%</div>
                  <div className="text-white/70 text-sm">Patients with normal BP</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3"><TrendingUp className="h-6 w-6 text-blue-300" /><span className="font-semibold">Health Improvement</span></div>
                  <div className="text-3xl font-bold mb-2">+15%</div>
                  <div className="text-white/70 text-sm">Since last quarter</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3"><Users className="h-6 w-6 text-purple-300" /><span className="font-semibold">Active Monitoring</span></div>
                  <div className="text-3xl font-bold mb-2">3,200+</div>
                  <div className="text-white/70 text-sm">Regular checkups</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn direction="up" delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-white font-semibold">Join Our Mission</span>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={100}>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-pulse-slow">Ready to Make a Difference?</h2>
          </FadeIn>
          <FadeIn direction="up" delay={200}>
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join our community of healthcare professionals, volunteers, and partners dedicated to improving lives and creating healthier communities.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-full hover:bg-gray-50 transition font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Register Now
              </Link>
              <Link to="/our-volunteers" className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-indigo-600 transition font-semibold text-lg backdrop-blur-sm transform hover:-translate-y-1">
                Become a Volunteer
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <FadeIn direction="up" delay={0}>
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Heart className="h-10 w-10 text-blue-500" />
                  <span className="text-2xl font-bold">IRYAX Health</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Making healthcare accessible to everyone, everywhere. Join us in our mission to transform lives through compassionate care.
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition cursor-pointer"><Users className="h-5 w-5" /></div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition cursor-pointer"><Globe className="h-5 w-5" /></div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition cursor-pointer"><Shield className="h-5 w-5" /></div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={80}>
              <div>
                <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                <ul className="space-y-3">
                  <li><a href="#home"       className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Home</a></li>
                  <li><a href="#about"      className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> About</a></li>
                  <li><a href="#gallery"    className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Gallery</a></li>
                  <li><a href="#what-we-do" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> What We Do</a></li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={160}>
              <div>
                <h4 className="font-bold text-lg mb-6">Services</h4>
                <ul className="space-y-3">
                  <li><Link to="/user-camps"     className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Health Camps</Link></li>
                  <li><Link to="/dashboard"      className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Health Records</Link></li>
                  <li><Link to="/our-volunteers" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Volunteers</Link></li>
                  <li><Link to="/partners"       className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Partners</Link></li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={240}>
              <div>
                <h4 className="font-bold text-lg mb-6">Contact</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full p-2 mt-1"><Globe className="h-4 w-4" /></div>
                    <div><p className="text-gray-400 text-sm">Email</p><p className="text-white">sk@iryax.com</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full p-2 mt-1"><Shield className="h-4 w-4" /></div>
                    <div><p className="text-gray-400 text-sm">Phone</p><p className="text-white">+91 9010481048</p></div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full p-2 mt-1"><TrendingUp className="h-4 w-4" /></div>
                    <div><p className="text-gray-400 text-sm">Address</p><p className="text-white">Hyderabad, Telangana</p></div>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center md:text-left">&copy; 2024 IRYAX Health. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage