#!/bin/bash

# Script de déploiement pour AI Acceleration EXEC
# Ce script prépare le projet pour le déploiement sur Railway ou Render

echo "🚀 Préparation du déploiement AI Acceleration EXEC v1.9"
echo "=================================================="

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez installer Git d'abord."
    exit 1
fi

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "web_interface.py" ]; then
    echo "❌ Veuillez exécuter ce script depuis le répertoire du projet v1.9"
    exit 1
fi

echo "✅ Répertoire du projet détecté"

# Initialiser Git si ce n'est pas déjà fait
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
    echo "✅ Git initialisé"
else
    echo "✅ Git déjà initialisé"
fi

# Ajouter tous les fichiers
echo "📁 Ajout des fichiers au repository..."
git add .

# Créer le commit initial
echo "💾 Création du commit initial..."
git commit -m "Initial commit - AI Acceleration EXEC v1.9

- Jeu sérieux interactif pour la transformation GenAI RH
- 5 phases avec vidéos intégrées et système de scoring
- Interface responsive avec authentification utilisateur
- Vidéo Recap intégrée dans l'écran de résultats final
- Prêt pour déploiement sur Railway/Render

Version: v1.9-phase1-context-enhanced
Date: $(date)"

echo "✅ Commit créé"

echo ""
echo "🎯 Prochaines étapes pour le déploiement :"
echo "=========================================="
echo ""
echo "1. 🌐 Créer un repository sur GitHub :"
echo "   - Aller sur https://github.com/new"
echo "   - Nom : ai-acceleration-exec"
echo "   - Description : AI Acceleration EXEC - Smart Retail Group HR Managers Edition"
echo "   - Public ou Private selon vos préférences"
echo ""
echo "2. 🔗 Connecter le repository local :"
echo "   git remote add origin https://github.com/VOTRE-USERNAME/ai-acceleration-exec.git"
echo "   git push -u origin main"
echo ""
echo "3. 🚀 Déployer sur Railway (Recommandé) :"
echo "   - Aller sur https://railway.app"
echo "   - Se connecter avec GitHub"
echo "   - Cliquer 'New Project'"
echo "   - Sélectionner 'Deploy from GitHub repo'"
echo "   - Choisir votre repository"
echo "   - Railway déploie automatiquement !"
echo ""
echo "4. 🌍 Alternative : Render.com :"
echo "   - Aller sur https://render.com"
echo "   - Créer un 'Web Service'"
echo "   - Connecter GitHub et sélectionner le repository"
echo "   - Configuration automatique Flask"
echo ""
echo "5. 📱 Partager l'URL publique avec les utilisateurs !"
echo ""
echo "✅ Projet prêt pour le déploiement !"
echo ""
echo "📋 Fichiers créés :"
echo "   - requirements.txt (dépendances Python)"
echo "   - Procfile (configuration Railway)"
echo "   - .gitignore (fichiers à ignorer)"
echo "   - README.md (documentation)"
echo "   - DEPLOYMENT_GUIDE.md (guide détaillé)"
echo ""
echo "🎮 Le jeu sera accessible via une URL publique permanente !"
