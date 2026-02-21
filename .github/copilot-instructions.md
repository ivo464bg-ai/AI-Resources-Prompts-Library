# 1. Project Assignment: AI Resources & Prompts Library

Using AI-assisted development, implement and deploy a fully functional multi-page JS app.

**AI Resources & Prompts Library**: implement a secure, personal management system where users can register, create categories, and save their AI prompts, experimental queries, and AI-generated results.
* A user's library has **Categories**, which organize the AI resources (e.g., Image Generation, Code Analysis, Creative Writing).
* Users can **create, edit, and delete their own categories**.
* Users can **add, edit, and delete prompts** within a category. 
* Prompts have a **Title, Prompt Text, Result/Output text (rich text), and Status**.
* Users can view and search their saved prompts easily.

**Optionally (at a later stage)**, you may implement additional functionality:
* **Attachments:** attach screenshots (e.g., AI-generated images) or PDF documents to specific prompts.
* **Admin panel (for the admin role):** list / view / edit / delete categories, prompts, and users globally.
* **Prompt Versioning:** keep a history of how a prompt was changed to achieve a better result.
* **Paging / infinite scrolling:** for users with 100+ saved prompts.
* **Tags/Labels:** assign multiple tags to prompts for better filtering.

# 2. Project Requirements

These are the core project requirements the AI dev agent must follow strictly.

## Technologies
* **Frontend:** Implement the app in HTML, CSS, JavaScript, and Bootstrap. Use standard UI components. Keep it simple, STRICTLY WITHOUT TypeScript and WITHOUT UI frameworks like React, Angular, or Vue.
* **Backend:** Use Supabase as a backend (database, authentication, and storage).
* **Build tools:** Node.js, npm, Vite.
* **Deployment:** Netlify.

## Architecture
* Use Node.js, npm, and Vite to structure the app with modular components.
* Use **multi-page navigation** (instead of a single page with popups) and keep each page in a separate file.
* Use **modular design**: split the app into self-contained components (e.g., UI pages, services, utils) to improve project maintenance. 
* When reasonable, use separate files for the UI, business logic, styles, and other app assets. Avoid big and complex monolith code.

## User Interface (UI)
* Place different app pages in separate files (for better maintenance).
* Implement responsive design for desktop and mobile browsers.
* Implement a modern and user-friendly UI design, using Bootstrap components and custom styles.
* Use icons, effects, and visual cues to enhance user experience and make the app more intuitive. Include Toast notifications for system feedback.

## Backend
* Use Supabase as a backend to keep all app data.
* Use Supabase DB for data tables.
* Use Supabase Auth for authentication (users, register, login, logout).
* Use Supabase Storage to upload files at the server-side.

## Authentication and Authorization
* Use Supabase Auth for authentication and authorization with JWT tokens.
* Implement users (register, login, logout) and roles (normal and admin users).
* Use **Row-Level Security (RLS)** policies to implement strict access control. Privacy is paramount: users must only see and edit their own private prompts.
* If role-based access control (RBAC) is needed, use a `user_roles` table + RLS to implement it.
* Implement an admin panel for special users, different from regular users.

## Database
* Use best practices to design the Supabase DB schema, including normalization, indexing, and relationships.
* When changing the DB schema, always use Supabase migrations.
* Sync the DB migrations history from Supabase to a local project folder.

## Storage
* Store app user files (like AI-generated photos and documents) in Supabase Storage.
* The project must include file upload and download functionality tied to the prompt entries.

## Deployment
* The project should be deployed live on the Internet (e.g., Netlify).
* Provide sample credentials to simplify app testing.

## GitHub Repo
* Commit and push each successful change during development to maintain a clear history.

## Documentation
* Generate project documentation in the GitHub repository (README.md).
* Include: Project description, Architecture, Database schema design, Local development setup guide, and Key folders/files purpose.