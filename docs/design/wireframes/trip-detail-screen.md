# Trip Detail Screen – Wireframes

> Issue #8 – Core & navigation. Base header (logo, theme, lang, user) est fixe sur toute l’app, y compris cette page.

---

## Desktop (layout simple)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Voyagely                    [Lang] [Theme] [Avatar] User  [Logout]   │  ← Header global fixe
├─────────────────────────────────────────────────────────────────────────────┤
│ ← Retour au tableau de bord                                                 │  ← Barre de contexte (sticky sous le header)
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Tokyo Exploration                                                     │  │
│  │  📍 Tokyo, Japan    📅 Dec 4 – Dec 11, 2025    👥 2 membres            │  │  ← Hero (titre, lieu, dates, membres)
│  │                                    [Modifier]  [Supprimer]             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Itinéraire  |  Météo  |  Explorer  |  Chat                                │  ← Tabs (sticky)
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ + Ajouter une activité ]                                                 │
│                                                                             │
│  ┌─ lundi 3 novembre 2025 ─────────────────────────────────────────────┐  │
│  │  1 activité                                                            │  │
│  │  ┌──────────────────────────────────────────────────┬──────────────┐  │  │
│  │  │ Visit Shibuya Crossing                            │  👍  0  👎   │  │  │
│  │  │ Sightseeing                                        │              │  │  │
│  │  │ Description…   🕐 18h–19h   💵 0 €/pers.           │              │  │  │
│  │  └──────────────────────────────────────────────────┴──────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**À prévoir (Issue #8) :**

- Contraintes (budget, rythme, enfants) dans le hero ou sous-titre
- Liste des membres + rôles (owner, editor, viewer)
- Badge statut (Planifié / Verrouillé / Archivé)
- Persistance de l’onglet (URL ou storage)

---

## Mobile (layout plus dense)

```
┌─────────────────────────────┐
│ [Logo] Voyagely       [☰]   │  ← Header global fixe (hamburger = menu lang/theme/user/logout)
├─────────────────────────────┤
│ ← Retour au tableau de bord │  ← Contexte
├─────────────────────────────┤
│                             │
│  Tokyo Exploration          │
│  📍 Tokyo, Japan            │
│  📅 4–11 déc. 2025          │
│  👥 1 membre                │
│         [Modifier] [Suppr.] │
│                             │
├─────────────────────────────┤
│ Itinéraire | Météo | … | Chat│  ← Tabs (scroll horizontal si besoin)
├─────────────────────────────┤
│                             │
│  [ + Ajouter une activité ] │
│                             │
│  lundi 3 novembre 2025      │
│  1 activité                 │
│  ┌─────────────────────┬──┐ │
│  │ Visit Shibuya Cross. │👍│ │
│  │ Sightseeing          │0 │ │
│  │ Description…         │👎│ │
│  │ 🕐 18h–19h  💵 0 €   │  │ │
│  └─────────────────────┴──┘ │
│                             │
│  (optionnel plus tard)      │
│  ┌─────────────────────┐   │
│  │ Itin. │ Météo │ … │ 💬 │   │  ← Bottom nav (Issue #8)
│  └─────────────────────┘   │
└─────────────────────────────┘
```

**Spécificités mobile :**

- Même header global que le dashboard (logo + hamburger).
- Hero en bloc vertical : titre, infos, boutons en dessous ou à droite.
- Tabs en une ligne avec scroll horizontal si besoin.
- Option future : bottom navigation pour les onglets (Itinéraire, Météo, Explorer, Chat) pour le pouce.

---

## Éléments communs

| Zone               | Desktop                          | Mobile                                             |
| ------------------ | -------------------------------- | -------------------------------------------------- |
| Header global      | Logo, Lang, Theme, User, Logout  | Logo, hamburger (menu = lang, thème, user, logout) |
| Contexte           | ← Retour au tableau de bord      | Idem                                               |
| Hero               | Titre + infos + actions à droite | Titre + infos + actions en dessous                 |
| Tabs               | 4 onglets inline                 | 4 onglets, scroll horizontal                       |
| Contenu            | Grille / liste large             | Liste pleine largeur                               |
| (futur) Bottom nav | —                                | Option : 4 icônes fixées en bas                    |

---

## Fait vs à faire (rappel Issue #8)

- [x] Header global (logo, theme, lang, user) visible et fixe sur Trip Detail
- [x] Retour dashboard, hero (titre, dates, lieu, membres), Edit/Delete
- [ ] Contraintes dans le hero
- [ ] Liste membres + rôles, badge statut
- [ ] Modal confirmation suppression
- [ ] Persistance onglet, (option) bottom nav mobile
- [ ] Gestion membres (inviter, rôles, retirer)
