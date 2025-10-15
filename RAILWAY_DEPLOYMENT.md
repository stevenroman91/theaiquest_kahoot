# 🚀 Guide de Déploiement Railway

## Problème de Connexion sur Railway

Si vous n'arrivez pas à vous connecter sur Railway, c'est probablement parce que les utilisateurs par défaut n'ont pas été créés.

## ✅ Solution Automatique

Le fichier `Procfile` a été mis à jour pour créer automatiquement les utilisateurs au déploiement :

```
release: python3 railway_init.py
web: python3 web_interface.py
```

## 🔧 Déploiement Manuel

Si le déploiement automatique ne fonctionne pas, vous pouvez créer les utilisateurs manuellement :

### 1. Accéder au Terminal Railway
- Allez sur votre projet Railway
- Cliquez sur "Deployments" 
- Cliquez sur le dernier déploiement
- Ouvrez le terminal

### 2. Créer les Utilisateurs
```bash
python3 create_default_users.py
```

### 3. Redémarrer l'Application
```bash
railway redeploy
```

## 🔐 Identifiants par Défaut

Une fois les utilisateurs créés, utilisez :

- **Admin** : `admin` / `FDJ2024!Admin`
- **Trainer** : `trainer` / `Trainer2024!`

## 🐛 Dépannage

### Vérifier les Logs Railway
1. Allez dans votre projet Railway
2. Cliquez sur "Deployments"
3. Cliquez sur le dernier déploiement
4. Regardez les logs pour voir si `railway_init.py` s'est exécuté

### Vérifier la Base de Données
```bash
# Dans le terminal Railway
ls -la users.db
```

### Recréer la Base de Données
```bash
# Dans le terminal Railway
rm users.db
python3 railway_init.py
```

## 📱 Test de Connexion

1. Allez sur l'URL Railway de votre application
2. Essayez de vous connecter avec les identifiants par défaut
3. Si ça ne marche pas, vérifiez les logs Railway

## 🔄 Redéploiement

Pour forcer un redéploiement avec initialisation :

```bash
railway redeploy
```

Cela exécutera automatiquement `railway_init.py` et créera les utilisateurs.
