# Itinéraire – 2 vues (classique + visuelle)

> Brainstorm : afficher un itinéraire avec **plusieurs activités par jour** sur **plusieurs semaines** (ex. 3 semaines). Deux modes : un classique type calendrier, un plus visuel / innovant.

---

## Contexte

- **Aujourd’hui** : liste verticale par jour (un bloc “Lundi 3 novembre 2025” → N activités en liste). Ça scale mal pour 3 semaines × plusieurs activités/jour.
- **Données** : activités avec `start_time`, `end_time`, regroupées par date ; on peut dériver jour/semaine/mois.

---

## Vue 1 – Classique (type calendrier)

Objectif : vue lisible, prévisible, bonne pour planifier et retrouver un jour précis.

**Cible typique** : voyages de **2–3 semaines** (pas des mois). Donc pas de “calendrier mensuel” avec des cases vides avant/après le voyage — on affiche uniquement la **durée du trip**.

### Option A : Grille des semaines du voyage (recommandée)

- **Layout** : grille dont les **lignes = semaines du voyage** (Semaine 1, Semaine 2, Semaine 3), **colonnes = 7 jours** (Lun → Dim).
- **Cellules** : une cellule par jour **contenu dans le voyage**. Les jours hors trip (ex. avant la date de début ou après la date de fin) ne sont pas affichés ou sont grisées / vides — pas de “mois complet”.
- **Contenu cellule** : nombre d’activités (ex. “3”) ou pastilles (couleur par catégorie). Clic → panneau ou section avec la liste des activités du jour.
- **Avantage** : vue d’ensemble 2–3 semaines en un coup d’œil, familier, sans s’encombrer d’un mois entier.
- **Inconvénient** : si le trip fait 10 jours à cheval sur 2 semaines, on a 2 lignes avec des cellules vides en début/fin de ligne ; à accepter ou à “tasser” (affichage continu des jours du trip sans respecter Lun–Dim).

### Option B : Semaines repliables + liste par jour

- **Layout** : liste verticale par **semaine** (ex. “Semaine 1 – 4–10 nov.”), chaque semaine **repliable**.
- **Dans une semaine** : comme aujourd’hui, un bloc par jour avec ses activités.
- **En-tête** : “Jump to” pour sauter à une semaine (ou un jour).
- **Avantage** : réutilise la liste par jour actuelle, réduit le scroll.
- **Inconvénient** : moins “calendrier” qu’une grille.

### Option C : Timeline horizontale par semaine

- **Layout** : une ligne du temps horizontale par semaine (Lun 4, Mar 5, …), activités en petits blocs dans la colonne du jour.
- **Scroll** : horizontal par semaine, vertical pour enchaîner les semaines.
- **Inconvénient** : horizontal peut être pénible sur mobile.

**Recommandation Vue 1** : **Grille des semaines du voyage (A)** — 2–3 lignes (semaines), 7 colonnes (jours), seules les dates du trip sont cliquables / remplies. Clic jour → détail (liste d’activités du jour). Si on veut livrer très vite, **B (semaines repliables)** en fallback.

---

## Vue 2 – Visuelle / innovante

Objectif : une expérience plus “voyage”, moins spreadsheet, qui donne envie de parcourir l’itinéraire.

### Option A : Timeline verticale “voyage”

- **Layout** : une **ligne verticale centrale** (le “fil du voyage”). Chaque **jour** est un nœud sur la ligne (date + court label).
- **Activités** : en cartes qui partent à gauche ou à droite de la ligne (alternance ou selon l’heure), positionnées selon l’heure dans la journée (matin = haut, soir = bas).
- **Scroll** : vertical, le fil défile. Option “scroll to day” (sélecteur de date ou mini calendrier).
- **Rendu** : léger effet “carte” ou “photo” par activité (si on a une image ou une icône catégorie), couleurs douces par jour.
- **Avantage** : très lisible, narrative, différenciant.
- **Inconvénient** : à bien faire pour ne pas être encombré avec 5–6 activités/jour.

### Option B : “Trip path” / cartes par jour (horizontal ou vertical)

- **Layout** : **une grosse carte par jour** (titre = date, sous-titre = “X activités”). Parcours en **swipe horizontal** (mobile) ou **scroll horizontal** (desktop) : Jour 1 → Jour 2 → … → Jour 21.
- **Dans la carte jour** : liste compacte d’activités (titre + heure + catégorie), ou “Voir 4 activités” qui expand.
- **Avantage** : très “story”, un jour = une étape, facile à parcourir.
- **Inconvénient** : 21 cartes = beaucoup de swipe ; prévoir raccourcis (ex. “Aller au 15 déc.”).

### Option C : Carte / strip map

- **Layout** : une **carte** (Leafwind / Mapbox) avec un **parcours** (ligne ou suite de points par jour). À droite (ou en bas sur mobile) une **strip de jours** cliquable.
- **Interaction** : clic sur un jour → la carte centre ce jour (lieu du jour si on a lat/lon), et un panneau liste les activités du jour.
- **Avantage** : très visuel, “où on est quand”, fort pour les voyages multi-destinations.
- **Inconvénient** : dépendant des coordonnées (lat/lon) des activités ; à prévoir même sans carte au début (strip de jours + liste).

### Option D : “Heatmap” des jours

- **Layout** : barres ou blocs **par jour** (ordre chronologique). **Hauteur ou couleur** = nombre d’activités ou “densité” (durée totale).
- **Interaction** : clic sur une barre → focus sur ce jour (liste dessous ou panneau).
- **Avantage** : en un coup d’œil on voit les jours “chargés” vs légers.
- **Inconvénient** : moins “narrative” que la timeline ou la carte.

**Recommandation Vue 2 (validée)** : **Timeline verticale “voyage” (A)** — fil du voyage, jours en nœuds, activités en cartes à gauche/droite. Option **“Trip path” (B)** en variante mobile (swipe par jour). Carte (C) en phase 2 si lat/lon dispo.

---

## Synthèse validée

| Vue       | Idée principale               | Cible (2–3 semaines)                                      | Mobile                                      |
| --------- | ----------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| Classique | Grille **semaines du voyage** | 2–3 lignes = semaines, 7 col = jours ; clic → détail jour | Même grille ou semaines repliables          |
| Visuelle  | Fil du voyage / récit         | Timeline verticale, jours = nœuds, activités en cartes    | Trip path (swipe par jour) ou même timeline |

### Comportement commun

- **Switch de vue** : toggle ou onglet “Calendrier” / “Voyage” (ou “Timeline”) dans l’onglet Itinéraire.
- **Persistance** : préférence vue (localStorage).
- **Données** : mêmes `activitiesByDate` + `sortedDates` ; index “by week” pour la grille (semaines du trip uniquement).

### Prochaines étapes possibles

1. Wireframes (ASCII ou maquettes) : grille semaines du voyage + timeline verticale.
2. Spec technique : composants (TripWeekGrid, DayDetailPanel, TripTimeline, etc.) pour l’issue itinéraire.
