# NewGen Residence

Aplicatie Next.js pentru prezentarea proiectelor rezidentiale, autentificarea clientilor si administrarea inventarului de apartamente prin Supabase.

## Pornire locala

1. Instaleaza dependintele:

```powershell
npm install
```

2. Creeaza `.env.local` pornind de la `.env.example` si completeaza valorile Supabase.

3. Porneste aplicatia:

```powershell
npm run dev
```

Aplicatia va fi disponibila la [http://localhost:3000](http://localhost:3000).

## Baza de date

Schema initiala este documentata in `database/`, iar migrarile noi sunt pastrate in `supabase/migrations/`.

Cheile Supabase si fisierul `.env.local` nu sunt incluse in repository.
