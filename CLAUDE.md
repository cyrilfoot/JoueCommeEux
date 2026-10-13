# Joue comme eux — consignes de rédaction et de publication

Blog d'affiliation sur l'équipement de football, édité par Cyril. Cyril utilise exclusivement un iPhone avec VoiceOver : tous les messages qui lui sont adressés sont en français, courts, sans tableau, avec des étapes numérotées si besoin.

## Fonctionnement du site
- Générateur maison : `python3 build.py` produit le site dans `docs/` (à committer). Hébergement Netlify (publie `docs/`), déploiement automatique à chaque push sur `main`.
- Articles : `content/posts/AAAA-MM-JJ-slug.md`, avec front matter `title`, `description` (150-160 caractères), `categorie`. `draft: true` empêche la publication.
- Fiche produit (format principal) : `[[produit: Nom du modèle | recherche Amazon exacte OU lien https://www.amazon.fr/.../dp/ASIN | Pourquoi ce choix, 1 à 2 phrases]]`. Affiche une carte produit avec un bouton « Voir le prix sur Amazon ». Un lien amazon.fr/dp/ est nettoyé et reçoit automatiquement le tag.
- Lien affilié simple : `[[amazon: mots-clés de recherche | Texte du bouton]]` (recherche Amazon.fr).
- Le tag Amazon (`jouecommeeux-21`) est défini dans `site.json` (`amazon_tag`) et ajouté à tous les liens.
- Commits : auteur `cyrilfoot <cyrilfoot@users.noreply.github.com>`.

## Article quotidien : procédure
1. Lire la liste des articles existants (`content/posts/`) et choisir un sujet **nouveau** dans le plan éditorial ci-dessous (ou une requête proche que des gens cherchent réellement sur Google).
2. Rédiger en brouillon (`draft: true`) : 700 à 1 200 mots, ton direct et chaleureux, tutoiement interdit (vouvoiement), titres H2/H3, une section « Notre sélection » puis une section « En résumé ».
   - « Notre sélection » présente 2 à 4 **modèles précis** sous forme de fiches `[[produit: ...]]` (marque + modèle + taille/version), un par profil (débutant, enfant, joueur régulier…).
   - Choisir des modèles réels et largement vendus, identifiés par recherche web (sites des marques, grandes enseignes, tests). La recherche Amazon de la fiche doit être le nom exact du modèle pour tomber dessus.
   - Pas de prix, pas de notes ou d'avis inventés, pas de « meilleur » absolu. Expliquer pourquoi chaque modèle convient.
3. Vérifier chaque fait (tailles, règles, normes) par une recherche web quand il n'est pas évident. Pas de prix, pas de « meilleur produit 2026 » inventé, pas de faux avis ou témoignages, pas d'affirmation sur l'équipement précis d'un joueur sans source.
4. Envoyer à Cyril : le titre, un résumé en 3 lignes, la liste des modèles sélectionnés, puis le texte complet. Lui rappeler qu'il peut remplacer un modèle en envoyant son lien Amazon. Demander : « Je publie ? Réponds oui, ou dis-moi ce qu'il faut changer. »
5. Sur accord : retirer `draft`, `python3 build.py`, commit, push. Confirmer à Cyril avec le lien de l'article. Sans réponse, ne rien publier.

## Plan éditorial (sujets à traiter, à cocher au fur et à mesure)
- Chaussures de foot pour enfant : comment choisir la pointure
- Gants de gardien : coupe négative, roll finger, plate
- Quel équipement pour un enfant qui commence le foot en club
- Chaussettes de foot et chaussettes antidérapantes : à quoi ça sert
- Matériel d'entraînement à la maison : plots, échelle de rythme, mini-buts
- Cage de foot pour le jardin : quelle taille choisir
- Comment entretenir ses crampons
- Sac de sport de foot : que mettre dedans
- Ballon de futsal : différences avec un ballon classique
- Maillot de foot officiel ou réplique : quelles différences
- Sous-vêtements thermiques pour jouer l'hiver
- Brassard de capitaine, sifflet, carton : le matériel de l'éducateur
- Genouillères et équipement de gardien de but
- Chaussures de futsal : comment choisir
- Idées cadeaux pour un fan de foot
