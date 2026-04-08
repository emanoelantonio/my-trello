# 🚀 My Trello — Modern Fullstack App

> A production-grade Trello-inspired project built with modern web technologies to demonstrate fullstack architecture, scalability patterns, and clean code principles.

---

## 📌 About The Project

This project is a modern implementation of a Kanban-style task management system inspired by Trello.

The goal is not just to replicate features, but to demonstrate:

* Modern React architecture
* Server-first data patterns
* Scalable folder organization
* Clean code and maintainability
* Real-world production practices

This project is part of my continuous study of modern frontend and fullstack technologies.

---

## 🧠 Tech Stack

### Core

* Next.js (App Router)
* React Server Components
* Server Actions
* TypeScript

### Styling & UI

* Tailwind CSS
* shadcn/ui
* Lucide Icons

### State & Interaction

* dnd-kit (Drag and Drop)

### Backend / Database

* Supabase (PostgreSQL + Auth + Realtime)

### Package Manager

* pnpm

---

## 🏗️ Architecture

This project follows a **feature-based architecture**, organizing code by domain instead of generic folders.

```
src/
  app/
    (auth)/
    (dashboard)/
  features/
    board/
    list/
    card/
  lib/
  types/
```

### Architectural Principles

* Server-first data fetching
* Minimal client-side JavaScript
* Clear separation between UI and business logic
* Scalable structure for future features

---

## ✨ Features (Planned & In Progress)

### ✅ Core

* User authentication
* Create / edit / delete boards
* Create / edit / delete lists
* Create / edit / delete cards
* Drag and drop reordering

### 🔄 Advanced

* Realtime updates
* Optimistic UI updates
* Role-based permissions
* Board collaboration
* Activity history

---

## ⚙️ Getting Started

### 1. Clone the repository

```
git clone <your-repo-url>
cd trello-clone
```

### 2. Install dependencies

```
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 4. Run development server

```
pnpm dev
```

---

## 🚀 Deployment

The project is optimized for deployment on Vercel.

---

## 📈 Why This Project Matters

This is not just a CRUD demo.

It demonstrates:

* Understanding of modern React mental models
* Server vs Client component architecture
* Fullstack integration
* Clean folder organization
* Real-world engineering decisions

---

## 🛣️ Roadmap

* [ ] Authentication
* [ ] Database schema
* [ ] Dashboard layout
* [ ] Board page
* [ ] Drag and drop
* [ ] Realtime sync
* [ ] Production deployment

---

## 👨‍💻 Author

Emanoel Silva
Frontend Developer

---

## 📄 License

This project is for portfolio and educational purposes.
