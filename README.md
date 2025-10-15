# AI Transformation - PlayNext Leader Edition

## 🎯 Vue d'ensemble

**AI Transformation** est un serious game interactif conçu pour les dirigeants et managers qui souhaitent comprendre et maîtriser la transformation numérique de leur organisation. Le jeu simule des décisions stratégiques autour de l'intégration de l'IA dans différents domaines métier.

### 🏢 Contexte
- **Entreprise** : PlayNext - Leader Edition v1.9
- **Public cible** : Dirigeants et managers RH
- **Objectif** : Formation à la transformation IA par la simulation de décisions stratégiques

## 🏗️ Architecture Technique

### Structure du Projet
```
v1.9-phase1-context-enhanced/
├── web_interface.py          # Interface Flask principale
├── ai_acceleration_game.py   # Logique métier du jeu
├── template_engine_complete.py # Gestion centralisée du contenu
├── user_manager.py           # Système d'authentification
├── game_template_complete.json # Configuration du jeu
├── templates/
│   └── index.html           # Interface utilisateur
├── static/
│   ├── css/style.css        # Styles
│   ├── js/game.js          # Logique frontend
│   └── videos/             # Ressources vidéo
├── users.db                # Base de données SQLite
└── requirements.txt        # Dépendances Python
```

### Technologies Utilisées
- **Backend** : Python 3.12, Flask
- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Base de données** : SQLite3
- **Authentification** : Sessions Flask + hachage SHA-256
- **Templates** : Jinja2

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.12+
- pip (gestionnaire de paquets Python)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd v1.9-phase1-context-enhanced

# Installer les dépendances
pip install -r requirements.txt

# Démarrer l'application
python3 web_interface.py
```

### Accès
- **URL** : http://localhost:5001
- **Utilisateurs par défaut** :
  - `admin` / `FDJ2024!Admin`
  - `trainer` / `Trainer2024!`

## 🔧 Configuration

### Variables d'Environnement
```bash
# Optionnel - Clé secrète pour les sessions Flask
export SECRET_KEY="votre_cle_secrete"

# Optionnel - Port de l'application (défaut: 5001)
export PORT=5001

# Optionnel - Mode de production
export FLASK_ENV=production
```

### Configuration du Jeu
Le contenu du jeu est centralisé dans `game_template_complete.json`. Ce fichier contient :
- Informations générales (titre, entreprise)
- Configuration des phases du jeu
- Choix disponibles pour chaque phase
- Enablers et leurs conditions de déblocage
- Messages personnalisés

## 🎮 Fonctionnalités du Jeu

### Phases du Jeu
1. **STEP 1** : Designing Your AI-Enhanced Business Strategy
2. **STEP 2** : Building Your AI Use Case Portfolio  
3. **STEP 3** : Launching Your Priority AI Pilots
4. **STEP 4** : Scaling Your AI and GenAI Solutions
5. **STEP 5** : Deploying AI Across the Organization

### Système de Scoring
- Chaque choix génère un score de 1 à 3 étoiles
- Les scores influencent les enablers débloqués
- Messages personnalisés selon les performances

### Enablers
- Système de déblocage progressif
- Affichage conditionnel selon les choix
- Impact sur le tableau de bord pédagogique

## 🛠️ Maintenance et Développement

### Structure du Code

#### `web_interface.py`
- **Responsabilité** : Interface Flask, routes API, gestion des sessions
- **Patterns** : Singleton pour l'instance de jeu, gestion d'erreurs centralisée
- **Optimisations** : Configuration via variables d'environnement, logging structuré

#### `ai_acceleration_game.py`
- **Responsabilité** : Logique métier, calcul des scores, gestion des états
- **Patterns** : Dataclasses pour les modèles, Enum pour les états
- **Optimisations** : Typage strict, gestion d'erreurs robuste

#### `template_engine_complete.py`
- **Responsabilité** : Chargement et accès au contenu du jeu
- **Patterns** : Singleton pour l'instance template, fallback sur configuration par défaut
- **Optimisations** : Cache du template, gestion d'erreurs avec logging

#### `user_manager.py`
- **Responsabilité** : Authentification, gestion des utilisateurs
- **Patterns** : Hachage sécurisé des mots de passe, gestion des sessions
- **Optimisations** : Requêtes SQL optimisées, gestion des connexions

### Ajout de Nouveau Contenu

#### Modifier le Template
1. Éditer `game_template_complete.json`
2. Redémarrer l'application pour recharger le template
3. Vérifier la cohérence des IDs et références

#### Ajouter une Nouvelle Phase
1. Ajouter la configuration dans `game_template_complete.json`
2. Implémenter la logique dans `ai_acceleration_game.py`
3. Ajouter les routes dans `web_interface.py`
4. Mettre à jour l'interface dans `templates/index.html`

### Debugging

#### Logs
```bash
# Activer les logs détaillés
export FLASK_ENV=development
python3 web_interface.py
```

#### Base de Données
```bash
# Accéder à la base SQLite
sqlite3 users.db
.tables
SELECT * FROM users;
```

### Tests
```bash
# Tester l'API
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"FDJ2024!Admin"}'

# Tester la configuration du jeu
curl http://localhost:5001/api/game_config
```

## 🔒 Sécurité

### Authentification
- Mots de passe hachés avec SHA-256 + salt
- Sessions Flask sécurisées
- Protection CSRF intégrée

### Données Sensibles
- Clé secrète configurable via variable d'environnement
- Pas de données sensibles en dur dans le code
- Logs sans exposition d'informations sensibles

## 📊 Monitoring et Performance

### Métriques
- Logs structurés avec timestamps
- Gestion des erreurs avec stack traces
- Monitoring des performances des requêtes

### Optimisations
- Singleton pattern pour les instances lourdes
- Cache du template en mémoire
- Requêtes SQL optimisées
- Limitation de taille des uploads

## 🚀 Déploiement

### Production
```bash
# Configuration production
export FLASK_ENV=production
export SECRET_KEY="cle_secrete_production"
export PORT=80

# Démarrage avec Gunicorn (recommandé)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:80 web_interface:app
```

### Docker (optionnel)
```bash
# Build de l'image
docker build -t ai-transformation .

# Exécution
docker run -p 5001:5001 ai-transformation
```

## 📝 Changelog

### Version 1.9 (Actuelle)
- ✅ Architecture optimisée et code nettoyé
- ✅ Gestion d'erreurs robuste
- ✅ Logging structuré
- ✅ Documentation complète
- ✅ Suppression des fichiers redondants
- ✅ Configuration via variables d'environnement

### Versions Précédentes
- v1.8 : Ajout du système d'enablers
- v1.7 : Personnalisation des messages de score
- v1.6 : Intégration des vidéos
- v1.5 : Système d'authentification

## 🤝 Contribution

### Standards de Code
- PEP 8 pour le style Python
- Docstrings pour toutes les fonctions publiques
- Typage strict avec `typing`
- Gestion d'erreurs explicite
- Logging structuré

### Processus
1. Créer une branche feature
2. Implémenter avec tests
3. Documenter les changements
4. Code review
5. Merge vers main

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de l'application
2. Consulter cette documentation
3. Tester avec les utilisateurs par défaut
4. Vérifier la configuration du template

---

**AI Transformation - PlayNext Leader Edition v1.9**  
*Architecture optimisée pour la performance et la maintenabilité*