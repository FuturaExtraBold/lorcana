# Lorcana Demo

A 3D interactive card viewer for Disney's Lorcana trading cards built with React Three Fiber.

## What It Does

Displays 204 Lorcana cards arranged in a 3D cylinder. Users can:

- Rotate the view with mouse drag
- Hover over cards to highlight them
- Click to open cards and view them full-screen with tilt controls
- Watch the background gradient animate to match the card's ink color
- See cards fade in with a staggered loading animation

## Quick Start

```bash
# Install dependencies
npm install

# Dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React** - UI framework
- **Three.js & React Three Fiber** - 3D rendering
- **GSAP** - Animation library
- **Vite** - Build tool

## Project Structure

```text
src/
├── components/     # Card, Cylinder, Loading, Logo
├── hooks/          # Animation and state hooks
├── context/        # React context (hover state)
├── constants/      # Colors, card config
├── styles/         # CSS
└── App.jsx         # Main app
```
