#!/usr/bin/env python3
"""
Script de démarrage pour le jeu AI Acceleration EXEC
"""

import subprocess
import sys
import os
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def install_requirements():
    """Installe les dépendances nécessaires"""
    print("📦 Installation des dépendances...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements_web.txt"])
        print("✅ Dépendances installées avec succès!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'installation: {e}")
        return False

def start_web_server():
    """Démarre le serveur web Flask"""
    print("🚀 Démarrage du serveur web...")
    print("📱 Le jeu sera accessible sur: http://localhost:5001")
    print("🛑 Appuyez sur Ctrl+C pour arrêter le serveur")
    print("=" * 50)
    
    try:
        # Import and run the web interface
        from web_interface import app
        app.run(debug=True, host='0.0.0.0', port=5001)
    except KeyboardInterrupt:
        print("\n👋 Serveur arrêté. Merci d'avoir joué!")
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")

def main():
    """Fonction principale"""
    print("🎮 AI Acceleration EXEC - Jeu Sérieux")
    print("=" * 50)
    
    # Vérifier si Flask est installé
    try:
        import flask
        print("✅ Flask déjà installé")
    except ImportError:
        print("📦 Flask non trouvé, installation...")
        if not install_requirements():
            return
    
    # Démarrer le serveur
    start_web_server()

if __name__ == "__main__":
    main()
