# Déploiement automatique sur Railway - Guide rapide 🚀

## Option 1 : Déploiement automatique via GitHub (RECOMMANDÉ)

### Étape unique : Connecter Railway à GitHub

1. **Allez sur https://railway.app**
2. **Cliquez sur "New Project"**
3. **Sélectionnez "Deploy from GitHub repo"**
4. **Choisissez votre repository `theaiquest_kahoot`**

**C'est tout !** Railway va automatiquement :
- ✅ Détecter que c'est une application Flask
- ✅ Utiliser le `Procfile` créé
- ✅ Installer les dépendances depuis `requirements.txt`
- ✅ Configurer Gunicorn
- ✅ Déployer à chaque push sur `main`

### Configurer les variables d'environnement

Dans Railway Dashboard → Votre projet → Variables :

```
FLASK_ENV=production
SECRET_KEY=<générez avec la commande ci-dessous>
```

Pour générer une SECRET_KEY :
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
- ✅ Configurer les variables d'environnement
- ✅ Déployer l'application

---

## 🎯 Recommandation

**Utilisez l'Option 1** : C'est la plus simple et la plus fiable. Railway détecte automatiquement tout et vous donne une URL publique immédiatement.

Une fois connecté, chaque `git push` sur `main` déploiera automatiquement votre application !

