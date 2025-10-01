# AI Acceleration EXEC - Smart Retail Group HR Managers Edition

## 🎮 Description

Jeu sérieux interactif pour la transformation GenAI dans les RH. Les joueurs naviguent à travers 5 phases de transformation, prennent des décisions stratégiques et reçoivent des scores basés sur leurs choix.

## 🚀 Déploiement Rapide

### Option 1 : Railway.app (Recommandé)

1. **Fork ce repository** sur GitHub
2. **Aller sur [railway.app](https://railway.app)**
3. **Se connecter avec GitHub**
4. **Créer un nouveau projet**
5. **Sélectionner "Deploy from GitHub repo"**
6. **Choisir votre repository**
7. **Railway déploie automatiquement !**

**URL publique** : `https://votre-projet.railway.app`

### Option 2 : Render.com

1. **Fork ce repository** sur GitHub
2. **Aller sur [render.com](https://render.com)**
3. **Créer un "Web Service"**
4. **Connecter GitHub et sélectionner le repository**
5. **Configuration automatique Flask**

**URL publique** : `https://votre-projet.onrender.com`

## 📋 Fonctionnalités

- ✅ **5 Phases interactives** avec vidéos intégrées
- ✅ **Système de scoring** basé sur les choix stratégiques
- ✅ **Vidéos automatiques** avec son
- ✅ **Interface responsive** Bootstrap
- ✅ **Authentification utilisateur** avec base de données
- ✅ **Écran de résultats** avec vidéo Recap intégrée
- ✅ **Système de progression** visuel

## 🎯 Phases du jeu

1. **Phase 1** : Embedding GenAI in your HR transformation
2. **Phase 2** : Revisiting your HR and AI portfolio  
3. **Phase 3** : Launching your priority HR and GenAI pilots
4. **Phase 4** : Scaling your AI and GenAI solutions
5. **Phase 5** : Deploying AI and GenAI across the organization

## 🛠️ Installation locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/ai-acceleration-exec.git
cd ai-acceleration-exec

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python3 web_interface.py
```

**URL locale** : `http://localhost:5001`

## 👥 Utilisateurs par défaut

- **admin** / `FDJ2024!Admin` (Administrateur)
- **manager** / `FDJ2024!Manager` (Manager)
- **user1** / `FDJ2024!User1` (Utilisateur)

## 📁 Structure du projet

```
├── web_interface.py          # Serveur Flask principal
├── ai_acceleration_game.py   # Logique du jeu
├── user_manager.py           # Gestion des utilisateurs
├── templates/
│   └── index.html           # Interface utilisateur
├── static/
│   ├── css/style.css        # Styles
│   ├── js/game.js           # Logique frontend
│   └── videos/              # Vidéos du jeu
├── requirements.txt         # Dépendances Python
├── Procfile                 # Configuration Railway
└── README.md               # Ce fichier
```

## 🌐 Configuration pour le déploiement

Le projet est configuré pour fonctionner automatiquement sur :
- **Railway.app** : Déploiement en 1 clic
- **Render.com** : Configuration automatique Flask
- **Heroku** : Compatible avec Procfile
- **VPS** : Fonctionne avec gunicorn

## 📊 Spécifications techniques

- **Framework** : Flask 2.3.3
- **Base de données** : SQLite (inclus)
- **Frontend** : Bootstrap 5 + JavaScript vanilla
- **Vidéos** : MP4 H.264 optimisé pour le web
- **Port** : Configuré automatiquement (Railway/Render)

## 🔧 Variables d'environnement

- `PORT` : Port du serveur (automatique sur Railway/Render)
- `FLASK_ENV` : `production` en production (automatique)

## 📈 Monitoring

- **Logs** : Disponibles sur Railway/Render
- **Métriques** : Monitoring intégré
- **Redémarrage** : Automatique en cas de problème

## 🎯 Avantages du déploiement cloud

- ✅ **Accessible 24/7** depuis n'importe où
- ✅ **URL publique** permanente
- ✅ **Pas de maintenance** serveur
- ✅ **Mise à jour** automatique via GitHub
- ✅ **Monitoring** intégré
- ✅ **Sauvegarde** automatique

## 🚀 Prochaines étapes

1. **Déployer** sur Railway ou Render
2. **Partager l'URL** avec les utilisateurs
3. **Monitorer** les performances
4. **Itérer** basé sur les retours utilisateurs

---

**Développé pour Smart Retail Group HR Managers**  
**Version v1.9 - Phase 1 Context Enhanced**