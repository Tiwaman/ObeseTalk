# The Unsolicited Advice Jar — ObseTalk

A cathartic, community-powered web app where people in bigger bodies can drop every ridiculous piece of unsolicited weight advice they've received into a virtual jar. See that you're not alone — because 847 other people got that one too.

Part of [ObseTalk.com](https://obesetalk.com) — a safe community for obese/plus-size people.

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite with Prisma ORM
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Upgrading to PostgreSQL for Production

1. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/obesetalk"
   ```
2. Change `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`
3. Run `npx prisma migrate dev --name postgres-migration`
4. Run `npx prisma db seed` to seed the database
