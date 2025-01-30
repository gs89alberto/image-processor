# Image Processing API

A **REST API** for **asynchronous image processing tasks management** using a **microservices architecture**. This project is built with **Node.js** and **Express**, following the **Hexagonal Architecture** pattern to ensure **scalability**, **maintainability**, and **flexibility**.

The system is composed of two microservices:

- **Tasks Service**: Manages image processing tasks.
- **Images Service**: Handles image transformations and storage.

These services communicate asynchronously using **Kafka** for event-driven processing. The application persists data in **MongoDB** and includes a **Postman collection** for API testing.

Below, you will find installation instructions, execution steps, API documentation, and details on unit, integration, and performance testing.

---

## Table of Contents
- [Image Processing API](#image-processing-api)
  - [Table of Contents](#table-of-contents)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Installation](#2-installation)
    - [Install Docker](#install-docker)
    - [Install Dependencies](#install-dependencies)
    - [Environment Setup](#environment-setup)
  - [3. Running the Application](#3-running-the-application)
  - [4. API Endpoints](#4-api-endpoints)
      - [1. `POST /tasks`](#1-post-tasks)
      - [2. `GET /tasks/:taskId`](#2-get-taskstaskid)
  - [5. Running Tests (Unit and Integration)](#5-running-tests-unit-and-integration)
    - [Running Unit and Integration Tests (Tasks)](#running-unit-and-integration-tests-tasks)
  - [6. Running Performance Tests with k6](#6-running-performance-tests-with-k6)
    - [1. Start the Server in Test Mode](#1-start-the-server-in-test-mode)
    - [2. Execute Performance Tests for Task Creation](#2-execute-performance-tests-for-task-creation)

## 1. Prerequisites
- Node.js v18+
- Docker & Docker Compose
- npm v9+
- Git

## 2. Installation
### Install Docker

To ensure smooth operation, you need **Docker** and **Docker Compose** installed on your system.

- **[Install Docker](https://docs.docker.com/get-docker/)**
- **[Install Docker Compose](https://docs.docker.com/compose/install/)**

### Install Dependencies

To install dependencies for **all** workspaces, simply run:

```bash
npm install
```
### Environment Setup

Create a `.env` file at tasks-service and images-service project root to provide environment variables. For example:

```plaintext
MONGODB_URI=mongodb://localhost:27017/image-processor-db
MONGODB_URI_TEST=mongodb://localhost:27017/image-processor-db-tests
KAFKA_BROKER=localhost:9092
PORT=3000
SERVICE_NAME=tasks-service
NODE_ENV=development
```

---

## 3. Running the Application
1. Start the required **Kafka** (and Zookeeper) containers using Docker Compose:
```markdown
   docker-compose up -d
   ```
2.	Start both microservices simultaneously:
```markdown
   npm run start:all
   ```

---

## 4. API Endpoints

The tasks microservice exposes two main endpoints:

#### 1. `POST /tasks`

- **Description**: Creates a new task for image processing.
- **Request Body**:

  ```json
  {
    "originalPath": "/path/or/url/of/the/image.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "taskId": "65d4a54b89c5e342b2c2c5f6",
    "status": "PENDING",
    "price": 25.5
  }
  ```

#### 2. `GET /tasks/:taskId`

- **Description**: Retrieves information about a task, including its `status`, `price`, and processed images (if completed).
- **Response (Completed Task)**:
  ```json
  {
    "taskId": "65d4a54b89c5e342b2c2c5f6",
    "status": "COMPLETED",
    "price": 25.5,
    "images": [
        {
            "resolution": "1024",
            "path": "/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg"
        },
        {
            "resolution": "800",
            "path": "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg"
        }
    ]
  }
  ```
---

## 5. Running Tests (Unit and Integration)

### Running Unit and Integration Tests (Tasks)

To execute **unit and integration tests** for the `tasks-service`, run:

```bash
npm run test:tasks
```
---

## 6. Running Performance Tests with k6

To run **performance tests** using **k6**, follow these steps:

### 1. Start the Server in Test Mode

Before running performance tests, the server must be started in **test mode**:

```bash
npm run start:all:test
```

### 2. Execute Performance Tests for Task Creation

Run the specific performance tests using k6:
```bash
cd packages/tasks-service/ #Navigate to the `tasks-service` Directory
npm run test:perf1  #Simulates a failure scenario when creating a task.
npm run test:perf2  #Tests performance when creating a task and the originalPath is a local path.
npm run test:perf3  #Tests performance when creating a task and the originalPath is a remote URL.
```
Each k6 test sends multiple requests to the POST /tasks endpoint under different conditions, measuring performance and response time.