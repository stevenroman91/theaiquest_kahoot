#!/bin/bash

# Script d'automatisation du déploiement sur Railway
# Usage: ./deploy_railway.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚂 Déploiement automatique sur Railway"
echo "========================================"
echo ""

# Vérifier si Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé."
    echo ""
    echo "📦 Installation..."
    if command -v npm &> /dev/null; then
        npm i -g @railway/cli
    else
        echo "❌ npm n'est pas installé. Veuillez installer Node.js d'abord."
        echo "   Ou installez Railway CLI manuellement : https://docs.railway.app/develop/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI détecté"
echo ""

# Vérifier si l'utilisateur est connecté
if ! railway whoami &> /dev/null; then
    echo "🔐 Connexion à Railway..."
    railway login
fi

echo "✅ Connecté à Railway"
echo ""

# Vérifier si un projet Railway existe déjà
if [ -f ".railway/project" ]; then
    echo "📁 Projet Railway existant détecté"
    PROJECT_ID=$(cat .railway/project)
else
    echo "🆕 Création d'un nouveau projet Railway..."
    railway init
    
    # Créer le projet si nécessaire
    if [ ! -f ".railway/project" ]; then
        echo "❌ Erreur lors de l'initialisation du projet"
        exit 1
    fi
fi

echo ""
echo "⚙️  Configuration des variables d'environnement..."

# Générer une SECRET_KEY si elle n'existe pas
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)
    echo "🔑 Génération de SECRET_KEY..."
fi

# Définir les variables d'environnement
railway variables set FLASK_ENV=production
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set DATABASE_PATH=/data/users.db

echo "✅ Variables d'environnement configurées"
echo "   - FLASK_ENV=production"
echo "   - SECRET_KEY=*** (configurée)"
echo "   - DATABASE_PATH=/data/users.db"
echo ""
echo "⚠️  IMPORTANT : N'oubliez pas de créer le volume persistant dans Railway Dashboard :"
echo "   1. Allez dans votre projet → Volumes"
echo "   2. Créez un volume avec Mount Path: /data"
echo "   3. Size: 1GB minimum"
echo ""

# Vérifier que tous les fichiers nécessaires existent
echo "📋 Vérification des fichiers nécessaires..."

REQUIRED_FILES=("Procfile" "requirements.txt" "web_interface.py")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done

echo "✅ Tous les fichiers requis sont présents"
echo ""

# Déployer
echo "🚀 Déploiement sur Railway..."
railway up

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Votre application est en cours de déploiement"
echo "   2. Vérifiez les logs : railway logs"
echo "   3. Obtenez l'URL : railway domain"
echo ""

