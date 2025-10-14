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
from template_engine_complete import get_template, GameTemplateEngine

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
    template = get_template()
    return render_template('index.html', 
                         game_title=template.get_game_title(),
                         company_name=template.get_company_name(),
                         teams_meeting_text=template.get_teams_meeting_text(),
                         teams_meeting_button_text=template.get_teams_meeting_button_text(),
                         template=template)

@app.route('/api/game_config')
def api_game_config():
    """API pour obtenir la configuration du jeu depuis le template"""
    try:
        template = get_template()
        
        config = {
            "game_info": {
                "company_name": template.get_company_name(),
                "game_title": template.get_game_title(),
                "game_subtitle": template.get_game_subtitle()
            },
            "terminology": {
                "phase": template.get_terminology("phase"),
                "enabler": template.get_terminology("enabler"),
                "choice": template.get_terminology("choice")
            },
            "characters": {
                "protagonist": {
                    "name": template.get_character_name("protagonist"),
                    "role": template.get_character_role("protagonist")
                },
                "elena": {
                    "name": template.get_character_name("elena"),
                    "role": template.get_character_role("elena")
                },
                "james": {
                    "name": template.get_character_name("james"),
                    "role": template.get_character_role("james")
                },
                "amira": {
                    "name": template.get_character_name("amira"),
                    "role": template.get_character_role("amira")
                }
            },
            "phases": {
                "phase1": {
                    "title": template.get_phase_title("phase1"),
                    "description": template.get_phase_description("phase1")
                },
                "phase2": {
                    "title": template.get_phase_title("phase2"),
                    "description": template.get_phase_description("phase2")
                },
                "phase3": {
                    "title": template.get_phase_title("phase3"),
                    "description": template.get_phase_description("phase3")
                },
                "phase4": {
                    "title": template.get_phase_title("phase4"),
                    "description": "You now have a better idea of what needs to be done to scale AI solutions. It's time to make a decision.\nSelect the most impactful and timely enablers within your 30-point budget that will allow you to successfully scale your AI solutions to continue accelerating value delivery. Don't forget you need to balance between different categories."
                },
                "phase5": {
                    "title": template.get_phase_title("phase5"),
                    "description": "It's time to launch and scale more solutions at the enterprise level. Let's decide what actions to take!\nSelect the option that will maximize your chances of bringing the most new scaled solutions to market. Consider what you need most at this stage of transformation to scale effectively."
                }
            },
            "ui_text": {
                "welcome_message": template.get_welcome_message(),
                "teams_meeting": {
                    "text": template.get_teams_meeting_text(),
                    "button_text": template.get_teams_meeting_button_text()
                },
                "dashboard": {
                    "title": template.get_dashboard_title(),
                    "subtitle": template.get_dashboard_subtitle()
                }
            },
            "theme_colors": template.get_theme_colors()
        }
        
        # Ajouter les enablers pour les tooltips
        enablers = template.get_all_enablers()
        
        return jsonify({
            "success": True,
            "config": config,
            "enablers": enablers
        })
        
    except Exception as e:
        logger.error(f"Error getting game config: {e}")
        return jsonify({
            "success": False,
            "message": f"Error loading game configuration: {str(e)}"
        }), 500

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
    
    # Get welcome message from template
    template = get_template()
    welcome_message = template.get_welcome_message()
    
    return jsonify({
        'success': True,
        'message': welcome_message,
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
    
    # Debug logs
    print(f"DEBUG Phase 3 API: mot2_choices = {game.current_path.mot2_choices}")
    print(f"DEBUG Phase 3 API: len(mot2_choices) = {len(game.current_path.mot2_choices) if game.current_path.mot2_choices else 0}")
    
    # Vérifier que Phase2 est terminé
    if not game.current_path.mot2_choices or len(game.current_path.mot2_choices) != 3:
        return jsonify({'success': False, 'message': f'Phase2 must be completed first. Current choices: {game.current_path.mot2_choices}, count: {len(game.current_path.mot2_choices) if game.current_path.mot2_choices else 0}'})
    
    choices_by_category = game.get_mot3_choices()
    
    result = {}
    for category, choices_list in choices_by_category.items():
        print(f"DEBUG Phase 3 API: category = {category}, choices_list type = {type(choices_list)}")
        if isinstance(choices_list, list):
            result[category] = [
                {
                    'id': choice.id,
                    'title': choice.title,
                    'description': choice.description
                }
                for choice in choices_list
            ]
        else:
            print(f"DEBUG Phase 3 API: choices_list is not a list, skipping category {category}")
            result[category] = []
    
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
    
    # Define category for each choice (corrected IDs and categories)
    choice_categories = {
        'apis_hr_systems': 'platform_partnerships',
        'tech_stack_data_pipelines': 'platform_partnerships',
        'ai_ethics_officer': 'policies_practices',
        'risk_mitigation_plan': 'policies_practices',
        'internal_mobility': 'people_processes',
        'data_collection_strategy': 'platform_partnerships',
        'ceo_video_series': 'policies_practices',
        'change_management': 'people_processes',
        'business_sponsors': 'people_processes'
    }
    
    # Define enabler mapping for each choice
    choice_enablers = {
        'apis_hr_systems': 'api_connectivity',
        'tech_stack_data_pipelines': 'data_pipeline_automation',
        'ai_ethics_officer': 'ethics_oversight',
        'risk_mitigation_plan': 'risk_management',
        'internal_mobility': 'talent_retention',
        'data_collection_strategy': 'data_strategy',
        'ceo_video_series': 'leadership_communication',
        'change_management': 'change_adoption',
        'business_sponsors': 'business_alignment'
    }
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description,
                'cost': choice.cost,
                'category': choice_categories.get(choice.id, 'people_processes'),
                'enabler_id': choice_enablers.get(choice.id, 'unknown')
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
            'message': 'Invalid choices (budget exceeded 30 points)'
        })

@app.route('/api/phase5/choices')
def api_phase5_choices():
    """API pour récupérer les choix Phase5"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    choices = game.get_mot5_choices()
    template = GameTemplateEngine()
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description,
                'icon': template.get_choice_icon('phase5', choice.id)
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
            'score_data': {
                'total': results['total'],
                'scores': results['scores'],
                'stars': results['stars']
            },
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
    print("=" * 50)
    print("DEBUG EXECUTIVE DASHBOARD: Function called")
    print("=" * 50)
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    game = get_game()
    current_score = game.get_current_score()
    print(f"DEBUG EXECUTIVE DASHBOARD: Game loaded, current_score = {current_score}")
    
    # Calculer les ENABLERS débloqués par catégorie
    unlocked_enablers_by_category = game.current_path.unlocked_enablers_by_category
    
    # Récupérer les ENABLERS par phase
    enablers_by_phase = game.current_path.enablers_by_phase
    
    # Obtenir tous les ENABLERS possibles par phase et par catégorie pour l'affichage pédagogique
    all_enablers_by_phase_and_category = game.get_all_enablers_by_phase_and_category()
    
    # S'assurer que les ENABLERS sont calculés
    game._calculate_enablers()
    
    # Récupérer les ENABLERS par phase après calcul
    enablers_by_phase = game.current_path.enablers_by_phase
    
    # Utiliser le template pour tous les enablers
    template = get_template()
    
    # Générer automatiquement les titres et descriptions depuis le template
    enabler_titles = {}
    enabler_descriptions = {}
    enabler_icons = {}
    
    all_enablers = template.get_all_enablers()
    for enabler_id, enabler_data in all_enablers.items():
        enabler_titles[enabler_id] = enabler_data.get("title", enabler_id.replace("_", " ").title())
        enabler_descriptions[enabler_id] = enabler_data.get("description", f"Capability: {enabler_id}")
        enabler_icons[enabler_id] = enabler_data.get("icon", "fas fa-cog")
    
    # Formater les ENABLERS par catégorie
    formatted_enablers_by_category = {}
    category_titles = {
        "technology_partnerships": "Technology & Partnerships",
        "transformation_change": "Transformation & Change",
        "policies_governance": "Policies & Governance"
    }
    
    for category, enablers in unlocked_enablers_by_category.items():
        if category in category_titles:  # Ne garder que les 3 catégories spécifiées
            formatted_enablers_by_category[category] = {
                "title": category_titles[category],
                "enablers": []
            }
            
            for enabler in enablers:
                formatted_enablers_by_category[category]["enablers"].append({
                    "id": enabler,
                    "title": enabler_titles.get(enabler, enabler.replace("_", " ").title()),
                    "description": enabler_descriptions.get(enabler, f"Capacité {enabler.replace('_', ' ')}"),
                    "icon": enabler_icons.get(enabler, "fas fa-cog")
                })
    
    # Garder aussi la liste globale pour compatibilité
    all_enablers = []
    for category_data in formatted_enablers_by_category.values():
        all_enablers.extend(category_data["enablers"])
    formatted_enablers = all_enablers
    
    # Générer un message d'impact pédagogique
    impact_message = generate_impact_message(current_score, formatted_enablers)
    
    # Récupérer TOUS les enablers disponibles par phase depuis le template
    template = get_template()
    all_available_enablers_by_phase = {}
    
    # Pour chaque phase, récupérer tous les enablers disponibles
    for phase_id in ['phase1', 'phase2', 'phase3', 'phase4', 'phase5']:
        all_available_enablers_by_phase[phase_id] = []
        phase_choices = template.get_phase_choices(phase_id)
        print(f"DEBUG web_interface: phase_id={phase_id}, phase_choices={list(phase_choices.keys())}")
        if phase_id == 'phase4':
            print(f"DEBUG web_interface: phase4 phase_choices type={type(phase_choices)}, len={len(phase_choices) if phase_choices else 'None'}")
        
        for choice_id, choice_data in phase_choices.items():
            # Récupérer les enablers de ce choix
            choice_enablers = template.get_choice_enablers(phase_id, choice_id)
            print(f"DEBUG web_interface: phase_id={phase_id}, choice_id={choice_id}, choice_enablers={choice_enablers}")
            if choice_enablers:
                print(f"DEBUG web_interface: Adding {choice_enablers} to phase {phase_id}")
                all_available_enablers_by_phase[phase_id].extend(choice_enablers)
                print(f"DEBUG web_interface: phase {phase_id} now has {all_available_enablers_by_phase[phase_id]}")
            else:
                print(f"DEBUG web_interface: No enablers for phase_id={phase_id}, choice_id={choice_id}")
    
    # Organiser par catégorie
    all_available_enablers_by_phase_and_category = {}
    for phase, enablers in all_available_enablers_by_phase.items():
        all_available_enablers_by_phase_and_category[phase] = {}
        for category in category_titles.keys():
            all_available_enablers_by_phase_and_category[phase][category] = []
        
        for enabler in enablers:
            # Déterminer la catégorie de cet enabler
            # Pour les enablers du Step 4, utiliser le mapping direct car les IDs des choix et enablers sont identiques
            if phase == 'phase4':
                # Mapping direct pour les enablers du Step 4
                enabler_to_category = {
                    'reusable_api_patterns': 'technology_partnerships',
                    'industrial_data_pipelines': 'technology_partnerships', 
                    'privacy_by_design_data': 'technology_partnerships',
                    'talent_mobility_program': 'transformation_change',
                    'business_ai_champions': 'transformation_change',
                    'ai_storytelling_communication': 'transformation_change',
                    'adoption_playbook': 'transformation_change',
                    'clear_ownership_accountability': 'policies_governance',
                    'local_ai_risk_management': 'policies_governance'
                }
                enabler_category = enabler_to_category.get(enabler, 'transformation_change')
            else:
                enabler_category = template.get_enabler_category(enabler)
            
            if enabler_category in category_titles:
                all_available_enablers_by_phase_and_category[phase][enabler_category].append(enabler)
                if phase == 'phase4':
                    print(f"DEBUG web_interface: Added enabler '{enabler}' to category '{enabler_category}' for phase4")
            else:
                if phase == 'phase4':
                    print(f"DEBUG web_interface: Category '{enabler_category}' not found for enabler '{enabler}' in phase4")
    
    # Formater les données pédagogiques par phase et catégorie (exclure Step 2 qui n'a pas d'enablers)
    pedagogical_data = {}
    print(f"DEBUG web_interface: all_available_enablers_by_phase_and_category keys: {list(all_available_enablers_by_phase_and_category.keys())}")
    for phase, phase_data in all_available_enablers_by_phase_and_category.items():
        print(f"DEBUG web_interface: Processing phase {phase}, phase_data keys: {list(phase_data.keys())}")
        # Exclure phase2 car elle n'a pas d'enablers, seulement des Use Cases
        if phase == 'phase2':
            print(f"DEBUG web_interface: Skipping phase2")
            continue
            
        pedagogical_data[phase] = {}
        for category, enablers in phase_data.items():
            if category in category_titles:  # Ne garder que les 3 catégories spécifiées
                pedagogical_data[phase][category] = {
                    "title": category_titles[category],
                    "enablers": []
                }
                
                # Déterminer quels ENABLERS sont débloqués dans cette phase
                unlocked_in_phase = enablers_by_phase.get(phase, [])
                
                for enabler in enablers:
                    is_unlocked = enabler in unlocked_in_phase
                    pedagogical_data[phase][category]["enablers"].append({
                        "id": enabler,
                        "title": enabler_titles.get(enabler, enabler.replace("_", " ").title()),
                        "description": enabler_descriptions.get(enabler, f"Capacité {enabler.replace('_', ' ')}"),
                        "icon": enabler_icons.get(enabler, "fas fa-cog"),
                        "unlocked": is_unlocked
                    })
    
    # Calculer les Use Cases activés
    print("DEBUG EXECUTIVE DASHBOARD: Starting Use Cases calculation")
    use_cases_data = {}
    use_cases_by_phase = game.current_path.enablers_by_phase
    
    print(f"DEBUG EXECUTIVE DASHBOARD: mot1_choice = {game.current_path.mot1_choice}")
    print(f"DEBUG EXECUTIVE DASHBOARD: mot2_choices = {game.current_path.mot2_choices}")
    print(f"DEBUG EXECUTIVE DASHBOARD: mot2_choices type = {type(game.current_path.mot2_choices)}")
    print(f"DEBUG EXECUTIVE DASHBOARD: mot2_choices length = {len(game.current_path.mot2_choices) if game.current_path.mot2_choices else 0}")
    
    # Déterminer quel step afficher selon l'état du jeu
    current_step = 1
    if game.current_path.mot2_choices and len(game.current_path.mot2_choices) > 0:
        current_step = 2
    elif game.current_path.mot3_choices and len(game.current_path.mot3_choices) > 0:
        current_step = 3
    elif game.current_path.mot4_choices and len(game.current_path.mot4_choices) > 0:
        current_step = 4
    elif game.current_path.mot5_choice:
        current_step = 5
    
    print(f"DEBUG EXECUTIVE DASHBOARD: current_step = {current_step}")
    
    # Use Cases pour Step 1 (Amira) - afficher si Amira a été choisie, quel que soit le step actuel
    if game.current_path.mot1_choice == 'amira':
        amira_use_cases = template.get_choice_use_cases('phase1', 'amira')
        use_cases_data['phase1'] = {
            'title': 'Step 1 Use Cases',
            'use_cases': []
        }
        
        for use_case_id in amira_use_cases:
            use_case_title = template.get_use_case_title(use_case_id)
            use_case_description = template.get_use_case_description(use_case_id)
            use_case_icon = template.get_use_case_icon(use_case_id)
            
            # Automated Banners Generation est activé, les autres sont désactivés
            is_unlocked = use_case_id == 'automated_banners_generation'
            
            use_cases_data['phase1']['use_cases'].append({
                'id': use_case_id,
                'title': use_case_title,
                'description': use_case_description,
                'icon': use_case_icon,
                'unlocked': is_unlocked
            })
    
    # Use Cases pour Step 2 - afficher si Step 2 est complété (peu importe current_step)
    print(f"DEBUG EXECUTIVE DASHBOARD: About to check Step 2, mot2_choices = {game.current_path.mot2_choices}")
    if game.current_path.mot2_choices and len(game.current_path.mot2_choices) > 0:
        print(f"DEBUG EXECUTIVE DASHBOARD: Creating Step 2 Use Cases, mot2_choices = {game.current_path.mot2_choices}")
        use_cases_data['phase2'] = {
            'title': 'Step 2 Use Cases',
            'use_cases': []
        }
        
        # Tous les Use Cases disponibles pour Step 2 avec descriptions spécifiques
        step2_use_cases_info = [
            {
                'id': 'fraud_integrity_detection',
                'title': 'Fraud & Integrity Detection',
                'description': 'Machine learning system that spots irregular in-game transactions and protects player trust.',
                'icon': 'fas fa-shield-alt'
            },
            {
                'id': 'ai_storyline_generator',
                'title': 'AI-Powered Storyline Generator',
                'description': 'Supports writers by creating adaptive narratives based on player choices.',
                'icon': 'fas fa-book-open'
            },
            {
                'id': 'smart_game_design_assistant',
                'title': 'Smart Game Design Assistant',
                'description': 'Generative AI that helps designers create concept art and levels faster while keeping our art style.',
                'icon': 'fas fa-palette'
            },
            {
                'id': 'player_journey_optimizer',
                'title': 'Player Journey Optimizer',
                'description': 'Predictive engine that analyzes player behavior and suggests personalized missions and rewards.',
                'icon': 'fas fa-route'
            },
            {
                'id': 'talent_analytics_dashboard',
                'title': 'Talent Analytics Dashboard',
                'description': 'Internal tool to track AI skills and training needs across teams.',
                'icon': 'fas fa-chart-bar'
            }
        ]
        
        for use_case_info in step2_use_cases_info:
            # Les Use Cases choisis sont activés
            is_unlocked = use_case_info['id'] in game.current_path.mot2_choices
            print(f"DEBUG: Use Case {use_case_info['id']} - is_unlocked = {is_unlocked}")
            
            # Pour Step 2, on affiche seulement les Use Cases choisis (verts)
            if is_unlocked:
                print(f"DEBUG: Adding Use Case {use_case_info['id']} to Step 2")
                use_cases_data['phase2']['use_cases'].append({
                    'id': use_case_info['id'],
                    'title': use_case_info['title'],
                    'description': use_case_info['description'],
                    'icon': use_case_info['icon'],
                    'unlocked': is_unlocked
                })
        
        print(f"DEBUG: Step 2 Use Cases count = {len(use_cases_data['phase2']['use_cases'])}")
    else:
        print(f"DEBUG: Not creating Step 2 Use Cases, current_step = {current_step}")

    return jsonify({
        'success': True,
        'dashboard_data': {
            'current_score': current_score,
            'unlocked_enablers': formatted_enablers,
            'unlocked_enablers_by_category': formatted_enablers_by_category,
            'pedagogical_data': pedagogical_data,
            'use_cases_data': use_cases_data,
            'impact_message': impact_message,
            'phase_title': get_current_phase_title(game.current_state)
        }
    })

def get_personalized_step_message(mot_key, choice, score):
    """Génère un message personnalisé selon le choix et le score pour chaque étape"""
    if mot_key == 'mot1':
        if choice == 'elena' and score == 3:
            return "By choosing Elena's approach, you earned 3 stars out of 3. This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap that inspires creativity, empowers teams, and delivers measurable business impact."
        elif choice == 'james' and score == 2:
            return "By choosing James's approach, you earned 2 stars out of 3. While this technology-first strategy builds solid foundations, it may miss opportunities for immediate value creation and team engagement that could accelerate your AI transformation."
        elif choice == 'amira' and score == 1:
            return "By choosing Amira's approach, you earned 1 star out of 3. While this rapid experimentation strategy enables quick learning, it lacks strategic alignment and foundational structure, potentially leading to fragmented AI initiatives and missed long-term opportunities."
    
    elif mot_key == 'mot2':
        if score == 3:
            return "By selecting the first three — Smart Game Design Assistant, Player Journey Optimizer, and Fraud & Integrity Detection — you earned 3 stars out of 3. You chose solutions that deliver immediate player impact while nurturing creativity and future-ready skills. PlayNext is now ready to move from vision to action."
        elif score == 2:
            return "You earned 2 stars out of 3 for your portfolio selection. While you've chosen some strong solutions, consider balancing immediate player impact with long-term strategic value. The optimal mix combines creative tools, player experience optimization, and security measures to build a comprehensive AI foundation."
        elif score == 1:
            return "You earned 1 star out of 3 for your portfolio selection. Your choices show potential, but may lack the strategic balance needed for sustainable growth. Consider selecting solutions that work together to create both immediate player value and long-term competitive advantage."
    
    elif mot_key == 'mot3':
        if score == 3:
            return "By choosing the AI Co-Creation Labs, AI & Data Foundations & AI Governance board you earned 3 stars out of 3. This choice focuses on people and collaboration — the most powerful accelerators of real adoption. Your teams now share ownership of the AI journey, turning experimentation into collective learning."
        elif score == 2:
            return "You earned 2 stars out of 3 for your enabler selection. While you've chosen solid foundations, you may have missed opportunities to fully engage your teams in the AI transformation. Consider balancing technical infrastructure with people-focused initiatives to accelerate adoption and build lasting change."
        elif score == 1:
            return "You earned 1 star out of 3 for your enabler selection. Your choices show some strategic thinking, but may lack the comprehensive approach needed for sustainable AI adoption. Focus on creating both technical foundations and human-centered change to ensure your AI initiatives succeed long-term."
    
    elif mot_key == 'mot4':
        if score == 3:
            return "By selecting Industrial Data Pipelines, Local AI Risk Management, Business AI Champions plus the Adoption Playbook you achieved the perfect balance — adoption, scalability, and trust. You earned 3 stars out of 3. PlayNext is now ready to move from pilot success to enterprise-wide impact."
        elif score == 2:
            return "You earned 2 stars out of 3 for your scaling enabler selection. While you've chosen solid foundations for scaling, you may have missed some key elements that ensure both technical robustness and organizational readiness. Consider balancing infrastructure investments with change management and governance to accelerate enterprise-wide adoption."
        elif score == 1:
            return "You earned 1 star out of 3 for your scaling enabler selection. Your choices show some strategic thinking, but may lack the comprehensive approach needed for successful enterprise-wide scaling. Focus on creating both technical foundations and human-centered change management to ensure your AI initiatives scale effectively across the organization."
    
    elif mot_key == 'mot5':
        if score == 3:
            return "By choosing 'Full speed on people', you earned 3 stars out of 3. This people-first approach creates a dedicated AI Hub, formalizes partnerships, and invests in recruiting top AI talents while growing internal expertise through the AI Academy. This comprehensive strategy ensures sustainable AI transformation through human capital development."
        elif score == 2:
            return "By choosing 'Continuous capability building', you earned 2 stars out of 3. This approach focuses on long-term governance and skill development, which provides solid foundations for AI transformation. However, it may miss opportunities for immediate impact and rapid scaling that could accelerate your AI journey."
        elif score == 1:
            return "By choosing 'AI for all', you earned 1 star out of 3. While this approach aims to democratize AI across the company, it may lack the strategic focus and foundational structure needed for sustainable transformation. Consider balancing broad access with targeted capability building and governance."
    
    # Messages génériques pour les autres phases
    return f"Congratulations! You earned {score} star{'s' if score > 1 else ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game."

def generate_impact_message(score_data, enablers):
    """Génère un message d'impact pédagogique basé sur le score et les enablers"""
    total_score = score_data.get('total', 0)
    max_possible = score_data.get('max_possible', 15)
    
    # Calculer les scores par étape dynamiquement
    mot_scores = {}
    if game_instance.current_path:
        # Calculer le score pour chaque phase complétée
        if game_instance.current_path.mot1_choice:
            mot_scores['mot1'] = game_instance.calculate_mot_score(1)
        if game_instance.current_path.mot2_choices:
            mot_scores['mot2'] = game_instance.calculate_mot_score(2)
        if game_instance.current_path.mot3_choices:
            mot_scores['mot3'] = game_instance.calculate_mot_score(3)
        if game_instance.current_path.mot4_choices:
            mot_scores['mot4'] = game_instance.calculate_mot_score(4)
        if game_instance.current_path.mot5_choice:
            mot_scores['mot5'] = game_instance.calculate_mot_score(5)
    
    # Analyser les résultats par étape avec messages personnalisés
    step_results = []
    step_names = {
        'mot1': 'Step 1 (Strategy)',
        'mot2': 'Step 2 (Portfolio)', 
        'mot3': 'Step 3 (Capabilities)',
        'mot4': 'Step 4 (Implementation)',
        'mot5': 'Step 5 (Scale-up)'
    }
    
    # Récupérer les choix faits pour chaque étape
    choices = {}
    if game_instance.current_path:
        if game_instance.current_path.mot1_choice:
            choices['mot1'] = game_instance.current_path.mot1_choice
        if game_instance.current_path.mot2_choices:
            choices['mot2'] = game_instance.current_path.mot2_choices
        if game_instance.current_path.mot3_choices:
            choices['mot3'] = game_instance.current_path.mot3_choices
        if game_instance.current_path.mot4_choices:
            choices['mot4'] = game_instance.current_path.mot4_choices
        if game_instance.current_path.mot5_choice:
            choices['mot5'] = game_instance.current_path.mot5_choice
    
    # Générer le message personnalisé pour la dernière étape complétée seulement
    last_completed_step = None
    last_score = 0
    
    # Trouver la dernière étape complétée
    for mot_key, step_name in step_names.items():
        score = mot_scores.get(mot_key, 0)
        if score > 0:
            last_completed_step = mot_key
            last_score = score
    
    # Générer le message pour la dernière étape seulement
    if last_completed_step:
        choice = choices.get(last_completed_step)
        # Pour Step 2, choice est une liste, on passe le score directement
        if last_completed_step == 'mot2':
            personalized_message = get_personalized_step_message(last_completed_step, None, last_score)
        else:
            personalized_message = get_personalized_step_message(last_completed_step, choice, last_score)
        return personalized_message
    else:
        return "Analysez vos choix pour améliorer votre stratégie AI."

def get_current_phase_title(game_state):
    """Retourne le titre de la phase actuelle"""
    template = get_template()
    phase_titles = {
        "mot1_hr_approach_selection": template.get_phase_title('phase1'),
        "phase2_hr_portfolio_selection": template.get_phase_title('phase2'),
        "mot3_hr_facilitator_selection": template.get_phase_title('phase3'),
        "mot4_hr_scaling_selection": template.get_phase_title('phase4'),
        "mot5_hr_deployment_selection": template.get_phase_title('phase5'),
        "results": "Résultats Finaux"
    }
    return phase_titles.get(game_state.value, "Phase en cours")

if __name__ == '__main__':
    import os
    # Configuration pour Railway
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
