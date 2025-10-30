# 🚀 Configuration Railway - Déploiement Automatique

## Une seule configuration, puis tout est automatique !

### ✅ Étape 1 : Connecter Railway à GitHub (5 minutes, une seule fois)

1. **Allez sur https://railway.app**
2. **Connectez-vous** (ou créez un compte gratuit)
3. **Cliquez sur "New Project"**
4. **Sélectionnez "Deploy from GitHub repo"**
5. **Autorisez Railway** à accéder à votre GitHub (si demandé)
6. **Choisissez le repo** : `stevenroman91/theaiquest_kahoot`
7. **Railway détecte automatiquement** :
   - ✅ C'est une app Python/Flask
   - ✅ Utilise `Procfile`
   - ✅ Installe depuis `requirements.txt`
   - ✅ Démarre avec Gunicorn

**C'est tout !** Railway va automatiquement :
- 🔨 Builder votre app
- 🚀 La déployer
- 🔄 Re-déployer à chaque `git push` sur `main`

---

### ⚙️ Étape 2 : Configurer les variables (2 minutes, une seule fois)

**Dans Railway Dashboard → Votre projet → Variables**, ajoutez :

| Variable | Value |
|----------|-------|
| `FLASK_ENV` | `production` |
| `SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_hex(32))"` (exécutez en local et copiez) |
| `DATABASE_PATH` | `/data/users.db` |

---

### 📦 Étape 3 : Créer le volume persistant (1 minute, une seule fois)

**Dans Railway Dashboard → Votre service → "Volumes"** :

1. Cliquez sur **"New"** ou **"Add Volume"**
2. **Mount Path** : `/data`
3. **Size** : `1GB` (minimum)
4. Cliquez sur **"Create"**

---

## ✅ C'est terminé !

**Maintenant, à chaque fois que vous faites :**
```bash
git push
```

**Railway va automatiquement :**
- ✅ Détecter le push
- ✅ Builder la nouvelle version
- ✅ Déployer sur l'URL publique
- ✅ Tout ça en arrière-plan, sans rien faire !

---

## 🔍 Vérifier que ça marche

1. **Faites un petit changement** dans votre code local
2. **Commitez et pushez** :
   ```bash
   git add .
   git commit -m "test auto deploy"
   git push
   ```
3. **Regardez dans Railway Dashboard** → Deployments
4. Vous verrez un nouveau déploiement en cours !
5. En 2-3 minutes, votre app est mise à jour automatiquement

---

## 📱 Obtenir l'URL de votre app

**Railway Dashboard → Votre projet → Settings → Domains**

Ou dans le terminal :
```bash
railway domain
```

---

## 🎯 Résumé

**Ce que vous avez à faire UNE SEULE FOIS :**
1. ✅ Connecter Railway à GitHub (5 min)
2. ✅ Ajouter les 3 variables d'environnement (2 min)
3. ✅ Créer le volume `/data` (1 min)

**Total : 8 minutes de configuration**

**Ensuite :** Rien ! Juste `git push` et Railway fait tout automatiquement ! 🎉


