import { useState, useEffect, useRef, useCallback } from 'react'

const TOTAL_SLIDES = 13

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

export default function Presentation({ onEnterWebsite }) {
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

        {/* SLIDE 1 — Title */}
        <div {...s(0)}>
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
            <div className="reveal reveal-d4" style={{ marginTop: '40px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', color: 'var(--gray)' }}>
                PREPARED FOR THE GIBS MANAGEMENT
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2 — About Us */}
        <div {...s(1)}>
          <div className="slide-inner">
            <div className="split">
              <div>
                <div className="slide-number reveal">01 — Who We Are</div>
                <h2 className="section-title reveal reveal-d1">We build brands<br />that <span className="accent">move</span> people.</h2>
                <p className="subtitle reveal reveal-d2" style={{ marginTop: 0 }}>
                  Iboro Ige-Edaba &amp; Associates is a Lagos-based creative and strategy agency specialising in brand positioning, digital marketing, and go-to-market campaigns for premium and emerging brands across Africa.
                </p>
                <ul className="strat-list reveal reveal-d3">
                  <li>8+ years shaping brand narratives in the Nigerian market</li>
                  <li>End-to-end capabilities: strategy, creative, digital, media</li>
                  <li>Deep understanding of the Nigerian consumer psyche</li>
                </ul>
              </div>
              <div>
                <div className="card reveal reveal-d2" style={{ marginBottom: '20px' }}>
                  <div className="card-icon"><CarIcon /></div>
                  <h3>Automotive Experience</h3>
                  <p>Campaign strategy for vehicle launches, dealership activations, and automotive lifestyle brands in the West African market.</p>
                </div>
                <div className="card reveal reveal-d3">
                  <div className="card-icon"><PhoneIcon /></div>
                  <h3>Digital-First DNA</h3>
                  <p>Performance marketing, social media ecosystems, and data-driven lead generation that converts interest into showroom visits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3 — The Opportunity */}
        <div {...s(2)}>
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

        {/* SLIDE 4 — Positioning */}
        <div {...s(3)}>
          <div className="slide-inner">
            <div className="slide-number reveal">03 — Brand Positioning</div>
            <h2 className="section-title reveal reveal-d1">Not just a car.<br /><span className="accent">A statement of intelligence.</span></h2>
            <div className="card-grid">
              <div className="card reveal reveal-d2">
                <h3>The Positioning</h3>
                <p>"The smartest way to drive Nigeria." — We position hybrid not as environmentally niche, but as the intelligent, forward-thinking choice for Nigeria's next generation of leaders.</p>
              </div>
              <div className="card reveal reveal-d3">
                <h3>Target Personas</h3>
                <p>Tech-forward professionals (30–50), corporate fleet managers seeking efficiency, and high-net-worth individuals who see their vehicle as a reflection of their values.</p>
              </div>
              <div className="card reveal reveal-d4">
                <h3>Key Message Pillars</h3>
                <p><strong>Save Smarter</strong> — fuel economy that pays for itself. <strong>Drive Smarter</strong> — cutting-edge technology. <strong>Lead Smarter</strong> — be the first to the future.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5 — Digital Strategy */}
        <div {...s(4)}>
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
                  { title: 'Website & Landing Pages', body: 'Immersive product experience site with 360° views, savings calculator, and instant test-drive booking. Bilingual — English & Pidgin landing variants.' },
                  { title: 'Lead Generation Engine', body: 'WhatsApp Business API integration, Facebook & Instagram lead forms, Google Search Ads targeting "fuel efficient cars Nigeria" and related queries.' },
                  { title: 'Social Media Ecosystem', body: 'Instagram (aspirational lifestyle), Twitter/X (conversations & thought leadership), TikTok (test-drive reactions & fuel savings content), LinkedIn (fleet/B2B).' },
                  { title: 'Paid Media', body: 'Programmatic display on Nigerian news sites, YouTube pre-roll, Instagram Stories ads — all with clear "Book Test Drive" CTAs.' },
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

        {/* SLIDE 6 — Visual Campaign */}
        <div {...s(5)}>
          <div className="slide-inner" style={{ textAlign: 'center' }}>
            <div className="slide-number reveal">05 — Campaign Concept</div>
            <h2 className="section-title reveal reveal-d1">"<span className="accent">Outsmart the Road.</span>"</h2>
            <p className="subtitle reveal reveal-d2" style={{ margin: '0 auto 40px', textAlign: 'center', maxWidth: '600px' }}>
              A campaign that positions hybrid ownership as a mark of intelligence. Every visual, every story, every touchpoint reinforces that choosing hybrid means you've outthought the rest.
            </p>
            <div className="card-grid reveal reveal-d3">
              {[
                { title: 'Hero Film', body: "A Lagos professional cruises past fuel queues in silence. The tagline lands: \"They're waiting. You're driving.\" 60-second hero spot for social, YouTube, and cinema." },
                { title: 'OOH & Print', body: 'Bold, minimalist billboards across Lagos, Abuja, and Port Harcourt. Fuel gauge on empty → "Unless you drive smarter." Clean vehicle shot + CTA.' },
                { title: 'Social Content Series', body: '"Fuel Math" — weekly posts showing real naira saved by hybrid owners. UGC-driven, shareable, and designed to spark conversation around running costs.' },
              ].map((item, i) => (
                <div key={i} className="card" style={{ textAlign: 'left' }}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE 7 — Influencer & PR */}
        <div {...s(6)}>
          <div className="slide-inner">
            <div className="slide-number reveal">06 — Influencer &amp; PR</div>
            <h2 className="section-title reveal reveal-d1">Earned trust through <span className="accent">credible voices.</span></h2>
            <div className="split" style={{ marginTop: '20px' }}>
              <ul className="strat-list reveal reveal-d2">
                <li><strong>Tier 1:</strong> Tech &amp; business macro-influencers (500K+ followers) — week-long vehicle loans with "honest review" content</li>
                <li><strong>Tier 2:</strong> Lifestyle &amp; auto micro-influencers — test-drive vlogs, fuel savings challenges</li>
                <li><strong>Tier 3:</strong> Corporate leaders &amp; CEOs — LinkedIn thought leadership placements, "Why I switched" narratives</li>
                <li><strong>Media Relations:</strong> Launch event with Channels TV, BusinessDay, TechCabal — test drives for journalists, embargoed specs &amp; pricing</li>
              </ul>
              <div>
                <div className="card reveal reveal-d3" style={{ marginBottom: '16px' }}>
                  <h3>PR Moments</h3>
                  <p>Exclusive media preview event at Eko Hotels. Partnership announcement with a major Nigerian corporation for fleet pilot. Feature pieces in Guardian Nigeria, Punch, and Arise TV.</p>
                </div>
                <div className="card reveal reveal-d4">
                  <h3>Content Strategy</h3>
                  <p>Monthly "Hybrid Diaries" video series following real Nigerian owners. Quarterly sustainability report positioning the brand as an industry leader.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8 — B2B / Fleet */}
        <div {...s(7)}>
          <div className="slide-inner">
            <div className="slide-number reveal">07 — Corporate &amp; Fleet Sales</div>
            <h2 className="section-title reveal reveal-d1">The enterprise <span className="electric">opportunity.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '650px' }}>Fleet is where volume lives. We create a dedicated B2B track that speaks the language of CFOs — total cost of ownership, not sticker price.</p>
            <div className="card-grid reveal reveal-d3">
              <div className="card">
                <div className="card-icon"><BuildingIcon /></div>
                <h3>Fleet Pilot Programme</h3>
                <p>Partner with 5 major Lagos corporations for a 90-day fleet trial. Provide real fuel savings data. Let the numbers do the selling.</p>
              </div>
              <div className="card">
                <div className="card-icon"><ChartIcon /></div>
                <h3>TCO Calculator</h3>
                <p>Custom digital tool showing 3-year cost comparison: hybrid vs. petrol. Shared via LinkedIn campaigns targeting fleet managers and procurement officers.</p>
              </div>
              <div className="card">
                <div className="card-icon"><HeartIcon /></div>
                <h3>Enterprise Portal</h3>
                <p>Dedicated website section for B2B enquiries with fleet pricing, bulk order incentives, and direct account manager contact.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 9 — Trust */}
        <div {...s(8)}>
          <div className="slide-inner">
            <div className="slide-number reveal">08 — Trust Building</div>
            <h2 className="section-title reveal reveal-d1">Trust is the <span className="accent">real currency.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '650px' }}>Nigerian consumers need proof, not promises. Every trust signal is designed to remove friction from the purchase decision.</p>
            <div className="card-grid reveal reveal-d3">
              {[
                { title: '5-Year Warranty Messaging', body: 'Bold, front-and-centre warranty communication. "We stand behind every kilometre." Warranty card becomes a premium unboxing moment.' },
                { title: 'Service Network Visibility', body: 'Interactive service centre map on website. "Your nearest certified hybrid service centre is X minutes away." Partnership with existing service networks.' },
                { title: 'Hybrid Academy', body: 'Free educational content addressing hybrid myths: battery life, maintenance costs, resale value. YouTube series + dealership workshops.' },
              ].map((item, i) => (
                <div key={i} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE 10 — Phased Rollout */}
        <div {...s(9)}>
          <div className="slide-inner">
            <div className="slide-number reveal">09 — Phased Rollout</div>
            <h2 className="section-title reveal reveal-d1">A strategic, <span className="electric">phased</span> launch.</h2>
            <div className="timeline reveal reveal-d2">
              {[
                { label: 'Phase 1 — Months 1–3', title: 'Brand Ignition', desc: 'Teaser campaign, media launch event, influencer seeding, website launch, initial PR wave. Build awareness and intrigue before vehicles are available.' },
                { label: 'Phase 2 — Months 4–6', title: 'Lead Generation & Test Drives', desc: 'Full digital ad rollout, WhatsApp lead nurturing, pop-up test drive experiences in Lagos & Abuja. Convert curiosity into qualified leads.' },
                { label: 'Phase 3 — Months 7–9', title: 'Sales Acceleration', desc: 'Owner testimonial campaign, fleet pilot results published, referral programme launch. Leverage early adopter stories to drive broader adoption.' },
                { label: 'Phase 4 — Months 10–12', title: 'National Expansion', desc: 'Expand to Port Harcourt, Kano, Enugu. Dealership network campaign. Year-end review event. Set foundation for Year 2 growth.' },
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

        {/* SLIDE 11 — Budget */}
        <div {...s(10)}>
          <div className="slide-inner">
            <div className="slide-number reveal">10 — Budget Framework</div>
            <h2 className="section-title reveal reveal-d1">Investment <span className="accent">structure.</span></h2>
            <p className="subtitle reveal reveal-d2" style={{ maxWidth: '600px' }}>A scalable budget framework designed for maximum impact. Exact figures are tailored to your specific goals and timeline.</p>
            <table className="budget-table reveal reveal-d3">
              <thead><tr><th>Category</th><th>Allocation</th></tr></thead>
              <tbody>
                {[
                  ['Brand Strategy & Creative Development', '15%'],
                  ['Website & Digital Platform Build', '12%'],
                  ['Paid Media (Digital + Traditional)', '30%'],
                  ['Influencer & PR Partnerships', '15%'],
                  ['Event & Experiential Activations', '12%'],
                  ['B2B / Fleet Marketing', '8%'],
                  ['Content Production (Video, Photo, Copy)', '8%'],
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

        {/* SLIDE 12 — Transition Tease */}
        <div {...s(11)}>
          <div className="slide-inner transition-slide">
            <div className="reveal"><div className="transition-line" /></div>
            <h2 className="reveal reveal-d1">We don't just <em>present</em> strategies.</h2>
            <h2 className="reveal reveal-d2" style={{ color: 'var(--coral)' }}>We <em>build</em> them.</h2>
            <p className="subtitle reveal reveal-d3" style={{ margin: '30px auto 0', textAlign: 'center', maxWidth: '480px' }}>
              What you're about to see is a fully realised sample of the vehicle brand website we would create. This is not a mockup — it's a working prototype.
            </p>
          </div>
        </div>

        {/* SLIDE 13 — Let's Go */}
        <div {...s(12)}>
          <div className="slide-inner transition-slide">
            <div className="slide-number reveal" style={{ color: 'var(--coral)' }}>Presenting</div>
            <h2 className="reveal reveal-d1" style={{ fontSize: 'clamp(64px,8vw,110px)', letterSpacing: '-0.03em' }}>
              VANTA<span className="accent"> Aero</span>
            </h2>
            <p className="subtitle reveal reveal-d2" style={{ textAlign: 'center', margin: '10px auto 0' }}>
              The hybrid vehicle brand website, built by our team.
            </p>
            <div className="reveal reveal-d3" style={{ marginTop: '40px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', color: 'var(--indigo-light)', animation: 'pulse 2s infinite' }}>
                CLICK TO EXPERIENCE →
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
