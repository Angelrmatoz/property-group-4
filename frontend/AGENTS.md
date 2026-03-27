# Frontend Agents

This document outlines the different agents involved in the development and maintenance of the Property Group 4 frontend.

## Key Agents:

### 1. User Interface (UI) Agent
- **Role**: Responsible for rendering the user interface, handling user input, and displaying data.
- **Technologies**: React, TypeScript, CSS frameworks (e.g., Tailwind CSS).
- **Responsibilities**:
    - Component rendering and state management.
    - User interaction handling (clicks, form submissions, etc.).
    - Data presentation.

### 2. API Interaction Agent
- **Role**: Manages communication with the backend API, sending requests and handling responses.
- **Technologies**: Axios, Fetch API.
- **Responsibilities**:
    - Constructing API requests.
    - Handling API responses, including error handling.
    - Data serialization/deserialization.

### 3. State Management Agent
- **Role**: Centralizes and manages the application's state, ensuring data consistency across components.
- **Technologies**: Redux, Zustand, React Context API.
- **Responsibilities**:
    - Defining and updating application state.
    - Providing state to various components.
    - Handling side effects related to state changes.

### 4. Routing Agent
- **Role**: Manages navigation within the single-page application, mapping URLs to specific components.
- **Technologies**: React Router.
- **Responsibilities**:
    - Defining application routes.
    - Handling URL changes and component rendering based on routes.
    - Implementing navigation guards if necessary.

### 5. Authentication Agent
- **Role**: Handles user authentication and authorization processes.
- **Technologies**: JWT (JSON Web Tokens), OAuth.
- **Responsibilities**:
    - User login and logout.
    - Managing authentication tokens.
    - Protecting routes based on user roles/permissions.

### 6. Validation Agent
- **Role**: Ensures that user input meets predefined criteria before processing or sending to the backend.
- **Technologies**: Yup, Zod, Formik.
- **Responsibilities**:
    - Validating form fields.
    - Providing immediate feedback to users on input errors.
    - Preventing invalid data from being submitted.

---

## 🤖 Critical Notes for AI Agents working on the frontend:

- **Strict Session Destruction:** The application implements a highly secure session destruction mechanism for users traversing back to the `/login` route without a `localStorage` memory token ("Remember Me"). The `page.tsx` within `/login` executes `clearAuthToken()` immediately on mount for non-persistent sessions to prevent unauthorized back-navigation to the dashboard. **DO NOT** remove this strict cleanup logic when refactoring the authentication flow.
- **Environment URLs:** Never use `window.location.host` or local paths for API requests in Server-side requests. `NEXT_PUBLIC_BACKEND_URL` is configured for client-side API calls to correctly hit the Azure Container Apps.
