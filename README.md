## Server

### Local development

1. `npm install`
2. Ensure MongoDB is reachable at the `MONGODB_URI` defined in `.env`
3. `npm run dev` (or `npm start`) to boot the Express server on `PORT`

### Deploying to Vercel

1. Promote this folder (`server/`) as the Vercel project root
2. Set the required environment variables in Vercel: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, and any admin bootstrap values you need
3. Run `vercel` for a preview deployment, then `vercel --prod` when ready
4. Point the frontend's `VITE_API_BASE` to the deployed URL

> The project uses a shared Express app defined in `app.mjs`, with `api/index.mjs` providing the serverless entrypoint for Vercel and `index.mjs` acting as the local development launcher.
