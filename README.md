# Medical Service API

This is a medical service API built with Node.js and Fastify framework.

## Features

- Health check endpoint (`/api/health`)
- High performance and low overhead
- JSON Schema validation
- Detailed logging

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd medical-service-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the server in production mode:

```
npm start
```

To start the server in development mode with auto-reload:

```
npm run dev
```

The server will start on port 3000. You can test the health endpoint at:

```
curl http://localhost:3000/api/health
```

## API Endpoints

### Health Check

- `GET /api/health` - Returns the status of the API

## Project Structure

```
medical-service-app/
├── src/
│   └── index.js          # Main application file
├── package.json          # Project dependencies and scripts
├── plans/
│   └── api-architecture.md # API architecture documentation
└── README.md             # This file
```

## Technology Stack

- **Node.js**: JavaScript runtime environment
- **Fastify**: Web framework for Node.js
- **Pino**: Logger for Node.js (used by Fastify)
- **Nodemon**: Utility for auto-reloading during development

## License

This project is licensed under the ISC License.
