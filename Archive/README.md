# AI Minds Template


## Run on your own

- Acquire [Clerk](https://clerk.com/) API Key and Secret Key. 
  - https://clerk.com/docs/quickstarts/nextjs
- Acquire PlanetScale DB API key.
- Acquire Cloudinary 'cloud name' and preset code. 
- Run `node scripts/seed.ts` first.
- After `pnpm i`, run `pnpx prisma generate` and `pnpx prisma db push`

We use [pnpm](https://pnpm.io/) for this project.

We use [shadcn/ui](https://ui.shadcn.com/) for components template.

...

For code format, we'll use prettier and only prettier to enforce code styling to avoid confusion.

**Visual Studio Code** is the recommended editor for this project.

`cp .env.example .env`, then put corresponding values to variables

Use `pnpm i` to install dependencies

Use `pnpm dev` to start dev mode

## Tech Stack 
NextJS

Deployed on Railway

Clerk: for user management

Pinecone

PlanetScale: Main SQL DB 

Cloudindary: Image hosting/store

Upstash: Redis

Replicate: run model
