# Assistant Coach — JC Martinez

## Description
Assistant IA discret pour coaching vocal/musical et développement personnel (PNL).
Utilisé pendant les séances via téléphone + lunettes Meta Ray-Ban.

## Stack technique
- **Framework** : Next.js 16 (App Router) + TypeScript
- **CSS** : Tailwind CSS v4
- **IA** : Cascade Gemini Flash (gratuit) → Groq Llama (gratuit)
- **Audio** : Web Speech API (transcription) + Speech Synthesis (réponse vocale)
- **Déploiement** : Vercel (à configurer)

## Fonctionnement
1. Téléphone posé sur le bureau, web app ouverte
2. Écoute continue via Web Speech API (micro du téléphone)
3. Bouton 💡 = l'IA analyse la conversation et répond vocalement
4. La réponse audio passe par Bluetooth → haut-parleurs des lunettes Meta
5. Le client n'entend rien (directional speakers)

## Modes
- **🎵 Musique** : suggestions d'exercices, techniques, encouragements
- **🧠 Dev. personnel** : patterns PNL, croyances limitantes, techniques adaptées

## Workflow avec lunettes Meta Ray-Ban
- **1 tap** : bouton 💡 sur le téléphone → suggestion vocale dans l'oreille
- **2 taps** : photo via lunettes → upload dans l'app → analyse visuelle (à venir)
- **SDK Meta 2026** : tap lunettes = trigger direct sans toucher le téléphone

## Structure
```
src/
  app/
    layout.tsx          — Layout mobile-first
    page.tsx            — Page session (transcription + IA + audio)
    api/
      analyze/route.ts  — Endpoint analyse IA (cascade Gemini → Groq)
  lib/
    ai-cascade.ts       — Cascade IA gratuite
    prompts.ts          — Prompts spécialisés (musique + PNL)
```

## Env variables
- `GEMINI_API_KEY` — Google Gemini (gratuit)
- `GROQ_API_KEY` — Groq Llama (gratuit)

## Design
- Mobile-first (utilisé sur téléphone pendant les séances)
- Theme sombre (noir #0A0A0A)
- Accent doré (musique) ou violet (PNL)
- Interface minimaliste et discrète

## À faire
- Historique des séances (localStorage puis Supabase)
- Upload photo (mode musique)
- PWA (installable sur le téléphone)
- Stripe (abonnement pour d'autres coachs)
- Déploiement Vercel
