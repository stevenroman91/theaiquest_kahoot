# Guide de Développement - AI Acceleration EXEC

## 🚀 Workflow de Développement

### 1. Démarrage Rapide

```bash
# Démarrer le serveur de développement
./dev.sh start

# Tester l'application
./dev.sh test

# Voir le statut
./dev.sh status

# Arrêter le serveur
./dev.sh stop
```

### 2. Cycle de Développement

#### Étape 1: Développement Local
```bash
# 1. Démarrer le serveur
./dev.sh start

# 2. Ouvrir http://localhost:5001 dans le navigateur
# 3. Fester vos modifications
# 4. Les modifications sont automatiquement rechargées (Flask debug mode)
```

#### Étape 2: Tests
```bash
# Tester l'application
./dev.sh test

# Vérifier les logs en temps réel
tail -f .dev_server.log
```

#### Étape 3: Déploiement
```bash
# Déployer vers GitHub
./dev.sh deploy
```

### 3. Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `./dev.sh start` | Démarrer le serveur de développement |
| `./dev.sh stop` | Arrêter le serveur |
| `./dev.sh restart` | Redémarrer le serveur |
| `./dev.sh status` | Afficher le statut du serveur |
| `./dev.sh test` | Tester l'application |
| `./dev.sh deploy` | Déployer vers GitHub |
| `./dev.sh help` | Afficher l'aide |

### 4. Structure du Projet

```
v1.9-phase1-context-enhanced/
├── dev.sh                 # Script de développement
├── web_interface.py       # Application Flask principale
├── requirements.txt       # Dépendances Python
├── static/               # Fichiers statiques
│   ├── css/             # Styles CSS
│   ├── js/              # JavaScript
│   └── videos/          # Vidéos du jeu
├── templates/           # Templates HTML
└── .gitignore          # Fichiers à ignorer par Git
```

### 5. Modifications Courantes

#### Modifier le JavaScript
```bash
# 1. Éditer static/js/game.js
# 2. Rafraîchir la page (Ctrl+F5 pour vider le cache)
# 3. Tester les modifications
```

#### Modifier le CSS
```bash
# 1. Éditer static/css/style.css
# 2. Rafraîchir la page
# 3. Vérifier les changements
```

#### Modifier les vidéos
```bash
# 1. Remplacer les fichiers dans static/videos/
# 2. Redémarrer le serveur si nécessaire
./dev.sh restart
```

### 6. Débogage

#### Logs du Serveur
```bash
# Voir les logs en temps réel
tail -f .dev_server.log

# Voir les dernières erreurs
tail -n 50 .dev_server.log
```

#### Console du Navigateur
- Ouvrir les outils de développement (F12)
- Onglet Console pour voir les erreurs JavaScript
- Onglet Network pour voir les requêtes

#### Erreurs Courantes
- **Port déjà utilisé** : `./dev.sh stop` puis `./dev.sh start`
- **Vidéo ne se charge pas** : Vérifier le chemin dans `static/videos/`
- **JavaScript ne fonctionne pas** : Vider le cache (Ctrl+F5)

### 7. Git Workflow

#### Branches Recommandées
- `main` : Version stable, prête pour la production
- `dev` : Version de développement
- `feature/nom-feature` : Nouvelles fonctionnalités

#### Workflow Git
```bash
# 1. Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
./dev.sh start
# ... modifications ...
./dev.sh test

# 3. Commiter les changements
git add .
git commit -m "Ajout de la nouvelle fonctionnalité"

# 4. Pousser vers GitHub
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request sur GitHub
# 6. Fusionner dans main après validation
```

### 8. Déploiement

#### Déploiement Automatique
```bash
# Déployer la version actuelle
./dev.sh deploy
```

#### Déploiement Manuel
```bash
# 1. Commiter les changements
git add .
git commit -m "Description des changements"

# 2. Pousser vers GitHub
git push origin main

# 3. Déployer sur Railway/Render (si configuré)
```

### 9. Sauvegarde et Versioning

#### Sauvegarde Locale
```bash
# Créer une sauvegarde complète
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Restaurer une sauvegarde
tar -xzf backup-YYYYMMDD.tar.gz
```

#### Versioning
- Utiliser des tags Git pour marquer les versions
- Documenter les changements dans `CHANGELOG.md`
- Tester chaque version avant déploiement

### 10. Conseils de Développement

#### Bonnes Pratiques
- Tester chaque modification avant de commiter
- Utiliser des messages de commit descriptifs
- Garder le code propre et commenté
- Sauvegarder régulièrement

#### Performance
- Optimiser les vidéos (compression)
- Minimiser les requêtes HTTP
- Utiliser le cache du navigateur

#### Sécurité
- Ne jamais commiter de mots de passe
- Valider les entrées utilisateur
- Utiliser HTTPS en production

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `tail -f .dev_server.log`
2. Redémarrer le serveur : `./dev.sh restart`
3. Vérifier la console du navigateur
4. Consulter ce guide de développement
