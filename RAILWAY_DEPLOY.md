# Déploiement sur Railway 🚂

Guide complet pour déployer l'application The AI Quest (Kahoot Edition) sur Railway.

## 📋 Prérequis

- Un compte Railway (https://railway.app)
- GitHub repository connecté
- Les fichiers de configuration sont déjà en place

## 🚀 Étapes de déploiement

### Option 1 : Déploiement via GitHub (Recommandé)

1. **Connecter Railway à GitHub**
   - Allez sur https://railway.app
   - Créez un nouveau projet
   - Sélectionnez "Deploy from GitHub repo"
   - Autorisez Railway à accéder à votre repository `theaiquest_kahoot`

2. **Configuration automatique**
   - Railway détectera automatiquement :
     - Le fichier `Procfile`
     - Le fichier `requirements.txt`
     - Python comme language

3. **Variables d'environnement**
   - Dans Railway, allez dans votre projet → Variables
   - Ajoutez les variables suivantes :
     ```
     PORT=5001 (Railway le définit automatiquement, mais on peut le spécifier)
     FLASK_ENV=production
     SECRET_KEY=<générez une clé secrète aléatoire>
     ```
   - Pour générer une SECRET_KEY :
     ```bash
     python3 -c "import secrets; print(secrets.token_hex(32))"
     ```

4. **Déploiement**
   - Railway déploiera automatiquement à chaque push sur la branche `main`
   - Vous pouvez aussi déclencher un déploiement manuel depuis le dashboard

### Option 2 : Déploiement via Railway CLI

1. **Installer Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialiser le projet**
   ```bash
   cd /Users/stevenroman/Desktop/Exec/versions/v2.0-kahoot
   railway init
   ```

4. **Ajouter les variables d'environnement**
   ```bash
   railway variables set FLASK_ENV=production
   railway variables set SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
   ```

5. **Déployer**
   ```bash
   railway up
   ```

## ⚙️ Configuration Railway

### Variables d'environnement requises

| Variable | Description | Valeur recommandée |
|----------|-------------|-------------------|
| `PORT` | Port de l'application | Automatique (défini par Railway) |
| `FLASK_ENV` | Environnement Flask | `production` |
| `SECRET_KEY` | Clé secrète pour les sessions | Générer avec `secrets.token_hex(32)` |

### Variables d'environnement optionnelles

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DATABASE_PATH` | Chemin vers la base SQLite | `users.db` (dans le répertoire du projet) |

## 📝 Notes importantes

### Base de données

- La base de données SQLite (`users.db`) sera créée automatiquement au premier démarrage
- Les données persistent entre les redémarrages car Railway monte un volume persistant
- Pour réinitialiser la base : supprimez le service et recréez-le, ou utilisez la variable `DATABASE_PATH`

### Fichiers statiques

- Les fichiers dans `static/` sont servis automatiquement par Flask
- Les images et vidéos doivent être incluses dans le repository
- Vérifiez que `.gitignore` n'exclut pas les fichiers nécessaires

### Logs

- Accédez aux logs via le dashboard Railway
- Ou via CLI : `railway logs`

## 🔧 Dépannage

### L'application ne démarre pas

1. Vérifiez les logs : `railway logs`
2. Vérifiez que `requirements.txt` est à jour
3. Vérifiez que `Procfile` est correct
4. Vérifiez les variables d'environnement

### Erreur "Port already in use"

- Railway définit automatiquement le `PORT`, ne le modifiez pas manuellement

### Base de données ne persiste pas

- Railway monte automatiquement un volume persistant
- Vérifiez que le chemin de la base est relatif (pas absolu)

### Erreur de permission sur fichiers

- Tous les fichiers doivent être accessibles en lecture
- Vérifiez que les permissions sont correctes dans le repository

## 📞 Support

En cas de problème, consultez :
- Documentation Railway : https://docs.railway.app
- Logs de l'application dans le dashboard Railway

