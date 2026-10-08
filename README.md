# SaaSquatch Opportunity Intelligence

AI-ready lead prioritization for SaaSquatch: answer **which lead should I contact first, why now, and what should I do next?**

## Features
- Explainable opportunity score and score breakdown
- Buying signals: funding, hiring growth, technology fit, decision maker
- Corporate relationships: parent, subsidiary, acquisition, related company
- Data-confidence score
- Why Now and Next Best Action recommendations
- Lead search, score sorting and signal filtering
- React + TypeScript dashboard
- Spring Boot REST API with PostgreSQL/H2 persistence
- Seeded demo data
- Unit tests and GitHub Actions CI
- Docker Compose for local deployment

## Architecture
`React/Vite -> Spring Boot REST -> Service/Scoring Engine -> Spring Data JPA -> PostgreSQL`

H2 is used for tests. The scoring engine is deterministic and explainable; it does not invent external company facts.

## Run locally
Requirements: Java 17+, Maven 3.9+, Node 20+, Docker (optional).

### Backend
```bash
cd backend
mvn spring-boot:run
```
API: `http://localhost:8080/api/leads`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Dashboard: `http://localhost:5173`

### Docker
```bash
docker compose up --build
```

## API
- `GET /api/health`
- `GET /api/leads`
- `GET /api/leads?search=acme&minScore=70&signal=HIRING_GROWTH`
- `GET /api/leads/{id}`
- `GET /api/leads/{id}/intelligence`
- `GET /api/leads/{id}/relationships`

## Challenge rationale
The reference SaaSquatch workflow is lead generation. This enhancement focuses the sales workflow on **prioritization and actionability**, reducing the time spent reviewing low-value leads. Corporate relationships add account-level context that can reveal expansion opportunities without claiming facts that have not been verified.

## Scoring model
Base score is 0-100:
- Revenue potential: 20
- Growth: 18
- Technology fit: 17
- Decision maker: 15
- Industry fit: 14
- Corporate relationship: 6
- Data confidence: 10

Signals are persisted and contribute to the corresponding factors. The UI exposes the exact breakdown so the score is auditable.

## Production notes
- PostgreSQL is the production datastore.
- Add Redis for high-volume caching of intelligence responses.
- Host the static frontend on a CDN and the Spring Boot API as a container/serverless-compatible service.
- CI runs Maven tests/package and the frontend production build.
- Only use legally collected/authorized lead data and respect site terms, robots directives and applicable privacy laws.
