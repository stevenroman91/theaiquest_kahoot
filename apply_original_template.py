#!/usr/bin/env python3
"""
Script pour appliquer le template original final au jeu
"""

import shutil
import os

def apply_original_template():
    """Appliquer le template original final au jeu"""
    
    print("🎮 APPLICATION DU TEMPLATE ORIGINAL FINAL")
    print("=" * 50)
    
    # Fichiers source et destination
    source_file = "game_template_original_final.json"
    destination_file = "game_template.json"
    
    # Vérifier que le fichier source existe
    if not os.path.exists(source_file):
        print(f"❌ Fichier source {source_file} non trouvé!")
        return False
    
    # Sauvegarder l'ancien template
    if os.path.exists(destination_file):
        backup_file = f"{destination_file}.backup"
        shutil.copy2(destination_file, backup_file)
        print(f"✅ Ancien template sauvegardé dans {backup_file}")
    
    # Copier le nouveau template
    shutil.copy2(source_file, destination_file)
    print(f"✅ Template original final appliqué!")
    
    # Vérifier l'application
    try:
        from template_engine import GameTemplate
        template = GameTemplate(destination_file)
        
        print("\n📋 NOUVEAU TEMPLATE APPLIQUÉ:")
        print(f"  Company: {template.get_company_name()}")
        print(f"  Game Title: {template.get_game_title()}")
        print(f"  Characters: {template.get_character_name('amira')}, {template.get_character_name('james')}, {template.get_character_name('elena')}")
        print(f"  Phase 2 Choices: {len(template.config['phases']['phase2']['choices'])}")
        print(f"  Phase 4 Choices: {len(template.config['phases']['phase4']['choices'])}")
        print(f"  Phase 5 Choices: {len(template.config['phases']['phase5']['choices'])}")
        print(f"  Total Capabilities: {len(template.config['capabilities'])}")
        
        print("\n🚀 PROCHAINES ÉTAPES:")
        print("1. Redémarrez le serveur de jeu")
        print("2. Testez le jeu avec le nouveau template")
        print("3. Vérifiez que tous les éléments s'affichent correctement")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {e}")
        return False

def restore_backup():
    """Restaurer le template de sauvegarde"""
    
    backup_file = "game_template.json.backup"
    destination_file = "game_template.json"
    
    if not os.path.exists(backup_file):
        print(f"❌ Fichier de sauvegarde {backup_file} non trouvé!")
        return False
    
    shutil.copy2(backup_file, destination_file)
    print(f"✅ Template de sauvegarde restauré!")
    return True

def main():
    """Fonction principale"""
    
    print("🎮 GESTIONNAIRE DE TEMPLATES")
    print("=" * 30)
    print("1. Appliquer le template original final")
    print("2. Restaurer le template de sauvegarde")
    print("3. Quitter")
    
    choice = input("\nVotre choix (1-3): ").strip()
    
    if choice == "1":
        apply_original_template()
    elif choice == "2":
        restore_backup()
    elif choice == "3":
        print("👋 Au revoir!")
    else:
        print("❌ Choix invalide!")

if __name__ == "__main__":
    main()
