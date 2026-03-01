# Supabase – Voyagely

## Seed (données de démo)

Le fichier `seed.sql` crée :

- **Un voyage d’une semaine** (« Tokyo - Semaine découverte », 9–15 mars 2026)
- **Une vingtaine d’activités** réparties sur chaque jour (2–3 par jour)

**Prérequis :** au moins un utilisateur dans `auth.users` (s’inscrire dans l’app ou via le dashboard Supabase avant de lancer le seed).

**Exécution :**

- Au premier `supabase start`, le seed est exécuté après les migrations.
- Pour relancer uniquement le seed après coup : `supabase db reset` (réapplique toutes les migrations puis le seed).

Après le seed, en te connectant à l’app tu devrais voir le voyage « Tokyo - Semaine découverte » avec un itinéraire rempli sur une semaine (vues Liste, Calendrier, Voyage).

### Ajouter ton user + activités sur un trip existant

Si tu as déjà un trip (ex. `cecf53f0-6244-4800-8ae8-3f76aa6e5524`) et que tu veux t’y ajouter comme membre et remplir une semaine d’activités :

1. Ouvre **Supabase → SQL Editor**.
2. Ouvre le script `supabase/scripts/add-me-and-activities-to-trip.sql`.
3. Remplace **`ton-email@example.com`** par ton email de connexion.
4. Exécute tout le script.

Cela met à jour les dates du trip (9–15 mars 2026), t’ajoute en `editor` (si besoin) et insère les ~20 activités sur cette semaine.
