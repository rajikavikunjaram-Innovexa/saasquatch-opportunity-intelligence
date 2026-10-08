# SaaSquatch Opportunity Intelligence

Opportunity prioritization for a lead-generation workflow. The product answers one sales question: **Which lead should I contact first, and why now?**

## Product flow
1. Import a 200-record demo lead dataset.
2. Analyze every lead with a deterministic 100-point opportunity model.
3. Rank HOT, GOOD, NURTURE and LOW opportunities.
4. Inspect why-now signals, score breakdown and next-best action.
5. Move from individual leads to corporate account relationships.

## Score model
| Dimension | Weight |
|---|---:|
| Revenue Potential | 20 |
| Growth | 18 |
| Technology Fit | 17 |
| Decision Maker | 15 |
| Industry Fit | 14 |
| Corporate Relationship | 6 |
| Data Confidence | 10 |
| **Total** | **100** |

Priority bands: HOT 85+, GOOD 70–84, NURTURE 55–69, LOW below 55.

## Stack
- Frontend: React, TypeScript, Vite, React Flow
- Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA, Validation
- Database: H2 for the challenge/demo
- Build: Maven and npm
- Demo data: 200 fictional records in `backend/src/main/resources/data.sql`

## API
- GET `/api/leads`
- POST `/api/leads/analyze`
- GET `/api/opportunities/top`
- GET `/api/leads/{id}/intelligence`
- GET `/api/accounts/{companyId}/relationships`
- GET `/api/health`

## Codespaces
The repository forwards ports 5173 for the React application and 8080 for the Spring Boot API.

Backend:
```bash
cd backend
mvn spring-boot:run
```

Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the forwarded port 5173.

## Architecture
```text
React + TypeScript
       |
       | REST
       v
Spring Boot
   |    |    |
 Lead  Intelligence  Account Graph
 Service Engine      Service
       |
       v
      H2
```

The dataset uses fictional/demo companies, contacts and domains.