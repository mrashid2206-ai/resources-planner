# Resource Planner Pro

A full-stack **resource capacity planning & project management application** built with Angular 18, Spring Boot 3.3, and PostgreSQL.

---

## Architecture

```
┌─────────────────────────────┐
│   Angular 18 (Port 4200)    │
│   Standalone Components     │
│   SCSS + DM Sans + Dark UI  │
└──────────┬──────────────────┘
           │ REST / JSON
           ▼
┌─────────────────────────────┐
│   Spring Boot 3.3 (Port 8080)│
│   /api context path          │
│   Swagger UI + Flyway        │
└──────────┬──────────────────┘
           │ JDBC
           ▼
┌─────────────────────────────┐
│   PostgreSQL                │
│   DB: resource_planner      │
│   Flyway migrations         │
└─────────────────────────────┘
```

---

## Quick Start

### 1. Database

```bash
# Create the PostgreSQL database
createdb resource_planner

# Option A: Run Flyway migration (auto on app start)
# Option B: Manually apply schema + seed data
psql -d resource_planner -f database/schema.sql
```

### 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
# API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/api/swagger-ui.html
```

Environment variables (optional):
- `DB_USERNAME` (default: `postgres`)
- `DB_PASSWORD` (default: `postgres`)

### 3. Frontend

```bash
cd frontend
npm install
ng serve
# App: http://localhost:4200
```

The Angular dev server proxies `/api` requests to `localhost:8080` automatically.

---

## Features

### Dashboard
- Resource count, average utilization, active projects/bids
- Budget totals and weighted pipeline value
- 12-month utilization heatmap per resource (color-coded)
- Monthly capacity forecast chart

### Resources
- CRUD with archive (soft-delete)
- Tags/skills system
- Monthly capacity grid (22 working days – leave days)
- Assignment list with allocation %
- Leave management (upsert per month)

### Projects
- CRUD with status lifecycle (Active → On-Hold → Completed)
- Budget tracking
- Assigned resources with allocation bars
- Inline status switching
- Convert from won bid (transfers assignments)

### Bids & Proposals
- CRUD with status lifecycle (Pending → Submitted → Won → Lost)
- Win probability and estimated value
- Status history tracking
- One-click convert to project (when won)

### Timeline
- Gantt-style resource allocation view
- Monthly utilization cells (color-coded)
- Assignment bars spanning month ranges
- Year navigation

### Portal (Read-Only)
- Stakeholder view of dashboard stats
- Resource utilization grid
- Active projects and bids lists

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resources` | List active resources |
| POST | `/resources` | Create resource |
| PUT | `/resources/{id}` | Update resource |
| PATCH | `/resources/{id}/archive` | Archive resource |
| DELETE | `/resources/{id}` | Delete resource |
| GET | `/assignments/resource/{id}` | Assignments for resource |
| GET | `/assignments/project/{id}` | Assignments for project |
| GET | `/assignments/bid/{id}` | Assignments for bid |
| POST | `/assignments` | Create assignment |
| PUT | `/assignments/{id}` | Update assignment |
| POST | `/assignments/reassign` | Reassign to different project/bid |
| GET | `/assignments/conflicts` | Check over-allocation |
| DELETE | `/assignments/{id}` | Delete assignment |
| GET | `/leaves/resource/{id}` | Leaves for resource |
| POST | `/leaves` | Create/upsert leave |
| PUT | `/leaves/{id}` | Update leave |
| DELETE | `/leaves/{id}` | Delete leave |
| GET | `/projects` | List active projects |
| POST | `/projects` | Create project |
| PUT | `/projects/{id}` | Update project |
| PATCH | `/projects/{id}/archive` | Archive project |
| POST | `/projects/convert-bid/{bidId}` | Convert bid to project |
| DELETE | `/projects/{id}` | Delete project |
| GET | `/bids` | List active bids |
| POST | `/bids` | Create bid |
| PUT | `/bids/{id}` | Update bid |
| PATCH | `/bids/{id}/status` | Update bid status with reason |
| PATCH | `/bids/{id}/archive` | Archive bid |
| DELETE | `/bids/{id}` | Delete bid |
| GET | `/dashboard` | Full dashboard data |

---

## Database Schema

8 tables with UUID primary keys:
- `resources` — people/team members
- `tags` / `resource_tags` — skills/tags (M2M)
- `projects` — active work with budgets
- `bids` — proposals with probability
- `assignments` — links resources to projects/bids with allocation %
- `leaves` — PTO per resource per month
- `project_milestones` — milestone tracking
- `project_notes` — timestamped notes
- `bid_status_history` — audit trail for bid status changes
- `portal_config` — stakeholder portal settings

PostgreSQL enums: `project_status`, `bid_status`, `assignment_type`, `resource_availability`, `portal_access_level`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, Standalone Components, SCSS |
| Backend | Spring Boot 3.3.5, Java 17, Lombok |
| Database | PostgreSQL with Flyway migrations |
| API Docs | Springdoc OpenAPI (Swagger) |
| Build | Maven (backend), Angular CLI (frontend) |

---

## Project Structure

```
resource-planner-pro/
├── database/
│   └── schema.sql                    # Full schema + seed data
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/resourceplanner/
│       │   ├── ResourcePlannerApplication.java
│       │   ├── config/WebConfig.java
│       │   ├── controller/           # 6 REST controllers
│       │   ├── dto/request/          # 6 request DTOs
│       │   ├── dto/response/         # 7 response DTOs
│       │   ├── entity/               # 9 JPA entities
│       │   ├── enums/                # 4 enum types
│       │   ├── exception/            # Global error handler
│       │   ├── repository/           # 6 Spring Data repos
│       │   └── service/
│       │       ├── impl/             # 6 service implementations
│       │       └── (interfaces)
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_schema.sql
└── frontend/
    ├── angular.json
    ├── package.json
    ├── proxy.conf.json
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── environments/
        ├── assets/styles/global.scss
        └── app/
            ├── app.component.ts      # Shell + navigation
            ├── app.config.ts
            ├── app.routes.ts          # Lazy-loaded routes
            ├── interceptors/          # HTTP error interceptor
            ├── models/models.ts       # All TypeScript interfaces
            ├── services/              # 6 Angular HTTP services
            └── components/
                ├── dashboard/         # Stats + heatmap
                ├── resources/         # CRUD + capacity grid
                ├── projects/          # CRUD + status management
                ├── bids/              # CRUD + convert to project
                ├── timeline/          # Gantt-style view
                └── portal/            # Read-only stakeholder view
```
