# AI Acceleration EXEC - Version 1.6 Real Authentication

## 🔐 Système d'Authentification Réel

La version 1.6 introduit un véritable système d'authentification avec gestion des utilisateurs et mots de passe hashés, remplaçant le système de codes d'accès de la version 1.5.

## ✨ Nouvelles Fonctionnalités

### 🔑 Authentification Sécurisée
- **Mots de passe hashés** avec PBKDF2-SHA256 et salt unique
- **Base de données SQLite** pour le stockage des utilisateurs
- **Sessions sécurisées** avec Flask
- **Validation côté client et serveur**

### 👥 Gestion des Utilisateurs
- **Création de comptes** via formulaire d'inscription
- **Rôles utilisateurs** (admin, manager, user)
- **Changement de mot de passe**
- **Historique des connexions**

### 🎨 Interface Utilisateur
- **Formulaire de connexion** avec username/password
- **Formulaire d'inscription** avec validation en temps réel
- **Navigation fluide** entre login et register
- **Messages d'erreur spécifiques**

## 🛠️ Architecture Technique

### Backend (Python)
- **`user_manager.py`** : Gestionnaire des utilisateurs avec authentification
- **`ai_acceleration_game.py`** : Logique de jeu mise à jour
- **`web_interface.py`** : API REST avec nouvelles routes d'authentification

### Frontend (JavaScript)
- **Validation en temps réel** des formulaires
- **Gestion des états de chargement**
- **Navigation entre formulaires**
- **Messages d'erreur contextuels**

### Base de Données
- **SQLite** avec table `users`
- **Champs** : id, username, email, password_hash, salt, role, created_at, last_login, is_active

## 🔧 Installation et Configuration

### 1. Prérequis
```bash
pip install flask sqlite3 hashlib secrets
```

### 2. Création des utilisateurs de test
```bash
cd /Users/stevenroman/Desktop/Exec/versions/v1.6-real-authentication
python3 create_test_users.py
```

### 3. Lancement du serveur
```bash
python3 start_game.py
```

## 👤 Comptes de Test

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| admin | FDJ2024!Admin | Administrateur |
| manager | FDJ2024!Manager | Manager |
| user1 | SecurePass2024! | Utilisateur |
| test | TestUser2024# | Utilisateur |

## 🔒 Sécurité

### Hachage des Mots de Passe
- **Algorithme** : PBKDF2-SHA256
- **Itérations** : 100,000
- **Salt** : 32 bytes hexadécimaux aléatoires
- **Stockage** : Hash + Salt en base de données

### Validation des Données
- **Côté client** : Validation HTML5 + JavaScript
- **Côté serveur** : Validation Python stricte
- **Protection** : Contre l'injection SQL et XSS

### Sessions
- **Cookies sécurisés** avec Flask
- **Timeout automatique** des sessions
- **Protection CSRF** intégrée

## 📡 API Endpoints

### Authentification
- `POST /api/login` - Connexion utilisateur
- `POST /api/register` - Création de compte
- `POST /api/logout` - Déconnexion
- `POST /api/change_password` - Changement de mot de passe

### Jeu (inchangé)
- `POST /api/start_game` - Démarrage du jeu
- `GET /api/mot1/choices` - Choix MOT1
- `POST /api/mot1/choose` - Sélection MOT1
- etc.

## 🎯 Utilisation

### Connexion
1. Ouvrir http://localhost:5001
2. Entrer nom d'utilisateur et mot de passe
3. Cliquer sur "Se connecter"

### Inscription
1. Cliquer sur "Créer un compte"
2. Remplir le formulaire d'inscription
3. Valider la création
4. Retour automatique au formulaire de connexion

### Jeu
- Le jeu fonctionne exactement comme la version 1.5
- Toutes les fonctionnalités précédentes sont conservées
- L'authentification est transparente pour l'utilisateur

## 🔄 Migration depuis v1.5

### Changements Majeurs
- **Suppression** des codes d'accès hardcodés
- **Ajout** de la gestion des utilisateurs
- **Modification** de l'interface de connexion
- **Nouvelle** base de données SQLite

### Compatibilité
- **Sauvegardes** : Non compatibles avec v1.5
- **Configuration** : Nouvelle initialisation requise
- **Données** : Création des utilisateurs nécessaire

## 🐛 Dépannage

### Problèmes Courants
1. **Base de données verrouillée** : Redémarrer le serveur
2. **Utilisateur existe déjà** : Utiliser un autre nom d'utilisateur
3. **Mot de passe incorrect** : Vérifier la casse et les caractères spéciaux

### Logs
- **Connexions** : Loggées avec timestamp et IP
- **Erreurs** : Détails dans les logs du serveur
- **Base de données** : Fichier `users.db` créé automatiquement

## 📈 Améliorations Futures

### Fonctionnalités Prévues
- **Récupération de mot de passe** par email
- **Comptes désactivés** temporairement
- **Audit trail** des actions utilisateurs
- **API REST** pour gestion des utilisateurs
- **Interface d'administration** web

### Sécurité
- **Rate limiting** pour les tentatives de connexion
- **2FA** (authentification à deux facteurs)
- **Chiffrement** des données sensibles
- **Audit** des logs de sécurité

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter la base de données `users.db`
3. Tester avec les comptes de démonstration
4. Redémarrer le serveur si nécessaire

---

**Version 1.6** - Système d'authentification réel avec gestion des utilisateurs
