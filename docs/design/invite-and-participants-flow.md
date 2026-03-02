# Invitation & participants – flux “lien d’invite”

> Comment on gère “j’envoie un lien, mon pote clique, crée un compte et rejoint mon voyage”. Et pourquoi **activity_participants = user** (forcer login pour l’itinéraire).

---

## 1. Oui : participants = utilisateurs (login obligatoire)

- **activity_participants** : on stocke `activity_id` + `user_id` (référence `auth.users`). Donc **toujours des utilisateurs connectés**.
- **Itinéraire** : on force bien login / création de compte pour accéder à l’itinéraire et être “membre” du voyage. C’est le choix standard :
  - on sait qui participe à quoi (pour l’affichage “qui vient à cette activité”) ;
  - on peut voter, éditer, recevoir des notifs ;
  - pas de “lien magique” anonyme qui donne accès sans compte.

Donc : **participants = users**. Pas de “invité par email sans compte”.

---

## 2. Flux “lien d’invitation” (comme les grosses apps)

Schéma type (Notion, Figma, Trello, etc.) :

1. **Toi** : tu crées un voyage (trip) dans l’app, tu es déjà connecté → tu es **owner** et dans `trip_members`.
2. **Tu génères un lien d’invite** : l’app crée une ligne dans `invitations` (trip_id, inviter_id, **invite_code** unique, expires_at, max_uses).  
   Le lien = `https://app.voyagely.com/join/<invite_code>` (ou `/invite/<invite_code>`).
3. **Tu envoies le lien** (SMS, WhatsApp, mail, copier-coller).
4. **Ton pote clique** → il arrive sur une page publique **“Rejoindre le voyage”** :
   - l’app lit `invite_code` (URL), appelle l’API pour vérifier que l’invitation est valide (pas expirée, pas max_uses dépassé) et récupère le nom du trip (pour afficher “Tu es invité sur Tokyo Exploration”).
5. **S’il n’est pas connecté** : bouton “Créer un compte” ou “Se connecter”.
   - **S’il crée un compte** : après signup (email + mot de passe, ou OAuth), il est redirigé vers la même page “Rejoindre le voyage” (avec le même `invite_code` dans l’URL).
   - **S’il est déjà connecté** : directement à l’étape suivante.
6. **“Rejoindre”** : un clic sur “Rejoindre le voyage” appelle le backend qui :
   - vérifie encore l’invitation (valide, pas expirée) ;
   - insère (ou met à jour) une ligne dans **trip_members** (trip_id, user_id, role = `editor` ou `viewer`, invited_by = inviter_id) ;
   - incrémente `invitations.used_count` (et éventuellement désactive l’invitation si max_uses atteint).
7. **Redirect** : on le redirige vers le voyage (ex. `/trip/:id`) → il voit l’itinéraire comme les autres membres.

Résumé : **lien d’invite = token dans l’URL → page publique “rejoindre” → gate auth (signup/login) → backend ajoute en trip_member → redirect vers le trip.**

---

## 3. En base (ce qu’on a déjà)

- **invitations** : `trip_id`, `inviter_id`, `invite_code` (unique), `expires_at`, `max_uses`, `used_count`.  
  → Suffit pour générer des liens et les valider.
- **trip_members** : `trip_id`, `user_id`, `role`, `invited_by`, `joined_at`.  
  → Quand quelqu’un “rejoint” via le lien, on ajoute une ligne ici.
- **activity_participants** (migration 009) : `activity_id`, `user_id`.  
  → Optionnel par activité ; si vide = “tous les membres du trip” par convention.

Pas de table “invités par email sans compte” : tout passe par **auth.users** + **trip_members**.

---

## 4. À implémenter côté app (pour le flux complet)

1. **Génération du lien** (dans la page trip ou paramètres du voyage) :
   - appel API qui fait `INSERT INTO invitations (trip_id, inviter_id, invite_code, expires_at, max_uses)` (invite_code = uuid ou slug aléatoire) ;
   - affichage du lien `https://.../join/<invite_code>` + bouton “Copier”.
2. **Route publique** ` /join/:inviteCode` (ou `/invite/:inviteCode`) :
   - pas de guard “logged in” ;
   - fetch “GET /invitations/validate?code=xxx” (ou équivalent) pour afficher le nom du trip et “Rejoindre / Se connecter / Créer un compte”.
3. **Après login ou signup** :
   - rediriger vers `/join/:inviteCode` pour finir le flux (ou garder le code en query et traiter au retour).
4. **Action “Rejoindre le voyage”** :
   - appel API “POST /invitations/accept” avec le code (et l’user courant) → backend ajoute trip_member, incrémente used_count, retourne trip_id → redirect vers `/trip/:id`.

Comme ça, le flux “lien → signup → rejoindre” est le même que ce que font les grosses boîtes tech.
