# Design System Documentation

## Overview

A complete design system implementation with warm, modern, minimal styling and light/dark theme support. The design system provides a unified visual language across the entire application with consistent colors, typography, spacing, shadows, and component styles.

## 🎨 Design Philosophy

- **Warm & Modern**: Warm orange/teal color palette with rounded corners and soft shadows
- **Minimal & Clean**: Uncluttered interfaces with clear visual hierarchy
- **Playful Social-App Vibe**: Friendly, approachable, slightly playful aesthetic
- **Accessible**: WCAG compliant colors, focus states, and keyboard navigation
- **Theme-Aware**: Full light/dark theme support with smooth transitions

---

## 📁 File Structure

```
src/scss/design-system/
├── tokens/
│   ├── _colors.scss          # Color palettes for light/dark modes
│   ├── _typography.scss      # Font families, sizes, weights, line heights
│   ├── _spacing.scss         # Spacing scale (4px grid)
│   ├── _radii.scss          # Border radius tokens
│   ├── _shadows.scss        # Shadow and glow effects
│   └── _animations.scss     # Animation durations, easings, keyframes
├── components/
│   ├── _button.scss         # Button component styles
│   ├── _input.scss          # Input, textarea, checkbox, radio styles
│   ├── _card.scss           # Card component styles
│   ├── _badge.scss          # Badge component styles
│   ├── _chip.scss           # Chip component styles
│   ├── _tabs.scss           # Tab component styles
│   ├── _spinner.scss        # Loading spinner styles
│   └── _modal.scss          # Modal dialog styles
├── _theme.scss              # CSS variable generation and theme switching
├── _mixins.scss             # Reusable SCSS mixins
└── index.scss               # Main entry point
```

---

## 🎨 Color Palette

### Light Mode
- **Primary**: `#F9A548` (Warm Orange)
- **Secondary**: `#0EB3A7` (Teal)
- **Purple**: `#9A72CA`
- **Background**: `#F8E8CD` (Warm Cream)
- **Surface**: `#FFFFFF`
- **Text Primary**: `#010100`
- **Text Secondary**: `#505866`

### Dark Mode
- **Primary**: `#F9A548` (Warm Orange)
- **Secondary**: `#0EB3A7` (Teal)
- **Purple**: `#9A72CA`
- **Background**: `#121110` (Dark Charcoal)
- **Surface**: `#1F1E1C`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#D4D0C9`

---

## 🔧 Usage

### Using CSS Variables (Recommended)

All design tokens are exposed as CSS variables with the `--ds-` prefix:

```vue
<template>
  <div class="my-component">
    <h1>Hello World</h1>
  </div>
</template>

<style scoped>
.my-component {
  /* Colors */
  background: var(--ds-color-surface);
  color: var(--ds-color-text-primary);
  border: 1px solid var(--ds-color-border-subtle);

  /* Spacing */
  padding: var(--ds-spacing-lg);
  gap: var(--ds-spacing-md);

  /* Borders */
  border-radius: var(--ds-radius-xl);

  /* Shadows */
  box-shadow: var(--ds-shadow-soft);

  /* Typography */
  font-size: var(--ds-font-size-lg);
  font-weight: var(--ds-font-weight-semibold);
  line-height: var(--ds-line-height-relaxed);
}
</style>
```

### Using SCSS Functions

Import the design system and use helper functions:

```scss
@use '@/scss/design-system/theme' as ds;
@use '@/scss/design-system/mixins' as ds-mix;

.my-button {
  background: ds.ds-color('primary');
  padding: ds.ds-spacing('md') ds.ds-spacing('xl');
  border-radius: ds.ds-radius('lg');
  box-shadow: ds.ds-shadow('soft');

  @include ds-mix.ds-transition;
  @include ds-mix.ds-focus-visible;
  @include ds-mix.ds-hover-glow('primary');
}
```

---

## 🧩 Component Classes

### Buttons

```vue
<template>
  <!-- Design System Buttons -->
  <button class="ds-btn ds-btn-primary">Primary Button</button>
  <button class="ds-btn ds-btn-secondary">Secondary Button</button>
  <button class="ds-btn ds-btn-outline">Outline Button</button>
  <button class="ds-btn ds-btn-ghost">Ghost Button</button>
  <button class="ds-btn ds-btn-error">Delete</button>

  <!-- Sizes -->
  <button class="ds-btn ds-btn-primary ds-btn-sm">Small</button>
  <button class="ds-btn ds-btn-primary ds-btn-lg">Large</button>

  <!-- Modifiers -->
  <button class="ds-btn ds-btn-primary ds-btn-block">Full Width</button>
  <button class="ds-btn ds-btn-primary ds-btn-pill">Pill Shape</button>

  <!-- Legacy Buttons (still work) -->
  <button class="btn btn-primary">Legacy Primary</button>
</template>
```

### Inputs

```vue
<template>
  <div class="ds-field">
    <label class="ds-label ds-label-required">Email</label>
    <input type="email" class="ds-input" placeholder="Enter your email" />
    <span class="ds-hint">We'll never share your email</span>
  </div>

  <div class="ds-field">
    <label class="ds-label">Message</label>
    <textarea class="ds-textarea" placeholder="Your message..."></textarea>
  </div>

  <!-- With error state -->
  <input type="text" class="ds-input ds-input-error" />
  <span class="ds-error-message">This field is required</span>

  <!-- Checkbox -->
  <div class="ds-checkbox-wrapper">
    <input type="checkbox" class="ds-checkbox" id="agree" />
    <label for="agree">I agree to the terms</label>
  </div>
</template>
```

### Cards

```vue
<template>
  <div class="ds-card">
    <div class="ds-card-header">
      <h3 class="ds-card-title">Card Title</h3>
    </div>
    <div class="ds-card-body">
      <p>Card content goes here...</p>
    </div>
    <div class="ds-card-footer">
      <button class="ds-btn ds-btn-primary">Action</button>
    </div>
  </div>

  <!-- Variants -->
  <div class="ds-card ds-card-elevated">Elevated Card</div>
  <div class="ds-card ds-card-interactive">Clickable Card</div>
</template>
```

### Badges & Chips

```vue
<template>
  <!-- Badges -->
  <span class="ds-badge ds-badge-primary">New</span>
  <span class="ds-badge ds-badge-success">Active</span>
  <span class="ds-badge ds-badge-error">Error</span>

  <!-- Chips (interactive) -->
  <div class="ds-chip ds-chip-primary">
    Featured
  </div>

  <div class="ds-chip ds-chip-dismissible">
    JavaScript
    <button class="ds-chip-close" aria-label="Remove">
      <X :size="14" />
    </button>
  </div>
</template>
```

### Tabs

```vue
<template>
  <div class="ds-tabs">
    <div class="ds-tab-list" role="tablist">
      <button class="ds-tab" role="tab" aria-selected="true">Overview</button>
      <button class="ds-tab" role="tab">Details</button>
      <button class="ds-tab" role="tab">Settings</button>
    </div>

    <div class="ds-tab-panel" role="tabpanel" aria-hidden="false">
      Overview content...
    </div>
  </div>

  <!-- Pill variant -->
  <div class="ds-tab-list ds-tab-list-pills">
    <button class="ds-tab" aria-selected="true">Tab 1</button>
    <button class="ds-tab">Tab 2</button>
  </div>
</template>
```

### Spinner

```vue
<template>
  <!-- Basic spinner -->
  <div class="ds-spinner" role="status">
    <span class="ds-spinner-sr">Loading...</span>
  </div>

  <!-- Sizes -->
  <div class="ds-spinner ds-spinner-sm"></div>
  <div class="ds-spinner ds-spinner-lg"></div>

  <!-- Colors -->
  <div class="ds-spinner ds-spinner-secondary"></div>

  <!-- Dot spinner -->
  <div class="ds-spinner-dots">
    <div class="ds-spinner-dot"></div>
    <div class="ds-spinner-dot"></div>
    <div class="ds-spinner-dot"></div>
  </div>

  <!-- Full screen overlay -->
  <div class="ds-spinner-overlay">
    <div class="ds-spinner ds-spinner-lg"></div>
  </div>
</template>
```

### Modal

```vue
<template>
  <div class="ds-modal-overlay">
    <div class="ds-modal-content">
      <div class="ds-modal-header">
        <h2 class="ds-modal-title">Modal Title</h2>
        <button class="ds-modal-close" aria-label="Close">
          <X :size="20" />
        </button>
      </div>

      <div class="ds-modal-body">
        <p>Modal content goes here...</p>
      </div>

      <div class="ds-modal-footer">
        <button class="ds-btn ds-btn-ghost">Cancel</button>
        <button class="ds-btn ds-btn-primary">Confirm</button>
      </div>
    </div>
  </div>
</template>
```

---

## 🌓 Theme Switching

### Programmatic Theme Control

```javascript
import { getTheme, setTheme, toggleTheme, initTheme } from '@/utils/theme.js';

// Initialize theme on app start (already done in main.js)
initTheme();

// Get current theme
const currentTheme = getTheme(); // 'light' or 'dark'

// Set theme explicitly
setTheme('dark');
setTheme('light');

// Toggle theme
const newTheme = toggleTheme(); // Returns 'light' or 'dark'
```

### Theme Toggle Component

A `ThemeToggle.vue` component has been created and added to the navbar:

```vue
<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue';
</script>
```

The toggle button automatically:
- Detects the current theme
- Switches between light/dark modes
- Persists preference to localStorage
- Shows appropriate icon (sun/moon)

---

## 🎭 Available Tokens

### Colors
```
--ds-color-primary
--ds-color-primary-dark
--ds-color-primary-light
--ds-color-secondary
--ds-color-secondary-dark
--ds-color-secondary-light
--ds-color-purple
--ds-color-purple-light
--ds-color-background
--ds-color-surface
--ds-color-surface-subtle
--ds-color-surface-hover (dark mode only)
--ds-color-text-primary
--ds-color-text-secondary
--ds-color-text-tertiary
--ds-color-inverse-text
--ds-color-divider
--ds-color-border-subtle
--ds-color-error
--ds-color-success
--ds-color-warning
--ds-color-info
```

### Spacing
```
--ds-spacing-0 (0)
--ds-spacing-xs (4px)
--ds-spacing-sm (8px)
--ds-spacing-md (12px)
--ds-spacing-base (16px)
--ds-spacing-lg (24px)
--ds-spacing-xl (32px)
--ds-spacing-2xl (40px)
--ds-spacing-3xl (48px)
--ds-spacing-4xl (64px)
--ds-spacing-5xl (80px)
--ds-spacing-6xl (96px)
```

### Border Radius
```
--ds-radius-sm (6px)
--ds-radius-md (8px)
--ds-radius-lg (12px)
--ds-radius-xl (16px)
--ds-radius-2xl (20px)
--ds-radius-3xl (24px)
--ds-radius-pill (999rem)
--ds-radius-round (50%)
--ds-radius-full (9999px)
```

### Shadows
```
--ds-shadow-soft
--ds-shadow-medium
--ds-shadow-elevated
--ds-shadow-high
--ds-shadow-glow-primary
--ds-shadow-glow-secondary
```

### Typography
```
--ds-font-family-base
--ds-font-family-mono
--ds-font-size-xs (12px)
--ds-font-size-sm (14px)
--ds-font-size-base (16px)
--ds-font-size-md (17px)
--ds-font-size-lg (18px)
--ds-font-size-xl (20px)
--ds-font-size-2xl (24px)
--ds-font-size-3xl (30px)
--ds-font-size-4xl (36px)
--ds-font-size-5xl (48px)
--ds-font-size-6xl (60px)
--ds-font-weight-normal (400)
--ds-font-weight-medium (500)
--ds-font-weight-semibold (600)
--ds-font-weight-bold (700)
--ds-font-weight-extrabold (800)
--ds-line-height-tight (1.25)
--ds-line-height-snug (1.375)
--ds-line-height-normal (1.5)
--ds-line-height-relaxed (1.625)
--ds-line-height-loose (2)
```

### Animations
```
--ds-duration-instant (0ms)
--ds-duration-fast (150ms)
--ds-duration-normal (250ms)
--ds-duration-slow (350ms)
--ds-duration-slower (500ms)
--ds-ease-standard
--ds-ease-emphasized
--ds-ease-decelerated
--ds-ease-accelerated
```

---

## 🛠️ Mixins

### Shadow Mixins
```scss
@include ds-mix.ds-shadow-soft;
@include ds-mix.ds-shadow-medium;
@include ds-mix.ds-shadow-elevated;
@include ds-mix.ds-shadow-high;
@include ds-mix.ds-shadow-glow-primary;
@include ds-mix.ds-shadow-glow-secondary;
```

### Animation Mixins
```scss
@include ds-mix.ds-transition; // All properties, normal duration
@include ds-mix.ds-transition(transform, 'fast', 'emphasized');
@include ds-mix.ds-animate-fade-in;
@include ds-mix.ds-animate-scale-in;
@include ds-mix.ds-animate-slide-up;
```

### Layout Mixins
```scss
@include ds-mix.ds-flex-center;
@include ds-mix.ds-flex-between;
@include ds-mix.ds-flex-column;
@include ds-mix.ds-absolute-center;
@include ds-mix.ds-full-coverage;
```

### Interactive State Mixins
```scss
@include ds-mix.ds-focus-visible; // Keyboard-only focus ring
@include ds-mix.ds-hover-lift; // Lift on hover
@include ds-mix.ds-hover-scale; // Scale on hover
@include ds-mix.ds-hover-glow('primary'); // Glow on hover
@include ds-mix.ds-disabled; // Disabled state
```

### Typography Mixins
```scss
@include ds-mix.ds-text-truncate; // Single line ellipsis
@include ds-mix.ds-text-clamp(3); // Multi-line clamp
```

### Other Mixins
```scss
@include ds-mix.ds-glass(20px); // Glassmorphism effect
@include ds-mix.ds-custom-scrollbar; // Styled scrollbar
@include ds-mix.ds-shimmer; // Loading shimmer effect
```

---

## 📋 Migration Notes

### What Changed
1. **New Design System Layer**: All new styles in `src/scss/design-system/`
2. **CSS Variables**: Theme colors now use CSS variables for easy light/dark switching
3. **Component Updates**: Updated NavbarComponent, App.vue, ErrorAlertComponent, AuthButtonsComponent
4. **Theme System**: New theme utility (`src/utils/theme.js`) with auto-detection
5. **Theme Toggle**: New ThemeToggle component in navbar

### What's Preserved
- **All layouts**: Grid, flex, positioning unchanged
- **All responsive breakpoints**: Mobile/tablet/desktop layouts intact
- **All functionality**: Business logic, state, routing untouched
- **Legacy classes**: Old `.btn`, `.card` classes still work (but now use design system)

### Recommended Next Steps
1. **Test theme switching**: Use the theme toggle button in the navbar
2. **Review component styles**: Check all pages in both light/dark modes
3. **Update remaining views**: Apply design system to HomeView, DashboardView, TodoView, etc.
4. **Create new components**: Use `.ds-*` classes for all new components
5. **Gradual migration**: Replace inline styles with design system tokens over time

---

## 💡 Tips & Best Practices

### DO ✅
- Use CSS variables for all colors, spacing, shadows
- Use `.ds-*` prefixed classes for new components
- Use design system mixins for common patterns
- Test components in both light and dark themes
- Use semantic color names (`primary`, `error`) not literal colors

### DON'T ❌
- Don't hardcode colors (`#F9A548` → use `var(--ds-color-primary)`)
- Don't hardcode spacing (`16px` → use `var(--ds-spacing-base)`)
- Don't mix old and new button classes on same element
- Don't forget `:focus-visible` states for keyboard accessibility
- Don't bypass the theme system with inline styles

---

## 🔍 Examples

### Before (Old Style)
```vue
<style scoped lang="scss">
@use '@/scss/variables' as *;

.my-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
```

### After (Design System)
```vue
<style scoped>
.my-card {
  background: var(--ds-color-surface);
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: var(--ds-radius-xl);
  padding: var(--ds-spacing-xl);
  color: var(--ds-color-text-primary);
  box-shadow: var(--ds-shadow-soft);
}
</style>
```

**Benefits**: Automatic light/dark theme support, consistent spacing, semantic naming

---

## 🎉 Quick Start

1. **Use existing components**:
   ```vue
   <button class="ds-btn ds-btn-primary">Click Me</button>
   ```

2. **Use CSS variables in custom styles**:
   ```vue
   <style scoped>
   .custom {
     color: var(--ds-color-primary);
     padding: var(--ds-spacing-md);
   }
   </style>
   ```

3. **Toggle theme**:
   - Click the sun/moon icon in the navbar
   - Or use `toggleTheme()` from JavaScript

---

## 📞 Support

For questions or issues with the design system:
1. Check this documentation
2. Review example components (ThemeToggle.vue, ErrorAlertComponent.vue)
3. Inspect CSS variables in browser DevTools
4. Check `/Users/michaelgoldman/Projects/todo-project/frontend/src/scss/design-system/` for implementation details

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
**Status**: ✅ Production Ready
