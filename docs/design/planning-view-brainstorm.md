# Vue Planning – Brainstorm (cœur de l’app)

> Ce que l’on doit **voir** et **faire** dans la vue Planning : lieu, participants, budget, coûts (exact ou fourchette), transport, contraintes, et création de planning avec l’IA. Ce doc va évoluer ; la vue prendra du temps.

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

- **Trip** : `destination_text`, `start_date`, `end_date`, `status`, `constraints` (JSONB : budget, pace, has_children, preferences, must_dos, no_gos).
- **Activity** : `trip_id`, `itinerary_day_id`, `place_id`, `title`, `description`, `category`, `start_time`, `end_time`, `cost_cents`, `currency`, `lat`, `lon`, `status`, `source`.
- **Votes** : `activity_id`, `user_id`, `choice` (up/down).
- **Trip members** : qui est dans le voyage (owner, editor, viewer, moderator).

### 3.2 À ajouter / préciser (pour la vue Planning)

- **Coût en fourchette** (optionnel)
  - Soit : `cost_min_cents` / `cost_max_cents` sur `activities` (et garder `cost_cents` pour “prix unique”).
  - Affichage : “5–15 €”, “gratuit”, “~10 €”.

- **Transport / trajet** (optionnel)
  - Option A : champs sur l’activité (`transport_type`, `transport_duration_minutes`, `transport_cost_cents`).
  - Option B : entité “leg” ou “segment” entre deux activités (origine, destination, mode, durée, coût).
  - À trancher selon complexité (MVP : champ simple “comment on y va” texte ou type prédéfini).

- **Qui participe à quelle activité**
  - Option A : “tous les membres” par défaut, pas de détail.
  - Option B : table `activity_participants (activity_id, user_id)` ou champ JSONB sur activity.
  - Permet d’afficher “Marie, Paul, Jean” ou “3/5 participants” et d’alimenter l’IA (“plan pour 3 personnes ce jour-là”).

- **Lieu structuré**
  - Aujourd’hui : `place_id` (texte), `lat`/`lon`.
  - Plus tard : nom, adresse, lien détail lieu (places_cache ou API) pour afficher “Lieu” proprement dans la vue.

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

## 6. Création de planning avec l’IA

- **Inputs** :
  - Trip : destination, dates, contraintes (budget, rythme, enfants, préférences, must_dos, no_gos).
  - Optionnel : nombre de scénarios (1–3), préférence “relax / équilibré / intense”.
- **Outputs** :
  - Un ou plusieurs scénarios (itineraries + itinerary_days + activities).
  - Chaque activité : titre, lieu (place_id / nom), créneau, coût (ou fourchette), éventuellement transport.
- **Workflow** :
  - Bouton “Générer un itinéraire” dans la vue Planning.
  - Choix des contraintes (ou reprise des contraintes du trip).
  - Appel backend → IA → parsing / validation → enregistrement en base.
  - Affichage dans la même vue (liste / calendrier / timeline) avec tout ce qu’on doit voir (lieu, qui participe, budget, coût, transport si dispo).

---

## 7. Résumé “ce qu’on doit voir” (checklist)

- [ ] **Lieu** : par activité (nom, lien carte si possible).
- [ ] **Qui du voyage participe** : par activité (ou “tous”) — besoin données (participants par activité).
- [ ] **Budget voyage** : rappel du budget (total ou/pers) depuis les contraintes.
- [ ] **Coût par activité** : montant exact ou fourchette (X–Y €) ; “gratuit” si 0.
- [ ] **Dépenses cumulées** : somme des coûts vs budget (barre ou indicateur).
- [ ] **Transport** : au moins type ou texte “comment on y va” (MVP) ; plus tard trajets détaillés.
- [ ] **Contraintes** : résumé court (rythme, enfants, préférences) visible dans la vue.
- [ ] **Statut et votes** : afficher votes + boutons seulement si activité pas encore validée par admin (et pas tous les votes) ; sinon badge “Validé” ou “Rejeté” uniquement.
- [ ] **Création IA** : bouton + flow qui utilise les contraintes et renvoie des activités avec lieu, horaire, coût (ou range).

---

## 8. Prochaines étapes possibles

1. **Valider** cette liste avec le produit / l’équipe (priorisation : MVP vs plus tard).
2. **Schéma** : décider champs “range” (cost_min/max), transport (champ simple vs entité), participants par activité.
3. **Maquettes** : une vue “jour” et une vue “voyage” qui montrent lieu, participants, budget, coût, transport.
4. **IA** : s’assurer que le prompt et le parsing produisent (ou pourront produire) lieu, coût, fourchette, et optionnellement transport.
5. **Itérer** : commencer par affichage (lecture seule) puis édition, puis génération IA, puis alertes budget.

---

_Doc à mettre à jour au fil des décisions (données, écrans, IA)._
