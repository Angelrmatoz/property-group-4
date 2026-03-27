# Backend Agents

This document outlines the different agents involved in the development and maintenance of the Property Group 4 backend.

## Key Agents:

### 1. API Gateway Agent

- **Role**: Acts as the single entry point for all client requests, routing them to the appropriate microservices or handlers.
- **Technologies**: Express.js, NestJS.
- **Responsibilities**:
  - Request routing.
  - Authentication and authorization (initial checks).
  - Rate limiting and traffic management.

### 2. Authentication and Authorization Agent

- **Role**: Manages user authentication (verifying user identity) and authorization (determining user permissions).
- **Technologies**: Passport.js, JWT, OAuth.
- **Responsibilities**:
  - User registration and login.
  - Token generation and validation.
  - Role-based access control.

### 3. Data Access Agent

- **Role**: Handles all interactions with the database, abstracting database operations from business logic.
- **Technologies**: Mongoose (for MongoDB), TypeORM, Sequelize.
- **Responsibilities**:
  - CRUD operations on database models.
  - Data validation and schema enforcement.
  - Connection management.

### 4. Business Logic Agent

- **Role**: Contains the core business rules and processes of the application.
- **Technologies**: Node.js, TypeScript.
- **Responsibilities**:
  - Implementing application-specific logic.
  - Orchestrating data flow between other agents.
  - Ensuring data integrity and consistency.

### 5. Messaging/Notification Agent

- **Role**: Manages asynchronous communication, such as sending emails, push notifications, or inter-service messages.
- **Technologies**: RabbitMQ, Kafka, AWS SQS, Nodemailer.
- **Responsibilities**:
  - Queuing and processing messages.
  - Sending notifications to users.
  - Decoupling services through event-driven architecture.

### 6. Configuration Agent

- **Role**: Manages application settings, environment variables, and secrets.
- **Technologies**: `dotenv`, `config` library.
- **Responsibilities**:
  - Loading configuration from various sources (environment variables, files).
  - Providing configuration values to other agents.
  - Securing sensitive information.

---

## 🤖 Critical Notes for AI Agents working on this project:

- **MongoDB Connection:** Due to DNS resolution issues (`ECONNREFUSED` / `querySrv`) in the local Node.js environment on Windows, the `MONGODB_URI` environment variable specifically uses the classical `mongodb://` format with explicit replica set nodes (e.g. `mongodb://user:pass@node1,node2,node3/?replicaSet=...`) instead of the `mongodb+srv://` format. **DO NOT** change the connection string back to `mongodb+srv://`, as it will break the backend connection to the database.
