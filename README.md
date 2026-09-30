# Shanudha Tirosh — STX Enterprises Digital Contact Card

A modern, responsive, mobile-first and desktop-optimized digital contact card for **Shanudha Tirosh** (STX Enterprises).

Visitors tap **Save Contact to Phone**, and a standard vCard (`.vcf`) with Shanudha's photo, name, email, website, birthday, and organization is generated in their browser and opened in their device's Contacts app.

- **Name**: Shanudha Tirosh
- **Organization**: STX Enterprises
- **Email**: shanudhatirosh@gmail.com
- **Website**: info.shanutechx.com
- **Birthday**: March 25, 2009 (2009-03-25)
- **Phone & WhatsApp**: +94 75 595 3683

## Features

- **vCard 3.0 Generation with Embedded Photo**: Converts avatar to base64 `PHOTO;TYPE=JPEG;ENCODING=b:...` for full contact import with profile image on iOS and Android.
- **Direct Contacts App Integration**: Triggers iOS contact sheet or Android `.vcf` import with step-by-step modal guide.
- **WhatsApp Integration**: Instant chat link (`wa.me`), WhatsApp Web link, and WhatsApp Contact Share.
- **Modern Responsive Glassmorphism**: High-contrast, dark mode UI with ambient glow gradients, desktop side-by-side card layout, and touch-optimized micro-animations.
- **100% Client-Side & Private**: Runs completely in the browser without third-party dependencies or tracking.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Semantic HTML5 structure, SEO metadata, accessible SVG icons |
| `style.css` | Glassmorphic dark design system, tokens, responsive layout |
| `script.js` | Shanudha Tirosh configuration, vCard 3.0 photo generator, clipboard & share handlers |
| `assets/` | `avatar.jpg`, `favicon.svg`, `qrcode.js` |

## Deploying

This is a static web app ready for deployment:

- **GitHub Pages / Vercel / Netlify / Cloudflare Pages**: Drag and drop or link repository. No build step required.
