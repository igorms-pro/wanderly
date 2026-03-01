# Vue Planning – Brainstorm (cœur de l’app)

> Ce que l’on doit **voir** et **faire** dans la vue Planning : lieu, participants, budget, coûts (exact ou fourchette), transport, contraintes, et création de planning avec l’IA. Ce doc va évoluer ; la vue prendra du temps.

---

## 0. En base : ce qu’on a vs ce qu’il manque (pour l’“event” / activité)

| Besoin vue Planning                            | En base aujourd’hui                                                                                       | Manque                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Budget voyage**                              | `trips.budget_cents`, `trips.constraints` (budget_total_cents, budget_per_person_cents), `trips.currency` | Rien, on a tout.                                                                           |
| **Contraintes** (rythme, enfants, préférences) | `trips.constraints` (pace, has_children, preferences, must_dos, no_gos)                                   | Rien.                                                                                      |
| **Lieu** (activité)                            | `activities.place_id`, `lat`, `lon`, `title`                                                              | Lieu structuré (nom, adresse) → optionnel, via places_cache plus tard.                     |
| **Horaire**                                    | `activities.start_time`, `end_time`                                                                       | Rien.                                                                                      |
| **Coût exact**                                 | `activities.cost_cents`, `currency`                                                                       | Rien.                                                                                      |
| **Coût fourchette**                            | —                                                                                                         | `cost_min_cents`, `cost_max_cents` sur `activities`.                                       |
| **Transport** (comment on y va)                | —                                                                                                         | Champs transport sur `activities` (type, durée, coût ou note).                             |
| **Qui participe** (par activité)               | —                                                                                                         | Table `activity_participants(activity_id, user_id)` = users connectés (login obligatoire). |
| **Statut / votes**                             | `activities.status`, table `votes`                                                                        | Rien.                                                                                      |

→ **Migration 009** déjà faite : `activities` a transport + fourchette de coût ; table **activity_participants** (optionnelle) pour “qui fait cette activité” quand ce n’est pas tout le groupe — par défaut on considère “tous les membres du trip”. Si on n’utilise pas cette finesse tout de suite, la table reste en base pour plus tard.

---

## 1. Objectif de la vue Planning

- **Une seule vue** où le groupe voit et construit le plan du voyage : activités, qui participe, combien ça coûte, comment on s’y rend, et comment tout ça respecte le budget et les contraintes.
- **Intégration IA** : génération de scénarios d’itinéraire à partir des contraintes (budget, rythme, enfants, préférences).
- **Décisions de groupe** : votes, validation, et visibilité “qui fait quoi / qui participe à quoi”.

---

## 2. Ce qu’on doit VOIR (affichage)

### 2.1 Par activité (ou par “bloc” jour)

| Élément           | Description                                                                 | Données actuelles                        | À prévoir                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lieu**          | Où ça se passe (nom, adresse, carte)                                        | `place_id`, `title`, `lat`/`lon`         | Lier à un lieu (nom, adresse) ; lien vers carte / détail lieu                                                                                            |
| **Qui participe** | Qui du voyage est concerné / participe à cette activité                     | —                                        | Table ou lien `activity_participants` (activity_id, user_id) ou “tous” par défaut                                                                        |
| **Budget / coût** | Ce que ça coûte (exact ou fourchette)                                       | `cost_cents`, `currency` sur activity    | Si pas de prix exact : `cost_min_cents` / `cost_max_cents` (range) ; afficher “gratuit”, “X €”, “X–Y €”                                                  |
| **Transport**     | Comment on y va (avant / après l’activité)                                  | —                                        | Champ “transport” (type, durée, coût optionnel) ou bloc “trajet” entre activités                                                                         |
| **Horaire**       | Quand                                                                       | `start_time`, `end_time`                 | Déjà là ; afficher time range clairement                                                                                                                 |
| **Statut**        | Proposé / validé / rejeté                                                   | `status` (proposed, confirmed, rejected) | Déjà là ; refléter dans l’UI (badge, filtre)                                                                                                             |
| **Votes**         | Afficher **seulement si** on n’a pas tous les votes **ni** validé par admin | `votes` (up/down)                        | Si validé par admin (ou status = confirmed) → afficher uniquement badge “Validé”. Si rejeté → “Rejeté”. Sinon afficher “X pour, Y contre” + boutons vote |

### 2.2 Au niveau voyage (contexte global)

| Élément                    | Description                                                                               | Données actuelles                                                                       | À prévoir                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Budget voyage**          | Budget total ou par personne                                                              | `trips.constraints` (budget_per_person_cents, budget_total_cents), `trips.budget_cents` | Affichage synthèse : “Budget : X €/pers” ou “X € total”                                                 |
| **Dépenses cumulées**      | Somme des coûts des activités du voyage (proposées + validées) comparée au budget du trip | Somme des `activities.cost_cents` ; budget dans `trips.constraints`                     | Afficher “X € utilisés / Y € budget” (ou “X € utilisés” si pas de budget) ; indicateur OK / dépassement |
| **Participants au voyage** | Qui fait partie du trip                                                                   | `trip_members`                                                                          | Liste + rôles ; utilisé pour “qui participe” par activité                                               |
| **Contraintes**            | Rythme, enfants, préférences, must-do, no-go                                              | `trips.constraints` (pace, has_children, preferences, must_dos, no_gos)                 | Résumé court dans la vue (ex. “Rythme cool · Avec enfants · Nature, bouffe”)                            |
| **Lieu principal**         | Destination du voyage                                                                     | `trips.destination_text`                                                                | Déjà là ; peut servir de contexte pour l’IA et les cartes                                               |

---

## 3. Données et entités

### 3.1 Déjà en place

- **Trip** : `destination_text`, `start_date`, `end_date`, `status`, `budget_cents`, `currency`, `constraints` (JSONB : budget_per_person_cents, budget_total_cents, pace, has_children, preferences, must_dos, no_gos).
- **Activity** : `trip_id`, `itinerary_day_id`, `place_id`, `title`, `description`, `category`, `start_time`, `end_time`, `cost_cents`, `currency`, `lat`, `lon`, `status`, `source`.
- **Votes** : `activity_id`, `user_id`, `choice` (up/down).
- **Trip members** : qui est dans le voyage (owner, editor, viewer, moderator).

### 3.2 À ajouter en base (pour avoir tout pour l’event)

- **Coût en fourchette** (activités)
  - Colonnes : `cost_min_cents`, `cost_max_cents` (INTEGER NULL) sur `activities`.
  - Si les deux sont NULL, on utilise `cost_cents` (prix unique). Sinon afficher “X–Y €”.
- **Transport** (activités)
  - MVP : `transport_notes` (TEXT) et/ou `transport_type` (TEXT, ex. foot / car / train / taxi), `transport_duration_minutes` (INTEGER), `transport_cost_cents` (INTEGER), tous NULLable.
  - Plus tard : segments entre activités si besoin.
- **Qui participe à quelle activité** (optionnel)
  - Table `activity_participants (activity_id, user_id)` en base (migration 009). Utile seulement si on veut afficher “Marie et Paul font cette activité” (sous-ensemble des membres). **Par défaut** = tous les membres du trip, pas besoin de remplir la table.
  - Voir aussi `docs/design/invite-and-participants-flow.md` (flux lien d’invite → signup → rejoindre le voyage).
- **Lieu structuré**
  - **Nouvelle issue** : place API direct (nom, adresse). Garder pour l’instant `place_id`, `lat`, `lon`.

---

## 4. Budget et contraintes (lien avec l’IA)

- **Contraintes trip** : déjà en base (`constraints`). À afficher en résumé dans la vue Planning et à envoyer à l’IA à chaque génération.
- **Règles à respecter** :
  - Budget : somme des coûts (ou fourchettes max) ≤ budget trip (total ou par personne × nb participants).
  - Rythme (pace) : nombre d’activités / jour, temps libre (déjà partiellement modélisé en prompt).
  - Enfants, must_dos, no_gos : injectés dans le prompt IA.
- **Feedback dans l’UI** :
  - Indicateur “Budget OK” / “Dépassement” selon somme des activités vs budget.
  - Optionnel : alerte si une activité dépasse une certaine part du budget.

---

## 5. Transport

- **MVP** : afficher un champ texte ou un type (à pied, taxi, train, voiture, etc.) par activité (“comment on arrive / repart”). Pas forcément de coût détaillé au début.
- **Évolution** : trajets entre activités (origine → destination), durée, coût, pour une vue “journée” plus réaliste et pour l’IA (enchaînements logiques).

---

## 6. Création de planning avec l’IA (plus tard)

- **À la base** : l’IA génère l’itinéraire en premier ; ensuite nous on valide ou on propose autre chose. Pas d’admin qui pré-valide la planif IA avant le vote — tout le monde vote / propose.
- **Inputs** : Trip (destination, dates, contraintes). **Outputs** : scénario(s) avec activités (titre, lieu, créneau, coût, transport si dispo).
- **Workflow** : bouton “Générer un itinéraire” → backend IA → parsing → enregistrement → affichage ; puis votes / propositions du groupe.
- Détail d’implémentation à prévoir dans une issue dédiée.

---

## 7. Résumé “ce qu’on doit voir” (checklist)

- **Lieu** : par activité (nom, lien carte si possible).
- **Qui du voyage participe** : par activité (ou “tous”) — besoin données (participants par activité).
- **Budget voyage** : rappel du budget (total ou/pers) depuis les contraintes.
- **Coût par activité** : montant exact ou fourchette (X–Y €) ; “gratuit” si 0.
- **Dépenses cumulées** : somme des coûts vs budget (barre ou indicateur).
- **Transport** : au moins type ou texte “comment on y va” (MVP) ; plus tard trajets détaillés.
- **Contraintes** : résumé court (rythme, enfants, préférences) visible dans la vue.
- **Statut et votes** : afficher votes + boutons seulement si activité pas encore validée par admin (et pas tous les votes) ; sinon badge “Validé” ou “Rejeté” uniquement.
- **Création IA** : bouton + flow qui utilise les contraintes et renvoie des activités avec lieu, horaire, coût (ou range).

---

## 8. Décisions / issues ailleurs

- **Lien d’invitation** (générer lien, page `/join/:code`, accepter → trip_members) : à faire dans l’**issue création du trip** (ou issue dédiée invite).
- **Lieu structuré** (nom, adresse lieu) : **nouvelle issue** “place API direct”.
- **IA itinéraire** : plus tard ; rappel : l’IA fait le plan en premier, puis le groupe valide ou propose autre chose ; pas de pré-validation admin avant vote.

## 9. Prochaines étapes possibles

1. **Maquettes** : vue “jour” et “voyage” avec lieu, budget, coût, transport (activity_participants optionnel).
2. **Itérer** : affichage (lecture seule) puis édition des champs 009 (transport, fourchette coût).
3. **IA** : issue dédiée quand on attaque la génération d’itinéraire.

---

_Doc à mettre à jour au fil des décisions (données, écrans, IA)._
