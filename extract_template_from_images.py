#!/usr/bin/env python3
"""
Script pour extraire le contenu des images MOT et créer un template original
"""

import os
import json
from PIL import Image
import pytesseract
import re

def extract_text_from_image(image_path):
    """Extraire le texte d'une image avec OCR"""
    try:
        # Ouvrir l'image
        image = Image.open(image_path)
        
        # Configuration OCR pour le français et l'anglais
        custom_config = r'--oem 3 --psm 6 -l fra+eng'
        
        # Extraire le texte
        text = pytesseract.image_to_string(image, config=custom_config)
        
        return text.strip()
    except Exception as e:
        print(f"Erreur lors de l'extraction de {image_path}: {e}")
        return ""

def parse_mot1_content(text, filename):
    """Parser le contenu des images MOT1"""
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    # Rechercher les patterns typiques des choix MOT1
    choice_data = {
        "title": "",
        "description": "",
        "character": "",
        "role": ""
    }
    
    # Patterns pour identifier les éléments
    for i, line in enumerate(lines):
        # Titre du choix (généralement en premier)
        if not choice_data["title"] and len(line) > 10 and not line.lower().startswith(('expert', 'marketing', 'it', 'transformation')):
            choice_data["title"] = line
        
        # Rôle de l'expert
        if 'expert' in line.lower():
            choice_data["role"] = line
        
        # Description (texte plus long)
        if len(line) > 50 and not choice_data["description"]:
            choice_data["description"] = line
    
    # Déterminer le personnage basé sur le nom du fichier
    if "option1" in filename:
        choice_data["character"] = "amira"
    elif "option2" in filename:
        choice_data["character"] = "james"
    elif "option3" in filename:
        choice_data["character"] = "elena"
    
    return choice_data

def parse_mot2_content(text, filename):
    """Parser le contenu des images MOT2"""
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    choice_data = {
        "title": "",
        "description": "",
        "choice_id": ""
    }
    
    # Identifier le choix basé sur le nom du fichier
    choice_mapping = {
        "option1": "intelligent_recruitment",
        "option2": "virtual_hr_assistant", 
        "option3": "training_optimization",
        "option4": "sentiment_analysis",
        "option5": "hr_automation",
        "option6": "candidate_matching",
        "option7": "employee_support",
        "option8": "personalized_training",
        "option9": "process_automation"
    }
    
    choice_data["choice_id"] = choice_mapping.get(filename.replace("MOT2_", "").replace(".png", ""), "")
    
    # Extraire le titre et la description
    for line in lines:
        if not choice_data["title"] and len(line) > 5 and len(line) < 50:
            choice_data["title"] = line
        elif len(line) > 30 and not choice_data["description"]:
            choice_data["description"] = line
    
    return choice_data

def parse_mot3_content(text, filename):
    """Parser le contenu des images MOT3"""
    if "options" in filename:
        # Image des options MOT3
        lines = text.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        categories = {
            "policies_practices": "",
            "platform_partnerships": "",
            "people_processes": ""
        }
        
        # Identifier les catégories
        for line in lines:
            if 'governance' in line.lower() or 'policies' in line.lower():
                categories["policies_practices"] = line
            elif 'platform' in line.lower() or 'partnership' in line.lower():
                categories["platform_partnerships"] = line
            elif 'people' in line.lower() or 'process' in line.lower():
                categories["people_processes"] = line
        
        return {"type": "categories", "data": categories}
    
    elif "details" in filename:
        # Image des détails MOT3
        return {"type": "details", "data": text}
    
    return {"type": "unknown", "data": text}

def parse_mot4_content(text, filename):
    """Parser le contenu des images MOT4"""
    if "options" in filename:
        # Image des options MOT4
        lines = text.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        choices = []
        for line in lines:
            if len(line) > 10 and len(line) < 100:
                choices.append(line)
        
        return {"type": "options", "data": choices}
    
    elif "details" in filename:
        # Image des détails MOT4
        return {"type": "details", "data": text}
    
    return {"type": "unknown", "data": text}

def parse_mot5_content(text, filename):
    """Parser le contenu des images MOT5"""
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    choice_data = {
        "title": "",
        "description": "",
        "choice_id": ""
    }
    
    # Identifier le choix basé sur le nom du fichier
    choice_mapping = {
        "option1": "genai_for_all",
        "option2": "capability_building",
        "option3": "people_speed"
    }
    
    choice_data["choice_id"] = choice_mapping.get(filename.replace("MOT5_", "").replace(".png", ""), "")
    
    # Extraire le titre et la description
    for line in lines:
        if not choice_data["title"] and len(line) > 5 and len(line) < 50:
            choice_data["title"] = line
        elif len(line) > 30 and not choice_data["description"]:
            choice_data["description"] = line
    
    return choice_data

def create_original_template():
    """Créer le template original basé sur les images MOT"""
    
    mot_directory = "/Users/stevenroman/Desktop/Exec/MOT"
    
    template = {
        "game_config": {
            "company_name": "TechCorp",
            "game_title": "AI Acceleration Game",
            "language": "en",
            "theme": {
                "primary_color": "#1e3a8a",
                "secondary_color": "#3b82f6",
                "accent_color": "#10b981"
            }
        },
        "terminology": {
            "phase": "phase",
            "enabler": "enabler",
            "choice": "choice",
            "score": "score",
            "dashboard": "dashboard"
        },
        "characters": {
            "protagonist": {
                "name": "Sophie",
                "role": "HR Director",
                "description": "Sophie is leading the AI transformation initiative"
            },
            "experts": {
                "amira": {
                    "name": "Amira",
                    "role": "Marketing Expert",
                    "description": "Amira brings marketing expertise to the AI transformation"
                },
                "james": {
                    "name": "James",
                    "role": "IT Expert",
                    "description": "James provides technical guidance for AI implementation"
                },
                "elena": {
                    "name": "Elena",
                    "role": "Transformation Expert",
                    "description": "Elena specializes in organizational change management"
                }
            }
        },
        "phases": {
            "phase1": {
                "title": "Phase 1 - Embedding GenAI in your AI transformation program",
                "description": "Define the strategic foundation for AI transformation",
                "choices": {}
            },
            "phase2": {
                "title": "Phase 2 - HR AI Use Cases",
                "description": "Select specific HR AI applications to implement",
                "choices": {}
            },
            "phase3": {
                "title": "Phase 3 - Implementation Strategy",
                "description": "Choose your implementation approach across different areas",
                "categories": {
                    "policies_practices": {
                        "title": "Policies & Practices",
                        "description": "Governance and ethical frameworks"
                    },
                    "platform_partnerships": {
                        "title": "Platform & Partnerships",
                        "description": "Technology partnerships and integrations"
                    },
                    "people_processes": {
                        "title": "People & Processes",
                        "description": "Human resources and operational processes"
                    }
                }
            },
            "phase4": {
                "title": "Phase 4 - Scaling & Governance",
                "description": "Establish governance and scaling mechanisms",
                "choices": {}
            },
            "phase5": {
                "title": "Phase 5 - Future Vision",
                "description": "Define your long-term AI transformation vision",
                "choices": {}
            }
        },
        "capabilities": {},
        "ui_text": {
            "teams_meeting": {
                "title": "Teams Meeting",
                "description": "{protagonist_name} is organising a Teams meeting with her colleagues {amira_name} ({amira_role}), {james_name} ({james_role}) and {elena_name} ({elena_role}) to gather their recommendations and define the best strategy for deploying generative AI",
                "button_text": "Join the Teams meeting"
            },
            "dashboard": {
                "title": "Executive Dashboard",
                "subtitle": "Track your AI transformation progress",
                "categories": {
                    "policies_practices": "Policies & Practices",
                    "platform_partnerships": "Platform & Partnerships",
                    "people_processes": "People & Processes"
                }
            },
            "navigation": {
                "next": "Next",
                "previous": "Previous",
                "continue": "Continue",
                "finish": "Finish"
            }
        }
    }
    
    # Traiter chaque image
    for filename in sorted(os.listdir(mot_directory)):
        if filename.endswith('.png'):
            image_path = os.path.join(mot_directory, filename)
            print(f"Traitement de {filename}...")
            
            # Extraire le texte
            text = extract_text_from_image(image_path)
            
            if not text:
                print(f"  Aucun texte extrait de {filename}")
                continue
            
            print(f"  Texte extrait: {text[:100]}...")
            
            # Parser selon le type d'image
            if filename.startswith('MOT1_'):
                choice_data = parse_mot1_content(text, filename)
                if choice_data["character"]:
                    template["phases"]["phase1"]["choices"][choice_data["character"]] = {
                        "title": choice_data["title"],
                        "description": choice_data["description"]
                    }
                    # Mettre à jour le rôle du personnage
                    if choice_data["role"]:
                        template["characters"]["experts"][choice_data["character"]]["role"] = choice_data["role"]
            
            elif filename.startswith('MOT2_'):
                choice_data = parse_mot2_content(text, filename)
                if choice_data["choice_id"]:
                    template["phases"]["phase2"]["choices"][choice_data["choice_id"]] = {
                        "title": choice_data["title"],
                        "description": choice_data["description"]
                    }
            
            elif filename.startswith('MOT3_'):
                parsed_data = parse_mot3_content(text, filename)
                if parsed_data["type"] == "categories":
                    for category, title in parsed_data["data"].items():
                        if title:
                            template["phases"]["phase3"]["categories"][category]["title"] = title
            
            elif filename.startswith('MOT4_'):
                parsed_data = parse_mot4_content(text, filename)
                if parsed_data["type"] == "options":
                    # Ajouter les choix MOT4
                    for i, choice_title in enumerate(parsed_data["data"]):
                        choice_id = f"choice_{i+1}"
                        template["phases"]["phase4"]["choices"][choice_id] = {
                            "title": choice_title,
                            "description": f"Description for {choice_title}"
                        }
            
            elif filename.startswith('MOT5_'):
                choice_data = parse_mot5_content(text, filename)
                if choice_data["choice_id"]:
                    template["phases"]["phase5"]["choices"][choice_data["choice_id"]] = {
                        "title": choice_data["title"],
                        "description": choice_data["description"]
                    }
    
    return template

def main():
    """Fonction principale"""
    print("🔍 Extraction du template original depuis les images MOT...")
    
    try:
        # Créer le template
        template = create_original_template()
        
        # Sauvegarder le template
        output_file = "/Users/stevenroman/Desktop/Exec/versions/v1.9-phase1-context-enhanced/game_template_original.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Template original créé et sauvegardé dans {output_file}")
        
        # Afficher un résumé
        print("\n📋 Résumé du template créé:")
        print(f"  Phases: {len(template['phases'])}")
        for phase_id, phase_data in template['phases'].items():
            choices_count = len(phase_data.get('choices', {}))
            print(f"    {phase_id}: {choices_count} choix")
        
        print(f"  Personnages: {len(template['characters']['experts'])} experts")
        for char_id, char_data in template['characters']['experts'].items():
            print(f"    {char_id}: {char_data['name']} - {char_data['role']}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print("💡 Assurez-vous que pytesseract est installé:")
        print("   pip install pytesseract")
        print("   Et que Tesseract OCR est installé sur votre système")

if __name__ == "__main__":
    main()
