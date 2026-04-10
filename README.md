# Platform Blogging API

A simple backend API for a blogging platform built with **Node.js**, **Express**, **PostgreSQL**, and **Redis**.  
Deployed using **Render**.

---

## Features

- RESTful API for blog operations
- PostgreSQL database integration
- Redis for caching and rate limiting
- Environment variable support with dotenv
- Docker support
- GitHub Actions CI pipeline
- Cloud deployment with Render

---

## Tech Stack

- Node.js (ES Modules)
- Express
- PostgreSQL
- Redis
- Docker
- GitHub Actions
- Render

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/platform_blogging_api.git
cd platform_blogging_api
```

Install dependencies

```bash
npm install
```

## Environment Variables

Create .env file in root directory

```bash
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db
REDIS_URL=redis://localhost:6379
PORT=3000
```

## Running the App

Start the server:

```bash
npm start
```

## Testing 

Check code syntax

```bash
npm test
```

## Docker

Build the Docker image:


```bash
docker build -t blog-api .
```

Run the container:

```bash
docker run -p 3000:3000 blog-api
```

## Deployment (Render)

This project was deployed online using Render

Steps:

•	Connect your GitHub repository to Render
•	Set environment variables in the Render dashboard
•	Deploy as a Web Service

## API Endpoints:

Create a post 

POST /post

Request body:

```json
{
  "title": "My Post",
  "content": "Default",
  "category": "Tech",
  "tags": ["node", "backend"]
}
```
---
Get All Posts

GET /get/all

- Uses Redis caching
---
GET Single Post

GET /get/:id

- Cached individually in Redis
---
Update Post

PUT /put/:id
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "category": "Updated tech",
  "tags": ["updated"]
}
```
---
DELETE Post

DELETE /delete/:id

## Rate Limiting 

Max: 10 requests

Window: 20 minutes

```json
{
  "error": "Requests overloaded! Please wait 20 minutes."
}
```
---
## CI/CD

GitHub Actions is configured to:

•	Install dependencies
•	Run syntax checks
•	Build a Docker image
•	Run with PostgreSQL and Redis services



