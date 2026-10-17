# System Patterns & Architecture Guidelines

## Architecture Overview
- **Next.js App Router**: Uses directory-based routing inside `src/app/`.
- **Server vs Client Boundary**:
  - Keep landing and informational pages as **Server Components** for instant static generation and minimal JS payloads.
  - Keep interactive features (such as interview session state, forms, timers) in dedicated **Client Components** (`"use client"`).
- **Styling Standards**:
  - Tailwind CSS v4 syntax (`@import "tailwindcss"`).
  - Explicit inline colors and Tailwind utilities for reliability:
    - Primary Navy: `bg-[#0a2540]`, `text-[#0a2540]`, `hover:bg-[#071b30]`
    - Saffron/Amber: `text-amber-600`, `bg-amber-500`, `border-amber-400`
    - Base White: `bg-white`, `text-slate-900`
  - Inline semantic SVGs with `aria-hidden="true"` (no bloated icon library packages).

## Component Conventions
- Use Next.js `<Link>` component for all internal client transitions.
- Semantic HTML tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<label>`, `<textarea>`.
- Form validation patterns:
  - Input limits (e.g. min 50 chars, max 1500 chars).
  - Explicit visual and screen-reader status indicators (`aria-describedby`, `role="progressbar"`).
- Prerendering Safety:
  - Avoid unstable dynamic expressions like `new Date().getFullYear()` in static components; use static constants or client state to prevent Next.js 16 prerender errors.
