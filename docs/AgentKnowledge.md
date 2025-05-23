# AquaDex Project Knowledge Document for AI Agents

## Project Overview

AquaDex is a comprehensive web application designed to assist aquarium enthusiasts in various aspects of fishkeeping. It provides tools and resources for managing aquariums, finding and identifying fish and plants, locating deals and local stores, analyzing water parameters, and connecting with other hobbyists.

## Key Features

*   **Aquarium Management:** Track multiple aquariums, including details about inhabitants, equipment, and maintenance.
*   **Fish and Plant Finder:** Search and identify fish and plant species with detailed information.
*   **Marketplace:** Buy and sell aquarium-related items, connect with breeders and sellers.
*   **Discounts and Deals:** Find ongoing promotions and deals from online and local stores.
*   **Filtration, Lighting, and Tank Finder:** Tools to help users select appropriate equipment.
*   **Water Analysis:** Analyze water test strip images and receive recommendations (AI-powered).
*   **Treatment Recommendations:** Suggest suitable treatment products for common issues (AI-powered).
*   **Q&A Forum:** A platform for users to ask and answer questions.
*   **Reminders:** Set reminders for maintenance tasks.
*   **User Profiles:** Manage personal information and track activity.

## Technical Stack

*   **Frontend:**
    *   React
    *   Next.js (App Router)
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn UI (likely for UI components)
*   **Backend:**
    *   Node.js (implied by Next.js and `package.json`)
    *   Firebase (App Hosting, potentially other services like Firestore, Authentication)
*   **AI/ML:**
    *   Genkit (for building AI flows)
    *   Likely integrates with models for image analysis and recommendations.

## Project Structure (Relevant Directories)

*   `src/app/`: Next.js App Router pages (routing and page components).
*   `src/components/`: Reusable React components.
*   `src/components/ui/`: UI components (likely from Shadcn UI).
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and server actions.
*   `src/types/`: TypeScript type definitions.
*   `src/ai/`: AI-related code.
    *   `src/ai/flows/`: Specific AI workflows (e.g., `analyze-test-strip.ts`).

## Design Guidelines and Principles

*   **User-Centric Design:** Prioritize a user-friendly and intuitive interface for both beginners and experienced fishkeepers.
*   **Mobile-First Responsiveness:** Ensure the application is fully responsive and works well on various screen sizes.
*   **Accessibility:** Adhere to accessibility guidelines to make the application usable for all.
*   **Performance:** Optimize for fast loading times and smooth interactions.
*   **Modularity:** Design components and code in a modular way for reusability and maintainability.
*   **Consistent Styling:** Maintain a consistent visual style throughout the application using Tailwind CSS and Shadcn UI.
*   **Clear Code:** Write clean, well-commented, and readable code following TypeScript best practices.
*   **AI Integration:** Seamlessly integrate AI features to provide valuable insights and assistance to users.

## AI Agent Collaboration Notes

*   AI agents working on this project should be familiar with the technical stack, particularly Next.js, TypeScript, and Genkit.
*   Understand the existing AI flows in `src/ai/flows/` and how they are integrated into the application.
*   When developing new features or modifying existing ones, consider how AI can enhance the user experience.
*   Adhere to the design guidelines and coding standards established in the project.
*   Refer to `docs/ProjectDocumentation.md` and `docs/blueprint.md` for more detailed information about the project's architecture and plans.