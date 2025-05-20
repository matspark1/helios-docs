# Helios Docs - Matthew Sparkman 2025

## Project Overview
This document summarizes my work on the Helios Docs capstone project - a collaborative document editing platform with real-time editing, user authentication, chat functionality, and document sharing capabilities.

## Link
[Helios Docs](https://heliosdocs.com/)

## 1. Itemized List of My Contributions

### Frontend Components & Pages
- **Authentication System**: 
  - Sign-in page (`/signin/+page.svelte`)
  - Sign-up page (`/signup/+page.svelte`) 
  - Onboarding page (`/onboarding/+page.svelte`)
- **Core Application Pages**:
  - Home dashboard (`/home/+page.svelte`)
  - Documents listing (`/docs/+page.svelte`)
  - Document editor (`/docs/[id]/+page.svelte`)
  - Shared documents (`/shared/+page.svelte`) 
  - Chat system (`/chats/+page.svelte`)
  - Error page (`/error/+page.svelte`)
- **Reusable Components**:
  - Document editor component
  - Document preview component
  - Document search component
  - Chat components (sidebar, view, messages)
  - Header and navigation components
  - Profile management component
  - File sharing buttons/modals

### Styling & UI Design
- **Comprehensive CSS**:
  - Created full styling system (`styles.css`)
  - Implemented dark/light theme toggle
  - Responsive design for mobile/desktop
  - Custom animations and transitions

### Backend Integration
- **Firebase Configuration**:
  - Authentication setup
  - Firestore database integration
  - Security rules implementation
  - Storage setup for document data

### Project Location
All project files are stored in a private GitHub repository. The main application files can be found at:
- Frontend: `src/routes/` (containing all page components)
- Components: `src/lib/components/`
- Services: `src/lib/services/`
- Utilities: `src/lib/util/`
- Styling: `src/styles.css`
