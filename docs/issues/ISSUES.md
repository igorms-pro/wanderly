# Voyagely Issues & Tasks Tracker

> Group travel planning — constraints, votes, chat, AI scenarios, expenses, PWA.

**Last Updated:** May 26, 2026 — fichier réaligné : **QA manuelle** en tête ; issues livrées **archivées** (tableau compact).

## 📋 Status Legend

| Symbole | Signification                          |
| ------- | -------------------------------------- |
| 🔵      | **Testing** — QA / validation manuelle |
| 🔴      | **Not started** — à planifier          |
| 🟡      | **In progress**                        |
| 🟢      | **Completed** — code mergé sur `main`  |
| 🟣      | **On hold** — reporté explicitement    |

**Repo :** `main` = MVP (#0–#13) + Premium code (#17) + refactor (#35) + Phase 2 (#14–#16). **CI :** [Actions `main`](https://github.com/igorms-pro/voyagely/actions?query=branch%3Amain).

| Terme           | Signification                                             |
| --------------- | --------------------------------------------------------- |
| **Doc #**       | Numéro dans ce fichier (≠ toujours le numéro GitHub)      |
| **Phase 2**     | #14 dépenses, #15 PWA, #16 templates — **tous livrés**    |
| **Refactor v2** | Doc #35 — split fichiers, **pas** une feature utilisateur |

---

## 🚀 IMMEDIATE NEXT ACTION

1. **🔵 QA manuelle — Premium #17** (Stripe **test mode**, `/account`, carte `4242…`) — checklist ci-dessous.
2. **🔵 QA manuelle — Templates #16** (login requis) : picker dashboard, duplicate trip, modals share/invite.
3. **CI** — dernier run `main` vert après [PR #56](https://github.com/igorms-pro/voyagely/pull/56).
4. **🟣 Stripe live prod** — reporté (`sk_live_`, `SITE_URL` prod) ; rester en test.

---

## 📑 Registre des issues

### Actives (à faire maintenant)

| Doc #     | Sujet                                      | Statut     | Détail                                                                                    |
| --------- | ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| **QA-17** | Premium Stripe — validation bout en bout   | 🔵 Testing | Code 🟢 [PR #44](https://github.com/igorms-pro/voyagely/pull/44) ; checklist § ci-dessous |
| **QA-16** | Templates & sharing — parcours authentifié | 🔵 Testing | Code 🟢 [PR #55](https://github.com/igorms-pro/voyagely/pull/55) ; 3 flows manuels        |

### Backlog produit (pas encore issue GitHub #18+)

| Idée                              | Priorité | Notes                                                                         |
| --------------------------------- | -------- | ----------------------------------------------------------------------------- |
| Dépenses avancées (#14 suite)     | MEDIUM   | Multi-devises, export CSV/PDF ; offline expenses non fait                     |
| Test auto webhook Stripe          | LOW      | Payload signé mock                                                            |
| E2E chemins critiques             | MEDIUM   | Expenses, `/account`, templates (besoin `SUPABASE_SERVICE_ROLE_KEY` en local) |
| i18n locales `account.*`          | LOW      | EN/FR OK ; autres locales strings obsolètes                                   |
| Chat reply threads                | LOW      | Optionnel, hors MVP                                                           |
| Dashboard coûts IA admin          | LOW      | Optionnel (#12)                                                               |
| Facebook login                    | 🟣       | App FB à vérifier                                                             |
| Stripe live prod                  | 🟣       | Quand domaine + décision                                                      |
| Phase 3 (B2B, audit UI, booking…) | 🔴       | À découper — voir `docs/architecture_design.md` § Roadmap                     |

### Archive — livré sur `main` (ne plus maintenir le détail ici)

| Doc # | Sujet                        | PR / GitHub                                                                                                                                                                                                                           |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–10  | Foundation, écrans MVP       | `main` — PR #34, #38, #39                                                                                                                                                                                                             |
| 11    | Chat & collaboration         | [#40](https://github.com/igorms-pro/voyagely/issues/40) CLOSED                                                                                                                                                                        |
| 12    | IA Edge + quotas tier        | `main`, migration `018`                                                                                                                                                                                                               |
| 13    | Explore, météo, carte        | [#45](https://github.com/igorms-pro/voyagely/issues/45), [#47](https://github.com/igorms-pro/voyagely/issues/47) — [PR #46](https://github.com/igorms-pro/voyagely/pull/46), [PR #48](https://github.com/igorms-pro/voyagely/pull/48) |
| 17    | Premium Stripe (impl.)       | [#42](https://github.com/igorms-pro/voyagely/issues/42) — [PR #44](https://github.com/igorms-pro/voyagely/pull/44), migration `019`                                                                                                   |
| 35    | Refactor v2 split fichiers   | [#35](https://github.com/igorms-pro/voyagely/issues/35) — [PR #49](https://github.com/igorms-pro/voyagely/pull/49)                                                                                                                    |
| 14    | Dépenses Tricount-like MVP   | [#50](https://github.com/igorms-pro/voyagely/issues/50) — [PR #51](https://github.com/igorms-pro/voyagely/pull/51), `020`                                                                                                             |
| 15    | PWA & offline (chat + votes) | [#52](https://github.com/igorms-pro/voyagely/issues/52) — [PR #53](https://github.com/igorms-pro/voyagely/pull/53)                                                                                                                    |
| 16    | Templates, duplicate, invite | [#54](https://github.com/igorms-pro/voyagely/issues/54) — [PR #55](https://github.com/igorms-pro/voyagely/pull/55), `021`                                                                                                             |

**Détail historique supprimé** (mai 2026) pour alléger ce fichier. Plans techniques refactor : `docs/codebase/SPLIT_*.md`.

### Itinéraire vs scénarios (rappel)

- **Itinéraire actif** = vérité du voyage (activités par jour, votes).
- **Scénarios** = options (souvent IA) ; import = copie vers l’itinéraire actif.

---

## 🔵 QA manuelle — Premium (#17)

**Prérequis :** `pnpm dev` → `http://localhost:5173` ; Edge secrets `STRIPE_*` + `SITE_URL=http://localhost:5173` ; Stripe **test mode** ; compte **Free** (`profiles.ai_tier = free`).

| #   | Étape                                      | Attendu                                                                  |
| --- | ------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | Login → **`/account`**                     | Badge **Free** ; cartes mensuel / annuel                                 |
| 2   | **Subscribe monthly** → Checkout           | `4242 4242 4242 4242` · `12/34` · CVC `123`                              |
| 3   | Retour `?checkout=success`                 | Sync → **Premium** ; **Gérer l’abonnement** ; pas de SQL manuel          |
| 4   | Stripe Dashboard → Webhooks                | `checkout.session.completed` / `customer.subscription.updated` → **200** |
| 5   | **Manage subscription** → portail → retour | Même onglet, `/account`, toujours Premium                                |
| 6   | Annuler abo (portail test)                 | `customer.subscription.deleted` → **200** → **Free**                     |
| 7   | Trip → génération scénario IA              | Free **3**/trip vs Premium **10** (`aiScenarioLimits.ts`)                |
| 8   | **Refresh** sur `/account`                 | Badge = `profiles` en base                                               |

**Carte test :** `4242 4242 4242 4242`. Déclin : `4000 0000 0000 0002`.

- [ ] **1–3** Checkout → Premium sans SQL
- [ ] **4** Webhooks **200**
- [ ] **5** Portail → retour `/account`
- [ ] **6–7** Annulation → Free + quotas free
- [ ] **8** Refresh cohérent

---

## 🔵 QA manuelle — Templates (#16)

- [ ] Dashboard → créer trip **from template** (picker)
- [ ] Trip → **Duplicate trip** (itinéraire cloné)
- [ ] Trip → **Share / invite** → lien → `/invite/:code` → rejoindre (2e compte ou session)

---

## 💡 Idées backlog (non issues)

- [ ] Multi-language trip planning
- [ ] Météo alertes + ajustements itinéraire
- [ ] Intégrations booking
- [ ] Photos dans trips
- [ ] Voice / AR-VR

---

## 📝 Décisions (rappel)

- Planification + décision groupe **avant** monétisation ; Premium = quotas IA (`ai_tier`).
- Pas de moteur de réservation ; pas de réseau social.
- Dépenses MVP livrées ; paiements réels hors scope.
- Humains proposent, IA suggère, le groupe **vote** et peut **finaliser** l’itinéraire.

---

## 📊 Synthèse

| Zone                         | État                                      |
| ---------------------------- | ----------------------------------------- |
| Code MVP + Phase 2 + Premium | 🟢 sur `main`                             |
| Validation (QA)              | 🔵 en cours — **bloque « done » produit** |
| Stripe live                  | 🟣 reporté                                |
| Prochaine issue dev          | 🔴 à créer (#18+ après QA)                |

**CRITICAL PATH :** QA #17 → QA #16 → CI → (plus tard) backlog / roadmap Phase 3.

**BLOCKER :** aucun bloquant code ; **QA manuelle** = gate principal.
