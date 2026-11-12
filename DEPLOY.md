# Deploying RAREsidence to Railway

The app runs as two Railway services from this one GitHub repo:

| Service    | Folder      | Public? | Notes                                                   |
| ---------- | ----------- | ------- | ------------------------------------------------------- |
| `backend`  | `/backend`  | No      | NestJS API. SQLite DB + photos live on a volume at `/data`. |
| `frontend` | `/frontend` | Yes     | Next.js. Forwards `/api` and `/uploads` to the backend over Railway's private network. |

Browsers only ever talk to the frontend, so the backend doesn't need a public URL or CORS.

Each folder has a `railway.json` with its build and start commands. The backend's start
command (`npm run start:railway`) creates or updates the database tables, adds demo data
**only if the database is empty**, then starts the API. Redeploys never wipe data.

---

## 1. Push the code

Railway deploys from GitHub, so commit and push to `main` first.

## 2. Create the backend service

1. Go to [railway.com](https://railway.com), sign in with GitHub, click **New Project → Deploy from GitHub repo**, and pick **RAREsidence**.
2. Click the new service and open **Settings**:
   - **Service name** (at the top): `backend`. The frontend finds it by this name.
   - **Source → Root Directory**: `/backend`
   - **Config-as-code → Railway Config File**: `/backend/railway.json`
   - Don't generate a public domain.
3. **Add a volume**: right-click the service on the canvas (or press ⌘K → "Volume"), choose **Attach Volume**, and set the mount path to `/data`.
4. Open **Variables → Raw Editor** and paste this, filling in `JWT_SECRET`:

   ```
   DATABASE_URL=file:/data/prod.db
   UPLOADS_DIR=/data/uploads
   JWT_SECRET=
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   COOKIE_SECURE=true
   TRUST_PROXY=2
   PORT=8080
   ```

   Generate a new `JWT_SECRET` (don't reuse your local one):

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

5. Click **Deploy**. Once the logs say `RAREsidence backend running on port 8080`, it's up.

## 3. Create the frontend service

1. On the project canvas, click **+ Create → GitHub Repo → RAREsidence** again.
2. **Settings**:
   - **Service name**: `frontend`
   - **Source → Root Directory**: `/frontend`
   - **Config-as-code → Railway Config File**: `/frontend/railway.json`
   - **Networking → Generate Domain**. This is the link you share.
3. **Variables**:

   ```
   API_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080
   ```

   Railway fills in `${{backend.RAILWAY_PRIVATE_DOMAIN}}` automatically. Next.js reads this
   **at build time**, so if you change it later, redeploy the frontend.

4. Deploy, then open the generated `https://….up.railway.app` URL.

## 4. Log in

On first start the database gets the demo accounts from `backend/prisma/seed.ts`:

- Admin: `admin@raresidence.com` / `admin123`
- Tenant: `tenant@example.com` / `tenant123`

⚠️ Anyone who can read this repo knows these passwords. Before you share the link widely,
change them in `seed.ts` before the first deploy (or in the app afterwards).

---

## Troubleshooting

- **Frontend shows errors or "failed to fetch"**: check that the backend service is named
  exactly `backend`, that `PORT=8080` is set on it, and redeploy the frontend after
  changing `API_URL`.
- **Backend crashes with a `JWT_SECRET` error**: the secret must be at least 32 characters.
- **Data disappears after a redeploy**: the volume isn't mounted at `/data`, or
  `DATABASE_URL` / `UPLOADS_DIR` don't point into `/data`.
- **Start over with fresh demo data**: delete `/data/prod.db` from the volume (or detach
  and re-create the volume), then redeploy the backend.

## Running locally

Unchanged: `npm run start:dev` in `backend/` and `npm run dev` in `frontend/`. The backend
`.env` now also needs `DATABASE_URL="file:./dev.db"` (already added to your local `.env`
and to `.env.example`).
