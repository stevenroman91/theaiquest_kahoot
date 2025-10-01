#!/usr/bin/env python3
"""
Script de démarrage pour AI Acceleration EXEC - Version 1.4
Lance le serveur Flask avec l'écran de récapitulatif du score global
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_banner():
    """Affiche la bannière de démarrage"""
    print("=" * 70)
    print("🎮 AI ACCELERATION EXEC - VERSION 1.4")
    print("=" * 70)
    print("🆕 NOUVELLE FONCTIONNALITÉ : Écran de récapitulatif du score global")
    print("=" * 70)
    print()
    print("📋 Fonctionnalités de la v1.4 :")
    print("  • Écran de récapitulatif automatique après chaque MOT")
    print("  • Score global mis en évidence")
    print("  • Détail par MOT avec progression visuelle")
    print("  • Passage automatique au MOT suivant")
    print()
    print("🔄 Nouveau flux :")
    print("  MOT → Choix → Score MOT → Récapitulatif Global → MOT suivant")
    print()
    print("=" * 70)

def check_dependencies():
    """Vérifie que les dépendances sont installées"""
    print("🔍 Vérification des dépendances...")
    
    try:
        import flask
        import requests
        print("  ✅ Flask installé")
    except ImportError as e:
        print(f"  ❌ Dépendance manquante: {e}")
        print("  💡 Installez les dépendances avec: pip install -r requirements_web.txt")
        return False
    
    return True

def check_port_available(port=5001):
    """Vérifie que le port est disponible"""
    import socket
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            print(f"  ✅ Port {port} disponible")
            return True
    except OSError:
        print(f"  ❌ Port {port} déjà utilisé")
        print(f"  💡 Arrêtez le processus utilisant le port {port} ou changez le port")
        return False

def start_server():
    """Démarre le serveur Flask"""
    print("🚀 Démarrage du serveur Flask...")
    
    # Vérifier que le fichier web_interface.py existe
    if not os.path.exists("web_interface.py"):
        print("  ❌ Fichier web_interface.py introuvable")
        print("  💡 Assurez-vous d'être dans le bon répertoire")
        return False
    
    try:
        # Démarrer le serveur Flask
        print("  🌐 Serveur démarré sur http://localhost:5001")
        print("  📱 Interface web prête")
        print()
        print("🎯 Instructions d'utilisation :")
        print("  1. Ouvrez votre navigateur sur http://localhost:5001")
        print("  2. Utilisez le code 'BASIC_QUICK' pour vous connecter")
        print("  3. Suivez les instructions du jeu")
        print("  4. Observez le nouvel écran de récapitulatif après chaque MOT !")
        print()
        print("⏹️  Pour arrêter le serveur : Ctrl+C")
        print("=" * 70)
        
        # Lancer le serveur
        subprocess.run([sys.executable, "web_interface.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Serveur arrêté par l'utilisateur")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ Erreur lors du démarrage du serveur: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Erreur inattendue: {e}")
        return False

def open_browser():
    """Ouvre le navigateur automatiquement"""
    try:
        webbrowser.open("http://localhost:5001")
        print("  🌐 Navigateur ouvert automatiquement")
    except Exception as e:
        print(f"  ⚠️  Impossible d'ouvrir le navigateur automatiquement: {e}")
        print("  💡 Ouvrez manuellement http://localhost:5001 dans votre navigateur")

def main():
    """Fonction principale"""
    print_banner()
    
    # Vérifications préliminaires
    if not check_dependencies():
        return 1
    
    if not check_port_available():
        return 1
    
    # Démarrer le serveur
    print("🎮 Démarrage du jeu AI Acceleration EXEC v1.4...")
    print()
    
    success = start_server()
    
    if success:
        print("✅ Jeu terminé avec succès")
        return 0
    else:
        print("❌ Erreur lors du démarrage du jeu")
        return 1

if __name__ == "__main__":
    sys.exit(main())
