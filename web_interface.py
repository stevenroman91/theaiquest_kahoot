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
    
    # Define feasibility and impact for each choice
    choice_metadata = {
        'hr_automation': {'feasibility': 'High', 'impact': 'High'},
        'virtual_hr_assistant': {'feasibility': 'High', 'impact': 'Medium'},
        'sentiment_analysis': {'feasibility': 'High', 'impact': 'High'},
        'intelligent_recruitment': {'feasibility': 'High', 'impact': 'High'},
        'predictive_analytics': {'feasibility': 'Medium', 'impact': 'High'}
    }
    
    return jsonify({
        'success': True,
        'choices': [
            {
                'id': choice.id,
                'title': choice.title,
                'description': choice.description,
                'feasibility': choice_metadata.get(choice.id, {}).get('feasibility', 'High'),
                'impact': choice_metadata.get(choice.id, {}).get('impact', 'High')
            }
            for choice in choices
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

if __name__ == '__main__':
    import os
    # Configuration pour Railway
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
