# The AI Quest - Kahoot Edition 🎮

Version Kahoot du serious game AI Acceleration - Interface simplifiée pour parties multi-joueurs sur mobile.

![GitHub](https://img.shields.io/badge/version-2.0--kahoot-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Flask](https://img.shields.io/badge/flask-2.3.3-green)

## 🎯 Vue d'ensemble

Version simplifiée du jeu AI Acceleration optimisée pour :
- **50 joueurs simultanés** sur mobile
- **Authentification rapide** : juste un username (mode Kahoot)
- **Flow simplifié** : Step → Score → Continue → Step suivant
- **Leaderboard automatique** après Step 5

## 🚀 Installation rapide

```bash
# Cloner le repository
git clone https://github.com/stevenroman91/theaiquest_kahoot.git
cd theaiquest_kahoot

# Installer les dépendances
pip install -r requirements.txt

# Démarrer l'application
python3 web_interface.py
```

L'application sera accessible sur `http://localhost:5001`

## 📱 Utilisation

### Connexion Kahoot

1. Entrer un **username** (minimum 2 caractères)
2. Cliquer sur "Start Game"
3. Le jeu démarre directement à Step 1

**Option** : Cliquer sur "Need password?" pour un login sécurisé avec username + password.

### Flow du jeu

```
Login → Step 1 → Score → Continue → Step 2 → Score → Continue → 
Step 3 → Score → Continue → Step 4 → Score → Continue → 
Step 5 → Score → Leaderboard
```

Chaque step affiche un écran de score avec le nombre d'étoiles obtenues (1-3).

## 🏆 Leaderboard

Le leaderboard s'affiche automatiquement après Step 5 avec :
- **Top 50 joueurs**
- **Statistiques** : Total Players, Average Score, Top Score
- **Votre rang** mis en évidence
- **Boutons** : Close / Play Again

## 📊 Architecture

### Backend
- **Flask** (Python 3.12)
- **SQLite** pour utilisateurs et scores
- **Authentification** Kahoot (username uniquement) ou normale (username + password)

### Frontend
- **HTML5/CSS3/JavaScript**
- **Bootstrap 5** pour le responsive
- **Mobile-first** design

### Base de données
- `users` : Utilisateurs (mode Kahoot ou normal)
- `game_scores` : Scores des parties (leaderboard)

## 🔧 Configuration

### Variables d'environnement

```bash
export PORT=5001
export FLASK_ENV=production  # ou development
export SECRET_KEY="votre_cle_secrete"
```

## 📁 Structure du projet

```
theaiquest_kahoot/
├── web_interface.py          # API Flask principale
├── ai_acceleration_game.py   # Logique métier du jeu
├── user_manager.py           # Authentification + Leaderboard
├── game_content_manager.py   # Gestion du contenu
├── game_content.json         # Configuration du jeu
├── templates/
│   └── index.html           # Interface utilisateur
├── static/
│   ├── css/style.css        # Styles (mobile-first)
│   ├── js/
│   │   ├── game.js          # Logique du jeu
│   │   └── kahoot-mode.js   # Mode Kahoot spécifique
│   ├── videos/              # Vidéos du jeu
│   └── images/              # Images
├── requirements.txt         # Dépendances Python
└── README_KAHOOT.md        # Documentation détaillée
```

## 🎮 Fonctionnalités Kahoot

### Authentification simplifiée
- ✅ Juste un username (création automatique)
- ✅ Option password pour login sécurisé
- ✅ Gestion automatique des sessions

### Flow simplifié
- ✅ Pas de pages welcome/introduction
- ✅ Accès direct aux steps
- ✅ Score après chaque step
- ✅ Navigation continue entre steps

### Leaderboard
- ✅ Sauvegarde automatique après Step 5
- ✅ Top 50 joueurs
- ✅ Statistiques en temps réel
- ✅ Mise en évidence de votre rang

### Mobile-first
- ✅ Boutons optimisés (48px+)
- ✅ Textes lisibles
- ✅ Interface responsive
- ✅ Support multi-touch

## 📖 Documentation

Consultez [README_KAHOOT.md](README_KAHOOT.md) pour la documentation complète :
- Architecture détaillée
- API endpoints
- Structure de la base de données
- Dépannage

## 🔒 Sécurité

- Sessions Flask sécurisées
- Hashage des mots de passe (mode normal)
- Protection CSRF
- Validation des inputs

## 🚀 Déploiement

### Production avec Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 web_interface:app
```

### Railway / Heroku

Configurez les variables d'environnement et déployez directement.

## 📝 Changelog

### Version 2.0-kahoot
- ✅ Authentification Kahoot (username uniquement)
- ✅ Flow simplifié (Step → Score → Continue)
- ✅ Leaderboard automatique
- ✅ Interface mobile-first
- ✅ Sessions multiples

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est privé et propriétaire.

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs (`server.log`)
2. Consulter [README_KAHOOT.md](README_KAHOOT.md)
3. Ouvrir une issue sur GitHub

---

**The AI Quest - Kahoot Edition** - Fait pour des parties multi-joueurs engageantes ! 🎯
