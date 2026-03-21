# Bento Enterprise - Data Analysis Dashboard

## Project Overview

**Purpose:** This project is an interactive and advanced web application designed to perform complex analysis on Trouble Ticket (N1 Support) operations data. It allows users to securely upload CSV or TSV files in their browser to get detailed visualizations, key metrics, and performance rankings across multiple specialized dashboards.

**Main Technologies:**
*   **Framework Core:** Astro 6 (for routing and initial load performance)
*   **UI Library:** React 18 (for the interactive engine and application state)
*   **Styling:** Tailwind CSS v4 (using the `@theme` directive in pure CSS)
*   **UI Components:** Custom components inspired by Shadcn/UI and Radix UI primitives
*   **Data Parsing:** PapaParse (for ultra-fast client-side CSV/TSV processing)
*   **Visualizations:** Chart.js + `react-chartjs-2`
*   **Icons:** Lucide React
*   **Language:** TypeScript

**Architecture:**
The application follows Clean Architecture principles adapted for the frontend to enforce a strict separation of concerns:
*   `src/layouts/`: Base Astro templates (e.g., `Layout.astro`) that configure the global theme, typography (Geist), and main canvas.
*   `src/pages/`: Astro entry points. `index.astro` mounts the React Single Page Application (SPA).
*   `src/components/ui/`: Reusable, generic UI components (buttons, tables, accordions, etc.).
*   `src/components/specific/`: Complex business views and dashboard tabs (e.g., `GeneralAnalysisDashboard.tsx`, `WeeklyAnalysisView.tsx`).
*   `src/domain/`: Pure business rules (e.g., `caseAnalysis.ts`). Stateless, UI-independent functions that transform raw CSV data into calculated metrics (SLAs, AHT, etc.).
*   `src/application/hooks/`: Orchestration logic (e.g., `useCaseData.ts`) that connects the UI with the domain via React Hooks.
*   `src/styles/`: Base CSS files (`global.css`, `theme.css`) defining variables and custom classes (like "Bento Grid" cards).

## Building and Running

**Prerequisites:** Node.js (v18.0 or higher)

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Start development server:**
    ```bash
    npm run dev
    ```
    (Runs at `http://localhost:4321` by default)
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Preview production build:**
    ```bash
    npm run preview
    ```

*(Note: No explicit testing commands are defined in `package.json` at this time.)*

## Development Conventions

*   **Visual Design:** Adheres strictly to a "Bento Grid" visual architecture, prioritizing managerial readability, high data contrast, and asymmetrical cards with subtle borders.
*   **Theming & Accessibility:** Native and persistent support for Dark / Light modes is required. The semantic color palette (Indigo, Emerald, Amber, Sky Blue) must adapt to guarantee accessible contrast in both modes.
*   **Separation of Concerns:** Strict isolation of domain logic (calculations like SLAs, Resolution Times, ASA, ASQ, and AHT) from UI components. All business logic must reside in `src/domain/`.
*   **Data Processing:** All CSV/TSV file processing occurs safely on the client-side. Do not introduce server-side processing for these files.
*   **Styling Approach:** Uses Tailwind CSS v4 directly in CSS files using the new `@theme` directive.
