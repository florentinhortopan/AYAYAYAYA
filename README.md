# Army Recruitment Platform

A comprehensive multi-agent AI platform designed to improve army recruitment by offering personalized career paths, recommendations, training (mental and physical), and a gamified community experience.

## 🎯 Features

### For Unregistered Users
- **Personalized Career Paths**: Get tailored recommendations based on your profile
- **Training Previews**: Sample mental and physical training programs
- **Recommendations**: AI-powered career suggestions

### For Registered Users
- **Full Access**: All unregistered features plus:
  - **UGC Content**: User-generated content and community interactions
  - **Detailed Guides**: Comprehensive training and career guides
  - **Financial Assistants**: AI-powered financial planning and benefits calculators
  - **Training & Educational Bots**: Interactive learning and training assistants
  - **Gamification**: Earn points, badges, and achievements
  - **Community Features**: Connect with other recruits and veterans

## 📁 Project Structure

```
├── backend/          # API server, agent orchestration, database
├── frontend/         # User interface (web application)
├── agents/           # AI agent modules (career, training, financial, etc.)
├── shared/           # Shared utilities, types, and common services
└── docker/           # Docker configurations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose (optional)
- PostgreSQL (or use Docker)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development servers
npm run dev
```

### Individual Modules

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 🤖 AI Agents

The platform includes multiple specialized AI agents:

1. **Career Advisor Agent**: Provides personalized career path recommendations
2. **Training Coach Agent**: Mental and physical training guidance
3. **Financial Assistant Agent**: Financial planning and benefits information
4. **Educational Bot**: Interactive learning and knowledge base
5. **Recruitment Agent**: General recruitment guidance and FAQ

## 🏗️ Architecture

- **Monorepo**: Workspace-based structure for modular development
- **Microservices-ready**: Agent modules can be deployed independently
- **API-First**: RESTful API with GraphQL support (optional)
- **Type-Safe**: TypeScript throughout
- **Scalable**: Designed for horizontal scaling

## 📝 License

MIT

