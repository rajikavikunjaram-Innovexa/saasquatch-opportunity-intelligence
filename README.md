# SaaSquatch Opportunity Intelligence

A full-stack lead prioritization dashboard for SaaSquatch-style sales data. The application helps a sales user decide **which lead to contact first, why the account is timely, and what action to take next**.

## What it includes

- Explainable opportunity score from 0–100
- Score breakdown for every lead
- Buying signals such as funding, hiring growth, technology fit, and decision-maker status
- Corporate relationship context: parent, subsidiary, acquisition, and related-company relationships
- Data-confidence score
- Why Now summary
- Next Best Action
- Search and minimum-score filtering
- Responsive React dashboard
- Spring Boot REST API
- H2 for local development and tests
- PostgreSQL for containerized deployment
- Seeded sample data
- Unit tests and GitHub Actions CI
- Docker Compose configuration
- GitHub Codespaces development configuration

## Product flow

```
Lead data
   ↓
Company + Contact + Signals + Corporate Relationships
   ↓
Opportunity Scoring Engine
   ↓
REST API
   ↓
React dashboard
   ↓
Prioritized lead → explanation → recommended action
```

## Technology

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven

### Data
- PostgreSQL 16 for the Docker deployment
- H2 for local/test execution

### Development and delivery
- Docker Compose
- GitHub Actions
- GitHub Codespaces

## Running locally

### Option 1: Frontend preview only

The dashboard contains a small sample dataset fallback, so the UI can be reviewed without starting the API.

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

### Option 2: Full application

Start the backend:

```bash
cd backend
mvn spring-boot:run
```

Then start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The API runs on port 8080 and the dashboard runs on port 5173.

### Option 3: Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL, the Spring Boot API, and the frontend container.

## GitHub Codespaces

The repository includes a dev container configuration with ports 8080 and 5173.

Create a Codespace from the repository and open the project in the browser-based VS Code environment. Dependencies are installed during container creation, and the application services are started when the Codespace attaches.

The dashboard is configured to open automatically when port 5173 is forwarded.

If the Codespace was created before the current dev container configuration was added, rebuild the container before using the automatic preview.

## API

- `GET /api/health`
- `GET /api/leads`
- `GET /api/leads?search=acme&minScore=70&signal=HIRING_GROWTH`
- `GET /api/leads/{id}`
- `GET /api/leads/{id}/intelligence`
- `GET /api/leads/{id}/relationships`

## Scoring model

The opportunity score is capped at 100.

| Factor | Maximum |
|---|---:|
| Revenue potential | 20 |
| Growth | 18 |
| Technology fit | 17 |
| Decision maker | 15 |
| Industry fit | 14 |
| Corporate relationship | 6 |
| Data confidence | 10 |
| **Total** | **100** |

The scoring engine is deterministic. Each factor is visible in the lead detail panel so a sales user can understand how the priority was calculated.

## Corporate relationships

Corporate relationships are stored separately from leads so account-level context can be reused across contacts.

```
Company
 ├── Parent company
 ├── Subsidiaries
 ├── Acquisitions
 └── Related companies
```

A relationship can contribute to the opportunity score when the supplied lead data contains a corresponding relationship signal.

## Data and privacy

The repository contains fictional sample companies, contacts, domains, and emails for demonstration and testing.

For a production implementation:

- Use only legally collected or authorized data.
- Respect website terms, robots directives, and applicable privacy requirements.
- Validate and normalize incoming records before scoring.
- Keep source provenance and verification status with externally collected records.
- Add authentication and authorization before exposing production lead data.

## Production considerations

A production deployment can use PostgreSQL as the primary datastore, Redis for frequently requested intelligence results, a CDN for the frontend, and a container platform for the Spring Boot API.

The CI workflow validates both application layers:

```
Backend: mvn test package
Frontend: npm install && npm run build
```

## Project structure

```
saasquatch-opportunity-intelligence/
├── backend/
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── .devcontainer/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```
