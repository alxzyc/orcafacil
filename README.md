# OrçaFácil

**A simple, open-source quotation and pricing platform for freelancers and small businesses.**

OrçaFácil is a SaaS platform designed to help freelancers, independent professionals, and small businesses create professional quotes, calculate service prices, and manage commercial proposals.

The goal is to make professional pricing and quotation management accessible, simple, and transparent.

## ✨ Features

- **Quote Management** — Create, edit, organize, and manage commercial proposals.
- **Smart Pricing** — Calculate prices based on labor, costs, hours, and profit margins.
- **Manual Pricing** — Set custom prices whenever needed.
- **Client Management** — Organize customer information and maintain client records.
- **Service Catalog** — Create reusable services with predefined prices and descriptions.
- **Public Proposal Portal** — Share proposals through secure links.
- **Proposal Approval** — Allow clients to review, accept, or reject proposals.
- **PDF Generation** — Generate professional quotation documents.
- **Dashboard** — Track proposals, approvals, and business performance.

> Features are subject to implementation progress. Check the project roadmap for current development status.

## 🎯 Project Goals

OrçaFácil aims to:

- Reduce the time spent creating commercial proposals.
- Help freelancers calculate fair and sustainable prices.
- Simplify communication between professionals and clients.
- Provide accessible tools for small businesses.
- Offer a free and open-source alternative to expensive quotation management platforms.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Supabase | Backend infrastructure |
| PostgreSQL | Database |
| Supabase Auth | Authentication |
| Supabase RLS | Data security |
| Zod | Data validation |
| React Hook Form | Form management |

## 🏗️ Architecture

OrçaFácil follows a modular architecture, separating interface components, business logic, and infrastructure.

```text
orcafacil/
├── public/
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── providers/
│   │   └── layouts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── services/
│   │   ├── quotes/
│   │   └── settings/
│   │
│   ├── domain/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── lib/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── package.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/orcafacil.git
```

Navigate to the project directory:

```bash
cd orcafacil
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Never expose your Supabase service role key or other privileged secrets in frontend environment variables.

### Development

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run type checking:

```bash
npm run typecheck
```

## 🔐 Security

Security is a fundamental part of OrçaFácil.

The project is designed around the following principles:

- Row Level Security (RLS) for user data isolation.
- Secure authentication through Supabase Auth.
- Server-side validation for sensitive operations.
- Secure public proposal access using unique tokens.
- No exposure of private business information through public endpoints.
- Financial calculations validated outside the client interface.

Security vulnerabilities should be reported responsibly rather than disclosed publicly before they are addressed.

## 🗺️ Roadmap

- [ ] Project foundation and architecture
- [ ] Supabase database schema and migrations
- [ ] Authentication and user profiles
- [ ] Client management
- [ ] Service catalog
- [ ] Manual pricing engine
- [ ] Assisted pricing engine
- [ ] Quote creation and management
- [ ] Public proposal portal
- [ ] Proposal acceptance and rejection
- [ ] PDF generation
- [ ] Business dashboard
- [ ] Automated tests
- [ ] Production deployment

## 🤝 Contributing

OrçaFácil is an open-source project, and contributions are welcome!

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

Please keep contributions focused, documented, and consistent with the project's architecture.

For significant changes, consider opening an issue first to discuss the proposal.

## 📄 License

This project is intended to be open-source.

The specific license will be defined in the repository's `LICENSE` file.

## 💡 Philosophy

**Good tools shouldn't be exclusive to big businesses.**

OrçaFácil exists to help independent professionals work smarter, value their work properly, and present themselves professionally.

---

Made with ❤️ by the open-source community.

**OrçaFácil — Your work deserves the right price.**
