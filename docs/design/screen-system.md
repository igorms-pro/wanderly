# Voyagely Screen System

> Complete screen architecture and navigation system for the Voyagely platform

## Overview

Voyagely follows a screen-by-screen development approach. Each screen is designed mobile-first with clear navigation patterns and consistent UX.

---

## Navigation Architecture

### Primary Flow

```
Landing Page
    ↓
Login / Signup
    ↓
Dashboard (Trip List)
    ↓
Trip Detail (with tabs)
    ├─ Itinerary
    ├─ Chat
    ├─ Weather
    └─ Explore
```

### Navigation Patterns

#### Mobile (< 768px)

- **Bottom Navigation Bar** (sticky)
  - Dashboard icon
  - Current trip icon
  - Profile icon
- **Top Header** (sticky)
  - Back button
  - Screen title
  - Action buttons (context-specific)

#### Desktop (≥ 768px)

- **Top Navigation Bar** (sticky)
  - Logo (left)
  - Navigation links (center)
  - User menu (right)
- **Sidebar** (optional, for trip detail)
  - Trip info
  - Quick actions
  - Member list

---

## Screen Inventory

### 1. Landing Page

**Route:** `/`  
**Auth Required:** No  
**Layout:** Full-page marketing

#### Structure

```
┌─────────────────────────────────────┐
│ Header (Nav + CTA)                  │
├─────────────────────────────────────┤
│ Hero Section                        │
│ - Headline                          │
│ - Subheadline                       │
│ - CTA Button                        │
│ - Hero Image/Illustration           │
├─────────────────────────────────────┤
│ Features Section (3 cards)          │
│ - AI-Powered Planning               │
│ - Democratic Voting                 │
│ - Real-Time Collaboration           │
├─────────────────────────────────────┤
│ How It Works (4 steps)              │
├─────────────────────────────────────┤
│ Social Proof (optional MVP)         │
├─────────────────────────────────────┤
│ Final CTA                           │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

#### Key Components

- Language switcher (top right)
- Theme toggle (top right)
- Sign in link (top right)
- "Get Started" CTA buttons
- Feature cards with icons
- Responsive hero image

#### States

- **Loading**: Skeleton for above-the-fold content
- **Error**: Fallback content if resources fail
- **Empty**: N/A

---

### 2. Login Page

**Route:** `/login`  
**Auth Required:** No  
**Layout:** Centered card

#### Structure

```
┌─────────────────────────────────────┐
│ Logo (centered)                     │
├─────────────────────────────────────┤
│ Card Container                      │
│ ┌─────────────────────────────────┐ │
│ │ Login Title                     │ │
│ │                                 │ │
│ │ Email Input                     │ │
│ │ Password Input                  │ │
│ │                                 │ │
│ │ [Remember me]  [Forgot?]        │ │
│ │                                 │ │
│ │ Login Button (full width)       │ │
│ │                                 │ │
│ │ ─── or ───                      │ │
│ │                                 │ │
│ │ Social Login (Google, GitHub)   │ │
│ │                                 │ │
│ │ "Don't have account? Sign up"   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components

- Email input with validation
- Password input with show/hide toggle
- Submit button with loading state
- Social login buttons
- Link to signup
- Link to forgot password (optional MVP)

#### States

- **Idle**: Form ready
- **Loading**: Disabled form, spinner in button
- **Success**: Brief success message → redirect
- **Error**: Error banner above form
- **Validation Error**: Inline field errors

---

### 3. Signup Page

**Route:** `/signup`  
**Auth Required:** No  
**Layout:** Centered card

#### Structure

```
┌─────────────────────────────────────┐
│ Logo (centered)                     │
├─────────────────────────────────────┤
│ Card Container                      │
│ ┌─────────────────────────────────┐ │
│ │ Signup Title                    │ │
│ │                                 │ │
│ │ Name Input                      │ │
│ │ Email Input                     │ │
│ │ Password Input                  │ │
│ │ - Password strength indicator   │ │
│ │                                 │ │
│ │ [x] Accept Terms & Privacy      │ │
│ │                                 │ │
│ │ Signup Button (full width)      │ │
│ │                                 │ │
│ │ ─── or ───                      │ │
│ │                                 │ │
│ │ Social Login (Google, GitHub)   │ │
│ │                                 │ │
│ │ "Already have account? Login"   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components

- Name input
- Email input with validation
- Password input with strength indicator
- Terms checkbox
- Submit button with loading state
- Social login buttons
- Link to login

#### States

- **Idle**: Form ready
- **Loading**: Disabled form, spinner in button
- **Success**: Success message → redirect to email confirmation
- **Error**: Error banner above form
- **Validation Error**: Inline field errors

---

### 4. Dashboard (Trip List)

**Route:** `/dashboard`  
**Auth Required:** Yes  
**Layout:** Full page with header

#### Structure (Mobile)

```
┌─────────────────────────────────────┐
│ Header                              │
│ - Logo                              │
│ - User Avatar + Menu                │
├─────────────────────────────────────┤
│ Page Title: "My Trips"              │
├─────────────────────────────────────┤
│ Filters & Search                    │
│ - Status tabs                       │
│ - Search input                      │
│ - Sort dropdown                     │
├─────────────────────────────────────┤
│ Trip Card 1                         │
│ ┌─────────────────────────────────┐ │
│ │ Destination                     │ │
│ │ Title                           │ │
│ │ Dates                           │ │
│ │ Status badge                    │ │
│ │ Member avatars                  │ │
│ │ Constraints summary             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Trip Card 2                         │
├─────────────────────────────────────┤
│ Trip Card 3                         │
├─────────────────────────────────────┤
│ ...                                 │
├─────────────────────────────────────┤
│ FAB: + Create Trip                  │
└─────────────────────────────────────┘
```

#### Structure (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | My Trips | Profile                   │
├─────────────────────────────────────────────────────┤
│ Page Title + Create Trip Button (right)             │
├─────────────────────────────────────────────────────┤
│ Filters & Search                                    │
├─────────────────────────────────────────────────────┤
│ Trip Cards (Grid 2-3 columns)                       │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│ │ Trip 1    │ │ Trip 2    │ │ Trip 3    │          │
│ └───────────┘ └───────────┘ └───────────┘          │
└─────────────────────────────────────────────────────┘
```

#### Key Components

- Trip cards with hover states
- Status filter tabs (all, planned, locked, archived)
- Search input with debounce
- Sort dropdown (date, title)
- Create trip FAB/button
- Empty state (no trips)
- Loading state (skeleton cards)

#### States

- **Loading**: Skeleton trip cards
- **Empty**: Empty state illustration + "Create your first trip" CTA
- **Error**: Error banner + retry button
- **Success**: List of trip cards

#### Modals

- **Create Trip Modal**:
  - Basic info (title, destination, dates)
  - Constraints (optional but recommended)
  - Create button

---

### 5. Trip Detail

**Route:** `/trip/:tripId`  
**Auth Required:** Yes  
**Layout:** Full page with tabs

#### Structure (Mobile)

```
┌─────────────────────────────────────┐
│ Header                              │
│ - Back button                       │
│ - Trip title                        │
│ - Edit button (role-based)          │
├─────────────────────────────────────┤
│ Trip Info Banner                    │
│ - Destination                       │
│ - Dates                             │
│ - Status badge                      │
│ - Member avatars with presence      │
│ - Constraints summary               │
├─────────────────────────────────────┤
│ Tab Navigation (scrollable)         │
│ [Itinerary] [Chat] [Weather] [...]  │
├─────────────────────────────────────┤
│ Tab Content                         │
│                                     │
│ (see tab-specific layouts below)    │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Bottom Action Bar (context)        │
│ - Add Activity / Send / etc.        │
└─────────────────────────────────────┘
```

#### Structure (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Trip Navigation | Profile            │
├──────────────┬──────────────────────────────────────┤
│ Left Sidebar │ Main Content                         │
│              │                                      │
│ Trip Info    │ Tab Navigation                       │
│ - Title      │ [Itinerary] [Chat] [Weather] [...]   │
│ - Dates      │                                      │
│ - Members    │ ┌──────────────────────────────────┐ │
│ - Status     │ │                                  │ │
│              │ │ Tab Content                      │ │
│ Quick Actions│ │                                  │ │
│ - Edit       │ │ (see tab-specific layouts)       │ │
│ - Delete     │ │                                  │ │
│ - Finalize   │ │                                  │ │
│              │ │                                  │ │
│              │ └──────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────┘
```

#### Key Components

- Trip header with all info
- Tab navigation (sticky)
- Role-based action buttons
- Real-time presence indicators
- Edit trip modal
- Delete trip confirmation
- Member management panel

---

### 5a. Itinerary Tab

#### Structure

```
┌─────────────────────────────────────┐
│ Actions Bar                         │
│ - Add Activity (human)              │
│ - Generate with AI                  │
│ - Create Scenario                   │
│ - Filters (validated/rejected/all)  │
├─────────────────────────────────────┤
│ Day 1 - March 15, 2025              │
│ ┌─────────────────────────────────┐ │
│ │ Activity Card 1                 │ │
│ │ - Time                          │ │
│ │ - Title                         │ │
│ │ - Location                      │ │
│ │ - Cost                          │ │
│ │ - Source badge (human/AI)       │ │
│ │ - Vote buttons (👍 5  👎 1)     │ │
│ │ - Edit/Delete (role-based)      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Activity Card 2                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Day 2 - March 16, 2025              │
│ ┌─────────────────────────────────┐ │
│ │ Activity Card 3                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Scenarios Section                   │
│ ┌─────────────────────────────────┐ │
│ │ Scenario A (AI) - 👍 8          │ │
│ │ - Day 1: Activity 1, 2, 3       │ │
│ │ - Day 2: Activity 4, 5          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Scenario B (Human) - 👍 3       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components

- Day headers with dates
- Activity cards with all info
- Vote buttons (upvote/downvote)
- Source badges (human/AI)
- Edit/delete buttons (role-based)
- Drag & drop handles (desktop)
- Add activity FAB/button
- Generate AI button
- Scenario cards
- Empty state per day
- Loading state (skeleton)

#### States

- **Loading**: Skeleton activity cards
- **Empty Day**: "No activities yet" + CTA
- **Empty Trip**: "Start planning" + CTA
- **AI Generating**: Progress indicator
- **Voting**: Optimistic UI updates

#### Modals

- **Create Activity Modal**:
  - Title, description
  - Date, time
  - Location (with autocomplete)
  - Cost (optional)
  - Must-have / No-go flags
- **Edit Activity Modal**: Same as create
- **Delete Confirmation**: Simple yes/no
- **Create Scenario Modal**: Multi-step scenario builder
- **AI Generation Progress**: Loading with steps

---

### 5b. Chat Tab

#### Structure

```
┌─────────────────────────────────────┐
│ Online Members (3 online)           │
│ [avatar] [avatar] [avatar]          │
├─────────────────────────────────────┤
│ Messages Area (scrollable)          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Alice - 2:30 PM                 │ │
│ │ "What about visiting the museum?"│ │
│ └─────────────────────────────────┘ │
│                                     │
│     ┌───────────────────────────┐   │
│     │ You - 2:31 PM             │   │
│     │ "Great idea! Let's vote."  │   │
│     └───────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Bob - 2:32 PM                   │ │
│ │ "👍"                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Alice is typing...]                │
│                                     │
├─────────────────────────────────────┤
│ Input Area                          │
│ [Text input]            [Send]      │
└─────────────────────────────────────┘
```

#### Key Components

- Presence indicators (online/offline)
- Message bubbles (left/right based on sender)
- Typing indicators
- Message timestamps
- Message reactions (optional MVP)
- @mentions (optional MVP)
- Message input with send button
- Auto-scroll to bottom
- Load more messages (scroll up)

#### States

- **Loading**: Skeleton messages
- **Empty**: "Start the conversation" empty state
- **Sending**: Optimistic message + loading indicator
- **Error**: Failed message with retry button

---

### 5c. Weather Tab

#### Structure

```
┌─────────────────────────────────────┐
│ Location: Lisbon, Portugal          │
├─────────────────────────────────────┤
│ Current Weather                     │
│ ┌─────────────────────────────────┐ │
│ │ ☀️ 24°C                          │ │
│ │ Sunny                           │ │
│ │ Feels like 26°C                 │ │
│ │ Wind: 10 km/h                   │ │
│ │ Humidity: 60%                   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Forecast (Trip Dates)               │
│                                     │
│ Day 1 - March 15                    │
│ ┌─────────────────────────────────┐ │
│ │ ☀️ 23°C / 18°C                   │ │
│ │ Sunny • No rain                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Day 2 - March 16                    │
│ ┌─────────────────────────────────┐ │
│ │ 🌧️ 19°C / 15°C                   │ │
│ │ Rainy • 60% chance              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Day 3 - March 17                    │
│ ┌─────────────────────────────────┐ │
│ │ ⛅ 21°C / 17°C                    │ │
│ │ Partly cloudy                   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components

- Current weather card
- Forecast cards per day
- Weather icons
- Temperature ranges
- Precipitation probability
- Wind speed
- Loading state (skeleton)
- Error state (API failure)

#### States

- **Loading**: Skeleton weather cards
- **Error**: "Unable to load weather" + retry
- **Success**: Weather data displayed

---

### 5d. Explore Tab

#### Structure

```
┌─────────────────────────────────────┐
│ Search Places                       │
│ [Search input]                      │
├─────────────────────────────────────┤
│ Nearby Places                       │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📍 Belém Tower                   │ │
│ │ ⭐ 4.6 (2,341 reviews)           │ │
│ │ 2.3 km away                     │ │
│ │ [Add to Itinerary]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🍽️ Time Out Market              │ │
│ │ ⭐ 4.4 (1,823 reviews)           │ │
│ │ 1.1 km away • Open now          │ │
│ │ [Add to Itinerary]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏛️ São Jorge Castle             │ │
│ │ ⭐ 4.7 (3,012 reviews)           │ │
│ │ 1.8 km away                     │ │
│ │ [Add to Itinerary]              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Key Components

- Search input with autocomplete
- Place cards with:
  - Category icon
  - Name
  - Rating & review count
  - Distance from trip location
  - Opening hours
  - "Add to Itinerary" button
- Loading state (skeleton)
- Empty state (no results)
- Error state

#### States

- **Loading**: Skeleton place cards
- **Empty**: "No places found" empty state
- **Error**: "Unable to load places" + retry
- **Success**: List of places

---

### 6. Profile Settings (Future)

**Route:** `/profile` or `/settings` (TBD)  
**Auth Required:** Yes  
**Layout:** Full page or sheet

- User avatar, display name, email
- Preferences (language, theme, notifications)
- Account security (password change, etc.)
- States: Loading, Success, Error

---

### 7. Team Settings (Future)

**Route:** `/trip/:tripId/settings` or similar  
**Auth Required:** Yes (trip member)  
**Layout:** Full page or sheet

- Member list and roles
- Invite members
- Trip settings (visibility, etc.)
- States: Loading, Success, Error

---

## Modal Patterns

### Standard Modal

```
┌─────────────────────────────────────┐
│                                 [X] │
│ Modal Title                         │
├─────────────────────────────────────┤
│                                     │
│ Modal Content                       │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [Cancel]              [Confirm]     │
└─────────────────────────────────────┘
```

- Semi-transparent backdrop
- Centered on screen
- Close on backdrop click (optional)
- Close on ESC key
- Trap focus within modal
- Primary action on right
- Secondary action on left

### Full-Screen Modal (Mobile)

```
┌─────────────────────────────────────┐
│ [X] Modal Title          [Save]     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│ Full-screen content                 │
│                                     │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

- Used for complex forms on mobile
- Header with close and action
- Scrollable content
- No backdrop (full takeover)

### Bottom Sheet (Mobile)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ ─────                               │
│ Sheet Title                         │
│                                     │
│ Sheet Content                       │
│ (scrollable)                        │
│                                     │
│ [Action Button]                     │
└─────────────────────────────────────┘
```

- Slides up from bottom
- Drag handle at top
- Swipe down to dismiss
- Semi-transparent backdrop
- Used for quick actions/filters

---

## Loading States

### Skeleton Loaders

Used for:

- Trip cards in dashboard
- Activity cards in itinerary
- Messages in chat
- Weather cards
- Place cards

Pattern:

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░                 │
│ ░░░░░░░░░░░░░                       │
│ ░░░░░░░░░░░░░░░░░░░░░░              │
└─────────────────────────────────────┘
```

### Spinner

Used for:

- Button loading states
- Inline loading
- Small updates

Pattern:

- Circular spinner
- Size matches context
- Warm color (brand primary)

### Progress Bar

Used for:

- AI generation
- File uploads
- Multi-step processes

Pattern:

- Horizontal bar
- Percentage indicator
- Step labels (optional)

---

## Empty States

### Pattern

```
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│                                     │
│         Empty State Title           │
│         Short description           │
│                                     │
│         [Primary Action]            │
│                                     │
└─────────────────────────────────────┘
```

### Examples

- **No trips**: "Start your first adventure"
- **No activities**: "Add your first activity"
- **No messages**: "Start the conversation"
- **No places**: "Search for places to explore"

---

## Error States

### Inline Error

```
┌─────────────────────────────────────┐
│ ⚠️ Error Title                      │
│ Error description text              │
│ [Retry] [Dismiss]                   │
└─────────────────────────────────────┘
```

### Full-Page Error

```
┌─────────────────────────────────────┐
│                                     │
│         [Error Illustration]        │
│                                     │
│         Oops! Something went wrong  │
│         Error description           │
│                                     │
│         [Try Again]                 │
│                                     │
└─────────────────────────────────────┘
```

### Toast Notification

```
┌─────────────────────────────────────┐
│ ⚠️ Error message here           [X] │
└─────────────────────────────────────┘
```

- Auto-dismiss after 5s
- Manual dismiss with X
- Stack multiple toasts
- Position: top-right (desktop), top-center (mobile)

---

## Toast Patterns

### Success Toast

```
┌─────────────────────────────────────┐
│ ✅ Success message here          [X]│
└─────────────────────────────────────┘
```

### Info Toast

```
┌─────────────────────────────────────┐
│ ℹ️ Info message here             [X]│
└─────────────────────────────────────┘
```

### Warning Toast

```
┌─────────────────────────────────────┐
│ ⚠️ Warning message here          [X]│
└─────────────────────────────────────┘
```

---

## Responsive Breakpoints

- **Mobile**: < 768px
  - Single column
  - Bottom navigation
  - Full-screen modals
  - Bottom sheets
  - Stacked layouts

- **Tablet**: 768px - 1024px
  - Two columns where appropriate
  - Top navigation
  - Standard modals
  - Mixed layouts

- **Desktop**: ≥ 1024px
  - Multi-column layouts
  - Sidebar navigation
  - Large modals
  - Grid layouts
  - Max width: 1440px (centered)

---

## Transitions & Animations

### Page Transitions

- **Fade**: 150ms ease-in-out
- **Slide**: 200ms ease-out
- **Scale**: 150ms ease-in-out

### Micro-interactions

- **Hover**: 100ms ease-in-out
- **Click**: 150ms ease-out
- **Focus**: Instant

### Loading Animations

- **Skeleton pulse**: 1.5s ease-in-out infinite
- **Spinner rotate**: 0.6s linear infinite
- **Progress bar**: 200ms ease-out

---

## Accessibility

### Keyboard Navigation

- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals
- Arrow keys for lists/tabs

### Screen Readers

- Semantic HTML
- ARIA labels where needed
- Live regions for dynamic content
- Skip links for navigation

### Focus Management

- Visible focus indicators
- Trap focus in modals
- Restore focus after modal close
- Focus first input in forms

---

## Performance

### Code Splitting

- Split by route
- Lazy load heavy components
- Dynamic imports for modals

### Optimization

- Image lazy loading
- Virtual lists for long lists
- Debounce search inputs
- Throttle scroll events
- Optimize re-renders (React.memo, useMemo)

---

## Testing Strategy

### Unit Tests

- Component rendering
- User interactions
- State management
- Form validation

### E2E Tests

- Critical user flows
- Screen navigation
- Form submissions
- Real-time updates

### Visual Regression

- Screenshot testing
- Cross-browser testing
- Responsive testing

---

**Last Updated:** January 2025  
**Related Docs:** [Design System](./design-system.md), [Product Roadmap](../roadmap/product-roadmap.md)
