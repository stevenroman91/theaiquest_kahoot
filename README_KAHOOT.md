# Version Kahoot - AI Acceleration Game

## 🎯 Objectif

Version simplifiée du jeu AI Acceleration pour un mode "Kahoot" :
- Authentification simple avec juste un username (ou username+password)
- Flow simplifié : Step → Score → Step suivant
- Leaderboard pour classer les joueurs
- Optimisé pour mobile (50 joueurs simultanés)

## 🔄 Modifications principales

### 1. Authentification simplifiée (`user_manager.py`)

**Mode Kahoot (recommandé)** :
- Juste un username requis (pas de password)
- Création automatique de l'utilisateur à la connexion
- Champ `is_kahoot_mode` dans la base de données

**Mode Normal** :
- Username + Password requis
- Authentification sécurisée avec hashage

**API Login** :
```javascript
// Mode Kahoot
POST /api/login
{
  "username": "Joueur1"
  // Pas de password
}

// Mode Normal
POST /api/login
{
  "username": "admin",
  "password": "motdepasse"
}
```

### 2. Système de Leaderboard

**Nouvelle table `game_scores`** :
- `username` : Nom du joueur
- `total_score` : Score total (/15)
- `stars` : Nombre d'étoiles (1-3)
- `mot_scores` : Scores détaillés par étape (JSON)
- `completed_at` : Date de fin de partie
- `session_id` : ID de session

**API Leaderboard** :
```javascript
GET /api/leaderboard?limit=50
// Retourne les 50 meilleurs scores

GET /api/user_best_score
// Retourne le meilleur score de l'utilisateur connecté
```

**Sauvegarde automatique** :
- Le score est sauvegardé automatiquement après Step 5
- Appel dans `api_phase5_choose()`

### 3. Flow simplifié

Le flow a été simplifié pour aller directement :
1. **Login** → Entrer username
2. **Step 1** → Faire choix → **Score Step 1** → Continue
3. **Step 2** → Faire choix → **Score Step 2** → Continue
4. **Step 3** → Faire choix → **Score Step 3** → Continue
5. **Step 4** → Faire choix → **Score Step 4** → Continue
6. **Step 5** → Faire choix → **Score Step 5** → **Leaderboard**

**Pas de** :
- Welcome page
- Introduction page
- Teams meeting
- Dashboard entre les steps

### 4. Interface mobile-first

L'interface doit être optimisée pour mobile :
- Boutons plus grands
- Textes lisibles
- Navigation simplifiée
- Score affiché clairement

## 🚀 Utilisation

### Démarrage

```bash
cd /Users/stevenroman/Desktop/Exec/versions/v2.0-kahoot
python3 web_interface.py
```

L'application démarre sur `http://localhost:5001`

### Connexion en mode Kahoot

1. Entrer juste un username (min 2 caractères)
2. Cliquer sur "Se connecter"
3. Le jeu démarre automatiquement à Step 1

### Affichage du Leaderboard

Après Step 5, le leaderboard s'affiche automatiquement avec :
- Top 50 joueurs
- Rang de l'utilisateur actuel
- Score total et étoiles

## 📊 Structure de la base de données

### Table `users`
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT, optionnel en mode Kahoot)
- password_hash (TEXT, NULL en mode Kahoot)
- salt (TEXT, NULL en mode Kahoot)
- role (TEXT)
- created_at (TEXT)
- last_login (TEXT)
- is_active (BOOLEAN)
- is_kahoot_mode (BOOLEAN)  -- NOUVEAU
```

### Table `game_scores` (NOUVELLE)
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT)
- total_score (INTEGER)
- stars (INTEGER)
- mot_scores (TEXT JSON)
- completed_at (TEXT)
- session_id (TEXT)
```

## 🔧 Configuration

### Variables d'environnement

```bash
export PORT=5001
export FLASK_ENV=production  # ou development
export SECRET_KEY="votre_cle_secrete"
```

## 📝 Notes techniques

### Sessions multiples

Chaque utilisateur a sa propre session Flask avec :
- `session['user_id']` : ID de l'utilisateur
- `session['username']` : Nom d'utilisateur
- `session['kahoot_mode']` : Mode Kahoot activé
- `session['session_id']` : ID de session unique

### Gestion des scores

- Score sauvegardé automatiquement à la fin (Step 5)
- Possibilité de jouer plusieurs fois
- Le leaderboard garde tous les scores (meilleur score via `get_user_best_score()`)

## 🎮 Prochaines étapes

1. ✅ Authentification Kahoot (juste username)
2. ✅ Système de leaderboard
3. ✅ Sauvegarde automatique des scores
4. ⏳ Interface mobile-first simplifiée
5. ⏳ Flow simplifié (Step → Score → Continue)
6. ⏳ Page Leaderboard dédiée

## 🐛 Dépannage

**Erreur "User doesn't exist" en mode Kahoot** :
- L'utilisateur est créé automatiquement à la connexion
- Vérifier que `is_kahoot_mode=True` est bien dans la DB

**Scores non sauvegardés** :
- Vérifier que Step 5 est complété
- Vérifier les logs pour erreurs SQLite
- Vérifier que `user_manager.save_game_score()` est appelé

**Leaderboard vide** :
- Vérifier que des parties ont été complétées
- Vérifier la table `game_scores` dans SQLite

## 📞 Support

Pour toute question ou problème, vérifier :
1. Les logs de l'application (`server.log`)
2. La base de données SQLite (`users.db`)
3. Les erreurs JavaScript dans la console du navigateur

