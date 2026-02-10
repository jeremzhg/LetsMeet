# Backend Service

Backend service for LetsMeet. Uses Prisma as the ORM for PostgreSQL.

## Project Structure

Purpose of folders:

-   **`src/controllers`**: Handles incoming HTTP requests and sends responses.
-   **`src/routes`**: Defines the API endpoints and maps them to controller functions.
-   **`src/models`**: Contains interfaces and types representing the data structures used in the application.
-   **`src/repositories`**: Database layer, where all Prisma calls should be.
-   **`src/index.ts`**: The entry point of the application, responsible for setting up the Express app and middleware.


### Installation

1.  Clone the repository and navigate to the `backend` directory.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Configuration

1.  Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

2.  Update the `.env` file with your PostgreSQL database connection string:

    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/db_name?schema=public"
    ```

### Database Setup

1.  Generate the Prisma client:

    ```bash
    npx prisma generate
    ```

2.  Run migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

### Running the Server

Start the development server with hot-reloading:

```bash
npm run dev
```

The server will start on port 3000.
