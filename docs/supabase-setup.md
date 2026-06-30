# Supabase setup

Am ales Supabase pentru ca ne da PostgreSQL in cloud, API REST automat, autentificare si storage pentru documente/imagini.

## 1. Creeaza proiectul

Creeaza un proiect nou in Supabase si copiaza:

- Project URL
- Secret API key

## 2. Configureaza variabilele

Creeaza un fisier .env.local pe baza lui .env.example:

```env
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_ID.supabase.co"
SUPABASE_SECRET_KEY="..."
DEVELOPER_SIGNUP_CODE="TEST_DEV"
```

Nu pune cheia secreta in browser. Ea este folosita doar de rutele server-side.

## 3. Creeaza tabelul

In Supabase, deschide SQL Editor si ruleaza continutul din:

`database/supabase-schema.sql`

## 4. Fluxul de inregistrare

Clientul completeaza formularul din /cont-client. API-ul accepta contul doar daca developerCode este exact TEST_DEV.
