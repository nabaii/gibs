import { useState, useEffect, useRef, useCallback } from 'react'

const TOTAL_SLIDES = 16

const CarIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M5 17H3V11L6 6h12l3 5v6h-2M9 17h6"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/><path d="M5 11h14"/></svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="var(--indigo-light)" stroke="none"/></svg>
)
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18M9 12h3M9 15h3"/></svg>
)
const ChartIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 20h16M7 20V14M11 20V8M15 20V11M19 20V4"/></svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
)

function triggerReveal(slideEl) {
  if (!slideEl) return
  slideEl.querySelectorAll('.reveal').forEach(el => {
    el.style.animation = 'none'
    void el.offsetHeight
    el.style.animation = ''
  })
}

export default function Presentation({ onEnterWebsite, embedded = false }) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hintDismissed, setHintDismissed] = useState(false)
  const slideRefs = useRef([])

  const progressPct = ((current + 1) / TOTAL_SLIDES) * 100

  const goToSlide = useCallback((n) => {
    if (isAnimating || n < 0 || n >= TOTAL_SLIDES) return
    setIsAnimating(true)
    if (!hintDismissed) setHintDismissed(true)
    setCurrent(n)
    setTimeout(() => {
      triggerReveal(slideRefs.current[n])
      setIsAnimating(false)
    }, 100)
  }, [isAnimating, hintDismissed])

  const nextSlide = useCallback(() => {
    if (current < TOTAL_SLIDES - 1) goToSlide(current + 1)
    else onEnterWebsite()
  }, [current, goToSlide, onEnterWebsite])

  const prevSlide = useCallback(() => {
    if (current > 0) goToSlide(current - 1)
  }, [current, goToSlide])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide() }
      else if (e.key === 'ArrowLeft') prevSlide()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [nextSlide, prevSlide])

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest('input, button, a, .nav-arrow, .dot-nav-item, .ws-cta, .form-submit, .footer-link')) return
      nextSlide()
    }
    document.body.addEventListener('click', onClick)
    return () => document.body.removeEventListener('click', onClick)
  }, [nextSlide])

  useEffect(() => {
    let startX = 0
    let startY = 0
    const onTouchStart = (e) => {
      startX = e.changedTouches[0].clientX
      startY = e.changedTouches[0].clientY
    }
    const onTouchEnd = (e) => {
      const dx = startX - e.changedTouches[0].clientX
      const dy = startY - e.changedTouches[0].clientY
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) nextSlide()
        else prevSlide()
      }
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [nextSlide, prevSlide])

  useEffect(() => {
    setTimeout(() => triggerReveal(slideRefs.current[0]), 100)
  }, [])

  const s = (i) => ({
    className: `slide${current === i ? ' active' : ''}`,
    ref: (el) => { slideRefs.current[i] = el },
  })

  return (
    <>
      <div id="progress" style={{ width: progressPct + '%' }} />

      <div className="agency-logo">
        Iboro<span className="logo-divider" /><span>Ige-Edaba</span>
      </div>

      <div id="counter">
        {String(current + 1).padStart(2, '0')} &middot; {String(TOTAL_SLIDES).padStart(2, '0')}
      </div>

      <div
        id="click-hint"
        style={{ opacity: hintDismissed ? 0 : undefined, pointerEvents: hintDismissed ? 'none' : undefined }}
      >
        Click or use arrow keys to advance
      </div>

      {!embedded && (
        <button
          className="skip-to-site"
          onClick={(e) => { e.stopPropagation(); onEnterWebsite() }}
        >
          Skip to Website →
        </button>
      )}

      <div id="dot-nav">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <button
            key={i}
            className={`dot-nav-item${current === i ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); goToSlide(i) }}
          />
        ))}
      </div>

      <div className="nav-arrow" id="nav-prev" onClick={(e) => { e.stopPropagation(); prevSlide() }}>
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
      </div>
      <div className="nav-arrow" id="nav-next" onClick={(e) => { e.stopPropagation(); nextSlide() }}>
        <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
      </div>

      <div id="presentation">
        <div className="bg-gradient bg-indigo" />
        <div className="bg-gradient bg-coral" />

        {/* SLIDE 1 — Greeting */}
        <div {...s(0)}>
          <div className="slide-inner transition-slide">
            <h2 className="section-title reveal" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Hello, <span className="accent">Gibs</span>
            </h2>
          </div>
        </div>

        {/* SLIDE 2 — Philosophy */}
        <div {...s(1)}>
          <div className="slide-inner transition-slide">
            <p className="subtitle reveal" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', lineHeight: 1.8 }}>
              At IEA, we believe proof holds far more value than words.
            </p>
            <p className="subtitle reveal reveal-d1" style={{ textAlign: 'center', maxWidth: '700px', margin: '16px auto 0', fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', lineHeight: 1.8 }}>
              We intend to <span className="accent">show</span> you what we will do for you, rather than simply write about it. Anyone can write.
            </p>
          </div>
        </div>

        {/* SLIDE 3 — What to Expect */}
        <div {...s(2)}>
          <div className="slide-inner transition-slide">
            <p className="subtitle reveal" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', lineHeight: 1.8 }}>
              What you are about to experience is our vision for how we would approach solving your challenges.
            </p>
            <p className="subtitle reveal reveal-d1" style={{ textAlign: 'center', maxWidth: '700px', margin: '16px auto 0', fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', lineHeight: 1.8 }}>
              To demonstrate this, we have built a working prototype of a website for a <span className="accent">hypothetical hybrid vehicle</span>.
            </p>
          </div>
        </div>

        {/* SLIDE 4 — Title */}
        <div {...s(3)}>
          <div className="slide-inner" style={{ textAlign: 'center' }}>
            <div className="reveal" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg,transparent,var(--coral))' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,107,71,0.6)' }}>2026</div>
              <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg,var(--coral),transparent)' }} />
            </div>
            <div className="reveal reveal-d1">
              <div className="slide-number">A Proposal by Iboro Ige-Edaba &amp; Associates</div>
            </div>
            <h1 className="hero-title reveal reveal-d2" style={{ margin: '0 auto' }}>
              Marketing the Future<br />of Mobility in <span className="accent">Nigeria</span>
            </h1>
            <p className="subtitle reveal reveal-d3" style={{ margin: '20px auto 0', textAlign: 'center' }}>
              A strategic framework for launching and positioning a hybrid vehicle brand in the Nigerian market.
            </p>
            <div className="reveal reveal-d4 slide-prepared-for">
              <div className="slide-meta-text">
                PREPARED FOR THE GIBS MANAGEMENT
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5 — About Us */}
        <div {...s(4)}>
          <div className="slide-inner">
            <div className="split">
              <div>
                <div className="slide-number reveal">01 — Who We Are</div>
                <h2 className="section-title reveal reveal-d1">We build brands<br />that <span className="accent">move</span> people.</h2>
                <p className="subtitle reveal reveal-d2" style={{ marginTop: 0 }}>
                  A Nigerian-based consulting firm which has a designated creative agency specialising in brand positioning, digital marketing, and go-to-market campaigns for premium brands across West Africa.
                </p>
                <ul className="strat-list reveal reveal-d3">
                  <li>25+ years of working with the largest companies in Nigeria</li>
                  <li>4+ years shaping brand narratives in Nigeria</li>
                  <li>End-to-end: strategy, creative, digital, media</li>
                  <li>Deep understanding of the Nigerian consumer</li>
                </ul>
              </div>
              <div>
                <div className="card reveal reveal-d2" style={{ marginBottom: '20px' }}>
                  <div className="card-icon"><CarIcon /></div>
                  <h3>Automotive Experience</h3>
                  <p>Vehicle launches, dealership activations, and automotive lifestyle brands across West Africa.</p>
                </div>
                <div className="card reveal reveal-d3">
                  <div className="card-icon"><PhoneIcon /></div>
                  <h3>Digital-First DNA</h3>
                  <p>Performance marketing, social media ecosystems, and data-driven lead generation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6 — The Opportunity */}
        <div {...s(5)}>
          <div className="slide-inner">
            <div className="slide-number reveal">02 — Market Opportunity</div>
            <h2 className="section-title reveal reveal-d1">Nigeria is <span className="electric">ready</span> for hybrid.</h2>
            <div className="stat-row reveal reveal-d2">
              {[
                { num: '₦750B+', label: 'Annual vehicle import spend' },
                { num: '68%', label: 'Urban Nigerians concerned about fuel costs' },
                { num: '3.2M', label: 'New middle-class vehicle buyers by 2028' },
              ].map(({ num, label }) => (
                <div key={label} className="stat-item">
                  <div className="stat-number">{num}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
            <p className="subtitle reveal reveal-d3" style={{ maxWidth: '700px' }}>
              Rising fuel costs, the growing environmental consciousness of affluent Nigerians, and the desire for modern technology create the perfect entry window for a hybrid vehicle positioned as both <em>smart</em> and <em>premium</em>.
            </p>
          </div>
        </div>

        {/* SLIDE 7 — Positioning */}
        <div {...s(6)}>
          <div className="slide-inner">
            <div className="slide-number reveal">03 — Brand Positioning</div>
            <h2 className="section-title reveal reveal-d1">Not just a car.<br /><span className="accent">A statement of intelligence.</span></h2>
            <div className="card-grid">
              <div className="card reveal reveal-d2">
                <h3>The Positioning</h3>
                <p>"The smartest way to drive Nigeria." — Hybrid positioned as the intelligent choice for Nigeria's next generation of leaders.</p>
              </div>
              <div className="card reveal reveal-d3">
                <h3>Target Personas</h3>
                <p>Tech-forward professionals (30–50), corporate fleet managers, and high-net-worth individuals.</p>
              </div>
              <div className="card reveal reveal-d4">
                <h3>Key Message Pillars</h3>
                <p><strong>Save Smarter</strong> — fuel economy. <strong>Drive Smarter</strong> — cutting-edge tech. <strong>Lead Smarter</strong> — first to the future.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8 — Digital Strategy */}
        <div {...s(7)}>
          <div className="slide-inner">
            <div className="split">
              <div>
                <div className="slide-number reveal">04 — Digital Strategy</div>
                <h2 className="section-title reveal reveal-d1">A digital ecosystem that <span className="electric">converts.</span></h2>
                <p className="subtitle reveal reveal-d2" style={{ marginTop: 0 }}>
                  Every touchpoint is designed to move potential buyers from curiosity to showroom visit.
                </p>
              </div>
              <div>
                {[
                  { title: 'Website & Landing Pages', body: '360° views, savings calculator, and instant test-drive booking. English & Pidgin variants.' },
                  { title: 'Lead Generation Engine', body: 'WhatsApp API, Facebook & Instagram lead forms, Google Ads targeting fuel-efficient car queries.' },
                  { title: 'Social Media Ecosystem', body: 'Instagram (lifestyle), Twitter/X (thought leadership), TikTok (test-drives), LinkedIn (fleet/B2B).' },
                  { title: 'Paid Media', body: 'Programmatic display, YouTube pre-roll, Instagram Stories — all with "Book Test Drive" CTAs.' },
                ].map((item, i) => (
                  <div key={i} className={`card reveal reveal-d${i + 2}`} style={{ marginBottom: i < 3 ? '16px' : 0 }}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 9 — Visual Campaign */}
        <div {...s(8)}>
          <div className="slide-inner">
            <div className="slide-number reveal">05 — Campaign Concept</div>
            <h2 className="section-title reveal reveal-d1">"<span className="accent">Outsmart the Road.</span>"</h2>
            <p className="subtitle reveal reveal-d2" style={{ margin: '0 0 24px', maxWidth: '600px' }}>
              Hybrid ownership as a mark of intelligence. Every visual, story, and touchpoint reinforces: choosing hybrid means you've outthought the rest.
            </p>
            <div className="card-grid reveal reveal-d3">
              {[
                { title: 'Hero Film', body: "Port-Harcourt professional cruises past fuel queues. \"They're waiting. You're driving.\" 60s spot for social, YouTube, cinema." },
                { title: 'OOH & Print', body: 'Minimalist online ads across all platforms.Fuel gauge on empty → "Drive smarter." Clean vehicle shot + CTA.' },
                { title: 'Social Content Series', body: '"Fuel Math" — weekly posts showing real naira saved. UGC-driven, shareable, sparking conversation on running costs.' },
              ].map((item, i) => (
                <div key={i} className="card" style={{ textAlign: 'left' }}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE 10 — Influencer & PR */}
        <div {...s(9)}>
          <div className="slide-inner">
            <div className="slide-number reveal">06 — Influencer &amp; PR</div>
            <h2 className="section-title reveal reveal-d1">Earned trust through <span className="accent">credible voices.</span></h2>
            <div className="split" style={{ marginTop: '20px' }}>
              <ul className="strat-list reveal reveal-d2">
                <li><strong>Tier 1:</strong> Tech &amp; business macro-influencers (100K+) — vehicle loans, "honest review" content</li>
                <li><strong>Tier 2:</strong> Lifestyle &amp; auto micro-influencers — test-drive vlogs, fuel challenges</li>
                <li><strong>Tier 3:</strong> Corporate leaders &amp; CEOs — LinkedIn placements, "Why I switched"</li>
              </ul>
              <div>
                <div className="card reveal reveal-d3" style={{ marginBottom: '16px' }}>
                  <h3>PR Moments</h3>
                  <p>Exclusive preview at with select paid influencers. Corporate fleet partnership announcement.</p>
                </div>
                <div className="card reveal reveal-d4">
                  <h3>Content Strategy</h3>
                  <p>Monthly "Hybrid Diaries" video series with real owners. Quarterly sustainability report.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 11 — B2B / Fleet */}
        <div {...s(10)}>
          <div className="slide-inner">
            <div className="slide-number reveal">07 — Corporate &amp; Fleet Sales</div>
            <h2 className="section-title reveal reveal-d1">The enterprise <span className="electric">opportunity.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '650px' }}>Fleet is where volume lives. A dedicated B2B track speaking the language of CFOs — total cost of ownership, not sticker price.</p>
            <div className="card-grid reveal reveal-d3">
              <div className="card">
                <div className="card-icon"><ChartIcon /></div>
                <h3>TCO Calculator</h3>
                <p>Daily cost comparison: hybrid vs. petrol. LinkedIn, Instagram and Tiktok campaigns targeting customers and businesses.</p>
              </div>
              <div className="card">
                <div className="card-icon"><HeartIcon /></div>
                <h3>Enterprise Portal</h3>
                <p>Dedicated B2B section with fleet pricing, bulk incentives, because we believe businesses are designed to optimize spending. Hybrid does this.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 12 — Trust */}
        <div {...s(11)}>
          <div className="slide-inner">
            <div className="slide-number reveal">08 — Trust Building</div>
            <h2 className="section-title reveal reveal-d1">Trust is the <span className="accent">real currency.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '650px' }}>Nigerian consumers need proof, not promises. Every signal removes friction from the purchase decision.</p>
            <div className="card-grid reveal reveal-d3">
              {[
                { title: 'Transparency', body: '"We stand behind every kilometre." By providing the users the ability track savings on each mile through the calculator, we show it is not a facade.' },
                { title: 'Service Network', body: 'Interactive service centre map. "Your nearest hybrid centre is X minutes away."' },
                { title: 'Hybrid Academy', body: 'Addressing hybrid myths: battery life, maintenance, resale. YouTube series + workshops.' },
              ].map((item, i) => (
                <div key={i} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE 13 — Phased Rollout */}
        <div {...s(12)}>
          <div className="slide-inner">
            <div className="slide-number reveal">09 — Phased Rollout</div>
            <h2 className="section-title reveal reveal-d1">A strategic, <span className="electric">phased</span> launch.</h2>
            <div className="timeline reveal reveal-d2">
              {[
                { label: 'Phase 1 — Mo 1–3', title: 'Brand Ignition', desc: 'Teaser campaign, media launch, influencer seeding, website launch, PR wave.' },
                { label: 'Phase 2 — Mo 4–6', title: 'Lead Gen & Test Drives', desc: 'Full digital rollout, WhatsApp nurturing, pop-up test drives in Lagos & Abuja.' },
                { label: 'Phase 3 — Mo 7–9', title: 'Sales Acceleration', desc: 'Owner testimonials, fleet pilot results, referral programme. Early adopter stories.' },
                { label: 'Phase 4 — Mo 10–12', title: 'National Expansion', desc: 'Expand to PH, Lagos, Abuja. Year-end review. Year 2 foundation.' },
              ].map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-label">{item.label}</div>
                  <div className="timeline-title">{item.title}</div>
                  <div className="timeline-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE 14 — Budget */}
        <div {...s(13)}>
          <div className="slide-inner">
            <div className="slide-number reveal">10 — Budget Framework</div>
            <h2 className="section-title reveal reveal-d1">Investment <span className="accent">structure.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '600px' }}>A scalable budget framework designed for maximum impact. Exact figures are tailored to your specific goals and timeline.</p>
            <table className="budget-table reveal reveal-d3">
              <thead><tr><th>Category</th><th>Allocation</th></tr></thead>
              <tbody>
                {[
                  ['Brand Strategy & Creative Development', '17%'],
                  ['Website & Digital Platform Build', '14%'],
                  ['Paid Media (Digital + Traditional)', '32%'],
                  ['Influencer & PR Partnerships', '17%'],
                  ['B2B / Fleet Marketing', '10%'],
                  ['Content Production (Video, Photo, Copy)', '10%'],
                ].map(([cat, pct]) => (
                  <tr key={cat}><td>{cat}</td><td>{pct}</td></tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--coral)', fontWeight: 600 }}>
                  <td>Total Campaign Investment</td>
                  <td style={{ color: 'var(--coral-light)' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SLIDE 15 — Transition Tease */}
        <div {...s(14)}>
          <div className="slide-inner transition-slide">
            <div className="reveal"><div className="transition-line" /></div>
            <h2 className="reveal reveal-d1">We don't just <em>present</em> strategies.</h2>
            <h2 className="reveal reveal-d2" style={{ color: 'var(--coral)' }}>We <em>build</em> them.</h2>
            <p className="subtitle transition-subtitle reveal reveal-d3">
              What you're about to see is a fully realised sample of the vehicle brand website we would create. This is not a mockup — it's a working prototype.
            </p>
          </div>
        </div>

        {/* SLIDE 16 — Let's Go */}
        <div {...s(15)}>
          <div className="slide-inner transition-slide">
            <div className="slide-number reveal" style={{ color: 'var(--coral)' }}>Presenting</div>
            <h2 className="vanta-title reveal reveal-d1">
              VANTA<span className="accent"> Aero</span>
            </h2>
            <p className="subtitle reveal reveal-d2" style={{ textAlign: 'center', margin: '10px auto 0' }}>
              The hybrid vehicle brand website, built by our team.
            </p>
            <div className="reveal reveal-d3 slide-cta-hint">
              <div className="slide-cta-hint-text">
                TAP TO EXPERIENCE →
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
