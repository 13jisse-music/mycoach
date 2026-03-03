// Bibliothèque d'exercices PNL / Hypnose / Développement personnel

export type ExerciseCategory = "pnl" | "hypnose" | "dev";

export interface Exercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  duration: string; // ex: "15-20 min"
  difficulty: "debutant" | "intermediaire" | "avance";
  summary: string; // 1-2 phrases
  steps: string[]; // étapes numérotées
  detail: string; // "Pour aller plus loin" — explication détaillée
  keywords?: string[]; // mots-clés pour la recherche
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  pnl: "PNL",
  hypnose: "Hypnose",
  dev: "Dev. perso",
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  pnl: "#C9A84C",
  hypnose: "#8B5CF6",
  dev: "#22C55E",
};

export const EXERCISES: Exercise[] = [
  // ═══════════════════════════════════════════════
  // PNL
  // ═══════════════════════════════════════════════
  {
    id: "ancrage",
    title: "Ancrage de ressource",
    category: "pnl",
    duration: "15-20 min",
    difficulty: "debutant",
    summary:
      "Associer un état émotionnel positif à un geste physique pour le retrouver à volonté.",
    steps: [
      "Demander au client de se souvenir d'un moment où il a ressenti intensément l'état désiré (confiance, calme, joie...)",
      "Guider la visualisation : \"Revois ce moment, entends les sons, ressens les sensations...\"",
      "Au pic de l'émotion, ancrer avec un geste discret (presser le pouce et l'index, toucher le poignet...)",
      "Briser l'état : parler d'autre chose 30 secondes",
      "Tester l'ancrage : refaire le geste et observer si l'état revient",
      "Empiler si besoin : ajouter 2-3 autres souvenirs positifs sur le même ancrage",
    ],
    detail: `L'ancrage est un des outils fondamentaux de la PNL, basé sur le conditionnement pavlovien.

**Principes clés :**
- L'ancrage doit être posé au PIC de l'émotion (pas avant, pas après)
- Le geste doit être unique, discret et reproductible
- Plus les sous-modalités sont riches (V-A-K), plus l'ancrage est puissant
- On peut "empiler" plusieurs souvenirs positifs sur un même ancrage

**Variantes :**
- Ancrage spatial : associer l'état à un endroit dans la pièce
- Ancrage auditif : un mot ou un son particulier
- Cercle d'excellence : imaginer un cercle au sol, y "déposer" ses ressources

**Attention :**
- Ne jamais ancrer un état négatif involontairement
- Vérifier que le souvenir choisi est 100% positif
- L'ancrage s'use s'il est déclenché sans l'état associé`,
    keywords: ["ancrage", "ressource", "état", "confiance", "geste"],
  },
  {
    id: "recadrage",
    title: "Recadrage en 6 étapes",
    category: "pnl",
    duration: "20-30 min",
    difficulty: "intermediaire",
    summary:
      "Transformer un comportement indésirable en trouvant son intention positive et une alternative.",
    steps: [
      "Identifier le comportement problématique : \"Qu'est-ce que tu voudrais changer ?\"",
      "Établir la communication avec la partie responsable : \"Ferme les yeux, remercie cette partie de toi...\"",
      "Découvrir l'intention positive : \"Quel bénéfice cette partie cherche-t-elle à t'apporter ?\"",
      "Demander à la partie créative de générer 3 nouvelles façons d'obtenir ce bénéfice",
      "Vérifier l'accord de la partie responsable sur les alternatives",
      "Vérification écologique : \"Y a-t-il une autre partie qui s'y oppose ?\"",
    ],
    detail: `Le recadrage en 6 étapes repose sur un principe fondamental de la PNL : tout comportement a une intention positive.

**Le présupposé :**
Même un comportement destructeur (fumer, procrastiner, s'énerver...) protège quelque chose ou répond à un besoin.

**Comment guider :**
- Étape 2 : demander un signal "oui/non" (sensation, image, son interne)
- Étape 3 : si le client résiste, reformuler : "Si tu DEVAIS trouver un bénéfice..."
- Étape 4 : la partie créative est différente de la partie responsable — insister sur la créativité
- Étape 6 : ne JAMAIS sauter cette étape — elle évite les effets secondaires

**Exemples d'intentions positives courantes :**
- Procrastination → protection contre l'échec
- Colère → défense des limites personnelles
- Anxiété → anticipation du danger (survie)
- Suralimentation → réconfort / remplissage d'un vide`,
    keywords: ["recadrage", "comportement", "intention positive", "changement"],
  },
  {
    id: "modelisation",
    title: "Modélisation (Modèle SCORE)",
    category: "pnl",
    duration: "25-35 min",
    difficulty: "avance",
    summary:
      "Explorer un problème en profondeur avec le modèle Symptôme-Cause-Objectif-Ressource-Effet.",
    steps: [
      "SYMPTÔME : \"Décris précisément ce qui se passe. Où, quand, comment ?\"",
      "CAUSE : \"Qu'est-ce qui a déclenché ça ? Depuis quand ? Quel événement ?\"",
      "OBJECTIF : \"Qu'est-ce que tu veux à la place ? Comment tu sauras que c'est atteint ?\"",
      "RESSOURCE : \"De quoi as-tu besoin ? Qu'est-ce qui t'a déjà aidé dans le passé ?\"",
      "EFFET : \"Une fois l'objectif atteint, qu'est-ce que ça changera dans ta vie ?\"",
      "Relier les éléments : montrer le chemin Symptôme → Ressource → Objectif → Effet",
    ],
    detail: `Le modèle SCORE (Robert Dilts) est un outil de diagnostic puissant.

**S — Symptôme :** Ce que le client vit maintenant (état présent indésirable)
- Utiliser les sous-modalités : "C'est grand/petit ? Chaud/froid ? Où dans le corps ?"

**C — Cause :** L'origine du symptôme
- Attention : la cause perçue n'est pas toujours la vraie cause
- Remonter avec "Et avant ça ?" jusqu'au déclencheur

**O — Objectif :** L'état désiré, formulé positivement
- Critères SMART + sensoriel : "Tu verras quoi ? Entendras quoi ? Ressentiras quoi ?"

**R — Ressource :** Ce qui va permettre le changement
- Internes (qualités, expériences passées) ET externes (personnes, outils)

**E — Effet :** Les conséquences positives au-delà de l'objectif
- C'est le "pourquoi profond" — la motivation durable

**Usage spatial :**
On peut placer 5 feuilles au sol (S-C-O-R-E) et faire marcher le client dessus pour incarner chaque étape.`,
    keywords: ["score", "modélisation", "dilts", "diagnostic", "objectif"],
  },
  {
    id: "meta-modele",
    title: "Méta-modèle linguistique",
    category: "pnl",
    duration: "10-15 min",
    difficulty: "debutant",
    summary:
      "Questionner les généralisations, distorsions et omissions dans le langage du client.",
    steps: [
      "Écouter attentivement les phrases du client",
      "Repérer les GÉNÉRALISATIONS : \"toujours\", \"jamais\", \"tout le monde\" → Questionner : \"Toujours ? Il n'y a AUCUNE exception ?\"",
      "Repérer les OMISSIONS : \"Ça me stresse\" → \"Qu'est-ce qui précisément te stresse ?\"",
      "Repérer les DISTORSIONS : \"Il me déteste\" → \"Comment sais-tu qu'il te déteste ?\"",
      "Reformuler avec précision ce que le client exprime réellement",
      "Faire émerger la structure profonde derrière les mots",
    ],
    detail: `Le méta-modèle est l'outil linguistique fondamental de la PNL (Bandler & Grinder).

**Les 3 catégories :**

**1. Généralisations (quantifieurs universels)**
- "Personne ne m'écoute" → "Personne ? Vraiment personne ?"
- "Je n'y arrive jamais" → "Jamais ? Pas une seule fois ?"
- Opérateurs modaux : "Je dois", "Il faut" → "Que se passerait-il si tu ne le faisais pas ?"

**2. Omissions**
- Verbe non spécifié : "Il m'a blessé" → "Comment exactement ?"
- Comparaison tronquée : "C'est mieux" → "Mieux que quoi ?"
- Nominalisation : "Je veux la liberté" → "Être libre de faire quoi ?"

**3. Distorsions**
- Lecture de pensée : "Elle pense que..." → "Comment le sais-tu ?"
- Cause-effet : "Il me rend triste" → "Comment fait-il pour te rendre triste ?"
- Équivalence complexe : "Il ne m'appelle pas = il ne m'aime pas"

**Attention :** Ne pas mitrailler de questions ! Choisir 1-2 patterns clés par séance.`,
    keywords: ["méta-modèle", "linguistique", "questions", "croyances", "langage"],
  },
  {
    id: "croyances-limitantes",
    title: "Transformation de croyance limitante",
    category: "pnl",
    duration: "20-30 min",
    difficulty: "intermediaire",
    summary:
      "Identifier et transformer une croyance qui bloque le client, en la remplaçant par une croyance aidante.",
    steps: [
      "Identifier la croyance : \"Quelle pensée revient souvent et te bloque ?\"",
      "Explorer l'origine : \"Depuis quand tu crois ça ? Qui te l'a dit ?\"",
      "Tester la solidité : \"Est-ce que c'est TOUJOURS vrai ? Connais-tu une exception ?\"",
      "Créer le doute : \"Et si c'était juste une habitude de pensée ?\"",
      "Formuler la croyance aidante : \"Qu'est-ce que tu aimerais croire à la place ?\"",
      "Installer la nouvelle croyance avec un ancrage et de la visualisation",
    ],
    detail: `Les croyances limitantes sont des "vérités" que le client tient pour acquises mais qui le freinent.

**Croyances limitantes courantes :**
- "Je ne suis pas assez bien" (valeur personnelle)
- "Je n'ai pas le droit de..." (permission)
- "C'est impossible pour moi" (capacité)
- "Le monde est dangereux" (identité/environnement)

**Niveaux logiques de Dilts :**
Plus la croyance est haute dans les niveaux logiques, plus elle est ancrée :
1. Environnement → facile à changer
2. Comportement → moyen
3. Capacités → plus difficile
4. Croyances/Valeurs → profond
5. Identité → très profond
6. Spirituel/Mission → le plus profond

**Technique du "Musée des croyances" :**
1. Visualiser un musée avec des salles
2. Mettre la vieille croyance dans une vitrine "Anciennes expositions"
3. Créer une nouvelle salle lumineuse pour la nouvelle croyance
4. Y accrocher des preuves, des souvenirs qui la soutiennent`,
    keywords: ["croyance", "limitante", "transformation", "pensée", "blocage"],
  },
  {
    id: "meta-programmes",
    title: "Détection des métaprogrammes",
    category: "pnl",
    duration: "15-20 min",
    difficulty: "intermediaire",
    summary:
      "Identifier les filtres de perception du client pour adapter sa communication.",
    steps: [
      "VERS / LOIN DE : \"Qu'est-ce qui te motive ?\" → Il parle de ce qu'il VEUT ou de ce qu'il ÉVITE ?",
      "GLOBAL / DÉTAIL : \"Parle-moi de ton projet\" → Vue d'ensemble ou détails précis ?",
      "INTERNE / EXTERNE : \"Comment sais-tu que tu as bien fait ?\" → Sensation intérieure ou validation des autres ?",
      "PROACTIF / RÉACTIF : \"Comment tu gères ça ?\" → Il agit ou il attend que ça change ?",
      "SIMILITUDE / DIFFÉRENCE : \"Compare ton travail actuel au précédent\" → Il voit le pareil ou le différent ?",
      "Adapter son langage aux métaprogrammes dominants du client",
    ],
    detail: `Les métaprogrammes sont des filtres inconscients qui structurent notre perception.

**Les principaux métaprogrammes :**

**Vers / Loin de**
- Vers : motivé par les objectifs, les gains → Lui parler de ce qu'il va OBTENIR
- Loin de : motivé par l'évitement → Lui parler de ce qu'il va ÉVITER

**Global / Détail**
- Global : a besoin du tableau d'ensemble d'abord → Commencer par la vision
- Détail : a besoin des étapes précises → Donner un plan step-by-step

**Interne / Externe**
- Interne : "Je le sens" → Ne pas trop imposer, poser des questions
- Externe : "On m'a dit que" → Donner des témoignages, des preuves

**Proactif / Réactif**
- Proactif : "Je fais" → Donner des actions concrètes
- Réactif : "J'attends de voir" → Donner du temps, des options

**Application pratique :**
Si le client est "Loin de + Détail + Externe" → "Les gens qui ont suivi ce plan précis ont évité les erreurs courantes. Voici les 5 étapes..."`,
    keywords: ["métaprogrammes", "filtres", "communication", "motivation", "perception"],
  },
  {
    id: "positions-perception",
    title: "Positions de perception",
    category: "pnl",
    duration: "15-20 min",
    difficulty: "debutant",
    summary:
      "Voir une situation sous 3 angles différents pour gagner en compréhension et flexibilité.",
    steps: [
      "Position 1 (SOI) : \"Raconte la situation de TON point de vue. Que vois-tu, ressens-tu ?\"",
      "Briser l'état : se lever, bouger, parler d'autre chose",
      "Position 2 (L'AUTRE) : \"Maintenant, mets-toi à la place de l'autre personne. Que voit-elle ? Que ressent-elle ?\"",
      "Briser l'état à nouveau",
      "Position 3 (OBSERVATEUR) : \"Observe la scène de l'extérieur, comme un conseiller neutre. Que remarques-tu ?\"",
      "Synthèse : \"Qu'est-ce que tu comprends maintenant que tu ne voyais pas avant ?\"",
    ],
    detail: `Les 3 positions de perception permettent de sortir d'une vision tunnel.

**Position 1 — Associé (Soi)**
- Vécu personnel, émotions directes
- Utile pour : clarifier ses besoins, ressentir ses limites
- Piège : rester bloqué dans ses émotions

**Position 2 — L'autre**
- Empathie, compréhension de l'autre
- Utile pour : résoudre les conflits, comprendre les motivations
- Piège : trop s'identifier à l'autre, perdre ses propres besoins

**Position 3 — Méta / Observateur**
- Recul, objectivité, sagesse
- Utile pour : prendre de la distance, voir les patterns
- Piège : devenir trop détaché, intellectualiser

**Variante avec chaises :**
Placer 3 chaises en triangle. Le client s'assoit physiquement sur chaque chaise pour incarner chaque position. Le mouvement physique renforce le changement de perspective.

**Position 4 (avancé) — Le système**
Voir l'ensemble du système (famille, entreprise, société) comme un tout.`,
    keywords: ["positions", "perception", "empathie", "conflit", "recul"],
  },

  // ═══════════════════════════════════════════════
  // HYPNOSE
  // ═══════════════════════════════════════════════
  {
    id: "induction-progressive",
    title: "Induction par relaxation progressive",
    category: "hypnose",
    duration: "10-15 min",
    difficulty: "debutant",
    summary:
      "Guider le client vers un état de transe légère par la détente musculaire progressive.",
    steps: [
      "Installer le client confortablement, yeux fermés",
      "Commencer par la respiration : \"Inspire profondément... et expire lentement...\" (3-4 cycles)",
      "Relaxation descendante : front → yeux → mâchoire → nuque → épaules → bras → mains → dos → ventre → jambes → pieds",
      "Pour chaque zone : \"Relâche... détends... laisse aller toute la tension...\"",
      "Approfondir : \"À chaque expiration, tu descends un peu plus profondément...\"",
      "Vérifier la transe : ralentissement de la respiration, immobilité, micro-mouvements des paupières",
    ],
    detail: `L'induction progressive est la plus sûre et la plus universelle.

**Signes de transe à observer :**
- Respiration abdominale lente
- Immobilité croissante
- Relâchement de la mâchoire
- REM (mouvements oculaires rapides sous les paupières)
- Catalepsie légère (bras qui reste en l'air si soulevé)
- Déglutition ralentie

**Voix du praticien :**
- Ralentir progressivement le débit
- Baisser légèrement le volume
- Utiliser des phrases de plus en plus courtes
- Marquer des pauses de plus en plus longues

**Approfondissement :**
- Escalier descendant : "Imagine un escalier de 10 marches..."
- Ascenseur : "Les portes s'ouvrent sur un étage de plus en plus profond..."
- Comptage : "À chaque chiffre, tu doubles ta relaxation... 10... 9... 8..."

**Réveil :**
TOUJOURS ramener le client en douceur : "Je vais compter de 1 à 5, et à 5 tu seras complètement éveillé, reposé et bien..."`,
    keywords: ["induction", "relaxation", "transe", "détente", "respiration"],
  },
  {
    id: "metaphore-therapeutique",
    title: "Métaphore thérapeutique",
    category: "hypnose",
    duration: "15-25 min",
    difficulty: "intermediaire",
    summary:
      "Raconter une histoire métaphorique qui parle à l'inconscient du client pour faciliter le changement.",
    steps: [
      "Identifier le problème du client et la ressource nécessaire",
      "Créer une métaphore : personnage similaire au client, dans un contexte différent",
      "Le personnage rencontre un obstacle similaire (isomorphisme)",
      "Induire la transe légère (relaxation ou conversation hypnotique)",
      "Raconter l'histoire : le personnage trouve une ressource inattendue et surmonte l'obstacle",
      "Laisser un silence pour que l'inconscient intègre, puis ramener doucement",
    ],
    detail: `La métaphore thérapeutique est l'outil préféré de Milton Erickson.

**Principe :** L'inconscient comprend mieux les histoires que les explications logiques.

**Structure de la métaphore :**
1. Un personnage (isomorphe au client)
2. Un contexte (différent mais structurellement similaire)
3. Un problème (même structure que celui du client)
4. Une quête / un voyage
5. Une rencontre avec une ressource (mentor, objet, découverte)
6. La résolution (le personnage change)
7. Les bénéfices du changement

**Exemple :**
Client anxieux qui n'ose pas → "Il était une fois un petit ruisseau qui avait peur de rejoindre la rivière... Il ne savait pas que c'est en se laissant couler qu'il deviendrait plus fort..."

**Règles d'or :**
- Ne JAMAIS expliquer la métaphore après
- Utiliser le langage sensoriel (V-A-K)
- Intégrer les mots-clés du client dans l'histoire
- Le dénouement doit être ouvert (laisser l'inconscient choisir)

**Personnalisation :**
Utiliser les passions du client : s'il aime la mer → métaphore maritime, s'il aime la cuisine → métaphore culinaire...`,
    keywords: ["métaphore", "histoire", "inconscient", "erickson", "changement"],
  },
  {
    id: "regression",
    title: "Régression en âge",
    category: "hypnose",
    duration: "30-45 min",
    difficulty: "avance",
    summary:
      "Remonter à un souvenir fondateur pour le transformer et libérer le client d'un schéma répétitif.",
    steps: [
      "Induction classique + approfondissement (escalier ou ascenseur)",
      "Pont d'affect : \"Ressens cette émotion... et laisse ton inconscient te ramener au tout premier moment où tu as ressenti ça...\"",
      "Observer sans juger : \"Que vois-tu ? Quel âge as-tu ? Qui est là ?\"",
      "Apporter la ressource : \"Imagine que toi adulte va voir cet enfant... Que lui dis-tu ?\"",
      "Transformer le souvenir : l'enfant reçoit ce dont il avait besoin",
      "Revenir au présent avec la nouvelle ressource intégrée, puis réveil progressif",
    ],
    detail: `La régression est un outil puissant mais qui demande de l'expérience.

**Précautions IMPORTANTES :**
- Ne JAMAIS forcer un souvenir — laisser l'inconscient guider
- Si le client s'agite ou pleure → rassurer : "Tu es en sécurité, tu observes depuis l'extérieur"
- Avoir un protocole de sortie rapide (comptage 1-5 ferme)
- Ne PAS utiliser avec des traumas lourds sans formation spécifique

**Le pont d'affect :**
C'est la clé de la régression — on utilise l'émotion présente comme "pont" vers le passé. L'inconscient trouve automatiquement le souvenir fondateur.

**Transformation du souvenir :**
On ne cherche PAS à effacer le souvenir mais à le RÉINTERPRÉTER :
- L'adulte apporte à l'enfant ce qui manquait (sécurité, amour, permission)
- L'enfant intègre cette nouvelle ressource
- Le souvenir se "re-code" avec un nouveau sens

**Après la séance :**
- Le client peut être émotif pendant 24-48h — c'est normal
- Conseiller de boire de l'eau, se reposer
- Prévoir un suivi dans la semaine`,
    keywords: ["régression", "enfant intérieur", "souvenir", "trauma", "passé"],
  },
  {
    id: "autohypnose",
    title: "Protocole d'auto-hypnose",
    category: "hypnose",
    duration: "10 min",
    difficulty: "debutant",
    summary:
      "Enseigner au client une technique simple d'auto-hypnose qu'il peut pratiquer seul à la maison.",
    steps: [
      "Choisir un objectif simple et positif (ex: calme, confiance, sommeil)",
      "S'installer confortablement, fixer un point au plafond",
      "Prendre 3 grandes respirations profondes",
      "Compter de 10 à 1 en fermant progressivement les yeux",
      "Visualiser un lieu de sécurité (plage, forêt, montagne...) en V-A-K",
      "Répéter mentalement 3 fois une suggestion positive, puis compter de 1 à 5 pour revenir",
    ],
    detail: `L'auto-hypnose est un cadeau que vous faites à votre client — il devient autonome.

**La technique 3-2-1 (Betty Erickson) :**
1. Nommer 3 choses que je VOIS... 3 choses que j'ENTENDS... 3 choses que je RESSENS
2. Puis 2 choses de chaque...
3. Puis 1 chose de chaque...
→ Les yeux se ferment naturellement

**Le lieu de sécurité :**
C'est l'ancre de base de l'auto-hypnose. Le client doit le construire en détail :
- Visuel : couleurs, lumière, formes
- Auditif : sons, silence, musique
- Kinesthésique : température, textures, sensations

**Suggestions efficaces :**
- Courtes (max 10 mots)
- Positives (pas de "ne pas")
- Au présent ("Je suis calme" pas "Je serai calme")
- Personnelles ("Je" pas "On")

**Fréquence recommandée :**
- 5-10 min/jour pendant 21 jours pour ancrer l'habitude
- Idéal au réveil ou avant de dormir
- Peut être combiné avec l'ancrage PNL`,
    keywords: ["auto-hypnose", "autonomie", "relaxation", "suggestion", "quotidien"],
  },
  {
    id: "recadrage-hypnotique",
    title: "Recadrage hypnotique (Milton)",
    category: "hypnose",
    duration: "20-30 min",
    difficulty: "intermediaire",
    summary:
      "Utiliser le langage de Milton Erickson pour contourner les résistances conscientes.",
    steps: [
      "Induction conversationnelle : parler de façon vague et permissive",
      "Utiliser les présuppositions : \"Quand tu te sentiras mieux...\" (pas \"si\")",
      "Saupoudrage : glisser les suggestions dans une histoire anodine",
      "Truismes : \"Tout le monde a déjà vécu un moment de changement...\"",
      "Doubles liens : \"Tu préfères changer maintenant ou dans quelques instants ?\"",
      "Laisser l'inconscient faire le travail — ne pas diriger le contenu",
    ],
    detail: `Le modèle de Milton est l'inverse du méta-modèle : on utilise volontairement le flou.

**Les patterns de Milton :**

**Présuppositions :**
"Quand tu auras résolu ce problème..." → présuppose que c'est possible et certain

**Truismes :**
"Chaque personne a en elle des ressources insoupçonnées..." → impossible à contester

**Doubles liens :**
"Tu peux te détendre maintenant... ou tu peux d'abord prendre une grande respiration et te détendre ensuite..." → dans les deux cas, il se détend

**Saupoudrage (embedded commands) :**
"Tu sais, beaucoup de gens découvrent qu'ils peuvent SE SENTIR EN CONFIANCE quand ils LÂCHENT PRISE..." → les mots-clés sont marqués par un changement de ton

**Négation :**
"N'essaie PAS de te détendre trop rapidement..." → l'inconscient ignore le "ne pas"

**Confusion :**
Surcharger le conscient pour que l'inconscient prenne le relais — utiliser des phrases longues et complexes avec plusieurs niveaux d'imbrication.`,
    keywords: ["milton", "erickson", "langage", "suggestion", "inconscient", "résistance"],
  },

  // ═══════════════════════════════════════════════
  // DÉVELOPPEMENT PERSONNEL
  // ═══════════════════════════════════════════════
  {
    id: "roue-vie",
    title: "La Roue de la Vie",
    category: "dev",
    duration: "15-20 min",
    difficulty: "debutant",
    summary:
      "Évaluer les domaines de vie du client pour identifier les déséquilibres et les priorités.",
    steps: [
      "Dessiner un cercle divisé en 8 parts : Santé, Finances, Travail, Relations amoureuses, Famille, Amis, Loisirs, Développement personnel",
      "Le client note chaque domaine de 1 à 10 (satisfaction actuelle)",
      "Colorier chaque section jusqu'au niveau noté",
      "Observer la forme : \"Qu'est-ce qui te saute aux yeux ?\"",
      "Identifier les 2-3 domaines prioritaires à améliorer",
      "Définir UNE action concrète pour le domaine le plus bas",
    ],
    detail: `La Roue de la Vie est un outil de diagnostic rapide et visuel.

**Les 8 domaines classiques :**
1. **Santé** : physique, alimentation, sommeil, énergie
2. **Finances** : revenus, épargne, dettes, sécurité
3. **Travail/Carrière** : satisfaction, sens, évolution
4. **Relations amoureuses** : couple, intimité, communication
5. **Famille** : parents, enfants, fratrie
6. **Amis/Social** : réseau, sorties, appartenance
7. **Loisirs/Fun** : hobbies, vacances, plaisir
8. **Développement personnel** : apprentissage, spiritualité, sens

**Variantes :**
- Adapter les domaines au client (ex: ajouter "Créativité" pour un artiste)
- Faire 2 roues : "Maintenant" et "Dans 6 mois" (état désiré)
- Refaire tous les 3 mois pour mesurer la progression

**Attention :**
- Un 10/10 n'est PAS l'objectif — c'est impossible et stressant
- Le but est l'ÉQUILIBRE, pas la perfection
- Un domaine à 3 est plus urgent qu'un domaine à 6`,
    keywords: ["roue", "vie", "équilibre", "diagnostic", "domaines", "priorités"],
  },
  {
    id: "objectif-smart",
    title: "Définition d'objectif SMART+",
    category: "dev",
    duration: "15-20 min",
    difficulty: "debutant",
    summary:
      "Transformer un souhait vague en objectif concret, mesurable et motivant.",
    steps: [
      "Formuler le souhait : \"Qu'est-ce que tu veux ?\"",
      "SPÉCIFIQUE : \"Concrètement, ça veut dire quoi ? Qu'est-ce que tu fais différemment ?\"",
      "MESURABLE : \"Comment tu sauras que c'est atteint ? Quel critère précis ?\"",
      "ATTEIGNABLE : \"C'est réaliste ? Qu'est-ce qui pourrait t'empêcher ?\"",
      "RELEVANT : \"Pourquoi c'est important pour toi ? Quel est le sens profond ?\"",
      "TEMPOREL : \"Pour quand ? Quelle est la première étape cette semaine ?\"",
    ],
    detail: `Le SMART classique ne suffit pas toujours. Voici la version enrichie :

**SMART+ ajoute :**
- **Écologique** : est-ce bon pour TOI et pour ton entourage ?
- **Sensoriel** : quand tu l'auras atteint, que verras-tu / entendras-tu / ressentiras-tu ?
- **Contrôlable** : est-ce que ça dépend de TOI (pas des autres) ?

**Pièges courants :**
- Objectif négatif : "Je ne veux plus être stressé" → "Je veux me sentir calme"
- Trop vague : "Je veux être heureux" → "Je veux sourire en me levant le matin"
- Trop ambitieux d'un coup : décomposer en sous-objectifs

**La question magique :**
"Imagine qu'on est dans 6 mois et que tu as atteint ton objectif. Décris-moi une journée type."
→ Force le client à se projeter concrètement

**Le premier pas :**
L'objectif n'a de valeur que si le client part avec UNE ACTION à faire dans les 24h.`,
    keywords: ["objectif", "smart", "motivation", "action", "concret"],
  },
  {
    id: "valeurs",
    title: "Élicitation des valeurs",
    category: "dev",
    duration: "20-30 min",
    difficulty: "intermediaire",
    summary:
      "Identifier les valeurs profondes du client et les hiérarchiser pour guider ses choix de vie.",
    steps: [
      "Questionner : \"Qu'est-ce qui est vraiment important pour toi dans la vie ?\"",
      "Lister 8-10 valeurs spontanées (liberté, famille, sécurité, réussite...)",
      "Hiérarchiser par paires : \"Si tu devais choisir entre X et Y, lequel ?\"",
      "Obtenir un top 5 ordonné",
      "Explorer : \"Quand ta valeur n°1 est respectée, que ressens-tu ?\"",
      "Vérifier l'alignement : \"Ta vie actuelle respecte-t-elle ces valeurs ?\"",
    ],
    detail: `Les valeurs sont le GPS interne du client. Quand il est perdu, c'est souvent un conflit de valeurs.

**Comment identifier les valeurs :**
- "Qu'est-ce qui te met en colère ?" → valeur violée
- "Qu'est-ce qui te rend fier ?" → valeur honorée
- "Pourquoi c'est important ?" (demander 3 fois) → valeur profonde

**Hiérarchisation par paires :**
Liberté vs Sécurité → "Si tu ne pouvais en garder qu'une ?"
C'est inconfortable mais révélateur.

**Conflits de valeurs :**
La souffrance vient souvent d'un conflit :
- Liberté vs Sécurité (quitter son emploi ?)
- Famille vs Carrière (travailler le week-end ?)
- Authenticité vs Appartenance (dire ce qu'on pense ?)

**Résolution :**
1. Reconnaître le conflit
2. Chercher comment honorer LES DEUX valeurs
3. Ou accepter de prioriser temporairement l'une

**Application pratique :**
Avant chaque grande décision, le client vérifie : "Est-ce aligné avec mon top 3 ?"`,
    keywords: ["valeurs", "hiérarchie", "sens", "alignement", "choix"],
  },
  {
    id: "ligne-du-temps",
    title: "Ligne du temps",
    category: "dev",
    duration: "20-30 min",
    difficulty: "intermediaire",
    summary:
      "Visualiser son parcours passé-présent-futur pour prendre du recul et se projeter positivement.",
    steps: [
      "Tracer une ligne au sol (avec une corde ou en imagination) : passé à gauche, futur à droite",
      "Le client se place sur le PRÉSENT",
      "Regarder vers le PASSÉ : \"Quelles étapes clés t'ont amené ici ? Quelles ressources as-tu acquises ?\"",
      "Regarder vers le FUTUR : \"Qu'est-ce que tu vois dans 1 an ? 5 ans ?\"",
      "Marcher vers le futur et s'arrêter au moment de l'objectif atteint : \"Que ressens-tu ?\"",
      "Revenir au présent avec les apprentissages : \"Quel est le prochain pas ?\"",
    ],
    detail: `La ligne du temps est un outil spatial qui mobilise le corps et l'inconscient.

**Installation :**
- Physiquement : une corde de 3-4 mètres au sol, ou des post-its
- En imagination : les yeux fermés, visualiser un chemin

**Le passé :**
- Placer les événements marquants (positifs ET négatifs)
- Pour chaque événement : "Quelle ressource tu en as tirée ?"
- Le passé devient un réservoir de ressources, pas un poids

**Le futur :**
- Se placer physiquement au "moment de l'objectif atteint"
- Ressentir pleinement (V-A-K)
- Regarder en arrière : "Qu'as-tu fait pour y arriver ?"
- C'est le "rétro-planning sensoriel"

**Variantes avancées :**
- Survol : monter "au-dessus" de la ligne pour avoir une vue d'ensemble
- Nettoyage : retourner sur un événement passé et le transformer (comme en régression)
- Multi-lignes : tracer la ligne "si je ne change rien" et "si je change maintenant"

**Puissant combiné avec :** Objectif SMART + Ancrage de ressource`,
    keywords: ["ligne", "temps", "passé", "futur", "projection", "parcours"],
  },
  {
    id: "gestion-emotions",
    title: "Gestion des émotions (RAIN)",
    category: "dev",
    duration: "10-15 min",
    difficulty: "debutant",
    summary:
      "Technique en 4 étapes pour accueillir et transformer une émotion difficile.",
    steps: [
      "R — RECONNAÎTRE : \"Qu'est-ce que tu ressens en ce moment ? Nomme l'émotion.\"",
      "A — ACCEPTER : \"C'est OK de ressentir ça. Cette émotion a une raison d'être.\"",
      "I — INVESTIGUER : \"Où est-ce dans ton corps ? Quelle est sa forme, sa couleur, sa température ?\"",
      "N — NON-IDENTIFICATION : \"Tu N'ES PAS cette émotion. Tu la RESSENS. Elle passe comme un nuage.\"",
      "Observer le changement : l'émotion diminue naturellement quand elle est accueillie",
      "Ancrer le calme retrouvé si souhaité",
    ],
    detail: `RAIN (Tara Brach) est une technique de pleine conscience appliquée aux émotions.

**Pourquoi ça marche :**
- Résister à une émotion l'AMPLIFIE (effet ressort)
- L'accueillir la DIMINUE naturellement (elle a été "entendue")
- L'investiguer corporellement la TRANSFORME

**R — Reconnaître :**
Nommer l'émotion avec précision :
- Pas "Je me sens mal" → "Je ressens de la frustration mêlée de tristesse"
- Le simple fait de nommer active le cortex préfrontal et calme l'amygdale

**A — Accepter :**
- NE PAS dire "Calme-toi" ou "C'est rien"
- DIRE "C'est normal de ressentir ça" ou "Cette émotion essaie de te dire quelque chose"

**I — Investiguer :**
- Localiser dans le corps (gorge serrée, ventre noué, poitrine lourde...)
- Donner des sous-modalités : taille, couleur, texture, mouvement
- Demander : "Si cette sensation pouvait parler, que dirait-elle ?"

**N — Non-identification :**
- "Je SUIS en colère" → "Je RESSENS de la colère"
- La différence est fondamentale : l'identité vs l'expérience temporaire`,
    keywords: ["émotions", "rain", "accueillir", "pleine conscience", "corps"],
  },
];
