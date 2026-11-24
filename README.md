# Nearzy Survey Map

Private map for the shop survey: add shops in the field, see them on a map, filter and colour them.
Only team members can log in; the database refuses everyone else.

## Run locally
1. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon (public) key.
2. `npm install`
3. `npm start` and open http://localhost:3000

## Database
`supabase/lockdown.sql` sets up the team list and the access rules. Run it once in the Supabase SQL editor
(instructions at the top of the file). Add or remove team members with the commands listed there.

## Deploy
Vercel builds with `npm run build`. Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY`
in the Vercel project settings.
