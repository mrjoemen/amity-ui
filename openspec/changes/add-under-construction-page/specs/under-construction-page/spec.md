# Spec Delta

## Purpose

Gives Amity Dental Solutions a branded placeholder page that tells visitors the site is coming soon, and that doubles as a maintenance fallback when the main site is unavailable.

## ADDED Requirements

### Requirement: Branded page content
The page SHALL display the Amity Dental Solutions wordmark logo (which carries the business name), the owner-approved copy below, and the illustration SVG.

#### Scenario: Visitor opens the page
- **WHEN** a visitor loads the under-construction page
- **THEN** the logo, the copy, and the illustration are all visible without interaction

#### Scenario: Exact copy
- **WHEN** the page text is read top to bottom
- **THEN** it shows, in this order and wording:
  - Headline: "Uh oh! You reached the website while it's under construction!"
  - Message: "We're just as stoked as you are at Amity, however, we want to ensure you're provided the best experience possible."
  - Closing line: "We'll be done soon!"
  - Signature: "- Amity Team"

#### Scenario: Page title identifies the business
- **WHEN** the page is shown in a browser tab or search result
- **THEN** the document title includes "Amity Dental Solutions"

### Requirement: Brand colors
The page SHALL style backgrounds, text, and accents only with the brand colors #F5F4F0 (background), #1F3D63 (secondary), #668FAF (primary), and #F7CC4C (accent), each defined in exactly one place. The illustration keeps its own colors.

#### Scenario: Page background and text
- **WHEN** the page renders
- **THEN** the background is #F5F4F0 and all body and heading text is #1F3D63

#### Scenario: Low-contrast colors are not used for body text
- **WHEN** any normal-size text is inspected
- **THEN** it is not colored #668FAF or #F7CC4C, which are used only for large text or decoration

#### Scenario: Brand color changes
- **WHEN** a brand color value is updated in its single definition
- **THEN** every element on the page that uses that color reflects the new value after rebuild

### Requirement: Side-by-side layout on wide screens
On viewports 768px wide or wider, the text block and the illustration SVG SHALL appear side by side in a single row, with the text on the left and the illustration on the right.

#### Scenario: Desktop viewport
- **WHEN** the page is viewed at 1280px wide
- **THEN** the text block and illustration are horizontally adjacent and vertically aligned to each other's centers

#### Scenario: Tablet viewport
- **WHEN** the page is viewed at 768px wide
- **THEN** the text block and illustration are still side by side

### Requirement: Stacked layout on narrow screens
On viewports narrower than 768px, the illustration and text block SHALL stack vertically with the illustration on top, and no content SHALL require horizontal scrolling.

#### Scenario: Phone viewport
- **WHEN** the page is viewed at 360px wide
- **THEN** the illustration appears above the text, both fit within the viewport width, and the page has no horizontal scrollbar

#### Scenario: Illustration scales down
- **WHEN** the viewport is narrower than the illustration's natural width
- **THEN** the illustration scales proportionally to fit without distortion or cropping

### Requirement: Accessible content
The page SHALL meet WCAG 2.1 AA for text contrast, SHALL provide a text alternative for the logo, and SHALL hide the purely decorative illustration from assistive technology.

#### Scenario: Screen reader user
- **WHEN** a screen reader reads the page
- **THEN** it announces the logo's alternative text, the headline as the page's top-level heading, and the message, and does not announce the decorative illustration

#### Scenario: Text contrast
- **WHEN** body and heading text are checked against their background colors
- **THEN** the contrast ratio is at least 4.5:1 for normal text and 3:1 for large text

### Requirement: Reduced motion
The illustration SHALL animate for visitors by default, and SHALL be shown as a still (non-animated) image to visitors whose system requests reduced motion.

#### Scenario: Default motion setting
- **WHEN** a visitor with no reduced-motion preference loads the page
- **THEN** the illustration plays its animation

#### Scenario: Reduced motion requested
- **WHEN** a visitor whose system sets `prefers-reduced-motion: reduce` loads the page
- **THEN** the illustration is shown without any animation

### Requirement: Served routes
The page SHALL be reachable at `/maintenance` at all times, and SHALL be what `/` serves until a landing page exists or whenever maintenance mode is enabled.

#### Scenario: Maintenance path
- **WHEN** a visitor requests `/maintenance`
- **THEN** the under-construction page is returned with HTTP 200

#### Scenario: Root path before launch
- **WHEN** a visitor requests `/` and no landing page has been built
- **THEN** the under-construction page is returned

### Requirement: Self-contained page
The page SHALL render fully without loading any third-party scripts and without requiring client-side JavaScript.

#### Scenario: JavaScript disabled
- **WHEN** the page is loaded with JavaScript disabled
- **THEN** all content and the responsive layout render the same as with JavaScript enabled
