# Uphold Backend Engineer Assessment

This project is a backend app for monitoring cryptocurrency price changes, triggering alerts based on specific thresholds, and persisting this information in a PostgreSQL database. It is built with Next.js, Prisma ORM, and is containerized using Docker.

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
    - [Locally](#running-locally)
    - [Via Docker](#running-via-docker-preferred)
- [Project Structure](#project-structure)
- [Main Routes](#main-routes)
- [Database Configuration](#database-configuration)
- [Testing](#testing)
- [Additional Information](#additional-information)

## Pre-requisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: v22.x.x
- **npm**
- **Docker**: v4.33.0 or later
- **Docker Compose**: v2.29.1 or later
- **PostgreSQL:** v16.4 or later if running locally

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/miniclip22/uphold-coding-challenge.git
   cd uphold-coding-challenge
2. **Install dependencies:**
   ```bash
   npm install
3. **Create a `.env` file in the root directory and add the following:**
   ```bash      
    DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
   example: DATABASE_URL=postgresql://my-postgres:mysecretpassword@postgres:5432/mydatabase
   ```
4. **Create a `.env.test` file in the root directory and add the following:**
   ```bash      
    TEST_DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
   example: TEST_DATABASE_URL=postgresql://my-postgres:mysecretpassword@localhost:5432/mydatabase_test
   ```
   
## Running the Project

### Running Locally

To run the project locally, follow the following steps:

1. **Start PostgreSQL Database:**
   Ensure you have a PostgreSQL instance running (Docker or running locally).
2. **Apply the `Prisma` migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Start the server:**
   ```bash
   npm run dev
   ```   
  The app should be running on `http://localhost:3000`. 

### Running via Docker (preferred)

1. Build and start the containers:
```bash 
docker compose up --build 
```
This command will start two containers:
* **postgres:** runs the PostgreSQL database.
* **app:** runs the Next.JS app with backend services.

2. Apply the `Prisma` migrations on a separate terminal window:
```bash
docker compose exec app npx prisma migrate dev --name init
```
The server should now be running inside a Docker container at URL `http://localhost:3000`.

## Project Structure

| Path                                          | Description                                 |
|-----------------------------------------------|---------------------------------------------|
| `prisma/`                                     | Prisma schema and migrations                |
| `prisma/schema.prisma`                        | Prisma schema definition                    |
| `prisma/migrations/`                          | Migration files                             |
| `src/bot/config.ts`                           | Bot configuration                           |
| `src/`                                        | Source code                                 |
| `src/app/`                                    | Main application directory                  |
| `src/app/api/`                                | API routes                                  |
| `src/app/api/bot/`                            | Bot-related routes and logic                |
| `src/app/api/bot/start/route.ts`              | Start monitoring route                      |
| `src/app/api/bot/stop/route.ts`               | Stop monitoring route                       |
| `src/app/api/bot/utils/helper.ts`             | Helper functions for monitoring             |
| `src/app/api/alerts/`                         | Alerts-related routes                       |
| `src/app/api/bot/alerts/[id]/route.ts`        | Route to get a specific alert               |
| `src/app/api/bot/alerts/route.ts`             | Route to get all alerts                     |
| `src/__tests__/`                              | Test files                                  |
| `src/__tests__/alerts.test.ts`                | Tests for alert triggering                  |
| `src/__tests__/botConfig.test.ts`             | Tests for bot configuration                 |
| `src/__tests__/concurrent-monitoring.test.ts` | Tests for data integrity during monitoring  |
| `src/__tests__/database.test.ts`              | Tests for database access                   |
| `Dockerfile.nextjs`                           | Dockerfile for the Next.js app              |
| `Dockerfile.postgres`                         | Dockerfile for PostgreSQL database          |
| `docker-compose.yaml`                         | Docker Compose file to orchestrate services |
| `README.md`                                   | Project README file                         |

## Main Routes

* **POST /api/bot/start**: Starts monitoring the configured cryptocurrency pairs
* **POST /api/bot/stop**: Stops monitoring all active pairs
* **GET /api/bot/alerts**: Retrieves all alerts from the database --> extra Route added, not related directly to the coding challenge
* **GET /api/bot/alerts/[id]**: Retrieves a specific alert by ID --> extra Route added, not related directly to the coding challenge

## Database Configuration

* **Database:** PostgreSQL
* **ORM:** Prisma

The database stores two main entities:

1. **BotConfig:** Stores the configuration of the bot at the time of monitoring.
2. **Alert**: Stores the alerts triggered when the price changes exceed a certain threshold.

## Usage

After running the application either locally or via Docker, you can interact with the bot to start and stop monitoring prices and view alerts:

1. **Start Monitoring:**
**Endpoint:** POST `/api/bot/start`. This endpoint starts the bot and begins monitoring prices with the configured cryptocurrency pairs.
**Example Request:** 
```bash
curl -X POST http://localhost:3000/api/bot/start
```
**Expected Response:**

```bash
app-1                  | Started monitoring for BTC-USD, interval ID: 15395
app-1                  | Started monitoring for ETH-USD, interval ID: 15422
app-1                  | Started monitoring for LTC-USD, interval ID: 15449
app-1                  | Monitoring started
app-1                  |  POST /api/bot/start 200 in 1121ms
app-1                  | Current BTC-USD Rate: 54365.0723827946
app-1                  | Initializing last alert rate for BTC-USD.
app-1                  | Current LTC-USD Rate: 62.60071413
app-1                  | Initializing last alert rate for LTC-USD.
app-1                  | Current ETH-USD Rate: 2285.8896454115
app-1                  | Initializing last alert rate for ETH-USD.
app-1                  | Current BTC-USD Rate: 54365.0723827946
app-1                  | Rate Change: 0.0000
app-1                  | Current ETH-USD Rate: 2285.9086849016
app-1                  | Rate Change: 0.0000
app-1                  | Current LTC-USD Rate: 62.60071413
```

2. **Stop Monitoring:**
**Endpoint:** POST `/api/bot/stop`. This endpoint stops the bot and hence all monitoring activity.
**Example Request:**
```bash
curl -X POST http://localhost:3000/api/bot/stop
```
**Example Response:**
```json
{
 "message": "Monitoring stopped"
}
```

## Testing

This project includes several tests to ensure data integrity and functionality:

* **Alert Triggering:** Tests to ensure alerts are triggered correctly when thresholds are exceeded.
* **Data Integrity During Concurrent Monitoring:** Ensures multiple currency pairs are handled.
* **Bot Configuration:** Validates that bot configurations are correctly saved and retrieved from the database.
* **Database Access:** Tests to ensure database access and data integrity.

## Running Tests

To run the tests, use the following command:

```bash 
npm run test
```

## Additional Information

* **Prisma Client:** The Prisma Client is generated automatically during the build process. Ensure it is updated by running the command 
```bash 
npx prisma generate
```
if changes are made to the schema.
