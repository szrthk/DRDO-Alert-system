[![CI](https://github.com/szrthk/DRDO-Alert-system/actions/workflows/ci.yml/badge.svg)](https://github.com/szrthk/DRDO-Alert-system/actions/workflows/ci.yml)
# DRDO Threat Alert API

A lightweight Spring Boot service with a simple, powerful web UI for creating and managing security alerts (e.g., drone sightings, sensor issues). Ships with Docker and GitHub Actions CI.

## Features
- REST API to create, list, fetch, and delete alerts
- In-memory H2 database (auto schema)
- Minimal single-page UI (served from `/`) with:
  - Search filter
  - Severity chips and counts (LOW, MEDIUM, HIGH, CRITICAL)
  - Create and delete actions
  - Toast feedback and skeleton loaders
- Health endpoint and H2 console
- Dockerfile (multi-stage) + optional Docker Compose
- GitHub Actions CI for Maven build and Docker build

## Tech stack
- Java 17, Spring Boot 3
- Spring Web, Spring Data JPA, H2
- Vanilla JS + CSS (no build tools)

## API
Base URL: `/api/alerts`

- GET `/api/alerts/health` → `"OK"`
- POST `/api/alerts`
  - Body (JSON):
    ```json
    {
      "severity": "HIGH",
      "location": "Test Range Alpha",
      "description": "Surveillance UAV detected by radar grid at 22:15 hrs."
    }
    ```
  - `severity` must be one of `LOW|MEDIUM|HIGH|CRITICAL`
- GET `/api/alerts` (optional `severity` query param)
  - Examples: `/api/alerts?severity=HIGH`
- GET `/api/alerts/{id}`
- DELETE `/api/alerts/{id}`

Entity fields returned:
```json
{
  "id": 1,
  "severity": "HIGH",
  "location": "Test Range Alpha",
  "description": "...",
  "createdAt": "2025-11-05T17:15:00Z"
}
```

### cURL examples
- Create
  ```bash
  curl -X POST http://localhost:8080/api/alerts \
    -H 'Content-Type: application/json' \
    -d '{
      "severity":"HIGH",
      "location":"Test Range Alpha",
      "description":"Surveillance UAV detected by radar grid at 22:15 hrs."
    }'
  ```
- List
  ```bash
  curl http://localhost:8080/api/alerts
  curl http://localhost:8080/api/alerts?severity=CRITICAL
  ```
- Delete
  ```bash
  curl -X DELETE http://localhost:8080/api/alerts/1 -i
  ```

## Web UI
- Served from `/` (http://localhost:8080/ by default)
- Provides search, severity chips, create form, and delete
- H2 console: `/h2` (username: `sa`, empty password)

## Run locally
- JDK 17+ and Maven installed
- Start app:
  ```bash
  mvn spring-boot:run
  ```
- Open http://localhost:8080/

## Docker
Multi‑stage Dockerfile builds a small runtime image.

- Build image
  ```bash
  docker build -t drdo/threat-api:latest .
  ```
- Run (map container 8080 → host 18080 to avoid conflicts)
  ```bash
  docker run --rm -d --name threat-api -p 18080:8080 drdo/threat-api:latest
  # open http://localhost:18080/
  ```
- Troubleshooting ports
  - Check listeners: `lsof -i :8080` (or `:18080`)
  - Remove previous container: `docker rm -f threat-api`

## Docker Compose (optional)
A compose file is included as `compose.yml`.

- Run on host port 8081 (adjust if busy):
  ```bash
  docker compose up --build
  # open http://localhost:8081/
  ```
- To change host port, edit `compose.yml` → `ports: ["18080:8080"]`
- Stop: `docker compose down`

## CI (GitHub Actions)
Workflow: `.github/workflows/ci.yml`
- Job `build`: Java 17 (Temurin), caches Maven, runs `mvn -B -DskipTests package`
- Job `docker-build`: builds the Docker image (no push by default)

## Configuration
See `src/main/resources/application.properties`:
- `server.port=8080`
- H2 console at `/h2`
- JPA auto-update schema

## Example alerts
- “Unauthorized drone sighted over test range” — HIGH — “Surveillance UAV detected by radar grid at 22:15 hrs.”
- “Sensor malfunction in lab B2” — MEDIUM — “Infrared sensor not transmitting telemetry since last calibration.”
- “Communication node offline” — CRITICAL — “Satellite uplink node dropped connection.”
- “Routine calibration complete” — LOW — “No threat; maintenance notification.”

## License
MIT (adjust as needed)
