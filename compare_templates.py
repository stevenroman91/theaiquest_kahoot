#!/usr/bin/env python3
"""
Script pour comparer les différents templates créés
"""

from template_engine import GameTemplate
import json

def compare_templates():
    """Comparer les différents templates disponibles"""
    
    print("🔍 COMPARAISON DES TEMPLATES")
    print("=" * 50)
    
    templates = {
        "Original": "game_template.json",
        "Digital": "game_template_digital.json", 
        "Original Final": "game_template_original_final.json",
        "Custom": "my_custom_template.json"
    }
    
    results = {}
    
    for name, file in templates.items():
        try:
            template = GameTemplate(file)
            results[name] = {
                "company": template.get_company_name(),
                "title": template.get_game_title(),
                "characters": {
                    "protagonist": template.get_character_name("protagonist"),
                    "amira": template.get_character_name("amira"),
                    "james": template.get_character_name("james"),
                    "elena": template.get_character_name("elena")
                },
                "phases": {
                    "phase1_choices": len(template.config["phases"]["phase1"]["choices"]),
                    "phase2_choices": len(template.config["phases"]["phase2"]["choices"]),
                    "phase4_choices": len(template.config["phases"]["phase4"]["choices"]),
                    "phase5_choices": len(template.config["phases"]["phase5"]["choices"])
                },
                "capabilities": len(template.config["capabilities"]),
                "terminology": {
                    "phase": template.get_terminology("phase"),
                    "enabler": template.get_terminology("enabler"),
                    "choice": template.get_terminology("choice")
                }
            }
        except Exception as e:
            print(f"❌ Erreur avec {name}: {e}")
            results[name] = None
    
    # Afficher la comparaison
    print("\n📊 RÉSUMÉ COMPARATIF:")
    print("-" * 50)
    
    for name, data in results.items():
        if data:
            print(f"\n🎮 {name}:")
            print(f"  Company: {data['company']}")
            print(f"  Title: {data['title']}")
            print(f"  Characters: {data['characters']['protagonist']}, {data['characters']['amira']}, {data['characters']['james']}, {data['characters']['elena']}")
            print(f"  Phases: P1({data['phases']['phase1_choices']}) P2({data['phases']['phase2_choices']}) P4({data['phases']['phase4_choices']}) P5({data['phases']['phase5_choices']})")
            print(f"  Capabilities: {data['capabilities']}")
            print(f"  Terminology: {data['terminology']['phase']} / {data['terminology']['enabler']} / {data['terminology']['choice']}")
    
    # Détails des choix par phase
    print("\n📋 DÉTAILS DES CHOIX PAR PHASE:")
    print("-" * 50)
    
    for name, data in results.items():
        if data:
            print(f"\n🎯 {name} - Phase 2 Choices:")
            try:
                template = GameTemplate(templates[name])
                for choice_id, choice_data in template.config["phases"]["phase2"]["choices"].items():
                    print(f"    {choice_id}: {choice_data['title']}")
            except:
                pass
    
    # Recommandations
    print("\n💡 RECOMMANDATIONS:")
    print("-" * 50)
    print("1. 🎮 Template Original: Parfait pour le jeu AI Acceleration Game")
    print("2. 🔄 Template Digital: Idéal pour transformation digitale")
    print("3. 📋 Template Original Final: Le plus complet avec toutes les capacités")
    print("4. 🎨 Template Custom: Exemple de personnalisation")
    
    print("\n🚀 UTILISATION:")
    print("-" * 50)
    print("Pour utiliser un template spécifique:")
    print("1. Copiez le fichier JSON souhaité vers 'game_template.json'")
    print("2. Ou modifiez le code pour charger directement le template")
    print("3. Redémarrez le jeu pour appliquer les changements")

if __name__ == "__main__":
    compare_templates()
