# 🌐 DEV WEB — Interface de Chat IA Médical BALMIGERE DYLAN

## Choix techniques
**HTML / CSS / JS (Vanilla)**, pour un développement léger, sans dépendances externes (pas de framework lourd type React/Vue), garantissant d'excellentes performances et une facilité de déploiement en local.

## Intégration API (Streaming)
Mise en place d'une requête Fetch asynchrone avec traitement par flux (Stream) via esponse.body.getReader().
**Raison** : Permet l'affichage en temps réel, mot par mot (effet machine à écrire). Sans cela, l'utilisateur devrait attendre la fin complète de la génération (jusqu'à 40-50s selon les limites INFRA) avant de voir une réponse.

## Lancement & Déploiement (Rendu/DevWeb/)
Exécution d'un serveur HTTP local minimaliste en Python pour servir les fichiers statiques et éviter les blocages CORS du navigateur :
``bash
python -m http.server 8000
# (Un fichier start.bat est fourni pour automatiser ce lancement)
``

## Fonctionnalités pour les utilisateurs

| | |
|---|---|
| Interface | Intuitive avec zone de chat principale réactive |
| Historique | Panneau latéral pour créer, renommer, chercher ou supprimer une discussion |
| Rendu | Support visuel complet du Markdown généré par l'IA (mise en gras corrigée, listes, code avec coloration syntaxique) |
| Erreurs | Alertes visuelles (bouton stop, champs désactivés) en cas de perte de connexion ou serveur injoignable |

## Limitations
- Dépendance totale à l'URL 
grok fournie par l'équipe INFRA. Si le tunnel ferme, l'interface perd le contact.
- Pas de base de données backend externe : le stockage de l'historique est lié au navigateur du client.

## ⚠️ À transmettre à l'équipe DATA / IA
- L'interface inclut actuellement un "Prompt Système" masqué forçant le modèle à répondre **en français** et **exclusivement sur des sujets médicaux** (en lui interdisant la finance). Si un modèle affiné (fine-tuné) Médical remplace le modèle Financier, ce prompt pourra être allégé.
