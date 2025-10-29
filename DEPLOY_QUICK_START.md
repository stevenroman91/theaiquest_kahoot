# Déploiement automatique sur Railway - Guide rapide 🚀

## 🎯 Configuration Automatique (Une seule fois, puis tout est automatique !)

### ✅ Étape 1 : Connecter Railway à GitHub (5 minutes)

1. **Allez sur https://railway.app** et connectez-vous
2. **Cliquez sur "New Project"**
3. **Sélectionnez "Deploy from GitHub repo"**
4. **Autorisez Railway** à accéder à GitHub (si demandé)
5. **Choisissez** : `stevenroman91/theaiquest_kahoot`
6. **C'est terminé !** Railway va automatiquement :
   - ✅ Détecter que c'est une application Flask
   - ✅ Utiliser le `Procfile` créé
   - ✅ Installer les dépendances depuis `requirements.txt`
   - ✅ Configurer Gunicorn
   - ✅ Builder et déployer votre app
   - ✅ **Re-déployer automatiquement à chaque `git push` sur `main`**

### ⚙️ Configuration ESSENTIELLE : Base de données

**IMPORTANT** : Pour que les données persistent, vous DEVEZ configurer le volume persistant :

1. **Créer le volume** :
   - Dans Railway Dashboard → Votre projet → Votre service
   - Cliquez sur "Volumes" (dans la sidebar)
   - Cliquez sur "New" ou "Add Volume"
   - Mount Path : `/data`
   - Size : `1GB` (minimum recommandé)
   - Cliquez sur "Create"

2. **Configurer la variable d'environnement** :
   - Railway Dashboard → Votre projet → Variables
   - Cliquez sur "New Variable"
   - Variable : `DATABASE_PATH`
   - Value : `/data/users.db`
   - Cliquez sur "Add"

### Variables d'environnement requises

Dans Railway Dashboard → Votre projet → Variables, ajoutez :

| Variable | Value | Commentaire |
|---------|-------|-------------|
| `FLASK_ENV` | `production` | Environnement Flask |
| `SECRET_KEY` | `<générez ci-dessous>` | Clé secrète pour les sessions |
| `DATABASE_PATH` | `/data/users.db` | **IMPORTANT** : Pour persistance des données |

**Pour générer SECRET_KEY** :
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Note** : `PORT` est automatiquement défini par Railway, pas besoin de le configurer.

---

## Option 2 : Déploiement automatique via GitHub Actions

Si vous voulez que GitHub Actions déploie automatiquement :

1. **Générer un token Railway** :
   - Allez sur Railway Dashboard → Settings → Tokens
   - Créez un nouveau token
   - Copiez-le

2. **Ajouter le token à GitHub** :
   - Allez sur votre repo GitHub → Settings → Secrets
   - Cliquez sur "New repository secret"
   - Nom : `RAILWAY_TOKEN`
   - Valeur : collez le token Railway

3. **C'est fait !** Chaque push sur `main` déploiera automatiquement.

**⚠️ N'oubliez pas** de configurer le volume persistant et `DATABASE_PATH` dans Railway Dashboard !

---

## Option 3 : Script de déploiement local

Si vous préférez déployer depuis votre machine :

```bash
cd /Users/stevenroman/Desktop/Exec/versions/v2.0-kahoot
./deploy_railway.sh
```

Le script va :
- ✅ Vérifier/installer Railway CLI
- ✅ Vous connecter si nécessaire
- ✅ Initialiser le projet
- ✅ Configurer les variables d'environnement (y compris `DATABASE_PATH`)
- ✅ Déployer l'application

**⚠️ N'oubliez pas** de créer le volume persistant manuellement dans Railway Dashboard !

---

## 🎯 Recommandation

**Utilisez l'Option 1** : C'est la plus simple et la plus fiable. Railway détecte automatiquement tout et vous donne une URL publique immédiatement.

**⚠️ Points critiques** :
1. ✅ Créer le volume persistant `/data` dans Railway Dashboard
2. ✅ Configurer `DATABASE_PATH=/data/users.db` dans les variables d'environnement
3. ✅ Configurer `SECRET_KEY` et `FLASK_ENV=production`

Une fois configuré, chaque `git push` sur `main` déploiera automatiquement votre application avec les données persistantes !

---

## 🔍 Vérification après déploiement

1. **Vérifier les logs** :
   - Railway Dashboard → Deployments → Dernier déploiement → Logs
   - Cherchez : `📊 Initialisation de la base de données: /data/users.db`

2. **Tester la connexion** :
   - Visitez votre URL Railway
   - Connectez-vous avec un username (mode Kahoot)
   - Vérifiez que les données sont sauvegardées

3. **Vérifier le volume** :
   - Railway Dashboard → Volumes
   - Vérifiez que le volume `/data` est monté et a de l'espace utilisé

---

## 🐛 Dépannage

### Les données disparaissent après redéploiement
- ✅ Vérifiez que `DATABASE_PATH=/data/users.db` est configuré
- ✅ Vérifiez que le volume `/data` est créé dans Railway Dashboard
- ✅ Vérifiez les logs pour confirmer le chemin de la base

### Erreur "Permission denied" sur `/data`
- Le volume est automatiquement créé avec les bonnes permissions
- Si problème, vérifiez que le volume est bien monté sur `/data`

### Base de données corrompue
- Vous pouvez supprimer le volume et le recréer
- Ou utiliser Railway CLI : `railway run python3 -c "import os; os.remove('/data/users.db')"`
- La base sera recréée automatiquement au prochain démarrage
