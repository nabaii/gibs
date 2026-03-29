import { useState, useEffect, useRef } from 'react'
import Presentation from './Presentation'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const FUEL_PRICE    = 897   // ₦ per litre (PMS)
const FUEL_CAR_L100 = 12    // litres / 100 km (typical Nigerian SUV)
const HYBRID_L100   = 4.2   // litres / 100 km (VANTA Aero)
const ROAD_FACTOR   = 1.3   // straight-line → estimated road distance

// ─── UTILS ───────────────────────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function nominatimGeocode(address) {
  const h = { 'Accept-Language': 'en' }
  const q = encodeURIComponent(address)
  let data = await (
    await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ng`,
      { headers: h }
    )
  ).json()
  if (!data.length) {
    data = await (
      await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: h }
      )
    ).json()
  }
  if (!data.length) throw new Error(`Could not find "${address}"`)
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

const naira = n => '₦' + Math.round(n).toLocaleString('en-NG')

// ─── ICONS ───────────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--indigo-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const WrenchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--indigo-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
)
const PhoneCallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--indigo-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.42 2 2 0 0 1 3.55 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 5.55 5.55l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
  </svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="22" height="22">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="22" height="22">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const LocateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
  </svg>
)

// ─── SLIDESHOW DATA ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    tag: '01 / Design',
    sub: 'Aerodynamics',
    title: 'Sculpted for Silence',
    desc: "Every curve is deliberate. The Aero's aerodynamic profile reduces drag by 38%, contributing to both performance and efficiency without sacrificing elegance.",
    accent: 'var(--coral)',
  },
  {
    tag: '02 / Efficiency',
    sub: 'Fuel Economy',
    title: '4.2L per 100km',
    desc: "Nigeria's most fuel-efficient luxury SUV. Drive Lagos to Ibadan and back on a single tank — and still have range to spare.",
    accent: 'var(--indigo-light)',
  },
  {
    tag: '03 / Power',
    sub: 'Performance',
    title: '0 – 100 in 6.4s',
    desc: 'Combined petrol-electric output of 320hp delivers instant torque and exhilarating acceleration. The road is unequivocally yours.',
    accent: 'var(--coral)',
  },
  {
    tag: '04 / Safety',
    sub: 'Protection',
    title: '5-Star Rated',
    desc: '8 airbags, automatic emergency braking, blind-spot monitoring, and lane-keep assist come standard. Safety is never optional.',
    accent: 'var(--indigo-light)',
  },
  {
    tag: '05 / Technology',
    sub: 'Intelligence',
    title: 'Always Connected',
    desc: 'Over-the-air updates, remote diagnostics, live theft tracking, and the VANTA companion app — technology that works tirelessly for you.',
    accent: 'var(--coral)',
  },
]

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'main',       label: 'Main' },
  { id: 'about',      label: 'About' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'products',   label: 'Products' },
  { id: 'contact',    label: 'Contact Us' },
  { id: 'slideshow',  label: 'Slideshow' },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function WebsiteSection({ onShowEnding }) {
  const [tab, setTab]           = useState('main')
  const [menuOpen, setMenuOpen] = useState(false)

  // Calculator
  const [origin,   setOrigin]   = useState('')
  const [dest,     setDest]     = useState('')
  const [locating, setLocating] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState('')

  // Stopwatch
  const [swRunning, setSwRunning]     = useState(false)
  const [swElapsed, setSwElapsed]     = useState(0)        // ms
  const [swResult, setSwResult]       = useState(null)
  const [swSpeed, setSwSpeed]         = useState(40)        // km/h default (city)
  const swStartRef = useRef(null)
  const swFrameRef = useRef(null)

  // Slideshow
  const [slideIdx, setSlideIdx] = useState(0)
  const slideTimer = useRef(null)

  // Scroll to top on tab change & lock scroll for slideshow
  useEffect(() => {
    window.scrollTo(0, 0)
    if (tab === 'slideshow') {
      document.body.style.overflow = 'hidden'
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.overflow = 'auto'
      document.body.style.cursor = 'default'
    }
  }, [tab])

  // Scroll-to-end → pitch ending (main tab only)
  useEffect(() => {
    if (tab !== 'main') return
    const checkEnd = () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
        window.removeEventListener('scroll', checkEnd)
        setTimeout(onShowEnding, 1500)
      }
    }
    window.addEventListener('scroll', checkEnd)
    return () => window.removeEventListener('scroll', checkEnd)
  }, [tab, onShowEnding])

  // Slideshow auto-advance — restart from slide 0 each time the tab is opened
  useEffect(() => {
    if (tab !== 'slideshow') { clearInterval(slideTimer.current); return }
    setSlideIdx(0)
    slideTimer.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(slideTimer.current)
  }, [tab])

  // Stopwatch tick
  useEffect(() => {
    if (!swRunning) { cancelAnimationFrame(swFrameRef.current); return }
    const tick = () => {
      setSwElapsed(Date.now() - swStartRef.current)
      swFrameRef.current = requestAnimationFrame(tick)
    }
    swFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(swFrameRef.current)
  }, [swRunning])

  const swStart = () => {
    swStartRef.current = Date.now() - swElapsed
    setSwRunning(true)
    setSwResult(null)
  }
  const swStop = () => {
    setSwRunning(false)
    const hours = swElapsed / 3_600_000
    const dist = Math.round(hours * swSpeed * 10) / 10
    const fuelCost   = (dist / 100) * FUEL_CAR_L100 * FUEL_PRICE
    const hybridCost = (dist / 100) * HYBRID_L100   * FUEL_PRICE
    const savings    = fuelCost - hybridCost
    if (dist > 0) {
      setSwResult({ dist, fuelCost, hybridCost, savings, savingsPct: fuelCost > 0 ? Math.round((savings / fuelCost) * 100) : 0 })
    }
  }
  const swReset = () => {
    setSwRunning(false)
    setSwElapsed(0)
    setSwResult(null)
    swStartRef.current = null
  }
  const fmtTime = (ms) => {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const sec = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // ── Helpers ────────────────────────────────────
  const goTab = (id) => { setTab(id); setMenuOpen(false) }

  const scrollToContact = () => {
    goTab('contact')
    setTimeout(() => document.getElementById('test-drive')?.scrollIntoView({ behavior: 'smooth' }), 150)
  }

  const handleLocate = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return }
    setLocating(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const data = await (
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
          ).json()
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
          setOrigin(city)
        } catch {
          setOrigin(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`)
        }
        setLocating(false)
      },
      () => {
        setError('Location access denied. Please type your location manually.')
        setLocating(false)
      }
    )
  }

  const handleCalculate = async () => {
    if (!origin.trim() || !dest.trim()) {
      setError('Please enter both your current location and destination.')
      return
    }
    setLoading(true); setError(''); setResult(null)
    try {
      const [from, to] = await Promise.all([nominatimGeocode(origin), nominatimGeocode(dest)])
      const straightKm = haversineKm(from.lat, from.lon, to.lat, to.lon)
      const dist       = Math.round(straightKm * ROAD_FACTOR)
      const fuelCost   = (dist / 100) * FUEL_CAR_L100 * FUEL_PRICE
      const hybridCost = (dist / 100) * HYBRID_L100   * FUEL_PRICE
      const savings    = fuelCost - hybridCost
      setResult({ dist, fuelCost, hybridCost, savings, savingsPct: Math.round((savings / fuelCost) * 100) })
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── CAR SVG (shared) ────────────────────────────
  const CarSVG = () => (
    <svg className="car-silhouette" viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="carGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1A1830" />
          <stop offset="50%"  stopColor="#2A2640" />
          <stop offset="100%" stopColor="#1A1830" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <ellipse cx="400" cy="230" rx="340" ry="18" fill="url(#shadowGrad)" />
      <path d="M100,180 L120,180 L160,120 L280,80 L380,70 L520,72 L620,85 L680,120 L710,180 L720,180 L720,195 L680,200 L620,200 L600,195 L260,195 L240,200 L140,200 L100,195 Z" fill="url(#carGrad)" stroke="#2A2640" strokeWidth="1" />
      <path d="M175,118 L280,82 L380,73 L500,75 L580,85 L630,118 L480,110 L320,110 Z" fill="url(#glassGrad)" stroke="rgba(108,99,255,0.3)" strokeWidth="0.5" />
      <line x1="400" y1="74" x2="395" y2="114" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <ellipse cx="700" cy="165" rx="15" ry="8" fill="#FF6B47" opacity="0.8" />
      <ellipse cx="700" cy="165" rx="8"  ry="4" fill="#FF9B7E" />
      <rect x="105" y="160" width="18" height="6" rx="2" fill="#cc3333" opacity="0.8" />
      {[580, 220].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="200" r="36" fill="#111"    stroke="#2A2640" strokeWidth="2" />
          <circle cx={cx} cy="200" r="22" fill="#1A1830" stroke="#3A3660" strokeWidth="1" />
          <circle cx={cx} cy="200" r="8"  fill="#2A2640" />
          <line x1={cx}      y1="178" x2={cx}      y2="184" stroke="#555" strokeWidth="1.5" />
          <line x1={cx}      y1="216" x2={cx}      y2="222" stroke="#555" strokeWidth="1.5" />
          <line x1={cx - 22} y1="200" x2={cx - 16} y2="200" stroke="#555" strokeWidth="1.5" />
          <line x1={cx + 16} y1="200" x2={cx + 22} y2="200" stroke="#555" strokeWidth="1.5" />
        </g>
      ))}
      <line x1="140" y1="170" x2="700" y2="170" stroke="var(--coral)" strokeWidth="0.5" opacity="0.4" />
      <text x="390" y="150" fontFamily="Cormorant Garamond, serif" fontSize="14" fontWeight="500" fill="var(--coral)" letterSpacing="4" opacity="0.6">VANTA</text>
      <rect x="650" y="185" width="40" height="3" rx="1.5" fill="var(--indigo)" opacity="0.6" />
      <text x="655" y="182" fontFamily="Space Mono, monospace" fontSize="6" fill="var(--indigo-light)" letterSpacing="1" opacity="0.7">HYBRID</text>
    </svg>
  )

  // ── FOOTER (shared) ─────────────────────────────
  const Footer = () => (
    <div className="ws-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">VANTA</div>
          <p className="footer-brand-desc">Nigeria's first luxury hybrid vehicle. Outsmart the road.</p>
        </div>
        {[
          { heading: 'Explore',  links: ['Aero Model', 'Build & Price', 'Test Drive', 'Fleet Solutions'] },
          { heading: 'Company',  links: ['About VANTA', 'Sustainability', 'Newsroom', 'Careers'] },
          { heading: 'Support',  links: ['Service Centres', 'Warranty Info', 'Hybrid Academy', 'Contact Us'] },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <div className="footer-heading">{heading}</div>
            {links.map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 VANTA Motors Nigeria. All rights reserved.</span>
        <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>A concept by Iboro Ige-Edaba &amp; Associates</span>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════
  return (
    <div id="website-section">

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <nav className="ws-nav">
        <div className="ws-nav-brand">VANTA</div>

        <div className={`ws-nav-links ${menuOpen ? 'open' : ''}`}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`ws-nav-link ${tab === id ? 'active' : ''}`}
              onClick={() => goTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="ws-nav-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* ══════════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════════ */}
      {tab === 'main' && <>
        <div className="ws-hero">
          <div className="ws-hero-bg" />
          <div className="ws-hero-content">
            <div className="ws-brand">VANTA Motors</div>
            <h1 className="ws-hero-title">Aero</h1>
            <p className="ws-hero-sub">
              Outsmart the road. Nigeria's first luxury hybrid — engineered for the roads you know, powered by the future you deserve.
            </p>
            <button className="ws-cta" onClick={scrollToContact}>
              Book a Test Drive <span>→</span>
            </button>
            <div className="car-visual"><CarSVG /></div>
          </div>
        </div>

        {/* Our Story (from About) */}
        <div className="ws-section">
          <div className="ws-section-label">Our Story</div>
          <div className="ws-section-title">
            Born in <span className="accent">Nigeria.</span><br />
            Built for <span className="electric">the world.</span>
          </div>
          <div className="about-grid">
            <div>
              <p className="about-text">
                VANTA Motors was founded on a single conviction: that Nigerian drivers deserve world-class vehicles engineered for their roads, their climate, and their future.
              </p>
              <p className="about-text about-text-full">
                We didn't set out to make just another car. We set out to make the car Nigeria never had — a luxury hybrid that confronts the realities of our infrastructure head-on, without sacrificing the refinement our drivers deserve.
              </p>
              <p className="about-text about-text-full">
                The Aero is the result of three years of engineering in partnership with globally certified hybrid specialists, road-tested across Lagos, Abuja, Port Harcourt, and everything in between.
              </p>
              <button className="about-read-more" onClick={() => goTab('about')}>
                Read more <span>→</span>
              </button>
            </div>
            <div className="about-stats">
              {[
                { num: '3',    label: 'Years in Development' },
                { num: '850km', label: 'Total Driving Range' },
                { num: '12',   label: 'Service Centres' },
                { num: '65%',  label: 'Fuel Cost Reduction' },
              ].map(({ num, label }) => (
                <div key={label} className="about-stat">
                  <div className="about-stat-num">{num}</div>
                  <div className="about-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications (from Products) */}
        <div className="ws-section">
          <div className="ws-section-label">Specifications</div>
          <div className="ws-section-title">The <span className="electric">VANTA Aero</span> — fully loaded.</div>
          <div className="specs-grid">
            {[
              ['Powertrain',      '2.5L Atkinson-cycle + Electric Motor'],
              ['Combined Output', '320 hp / 450 Nm'],
              ['Fuel Economy',    '4.2L / 100km (combined cycle)'],
              ['Total Range',     '850 km'],
              ['0 – 100 km/h',   '6.4 seconds'],
              ['Top Speed',       '210 km/h'],
              ['Ground Clearance','200 mm'],
              ['Seating',         '5 passengers'],
              ['Boot Space',      '580L (seats up)'],
              ['Infotainment',    '14" VANTA Connect touchscreen'],
              ['Driver Aids',     'AEB, LKA, BSM, RCTA, ACC'],
              ['Warranty',        '5 years / 100,000 km'],
            ].map(([key, val]) => (
              <div key={key} className="spec-row">
                <div className="spec-key">{key}</div>
                <div className="spec-val">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ws-cta-banner">
          <h2>Ready to outsmart the road?</h2>
          <p>Book your private test drive experience today.</p>
          <button className="ws-cta" onClick={scrollToContact}>Schedule Now <span>→</span></button>
        </div>

        <Footer />
      </>}

      {/* ══════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════ */}
      {tab === 'about' && <>
        <div className="ws-section">
          <div className="ws-section-label">Our Story</div>
          <div className="ws-section-title">
            Born in <span className="accent">Nigeria.</span><br />
            Built for <span className="electric">the world.</span>
          </div>
          <div className="about-grid">
            <div>
              <p className="about-text">
                VANTA Motors was founded on a single conviction: that Nigerian drivers deserve world-class vehicles engineered for their roads, their climate, and their future.
              </p>
              <p className="about-text">
                We didn't set out to make just another car. We set out to make the car Nigeria never had — a luxury hybrid that confronts the realities of our infrastructure head-on, without sacrificing the refinement our drivers deserve.
              </p>
              <p className="about-text">
                The Aero is the result of three years of engineering in partnership with globally certified hybrid specialists, road-tested across Lagos, Abuja, Port Harcourt, and everything in between.
              </p>
            </div>
            <div className="about-stats">
              {[
                { num: '3',    label: 'Years in Development' },
                { num: '850km', label: 'Total Driving Range' },
                { num: '12',   label: 'Service Centres' },
                { num: '65%',  label: 'Fuel Cost Reduction' },
              ].map(({ num, label }) => (
                <div key={label} className="about-stat">
                  <div className="about-stat-num">{num}</div>
                  <div className="about-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ws-cta-banner">
          <h2>Join the movement.</h2>
          <p>Be among the first to own the VANTA Aero.</p>
          <button className="ws-cta" onClick={scrollToContact}>Reserve Yours <span>→</span></button>
        </div>

        <div className="ws-section">
          <div className="ws-section-label">Your Confidence</div>
          <div className="ws-section-title">Built on <span className="electric">trust.</span></div>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><ShieldIcon /></div>
              <div className="trust-title">5-Year Warranty</div>
              <div className="trust-desc">Comprehensive bumper-to-bumper coverage including hybrid battery. Drive with absolute peace of mind.</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><WrenchIcon /></div>
              <div className="trust-title">Service Network</div>
              <div className="trust-desc">12 certified service centres across Nigeria. Your nearest technician is never more than 30 minutes away.</div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><PhoneCallIcon /></div>
              <div className="trust-title">Roadside Assist</div>
              <div className="trust-desc">24/7 roadside assistance included for the first 3 years. One tap in the VANTA app brings help to you.</div>
            </div>
          </div>
        </div>

        <Footer />
      </>}

      {/* ══════════════════════════════════════════════
          CALCULATOR
      ══════════════════════════════════════════════ */}
      {tab === 'calculator' && (
        <div className="ws-section">
          <div className="ws-section-label">Fuel Cost Calculator</div>
          <div className="ws-section-title">See how much you <span className="accent">save.</span></div>
          <p className="calc-intro">
            Enter your current location and destination. We'll estimate the driving distance and compare the fuel cost of a conventional car versus the VANTA Aero hybrid.
          </p>

          <div className="calc-form">
            {/* Origin */}
            <div className="form-group">
              <label className="form-label">Your Current Location</label>
              <div className="calc-input-row">
                <input
                  className="form-input calc-input"
                  type="text"
                  placeholder="e.g. Lagos Island"
                  value={origin}
                  onChange={e => { setOrigin(e.target.value); setError(''); setResult(null) }}
                />
                <button
                  className="calc-locate-btn"
                  onClick={handleLocate}
                  disabled={locating}
                  title="Detect my location"
                >
                  {locating ? 'Locating…' : <><LocateIcon />Locate Me</>}
                </button>
              </div>
            </div>

            {/* Destination */}
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Abuja"
                value={dest}
                onChange={e => { setDest(e.target.value); setError(''); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()}
              />
            </div>

            {error && <p className="calc-error">{error}</p>}

            <button className="form-submit calc-btn" onClick={handleCalculate} disabled={loading}>
              {loading ? 'Calculating…' : 'Calculate Savings →'}
            </button>
          </div>

          {result && (
            <div className="calc-results">
              <p className="calc-dist">
                Estimated road distance: <strong>~{result.dist.toLocaleString()} km</strong>
                <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>(straight-line × {ROAD_FACTOR} road factor)</span>
              </p>

              <div className="calc-results-grid">
                <div className="calc-result-card fuel">
                  <div className="calc-result-type">Conventional Fuel Car</div>
                  <div className="calc-result-cost">{naira(result.fuelCost)}</div>
                  <div className="calc-result-sub">{FUEL_CAR_L100}L / 100km · ₦{FUEL_PRICE.toLocaleString()}/L</div>
                </div>
                <div className="calc-result-card hybrid">
                  <div className="calc-result-badge">VANTA Aero</div>
                  <div className="calc-result-type">Hybrid Vehicle</div>
                  <div className="calc-result-cost">{naira(result.hybridCost)}</div>
                  <div className="calc-result-sub">{HYBRID_L100}L / 100km · ₦{FUEL_PRICE.toLocaleString()}/L</div>
                </div>
              </div>

              <div className="calc-savings-banner">
                <div>
                  <div className="calc-savings-label">You save with the VANTA Aero</div>
                  <div className="calc-savings-amount">{naira(result.savings)}</div>
                  <div className="calc-savings-pct">on this trip alone</div>
                </div>
                <div className="calc-savings-right">
                  <div className="calc-savings-label">Cost reduction</div>
                  <div className="calc-savings-amount">{result.savingsPct}%</div>
                  <div className="calc-savings-pct">cheaper than a fuel car</div>
                </div>
              </div>

              <p className="calc-disclaimer">
                * Fuel price used: ₦{FUEL_PRICE.toLocaleString()}/L (PMS). Fuel car baseline: {FUEL_CAR_L100}L/100km.
                Actual costs may vary based on driving conditions and fuel prices.
              </p>
            </div>
          )}

          {/* ── Stopwatch Section ── */}
          <div className="sw-divider" />
          <div className="ws-section-label">Trip Stopwatch</div>
          <div className="ws-section-title">Track your ride in <span className="accent">real time.</span></div>
          <p className="calc-intro">
            Start the stopwatch when you begin driving and stop it when you arrive. We'll estimate the fuel cost for both a conventional car and the VANTA Aero based on your trip duration.
          </p>

          <div className="sw-speed-row">
            <label className="form-label" style={{ marginBottom: 0 }}>Driving mode</label>
            <div className="sw-speed-options">
              {[
                { label: 'City', value: 30 },
                { label: 'Mixed', value: 50 },
                { label: 'Highway', value: 80 },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`sw-speed-btn${swSpeed === opt.value ? ' active' : ''}`}
                  onClick={() => { setSwSpeed(opt.value); setSwResult(null) }}
                  disabled={swRunning}
                >
                  {opt.label}
                  <span className="sw-speed-sub">{opt.value} km/h</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sw-display">
            <div className="sw-time">{fmtTime(swElapsed)}</div>
            {swElapsed > 0 && !swRunning && !swResult && (
              <div className="sw-paused-label">Paused</div>
            )}
          </div>

          <div className="sw-controls">
            {!swRunning && swElapsed === 0 && (
              <button className="form-submit calc-btn sw-btn sw-start" onClick={swStart}>
                Start Stopwatch
              </button>
            )}
            {swRunning && (
              <button className="form-submit calc-btn sw-btn sw-stop" onClick={swStop}>
                Stop — Calculate Cost
              </button>
            )}
            {!swRunning && swElapsed > 0 && !swResult && (
              <div className="sw-btn-row">
                <button className="form-submit calc-btn sw-btn sw-start" onClick={swStart}>Resume</button>
                <button className="form-submit calc-btn sw-btn sw-stop" onClick={swStop}>Stop — Calculate</button>
              </div>
            )}
            {swResult && (
              <button className="form-submit calc-btn sw-btn sw-reset" onClick={swReset}>
                Reset Stopwatch
              </button>
            )}
          </div>

          {swResult && (
            <div className="calc-results">
              <p className="calc-dist">
                Estimated distance: <strong>~{swResult.dist.toLocaleString()} km</strong>
                <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>(based on {swSpeed} km/h average)</span>
              </p>

              <div className="calc-results-grid">
                <div className="calc-result-card fuel">
                  <div className="calc-result-type">Conventional Fuel Car</div>
                  <div className="calc-result-cost">{naira(swResult.fuelCost)}</div>
                  <div className="calc-result-sub">{FUEL_CAR_L100}L / 100km · ₦{FUEL_PRICE.toLocaleString()}/L</div>
                </div>
                <div className="calc-result-card hybrid">
                  <div className="calc-result-badge">VANTA Aero</div>
                  <div className="calc-result-type">Hybrid Vehicle</div>
                  <div className="calc-result-cost">{naira(swResult.hybridCost)}</div>
                  <div className="calc-result-sub">{HYBRID_L100}L / 100km · ₦{FUEL_PRICE.toLocaleString()}/L</div>
                </div>
              </div>

              <div className="calc-savings-banner">
                <div>
                  <div className="calc-savings-label">You would save with the VANTA Aero</div>
                  <div className="calc-savings-amount">{naira(swResult.savings)}</div>
                  <div className="calc-savings-pct">on this trip</div>
                </div>
                <div className="calc-savings-right">
                  <div className="calc-savings-label">Cost reduction</div>
                  <div className="calc-savings-amount">{swResult.savingsPct}%</div>
                  <div className="calc-savings-pct">cheaper than a fuel car</div>
                </div>
              </div>

              <p className="calc-disclaimer">
                * Distance estimated at {swSpeed} km/h average. Fuel price: ₦{FUEL_PRICE.toLocaleString()}/L (PMS).
                Actual costs vary based on driving conditions, speed, and fuel prices.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PRODUCTS
      ══════════════════════════════════════════════ */}
      {tab === 'products' && <>
        <div className="ws-section">
          <div className="ws-section-label">Performance</div>
          <div className="ws-section-title">Engineered for <span className="accent">Nigerian roads.</span></div>
          <div className="feature-grid">
            {[
              { num: '4.2L',  name: 'Per 100km',       desc: 'Best-in-class fuel economy that saves you over ₦200,000 monthly compared to conventional SUVs.' },
              { num: '320',   name: 'Horsepower',       desc: 'Combined petrol + electric powertrain delivers exhilarating performance when you need it.' },
              { num: '850km', name: 'Total Range',      desc: 'Lagos to Abuja and back. No range anxiety. No compromise.' },
              { num: '200mm', name: 'Ground Clearance', desc: 'Built for the reality of Nigerian roads — potholes, speed bumps, and unpaved stretches.' },
              { num: '5★',    name: 'Safety Rating',    desc: '8 airbags, ABS, ESC, and advanced driver assistance systems keep your family protected.' },
              { num: '24/7',  name: 'Connected',        desc: 'OTA updates, remote diagnostics, and real-time vehicle tracking via the VANTA app.' },
            ].map(({ num, name, desc }) => (
              <div key={name} className="feature-cell">
                <div className="feature-number">{num}</div>
                <div className="feature-name">{name}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ws-section">
          <div className="ws-section-label">Specifications</div>
          <div className="ws-section-title">The <span className="electric">VANTA Aero</span> — fully loaded.</div>
          <div className="specs-grid">
            {[
              ['Powertrain',      '2.5L Atkinson-cycle + Electric Motor'],
              ['Combined Output', '320 hp / 450 Nm'],
              ['Fuel Economy',    '4.2L / 100km (combined cycle)'],
              ['Total Range',     '850 km'],
              ['0 – 100 km/h',   '6.4 seconds'],
              ['Top Speed',       '210 km/h'],
              ['Ground Clearance','200 mm'],
              ['Seating',         '5 passengers'],
              ['Boot Space',      '580L (seats up)'],
              ['Infotainment',    '14" VANTA Connect touchscreen'],
              ['Driver Aids',     'AEB, LKA, BSM, RCTA, ACC'],
              ['Warranty',        '5 years / 100,000 km'],
            ].map(([key, val]) => (
              <div key={key} className="spec-row">
                <div className="spec-key">{key}</div>
                <div className="spec-val">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </>}

      {/* ══════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════ */}
      {tab === 'contact' && (
        <div className="ws-section" id="test-drive">
          <div className="form-split">
            <div>
              <div className="ws-section-label">Experience</div>
              <div className="ws-section-title">Book your <span className="accent">test drive.</span></div>
              <p style={{ color: 'var(--gray)', lineHeight: 1.7, maxWidth: '400px' }}>
                Visit one of our experience centres in Lagos or Abuja. A VANTA specialist will walk you through every feature and put you behind the wheel.
              </p>
              <div style={{ marginTop: '30px' }}>
                {['Victoria Island Experience Centre, Lagos', 'Maitama Experience Centre, Abuja'].map(loc => (
                  <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--indigo)', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: 'var(--cream)' }}>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {[
                { label: 'Full Name',          type: 'text',  placeholder: 'Enter your name' },
                { label: 'Email',              type: 'email', placeholder: 'your@email.com' },
                { label: 'Phone',              type: 'tel',   placeholder: '+234' },
                { label: 'Preferred Location', type: 'text',  placeholder: 'Lagos or Abuja' },
              ].map(({ label, type, placeholder }) => (
                <div key={label} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} placeholder={placeholder} />
                </div>
              ))}
              <button className="form-submit">Book Test Drive →</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SLIDESHOW
      ══════════════════════════════════════════════ */}
      {tab === 'slideshow' && (
        <div className="ws-slideshow-wrap">
          <Presentation onEnterWebsite={() => goTab('main')} embedded />
        </div>
      )}

    </div>
  )
}
