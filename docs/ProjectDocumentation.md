# AquaDex Project Documentation

## Project Overview

AquaDex is a NextJS web application developed within Firebase Studio. The primary goal of AquaDex is to provide aquarium enthusiasts with a comprehensive toolkit for managing their aquariums effectively. This includes features for water analysis, tracking, AI-powered insights, and community engagement.

## Documentation Index

### Governance & Architecture
- **[Project Constitution](../.specify/memory/constitution.md)** - Core principles and governance (v1.0.0)
- **[Application Sitemap](./SITEMAP.md)** - Complete URL structure and navigation hierarchy
- **[Master Project Plan](./MASTER_PROJECT_PLAN.md)** - Complete roadmap and implementation phases

### Feature Documentation
- **[Feature Documentation](./features/)** - Detailed documentation for each feature area:
  - [Aquarium Management](./features/aquarium-management/) - Tank profiles, parameters, and maintenance
  - [Water Testing](./features/water-testing/) - AI-powered test analysis and tracking
  - [AI Tools](./features/ai-tools/) - Intelligent product discovery suite
  - [Marketplace](./features/marketplace/) - Community buying and selling platform
  - [Community](./features/community/) - Q&A forum and local resources
  - [User Management](./features/user-management/) - Authentication and profiles

### Development Guides
- **[Neon Database Setup](./NEON_SETUP.md)** - Complete guide for setting up cloud PostgreSQL
- **[AI Agent Guide](./AgentKnowledge.md)** - Technical guide for AI assistants
- **[Frontend Todo](./FrontendTodo.md)** - Missing pages and components to implement

## Features

AquaDex includes the following key features:

*   **Image Upload:** Allows users to upload images of their aquarium test strips directly from their devices.
*   **Image Preprocessing:** Processes uploaded images to identify and isolate the colorimetric pads on the test strip, preparing them for AI analysis.
*   **AI Parameter Analysis:** Employs an AI-powered tool to accurately determine water parameters based on the color values extracted from the test strip image. This involves correlating color values to known scales and providing estimated readings.
*   **Parameter Display:** Presents clear and immediate feedback on detected water parameters, highlighting any values that fall outside the ideal range for a healthy aquarium.
*   **Historical Data Tracking:** Enables users to store and review historical water parameter data, allowing them to monitor trends and the stability of their aquarium's water quality over time.
*   **Water Change Tracking & Notifications:** Tracks water changes for each aquarium managed within the app and sends email notifications to remind users when it's time for their next water change.
*   **Social Sharing:** Provides functionality for users to easily share individual test results or their full test history with others.
*   **Recommended Treatment Products:** Recommends relevant treatment products to users based on their water parameter analysis results, utilizing Amazon's API for product suggestions.
*   **Community Support Forum (Q&A):** A dedicated Q&A section where registered users can ask questions and receive answers from other members of the AquaDex community. Includes account registration and reporting functions for abusive content.
*   **Classified Marketplace:** A marketplace feature allowing users to list and find aquarium-related items such as fish, plants, and equipment for sale or trade within the AquaDex community.
*   **Fish Food Management**: Allows users to input specific fish foods, and the application generates Amazon purchase links.
*   **Water Treatment Management**: Allows users to input water treatment chemicals, and the application generates Amazon purchase links.
*   **Fish Finder**: Users can search for specific fish or invertebrates, and the AI simulates finding listings from various sources.

## Technical Requirements

AquaDex is built upon the following technical stack and dependencies (aligned with [Project Constitution](../.specify/memory/constitution.md)):

### Core Framework
*   **Framework:** Next.js 15+ with App Router
*   **Language:** TypeScript 5+ (strict mode)
*   **Runtime:** Node.js

### Database & Storage
*   **Primary Database:** Neon PostgreSQL (serverless, cloud-hosted) - see [setup guide](./NEON_SETUP.md)
*   **ORM:** Prisma or Drizzle (for type-safe database access)
*   **File Storage:** Firebase Storage (for images)
*   **Authentication:** Firebase Authentication

### AI/ML Integration
*   **AI Framework:** Genkit with Google AI
*   **AI Flows:** Located in `src/ai/flows/`
*   **Use Cases:** Water parameter analysis, product discovery, treatment recommendations

### Frontend Stack
*   **Styling:** Tailwind CSS
*   **Component Library:** Shadcn UI
*   **Icon Library:** Lucide React
*   **Form Management:** React Hook Form with Zod validation

### External APIs
*   **Amazon Product API:** Product recommendations (simulated via AI flows)
*   **Email Service:** For notifications (configurable provider)

### Development Tools
*   **Package Manager:** npm
*   **Code Quality:** ESLint, TypeScript compiler
*   **Environment:** `.env.local` for configuration

## Design Guidelines

AquaDex's design adheres to the following guidelines to ensure a visually appealing and user-friendly experience:

*   **Primary Color:** Deep turquoise (#45B6FE), used to evoke a sense of clarity and depth associated with aquarium water.
*   **Background Color:** Light cyan (#E0F7FA), providing a clean, airy, and spacious feel throughout the application.
*   **Accent Color:** Muted teal (#4DB6AC), utilized for interactive elements such as buttons and calls to action to provide visual cues.
*   **Typography:** Clean and modern sans-serif fonts are used for optimal readability. The application utilizes Shadcn UI's default typography settings for consistency across all components.
*   **Icons:** Simple and clear icons, sourced from the Lucide library, are used to represent different water parameters, features, and functions within the app, ensuring easy visual identification.
*   **Layout:** The application features an intuitive and well-organized layout to facilitate easy navigation and understanding of data. Shadcn UI's grid and spacing utilities are leveraged to ensure a responsive design that adapts well to various screen sizes.
