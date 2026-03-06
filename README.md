# Kabiraj Rana Portfolio

A modern full-stack personal website and AI/ML portfolio built to present my work, research, projects, technical journey, and professional identity with a world-class product feel.

Live domain: `kabirajrana.com.np`

---

## Overview

This website is my personal digital platform for presenting:

- AI/ML-focused projects
- research and experiments
- technical skills and tools
- professional experience
- certifications and achievements
- contact and collaboration opportunities

The platform is designed not just as a portfolio, but as a scalable personal brand system with an admin panel for managing content professionally.

---

## Core Goals

- Build a premium personal website with modern 2026 design quality
- Present myself as an AI/ML-focused engineer and builder
- Manage portfolio content through an admin panel
- Keep the architecture scalable for future growth
- Maintain production-grade structure, security, and deployment practices

---

## Key Features

### Public Website
- Modern landing page
- Hero section with strong positioning
- About section
- Skills and tech stack
- Featured projects
- Research section
- Experience section
- Certifications and achievements
- Contact section
- Responsive design for desktop, tablet, and mobile
- SEO-friendly structure
- Fast-loading production deployment

### Admin Panel
- Secure admin authentication
- Dashboard for content management
- Manage projects
- Manage research entries
- Manage experience
- Manage contact information
- Manage featured content visibility
- Structured content updates without hardcoding

### Backend
- REST/API-based architecture
- Database-driven content management
- Environment-based configuration
- Secure authentication and protected admin routes

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Modern responsive UI architecture

### Backend
- Node.js / API layer
- Prisma ORM
- PostgreSQL

### Deployment
- Vercel for frontend
- Railway for backend
- Custom domain support

---

## Project Structure

```bash
kabiraj-rana-portfolio/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── sections/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   └── .env
│
└── README.md
