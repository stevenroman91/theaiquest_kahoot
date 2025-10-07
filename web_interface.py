#!/usr/bin/env python3
"""
Interface Web pour le jeu AI Acceleration EXEC
Utilise Flask pour créer une interface simple
"""

from flask import Flask, render_template, request, jsonify, session
import json
import pickle
import base64
import logging
from datetime import datetime
from ai_acceleration_game import AIAccelerationGame, GameState
from user_manager import user_manager

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'ai_acceleration_secret_key_2024'

# Instance globale du jeu (retour à la version simple qui fonctionnait)
game_instance = None

def get_game():
    """Récupère ou crée l'instance du jeu"""
    global game_instance
    if game_instance is None:
        game_instance = AIAccelerationGame()
    return game_instance

@app.route('/')
def index():
    """Page d'accueil"""
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    """API pour l'authentification réelle avec utilisateurs et mots de passe"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données de connexion manquantes'
            }), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        game = get_game()
        success, message, user_info = game.login(username, password)
        
        if success:
            session['logged_in'] = True
            session['user_id'] = user_info['id']
            session['username'] = user_info['username']
            session['user_role'] = user_info['role']
            session['login_time'] = datetime.now().isoformat()
            
            return jsonify({
                'success': True,
                'message': message,
                'user_info': user_info,
                'game_state': game.get_current_state().value
            })
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 401
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erreur interne du serveur'
        }), 500

@app.route('/api/register', methods=['POST'])
def api_register():
    """API pour créer un nouvel utilisateur"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données d\'inscription manquantes'
            }), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'user')
        
        # Validation des données
        if len(username) < 2:
            return jsonify({
                'success': False,
                'message': 'Le nom d\'utilisateur doit contenir au moins 2 caractères'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Le mot de passe doit contenir au moins 6 caractères'
            }), 400
        
        if '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Adresse email invalide'
            }), 400
        
        # Vérifier si l'utilisateur existe déjà
        if user_manager.get_user_by_username(username):
            return jsonify({
                'success': False,
                'message': f'Le nom d\'utilisateur "{username}" existe déjà. Veuillez en choisir un autre.'
            }), 400
        
        if user_manager.get_user_by_email(email):
            return jsonify({
                'success': False,
                'message': f'L\'adresse email "{email}" est déjà utilisée. Veuillez en choisir une autre.'
            }), 400
        
        # Créer l'utilisateur
        success = user_manager.create_user(username, email, password, role)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Utilisateur {username} créé avec succès'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la création de l\'utilisateur'
            }), 400
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erreur interne du serveur'
        }), 500

@app.route('/api/change_password', methods=['POST'])
def api_change_password():
    """API pour changer le mot de passe"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Non connecté'}), 401
    
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données manquantes'
            }), 400
        
        username = session.get('username')
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if len(new_password) < 6:
            return jsonify({
                'success': False,
                'message': 'Le nouveau mot de passe doit contenir au moins 6 caractères'
            }), 400
        
        success = user_manager.change_password(username, old_password, new_password)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Mot de passe changé avec succès'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Ancien mot de passe incorrect'
            }), 400
            
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erreur interne du serveur'
        }), 500

@app.route('/api/logout', methods=['POST'])
def api_logout():
    """API pour se déconnecter"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Déconnexion réussie'
    })

@app.route('/api/start_game', methods=['POST'])
def api_start_game():
    """API pour démarrer le jeu"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    intro = game.start_game()
    
    return jsonify({
        'success': True,
        'message': intro,
        'game_state': game.get_current_state().value
    })

@app.route('/api/phase1/choices')
def api_phase1_choices():
    """API pour récupérer les choix Phase1"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    choices = game.get_mot1_choices()
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description,
                'category': choice.category
            }
            for choice in choices
        ]
    })

@app.route('/api/phase1/choose', methods=['POST'])
def api_phase1_choose():
    """API pour faire un choix Phase1"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    character_id = data.get('character_id', '')
    
    game = get_game()
    success = game.make_mot1_choice(character_id)
    
    if success:
        score_info = game.get_current_score()
        return jsonify({
            'success': True,
            'message': f'Choice made: {character_id}',
            'game_state': game.get_current_state().value,
            'score': score_info
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choice'
        })

@app.route('/api/phase2/choices')
def api_phase2_choices():
    """API pour récupérer les choix Phase2"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    choices = game.get_mot2_choices()
    
    # Ne prendre que les 5 premières solutions (positions 1-5 dans la matrice)
    available_choices = choices[:5]
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description
            }
            for choice in available_choices
        ]
    })

@app.route('/api/phase2/choose', methods=['POST'])
def api_phase2_choose():
    """API pour faire des choix Phase2"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    solution_ids = data.get('solution_ids', [])
    
    game = get_game()
    success = game.make_mot2_choices(solution_ids)
    
    if success:
        score_info = game.get_current_score()
        return jsonify({
            'success': True,
            'message': f'Choices made: {solution_ids}',
            'game_state': game.get_current_state().value,
            'score': score_info
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choices (must select exactly 3 solutions)'
        })

@app.route('/api/phase3/choices')
def api_phase3_choices():
    """API pour récupérer les choix Phase3"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    
    # Vérifier que Phase2 est terminé
    if not game.current_path.mot2_choices or len(game.current_path.mot2_choices) != 3:
        return jsonify({'success': False, 'message': 'Phase2 must be completed first'})
    
    choices_by_category = game.get_mot3_choices()
    
    result = {}
    for category, choices_dict in choices_by_category.items():
        result[category] = [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description
            }
            for choice in choices_dict.values()
        ]
    
    return jsonify({
        'success': True,
        'choices': result
    })

@app.route('/api/phase3/choose', methods=['POST'])
def api_phase3_choose():
    """API pour faire des choix Phase3"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.get_json()
    choices = data.get('choices', {})
    
    game = get_game()
    
    # Vérifier que Phase2 est terminé
    if not game.current_path.mot2_choices or len(game.current_path.mot2_choices) != 3:
        return jsonify({'success': False, 'message': 'Phase2 must be completed first'})
    
    if game.make_mot3_choices(choices):
        score_info = game.get_current_score()
        return jsonify({
            'success': True,
            'message': f'Choices made: {choices}',
            'game_state': game.get_current_state().value,
            'score': score_info
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choices'
        })

@app.route('/api/mot3/choices')
def api_mot3_choices():
    """API pour récupérer les choix MOT3"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    
    # Vérifier que MOT2 est terminé
    if not game.current_path.mot2_choices or len(game.current_path.mot2_choices) != 3:
        return jsonify({'success': False, 'message': 'MOT2 must be completed first'})
    
    choices_by_category = game.get_mot3_choices()
    
    result = {}
    for category, choices in choices_by_category.items():
        result[category] = [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description
            }
            for choice in choices.values()
        ]
    
    return jsonify({
        'success': True,
        'choices': result
    })

@app.route('/api/mot3/choose', methods=['POST'])
def api_mot3_choose():
    """API pour faire des choix MOT3"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    choices = data.get('choices', {})
    
    game = get_game()
    success = game.make_mot3_choices(choices)
    
    if success:
        score_info = game.get_current_score()
        return jsonify({
            'success': True,
            'message': f'Choices made: {choices}',
            'game_state': game.get_current_state().value,
            'score': score_info
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choices (must select 1 from each category)'
        })

@app.route('/api/phase4/choices')
def api_phase4_choices():
    """API pour récupérer les choix Phase4"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    choices = game.get_mot4_choices()
    
    # Define category for each choice
    choice_categories = {
        'apis_internal_vendor': 'platform_partnerships',
        'tech_stack_pipelines': 'platform_partnerships',
        'internal_mobility': 'people_processes',
        'responsible_ai_lead': 'policies_practices',
        'risk_mitigation': 'policies_practices',
        'data_collection_strategy': 'platform_partnerships',
        'business_sponsors': 'people_processes',
        'ceo_video_series': 'people_processes',
        'change_management': 'people_processes'
    }
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description,
                'cost': choice.cost,
                'category': choice_categories.get(choice.id, 'people_processes')
            }
            for choice in choices
        ]
    })

@app.route('/api/phase4/choose', methods=['POST'])
def api_phase4_choose():
    """API pour faire des choix Phase4"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    enabler_ids = data.get('enabler_ids', [])
    
    game = get_game()
    success = game.make_mot4_choices(enabler_ids)
    
    if success:
        score_info = game.get_current_score()
        return jsonify({
            'success': True,
            'message': f'Choices made: {enabler_ids}',
            'game_state': game.get_current_state().value,
            'score': score_info
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choices (must total exactly 30 points)'
        })

@app.route('/api/phase5/choices')
def api_phase5_choices():
    """API pour récupérer les choix Phase5"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    choices = game.get_mot5_choices()
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description
            }
            for choice in choices
        ]
    })

@app.route('/api/phase5/choose', methods=['POST'])
def api_phase5_choose():
    """API pour faire un choix Phase5"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    choice_id = data.get('choice_id', '')
    
    game = get_game()
    success = game.make_mot5_choice(choice_id)
    
    if success:
        results = game.get_results()
        game.save_path()
        
        return jsonify({
            'success': True,
            'message': f'Choice made: {choice_id}',
            'game_state': game.get_current_state().value,
            'results': {
                'score': results['score'],
                'stars': results['stars'],
                'path': results['path'].__dict__,
                'scores': results['scores'],
                'total': results['total']
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid choice'
        })

@app.route('/api/current_score')
def api_current_score():
    """API pour récupérer les scores actuels"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    score_info = game.get_current_score()
    
    return jsonify({
        'success': True,
        'score': score_info
    })

@app.route('/api/game_state')
def api_game_state():
    """API pour récupérer l'état actuel du jeu"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    return jsonify({
        'success': True,
        'game_state': game.get_current_state().value,
        'current_path': game.current_path.__dict__
    })

@app.route('/api/statistics')
def api_statistics():
    """API pour récupérer les statistiques"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    stats = game.get_statistics()
    
    return jsonify({
        'success': True,
        'statistics': stats
    })

@app.route('/api/executive_dashboard')
def api_executive_dashboard():
    """API pour récupérer les données de l'executive dashboard"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    current_score = game.get_current_score()
    
    # Calculer les ENABLERS débloqués par catégorie
    unlocked_enablers_by_category = game.current_path.unlocked_enablers_by_category
    
    enabler_descriptions = {
        "strategic_planning": "Planification stratégique avancée",
        "leadership_alignment": "Alignement du leadership",
        "structured_vision": "Vision structurée",
        "tech_foundations": "Fondations techniques solides",
        "platform_integration": "Intégration de plateforme",
        "technical_support": "Support technique",
        "rapid_deployment": "Déploiement rapide",
        "bottom_up_innovation": "Innovation bottom-up",
        "cost_efficiency": "Efficacité des coûts",
        "candidate_matching": "Correspondance candidats-posts",
        "cv_analysis": "Analyse de CV",
        "performance_prediction": "Prédiction de performance",
        "employee_support": "Support employés",
        "24_7_assistance": "Assistance 24/7",
        "chatbot_intelligence": "Intelligence chatbot",
        "personalized_training": "Formation personnalisée",
        "need_prediction": "Prédiction des besoins",
        "skill_development": "Développement des compétences",
        "sentiment_detection": "Détection de sentiment",
        "employee_satisfaction": "Satisfaction employés",
        "text_analysis": "Analyse de texte",
        "process_automation": "Automatisation des processus",
        "efficiency_gains": "Gains d'efficacité",
        "repetitive_task_reduction": "Réduction des tâches répétitives",
        # Phase 3 ENABLERS
        "hr_ai_competencies": "Compétences RH en IA",
        "team_upskilling": "Montée en compétences équipe",
        "knowledge_transfer": "Transfert de connaissances",
        "role_evolution": "Évolution des rôles",
        "job_design": "Conception des postes",
        "competency_mapping": "Cartographie des compétences",
        "change_communication": "Communication du changement",
        "cultural_transformation": "Transformation culturelle",
        "employee_engagement": "Engagement des employés",
        "system_connectivity": "Connectivité des systèmes",
        "data_integration": "Intégration des données",
        "workflow_seamlessness": "Fluidité des processus",
        "vendor_relationships": "Relations fournisseurs",
        "technical_expertise": "Expertise technique",
        "innovation_access": "Accès à l'innovation",
        "cloud_migration": "Migration cloud",
        "scalability": "Évolutivité",
        "infrastructure_flexibility": "Flexibilité infrastructure",
        "ethical_framework": "Cadre éthique",
        "ai_governance": "Gouvernance IA",
        "responsible_ai": "IA responsable",
        "data_protection": "Protection des données",
        "compliance_framework": "Cadre de conformité",
        "privacy_management": "Gestion de la confidentialité",
        "kpi_definition": "Définition des KPI",
        "impact_measurement": "Mesure d'impact",
        "performance_tracking": "Suivi de performance",
        # Phase 4 ENABLERS
        "api_connectivity": "Connectivité API",
        "system_interoperability": "Interopérabilité des systèmes",
        "data_flow_optimization": "Optimisation des flux de données",
        "data_pipeline_automation": "Automatisation des pipelines de données",
        "industrialization": "Industrialisation",
        "scalable_infrastructure": "Infrastructure évolutive",
        "ethics_oversight": "Surveillance éthique",
        "governance_structure": "Structure de gouvernance",
        "responsible_leadership": "Leadership responsable",
        "risk_management": "Gestion des risques",
        "compliance_readiness": "Préparation à la conformité",
        "geographic_adaptation": "Adaptation géographique",
        "talent_retention": "Rétention des talents",
        "skill_mobility": "Mobilité des compétences",
        "internal_development": "Développement interne",
        "data_strategy": "Stratégie de données",
        "synthetic_data_generation": "Génération de données synthétiques",
        "data_quality": "Qualité des données",
        "leadership_communication": "Communication de leadership",
        "change_narrative": "Narrative du changement",
        "executive_sponsorship": "Sponsorisation exécutive",
        "change_adoption": "Adoption du changement",
        "user_engagement": "Engagement utilisateur",
        "transformation_support": "Support à la transformation",
        "business_alignment": "Alignement métier",
        "value_delivery": "Livraison de valeur",
        "stakeholder_engagement": "Engagement des parties prenantes",
        # Phase 5 ENABLERS
        "organization_wide_ai": "IA organisationnelle",
        "corporate_communication": "Communication d'entreprise",
        "ethics_policies": "Politiques éthiques",
        "long_term_roadmap": "Feuille de route long terme",
        "value_based_governance": "Gouvernance basée sur les valeurs",
        "supplier_panel": "Panel de fournisseurs",
        "training_academy": "Académie de formation",
        "structured_approach": "Approche structurée",
        "genai_hub": "Hub GenAI",
        "talent_recruitment": "Recrutement de talents",
        "analytics_expertise": "Expertise analytique",
        "continuous_training": "Formation continue",
        "people_focus": "Focus sur les personnes"
    }
    
    # Formater les ENABLERS par catégorie
    formatted_enablers_by_category = {}
    category_titles = {
        "platform_partnerships": "Platform & Partnerships",
        "policies_practices": "Policies & Practices", 
        "people_processes": "People & Processes"
    }
    
    for category, enablers in unlocked_enablers_by_category.items():
        formatted_enablers_by_category[category] = {
            "title": category_titles[category],
            "enablers": []
        }
        
        for enabler in enablers:
            formatted_enablers_by_category[category]["enablers"].append({
                "id": enabler,
                "title": enabler.replace("_", " ").title(),
                "description": enabler_descriptions.get(enabler, f"Capacité {enabler.replace('_', ' ')}")
            })
    
    # Garder aussi la liste globale pour compatibilité
    all_enablers = []
    for category_data in formatted_enablers_by_category.values():
        all_enablers.extend(category_data["enablers"])
    formatted_enablers = all_enablers
    
    # Générer un message d'impact pédagogique
    impact_message = generate_impact_message(current_score, formatted_enablers)
    
    return jsonify({
        'success': True,
        'dashboard_data': {
            'current_score': current_score,
            'unlocked_enablers': formatted_enablers,
            'unlocked_enablers_by_category': formatted_enablers_by_category,
            'impact_message': impact_message,
            'phase_title': get_current_phase_title(game.current_state)
        }
    })

def generate_impact_message(score_data, enablers):
    """Génère un message d'impact pédagogique basé sur le score et les enablers"""
    total_score = score_data.get('total', 0)
    max_possible = score_data.get('max_possible', 15)
    
    if total_score >= 12:
        return f"Excellent travail ! Avec un score de {total_score}/{max_possible}, vous avez débloqué {len(enablers)} capacités stratégiques RH. Vos décisions créent une transformation AI solide et durable pour votre équipe."
    elif total_score >= 8:
        return f"Bon parcours ! Votre score de {total_score}/{max_possible} vous donne accès à {len(enablers)} possibilités d'action RH. Continuez à optimiser vos choix pour maximiser l'impact sur vos équipes."
    else:
        return f"Avec un score de {total_score}/{max_possible}, vous avez {len(enablers)} capacités RH disponibles. Analysez vos choix pour améliorer votre stratégie AI RH."

def get_current_phase_title(game_state):
    """Retourne le titre de la phase actuelle"""
    phase_titles = {
        "mot1_hr_approach_selection": "Choix de l'Approche RH",
        "phase2_hr_portfolio_selection": "Sélection Portfolio RH",
        "mot3_hr_facilitator_selection": "Sélection Facilitateurs RH",
        "mot4_hr_scaling_selection": "Sélection Scaling RH",
        "mot5_hr_deployment_selection": "Choix Déploiement RH",
        "results": "Résultats Finaux"
    }
    return phase_titles.get(game_state.value, "Phase en cours")

if __name__ == '__main__':
    import os
    # Configuration pour Railway
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
