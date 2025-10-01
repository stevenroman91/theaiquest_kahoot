# Déploiement du jeu AI Acceleration EXEC

## 🚀 Déploiement sur Railway.app

### Prérequis
- Compte GitHub
- Compte Railway (gratuit)
- Projet v1.9 prêt

### Étapes de déploiement

#### 1. Préparer le projet
```bash
# Créer un fichier requirements.txt
pip freeze > requirements.txt

# Créer un fichier Procfile
echo "web: python3 web_interface.py" > Procfile

# Créer un fichier .env pour les variables d'environnement
echo "PORT=5000" > .env
```

#### 2. Créer un repository GitHub
```bash
# Initialiser git
git init
git add .
git commit -m "Initial commit - AI Acceleration EXEC v1.9"

# Créer repository sur GitHub et pousser
git remote add origin https://github.com/votre-username/ai-acceleration-exec.git
git push -u origin main
```

#### 3. Déployer sur Railway
1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Cliquer "New Project"
4. Sélectionner "Deploy from GitHub repo"
5. Choisir votre repository
6. Railway détecte automatiquement Flask et déploie

#### 4. Configuration
- **Port** : Railway utilise automatiquement la variable PORT
- **Base de données** : SQLite fonctionne directement
- **Fichiers statiques** : Les vidéos sont servies automatiquement

#### 5. URL publique
- Railway génère une URL comme : `https://ai-acceleration-exec-production.up.railway.app`
- Cette URL est accessible depuis n'importe où dans le monde

### Configuration du serveur Flask

#### Modifier web_interface.py pour Railway
```python
import os

# Configuration pour Railway
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
```

#### Variables d'environnement Railway
- `PORT` : Port automatiquement assigné par Railway
- `FLASK_ENV` : `production` (automatique)

### Avantages Railway
- ✅ **Gratuit** : 500h/mois
- ✅ **Simple** : Déploiement en 1 clic
- ✅ **Stable** : Pas de limitation de temps
- ✅ **Base de données** : SQLite inclus
- ✅ **Logs** : Monitoring intégré
- ✅ **Redéploiement** : Automatique sur push GitHub

### Limitations
- ⚠️ **RAM** : 1GB maximum (suffisant pour le jeu)
- ⚠️ **Stockage** : 1GB (les vidéos prennent de la place)
- ⚠️ **CPU** : Limité mais suffisant

### Alternative : Render.com
Si Railway ne fonctionne pas :

1. Aller sur [render.com](https://render.com)
2. Créer un compte gratuit
3. Connecter GitHub
4. Créer un "Web Service"
5. Sélectionner votre repository
6. Configuration automatique Flask

**Limitation Render** : Le service s'endort après 15min d'inactivité et prend 30s à redémarrer.

## 🌐 Autres options

### ngrok (pour test rapide)
```bash
# Installer ngrok
brew install ngrok  # macOS
# ou télécharger depuis ngrok.com

# Créer un tunnel
ngrok http 5001

# URL publique générée : https://abc123.ngrok.io
```

### VPS (pour contrôle total)
- **DigitalOcean Droplet** : $4/mois
- **Configuration** : Ubuntu + Python + Nginx
- **Avantage** : Contrôle total, pas de limitations
- **Inconvénient** : Configuration plus complexe

## 📊 Comparaison des solutions

| Solution | Coût | Simplicité | Stabilité | Limitation |
|----------|------|------------|-----------|------------|
| Railway | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 1GB RAM |
| Render | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | S'endort |
| ngrok | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐ | Machine locale |
| VPS | $4/mois | ⭐⭐ | ⭐⭐⭐⭐⭐ | Configuration |

## 🎯 Recommandation finale

**Railway.app** est la meilleure solution pour votre jeu :
- Déploiement en 5 minutes
- URL publique permanente
- Pas de limitations gênantes
- Support excellent
- Gratuit et généreux
