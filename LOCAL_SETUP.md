# Local Development Setup

1. **Postgres on localhost**
   - Run a Postgres server on your machine (e.g., `brew services start postgresql`, Docker, or your OS service manager) and make sure it listens on `localhost:5432`.
   - Create a database named `tavern` (or update `.env` accordingly) and ensure a user/password pair exists that Prisma can use.

2. **Environment variables**
   - Copy `.env.local.example` to `.env` and fill in values such as:
     ```
     DATABASE_URL="postgresql://postgres:password@localhost:5432/tavern"
     NEXTAUTH_SECRET="<long-random-string>"
     NEXTAUTH_URL="http://localhost:3000"
     ```
   - Adjust other toggles (e.g., `NEXT_SKIP_TURBOPACK=1`) if needed for your dev workflow.

3. **NPM scripts**
   - `package.json` already provides:
     ```json
     {
       "scripts": {
         "dev": "next dev",
         "build": "prisma generate && next build",
         "postinstall": "prisma generate",
         "migrate:deploy": "prisma migrate deploy"
       }
     }
     ```
   - These scripts keep the Prisma client fresh and let you run production-safe migrations locally (`npm run migrate:deploy`) before building.

4. **Running migrations locally**
   - With your local Postgres running and `.env` configured, run `npm run migrate:deploy` (or `npx prisma migrate dev --name init` if you are iterating on schema) to create the tables defined in `prisma/schema.prisma`.

5. **Start the app**
   - After migrations, run `npm run dev` to launch Next.js on `http://localhost:3000`. Prisma will now connect to your local database, so dashboard pages and API routes can fetch data during rendering.

6. **Optional checks**
   - Use `npx prisma studio` to inspect data, `npm run build` to verify production build pass, and keep `.env` out of source control.

Keeping these steps near the code helps everyone run the project locally with a Postgres instance on `localhost`.
