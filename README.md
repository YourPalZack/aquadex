# AquaDex - The Fishkeeper's Toolkit

Welcome to AquaDex! A cloud-native Next.js application designed to be the ultimate toolkit for aquarium enthusiasts.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials

# Set up database (see docs/NEON_SETUP.md)
npx prisma migrate dev

# Run development server
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002) to see the application.

## 📚 Documentation

- **[Project Constitution](./.specify/memory/constitution.md)** - Core principles and governance
- **[Project Documentation](./docs/ProjectDocumentation.md)** - Complete feature overview
- **[Neon Database Setup](./docs/NEON_SETUP.md)** - Cloud database configuration
- **[Master Project Plan](./docs/MASTER_PROJECT_PLAN.md)** - Implementation roadmap
- **[AI Agent Guide](./docs/AgentKnowledge.md)** - For AI-assisted development

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Database:** Neon PostgreSQL (serverless)
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **AI:** Genkit with Google AI
- **Styling:** Tailwind CSS + Shadcn UI
- **Forms:** React Hook Form + Zod

## ✨ Features

- 🧪 **Water Testing** - AI-powered test strip analysis
- 🐠 **Aquarium Management** - Track tanks, parameters, and maintenance
- 🔍 **Smart Finders** - AI-assisted product discovery (fish, plants, equipment)
- 🛒 **Marketplace** - Community buying and selling
- 💬 **Q&A Forum** - Community support and discussions
- 📊 **History Tracking** - Monitor trends over time
- 🔔 **Reminders** - Maintenance notifications

## 🏗️ Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components by feature
├── ai/flows/        # Genkit AI workflows
├── lib/             # Utilities and server actions
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
```

## 📋 Development Principles

This project follows strict architectural principles defined in our [constitution](./.specify/memory/constitution.md):

1. **Component-First** - Modular, reusable React components
2. **Cloud-Native** - No localhost dependencies, fully browser-testable
3. **User Story Prioritization** - P1/P2/P3 for focused delivery
4. **AI-Enhanced** - Genkit flows exposed via API routes
5. **Type Safety** - Strict TypeScript + Zod validation
6. **Mobile-First** - Responsive design with Tailwind

## 🚦 Scripts

```bash
npm run dev          # Start Next.js dev server (port 9002)
npm run genkit:dev   # Start Genkit dev UI
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

## 🔍 Debug & Testing

```bash
# Run comprehensive application audit
./scripts/debug-test.sh

# The debug test checks:
# - Environment setup
# - File integrity
# - Security vulnerabilities
# - TypeScript type checking
# - Build status
# - Dependencies
# - Source code analysis
# - Configuration files
# - Documentation

# Results are saved to debug_test_results.txt
# See docs/AUDIT_REPORT.md for detailed findings
```

## 🔐 Environment Setup

Required environment variables (see `.env.example`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client configuration
- `FIREBASE_ADMIN_*` - Firebase admin credentials
- `GOOGLE_GENAI_API_KEY` - Google AI API key

## 🤝 Contributing

1. Review the [Project Constitution](./.specify/memory/constitution.md)
2. Check [Frontend Todo](./docs/FrontendTodo.md) for available tasks
3. Follow the feature development workflow in the constitution
4. Ensure all quality gates pass before submitting

## 📄 License

[Add your license information]

## 🆘 Support

- Check [documentation](./docs/ProjectDocumentation.md)
- Review [troubleshooting guide](./docs/NEON_SETUP.md#troubleshooting)
- Open an issue for bugs or feature requests
