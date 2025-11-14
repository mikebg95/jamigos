# Jamigos Landing Page Design Specification

## Executive Summary
This document outlines the complete landing page redesign for **Jamigos**, a social media platform for musicians focused on jam sessions. The design leverages the existing design system (colors, spacing, animations, components) while creating a fresh, music-centric brand identity.

---

## 1. Brand Identity

### Name & Positioning
- **Name:** Jamigos
- **Tagline Options:**
  1. **"Where Musicians Connect & Create"** (Recommended - Simple, clear, inclusive)
  2. **"Find Your Rhythm, Meet Your Band"** (Playful, emphasizes matching)
  3. **"Jam Sessions, Reimagined"** (Bold, modern, transformation-focused)
  4. **"Connect. Jam. Share. Repeat."** (Action-oriented, cyclical)
  5. **"Your Next Jam Session Starts Here"** (Direct, inviting, immediate)

### Logo Concept
**Design Direction:** Modern geometric G-clef meets guitar pick

**Visual Elements:**
- **Primary Shape:** Geometric G-clef (treble clef) simplified into clean lines
- **Secondary Element:** Circular guitar pick silhouette surrounding/framing the clef
- **Style:** Minimalist, single-weight line art, scalable
- **Color Application:**
  - Uses existing gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
  - Maintains consistency with the current purple/violet brand palette

**Logo Variations:**
- **Full Logo:** Icon + "Jamigos" wordmark
- **Icon Only:** Standalone G-clef/pick for app icons, favicons
- **Monochrome:** Single-color version for dark/light backgrounds

**Implementation Notes:**
- SVG format for scalability
- 32x32px icon size (matching current system)
- Maintains existing gradient definition in navbar
- Hover effect: Subtle rotation (5deg) like current logo

---

## 2. Design System Alignment

### Colors (Existing Palette - DO NOT CHANGE)
```scss
// Primary Gradient
$color-primary-start: #667eea;  // Violet-blue
$color-primary-mid: #764ba2;    // Deep purple
$color-primary-end: #f093fb;    // Pink

// Backgrounds
$bg-dark-start: #0a0a0f;
$bg-dark-end: #1a1a2e;

// Status Colors
$color-success: #10b981;  // Used for "Live Session" indicators
$color-info: #3b82f6;     // Used for feature highlights
```

### Typography (Existing - DO NOT CHANGE)
- **Font Family:** System UI stack
- **Heading Sizes:**
  - Hero: `$font-4xl` (48px)
  - Section: `$font-3xl` (32px)
  - Feature: `$font-xl` (20px)
- **Weights:** 600 (semibold) for headings, 500 (medium) for body

### Spacing (Existing - DO NOT CHANGE)
- Section padding: `$spacing-4xl` (96px)
- Card gaps: `$spacing-xl` (32px)
- Element gaps: `$spacing-md` (16px)

### Animations (Existing - DO NOT CHANGE)
- **Entrance:** `fadeInUp` with staggered delays
- **Floating Elements:** `float` animation (6s infinite)
- **Hover Effects:**
  - Lift: `-2px translateY` with glow shadow
  - Scale: `1.05` scale on hover
- **Transitions:** `cubic-bezier(0.4, 0, 0.2, 1)` (0.3s base)

---

## 3. Landing Page Structure

### Section 1: Hero
**Layout:** Two-column grid (content left, visual right)

**Content:**
- **Badge:** "Now in Beta" with pulsing green dot
- **Headline:** "Where Musicians Connect & Create"
- **Subheadline:** "Join jam sessions, showcase your talent, and discover your next bandmate—all powered by AI-driven matching."
- **CTAs:**
  - Primary: "Start Jamming Free" (signup)
  - Secondary: "Watch How It Works" (scroll to demo/video section)
- **Stats:**
  - "5K+ Musicians"
  - "10K+ Jam Sessions"
  - "500+ Bands Formed"

**Visual Elements:**
- **Card 1 (Left):** Floating card showing "Upcoming Jam Session" with:
  - Profile avatars (3-4 musicians)
  - Time: "Today, 7:00 PM"
  - Genre badge: "Jazz Fusion"
  - Instruments: Guitar, Bass, Drums icons
- **Card 2 (Top Right):** Mini stat card:
  - Music note icon
  - "+42 New Sessions This Week"
- **Card 3 (Bottom):** Recording preview card:
  - Waveform visualization
  - "Blues Jam - Dec 12" title
  - Play button icon

**Animation Sequence:**
1. Hero text fades in up (0s delay)
2. CTAs fade in up (0.3s delay)
3. Stats fade in up (0.4s delay)
4. Card 1 floats in (0.5s delay, continuous float)
5. Card 2 floats in (1s delay, continuous float)
6. Card 3 floats in (1.5s delay, continuous float)

---

### Section 2: Features
**Headline:** "Everything You Need to Jam"

**Subheadline:** "From discovery to recording, Jamigos connects musicians at every step of the creative journey."

**Features Grid (3 columns, 2 rows):**

1. **Create & Join Sessions**
   - Icon: Calendar + music note
   - Description: "Schedule jam sessions, set your genre preferences, and invite musicians in your area or online."

2. **AI-Powered Matching**
   - Icon: Sparkles/stars
   - Description: "Smart algorithms connect you with musicians who match your skill level, style, and availability."

3. **Upload & Showcase**
   - Icon: Upload cloud + waveform
   - Description: "Record your sessions and share them on your profile. Build a portfolio that shows what you can do."

4. **Discover Musicians**
   - Icon: Search + user group
   - Description: "Explore profiles, listen to recordings, and find your next collaborator or bandmate."

5. **Video & Audio**
   - Icon: Video camera + headphones
   - Description: "Join virtual jam sessions with high-quality audio/video, or meet up in person."

6. **Build Your Profile**
   - Icon: User circle + badge
   - Description: "Showcase your instruments, genres, influences, and past sessions. Let your music speak."

**Interaction:**
- Cards use `hover-lift` mixin (lift up 2px with glow shadow)
- Staggered `fadeInUp` animation (0.1s increment per card)
- Icon color: Uses primary gradient

---

### Section 3: How It Works
**Layout:** Horizontal timeline (desktop) / Vertical (mobile)

**Headline:** "From Sign-Up to Sound Check in 3 Steps"

**Steps:**

1. **Create Your Profile**
   - Visual: Profile card mockup with instrument badges
   - Text: "Tell us what you play, your skill level, and your favorite genres. Upload a sample if you'd like."

2. **Find Your Match**
   - Visual: AI matching interface with profile cards
   - Text: "Browse sessions or let our AI suggest musicians who fit your style. Filter by location, genre, or instrument."

3. **Jam & Share**
   - Visual: Session recording with waveform + share icons
   - Text: "Join live sessions, record your jams, and share your best work on your profile or social media."

**Design Notes:**
- Use numbered badges (1, 2, 3) with gradient background
- Cards use glass morphism effect (`@include glass`)
- Connecting line between steps (horizontal dashed line, subtle)

---

### Section 4: AI Matching Spotlight
**Layout:** Split 50/50 (visual left, content right)

**Headline:** "Smart Matching, Better Jams"

**Subheadline:** "Our AI analyzes your musical preferences, experience level, location, and availability to connect you with the perfect jam partners."

**Key Points (Bulleted):**
- Genre compatibility scoring
- Skill level balancing (beginners to pros)
- Availability sync (time zones, schedules)
- Instrument complement suggestions

**Visual:**
- Animated matching UI mockup showing:
  - User card sliding in from left
  - Multiple potential match cards
  - "Match Score: 94%" badge appearing
  - Gradient connecting lines between profiles

**Interaction:**
- Shimmer effect on match score reveal
- Pulse animation on "New Match!" notification badge

---

### Section 5: Social Proof
**Headline:** "Loved by Musicians Worldwide"

**Layout:** 3-column testimonial cards

**Testimonials:**

1. **Sarah M. - Guitarist**
   - Quote: "I found my dream band in two weeks. The AI matching is spot-on—everyone I jammed with was exactly my vibe."
   - Rating: 5 stars
   - Genre: Indie Rock

2. **Marcus T. - Drummer**
   - Quote: "Finally, a platform that gets it. No more flaky meetups or mismatched skill levels. Just pure jamming."
   - Rating: 5 stars
   - Genre: Jazz

3. **Lena K. - Vocalist**
   - Quote: "Jamigos helped me build a portfolio I'm proud of. I've gotten 3 gig offers just from my profile recordings!"
   - Rating: 5 stars
   - Genre: R&B

**Stats Bar (Below Testimonials):**
- 4.9/5 Average Rating
- 2,500+ Sessions This Month
- 50+ Countries

**Design:**
- Testimonial cards with gradient border on hover
- Profile photos (circular avatars)
- Star icons for ratings (gradient fill)

---

### Section 6: Screenshot Gallery (Optional Carousel)
**Headline:** "See Jamigos in Action"

**Screens to Show:**
1. Session discovery feed
2. Musician profile page
3. Recording playback interface
4. AI match results

**Interaction:**
- Auto-rotate carousel (5s interval)
- Manual navigation dots
- Phone frame mockup (optional) with shadow

---

### Section 7: Call to Action
**Layout:** Centered card with gradient border

**Headline:** "Ready to Find Your Next Jam?"

**Subheadline:** "Join thousands of musicians creating, connecting, and collaborating on Jamigos."

**CTAs:**
- Primary: "Create Free Account" (large button)
- Secondary: "Learn More" (ghost button, links to info page)

**Background:**
- Subtle animated gradient wave pattern (using existing gradient colors)
- Glass card with backdrop blur

---

### Section 8: Footer
**Layout:** 3-column grid (desktop) / Stacked (mobile)

**Column 1: Branding**
- Jamigos logo
- Tagline: "Where Musicians Connect & Create"
- Social media icons (placeholder)

**Column 2: Quick Links**
- About
- Features
- How It Works
- Pricing (future)
- Contact

**Column 3: Legal**
- Privacy Policy
- Terms of Service
- Cookie Policy

**Bottom Bar:**
- © 2025 Jamigos. All rights reserved.
- "Built for musicians, by musicians"

---

## 4. Microcopy & Voice

### Tone Guidelines
- **Friendly, not overly casual:** "Start jamming" not "Let's jam bro"
- **Inclusive:** "Musicians of all levels" not "Pros only"
- **Action-oriented:** Use verbs (Create, Join, Share, Discover)
- **Music-centric:** Sprinkle music metaphors naturally (rhythm, harmony, vibe)

### Button Labels
- Primary CTA: "Start Jamming Free"
- Secondary CTA: "Watch How It Works"
- Login: "Sign In"
- Signup: "Create Account"
- Profile: "View Your Jams"

### Error States (Future)
- No sessions found: "No jams in your area yet. Be the first to start one!"
- Match error: "Oops, we hit a wrong note. Try again."

---

## 5. Animation & Interaction Details

### Hero Animations
**Logo/Icon Motion (On Page Load):**
- G-clef icon: Gentle rotation (360deg) over 1.5s
- Guitar pick outline: Scale in from 0.8 to 1.0 with fade-in
- Combined effect: Musical "tuning" feel

**Floating Cards:**
- Use existing `float` animation (6s infinite)
- Stagger delays: Card 1 (0s), Card 2 (1s), Card 3 (2s)
- Hover: Pause float, apply `hover-lift` effect

**Waveform Visualization (Card 3):**
- Animated bars (height oscillation)
- Uses existing `pulseScale` animation
- Bars: 8-10 vertical lines with staggered delays

### Feature Cards
- Entrance: `fadeInUp` with 0.1s increment per card
- Hover: `@include hover-lift` (lift + glow shadow)
- Icon: Slight scale (1.1) on card hover

### How It Works Steps
- Cards slide in from left (odd numbers) and right (even numbers)
- Numbered badges: Bounce once on appearance
- Connecting line: Draws from left to right (width animation)

### AI Matching Visual
- Profile cards slide in with `slideInRight`
- Match percentage: Count-up animation (0% → 94%)
- Success pulse: Green glow pulse on match confirmation

### Scroll Animations (Intersection Observer)
- Sections fade in when 20% visible
- Testimonials: Stagger appearance (left to right wave)

---

## 6. Responsive Behavior

### Mobile Adjustments (< 768px)
- Hero: Stack to single column (content above visual)
- Features: Single column grid
- How It Works: Vertical timeline instead of horizontal
- Testimonials: Single column carousel with swipe
- Footer: Stack all columns vertically

### Tablet (768px - 1024px)
- Hero: Maintain 2-column but reduce spacing
- Features: 2-column grid
- Testimonials: 2-column grid

---

## 7. Iconography Style

### Icon Library
Use existing Lucide icons (already in project):
- Music note
- Calendar
- Sparkles (AI)
- Upload cloud
- Search
- Users
- Video camera
- Headphones
- User circle
- Guitar (if available, else use music note)

### Icon Treatment
- Stroke width: Existing `UI.ICON_STROKE_WIDTH` (likely 1.5-2)
- Color: Primary gradient for featured icons, secondary text color for utility
- Size: Lg/Xl for feature icons, Md for UI elements

---

## 8. Content Strategy

### SEO-Friendly Copy
- H1: "Where Musicians Connect & Create"
- Meta Description: "Join Jamigos, the social platform for musicians. Create jam sessions, upload recordings, discover collaborators, and get AI-powered matches. Free for all skill levels."
- Keywords: musicians, jam sessions, music collaboration, band finder, AI matching

### Accessibility
- All images have alt text
- Icons paired with text labels
- ARIA labels on interactive elements
- Keyboard navigation for all CTAs
- High contrast maintained (existing design system already compliant)

---

## 9. Technical Implementation Notes

### Component Structure
```
HomeView.vue (Main Landing Page)
├── HeroSection
│   ├── HeroContent (text, CTAs, stats)
│   └── HeroVisual (floating cards)
├── FeaturesSection
│   └── FeatureCard (x6)
├── HowItWorksSection
│   └── StepCard (x3)
├── AIMatchingSection
│   ├── MatchingVisual
│   └── MatchingContent
├── TestimonialsSection
│   └── TestimonialCard (x3)
├── CTASection
└── FooterSection
```

### State Management
- No new stores required
- Use existing `useUserStore` for auth state
- Use existing `apiFetch` for future API calls

### Assets Needed
- Jamigos logo SVG (new)
- Instrument icons (use Lucide or minimal SVG)
- Waveform animation (CSS-only bars)
- Profile avatar placeholders (colored circles with initials)

---

## 10. Future Enhancements (Post-Launch)

### Phase 2 Features
- Video demo embed (YouTube/Vimeo)
- Interactive genre selector ("Find jams in...")
- Live session counter (WebSocket)
- Musician map visualization

### Analytics Events
- CTA clicks
- Section scroll depth
- Video play rate
- Feature card hovers

---

## Conclusion

This design specification maintains full compatibility with the existing design system while transforming the brand identity from "TaskFlow" (todo app) to "Jamigos" (musician social network). All colors, spacing, animations, and interaction patterns remain unchanged—only content, copy, and iconography shift to reflect the music-focused mission.

**Next Steps:**
1. Approve tagline and logo concept
2. Implement landing page updates in HomeView.vue
3. Update NavbarComponent.vue with new logo
4. Create features config for music-specific features
5. Test responsive behavior and animations
