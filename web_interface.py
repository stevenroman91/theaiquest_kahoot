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
import os
from datetime import datetime
from ai_acceleration_game import AIAccelerationGame, GameState
from user_manager import user_manager
from game_content_manager import content_manager as content

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ai_acceleration_secret_key_2024')

@app.before_request
def ensure_guest_session():
    """Create a guest session so the game is accessible without login."""
    global game_instance
    
    if not session.get('logged_in'):
        session['logged_in'] = True
        session['user_id'] = session.get('user_id', 'guest')
        session['username'] = session.get('username', 'guest')
        session['user_role'] = session.get('user_role', 'user')
    
    # Vérifier si c'est un refresh forcé (paramètre reset=1 dans l'URL)
    if request.args.get('reset') == '1':
        session.clear()  # Effacer complètement la session
        session['logged_in'] = True
        session['user_id'] = 'guest'
        session['username'] = 'guest'
        session['user_role'] = 'user'
        game_instance = None  # Reset le jeu global
        return
    
    # Créer un ID de session temporaire pour chaque refresh
    if not session.get('session_id'):
        import uuid
        session['session_id'] = str(uuid.uuid4())

# Instance globale du jeu
game_instance = None

def initialize_default_users():
    """Initialise les utilisateurs par défaut au démarrage"""
    try:
        logger.info("🔐 Initialisation des utilisateurs par défaut...")
        
        # Vérifier si les utilisateurs existent déjà
        admin_user = user_manager.get_user_by_username('admin')
        trainer_user = user_manager.get_user_by_username('trainer')
        
        users_created = 0
        
        if not admin_user:
            if user_manager.create_user('admin', 'admin@playnext.com', 'FDJ2024!Admin', 'admin'):
                logger.info("✅ Utilisateur 'admin' créé")
                users_created += 1
            else:
                logger.error("❌ Échec création utilisateur 'admin'")
        else:
            logger.info("ℹ️  Utilisateur 'admin' existe déjà")
        
        if not trainer_user:
            if user_manager.create_user('trainer', 'trainer@playnext.com', 'Trainer2024!', 'trainer'):
                logger.info("✅ Utilisateur 'trainer' créé")
                users_created += 1
            else:
                logger.error("❌ Échec création utilisateur 'trainer'")
        else:
            logger.info("ℹ️  Utilisateur 'trainer' existe déjà")
        
        if users_created > 0:
            logger.info(f"🎉 {users_created} utilisateur(s) créé(s) au démarrage")
        else:
            logger.info("ℹ️  Tous les utilisateurs existent déjà")
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation des utilisateurs: {e}")

def get_game():
    """Récupère ou crée l'instance du jeu"""
    global game_instance
    if game_instance is None:
        game_instance = AIAccelerationGame()
    return game_instance

@app.route('/')
def index():
    """Page d'accueil"""
    template = content
    # Récupérer le code de session depuis l'URL (si présent)
    session_code_from_url = request.args.get('session', '').strip().upper()
    # Vérifier si l'utilisateur est admin pour afficher le panneau admin
    is_admin = session.get('logged_in') and session.get('user_role') == 'admin'
    return render_template('index.html', 
                         game_title=template.get_game_title(),
                         company_name=template.get_company_name(),
                         teams_meeting_text=template.get_teams_meeting_text(),
                         teams_meeting_button_text=template.get_teams_meeting_button_text(),
                         template=template,
                         content=content,
                         session_code=session_code_from_url,
                         is_admin=is_admin)

@app.route('/api/game_config')
def api_game_config():
    """API pour obtenir la configuration du jeu depuis le template"""
    try:
        template = content
        
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
                    "description": "You now have a better idea of what needs to be done to scale AI solutions. It's time to make a decision.\nSelect the most impactful and timely enablers within your 30-point budget that will allow you to successfully scale your AI solutions to continue accelerating value delivery. Don't forget you need to balance between different pillars."
                },
                "phase5": {
                    "title": template.get_phase_title("phase5"),
                    "description": "It's time to launch and scale more solutions at the enterprise level. Let's decide what actions to take!\nSelect the option that will maximize your chances of bringing the most new fully-scaled solutions to market. Consider what you need most at this stage of the transformation to scale effectively."
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

@app.route('/api/admin/create_session', methods=['POST'])
def api_create_session():
    """API pour créer une nouvelle session de jeu (admin uniquement)"""
    try:
        # Vérifier que l'utilisateur est admin ou trainer
        user_role = session.get('user_role')
        if not session.get('logged_in') or (user_role != 'admin' and user_role != 'trainer'):
            return jsonify({
                'success': False,
                'message': 'Accès refusé. Admin requis.'
            }), 403
        
        username = session.get('username', 'admin')
        session_code = user_manager.create_game_session(username)
        
        if session_code:
            # Construire l'URL pour rejoindre la session
            base_url = request.url_root.rstrip('/')
            join_url = f"{base_url}/?session={session_code}"
            
            return jsonify({
                'success': True,
                'session_code': session_code,
                'join_url': join_url,
                'message': f'Session créée avec succès: {session_code}'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la création de la session'
            }), 500
            
    except Exception as e:
        logger.error(f"Erreur lors de la création de session: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@app.route('/api/validate_session', methods=['POST'])
def api_validate_session():
    """API pour valider un code de session"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'Code de session manquant'
            }), 400
        
        session_code = data.get('session_code', '').strip().upper()
        
        if not session_code or len(session_code) != 6:
            return jsonify({
                'success': False,
                'message': 'Code de session invalide (doit contenir 6 caractères)'
            }), 400
        
        session_data = user_manager.get_session_by_code(session_code)
        
        if session_data:
            return jsonify({
                'success': True,
                'session_code': session_code,
                'message': 'Session valide'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Session introuvable ou inactive'
            }), 404
            
    except Exception as e:
        logger.error(f"Erreur lors de la validation de session: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@app.route('/api/login', methods=['POST'])
def api_login():
    """API pour l'authentification (mode Kahoot avec code de session et username)"""
    try:
        data = request.json
        if not data:
            return jsonify({
                'success': False,
                'message': 'Données de connexion manquantes'
            }), 400
        
        session_code = data.get('session_code', '').strip().upper()
        username = data.get('username', '').strip()
        password = data.get('password', '')  # Requis pour admin, non utilisé pour joueurs
        
        # Si password fourni: mode Admin (pas de code requis)
        # Si pas de password: mode Joueur (code requis)
        if password:
            # Mode Admin: pas de code de session requis
            session_code = None
        else:
            # Mode Joueur: code de session obligatoire
            if not session_code or len(session_code) != 6:
                return jsonify({
                    'success': False,
                    'message': 'Code de session requis (6 caractères)'
                }), 400
            
            # Vérifier que la session existe et est active
            session_data = user_manager.get_session_by_code(session_code)
            if not session_data:
                return jsonify({
                    'success': False,
                    'message': 'Code de session invalide ou session terminée'
                }), 404
        
        # Validation basique du username
        if not username or len(username) < 2:
            return jsonify({
                'success': False,
                'message': 'Le nom d\'utilisateur doit contenir au moins 2 caractères'
            }), 400
        
        # Mode Kahoot : vérifier si le username est déjà pris dans cette session
        if not password and session_code:  # Mode Kahoot avec session
            # Vérifier si le username existe déjà dans cette session
            if user_manager.username_exists_in_session(username, session_code):
                return jsonify({
                    'success': False,
                    'message': f'Le nom "{username}" est déjà pris dans cette session. Veuillez choisir un autre nom.'
                }), 409  # HTTP 409 Conflict
        
        # Flux joueur Kahoot (pas de password): création/fetch direct et login sans passer par mot de passe
        if not password:
            try:
                existing = user_manager.get_user_by_username(username)
                if not existing:
                    user_manager.create_user(username, kahoot_mode=True)
                    existing = user_manager.get_user_by_username(username)
                user = existing
                success = True if user else False
            except Exception as e:
                logger.error(f"Kahoot login creation failed for {username}: {e}")
                success, user = False, None
        else:
            # Mode normal: authentification via password
            success, user = user_manager.authenticate_user(username, password)
        
        if success and user:
            # Réinitialiser le jeu pour une nouvelle session
            global game_instance
            game_instance = None
            game = get_game()
            
            # Démarrer le jeu automatiquement en mode Kahoot
            if not password:  # Mode Kahoot
                game.start_game()
                # Incrémenter le compteur de joueurs
                user_manager.increment_session_player_count(session_code)
            
            session['logged_in'] = True
            session['user_id'] = user.id
            session['username'] = user.username
            session['user_role'] = user.role
            session['login_time'] = datetime.now().isoformat()
            session['kahoot_mode'] = user.is_kahoot_mode
            if session_code:
                session['game_session_code'] = session_code
                # Enregistrer le joueur comme actif dans cette session (pour empêcher les doublons)
                registered = user_manager.register_active_player(user.username, session_code)
                if not registered:
                    return jsonify({
                        'success': False,
                        'message': f'Le nom "{user.username}" est déjà pris dans cette session.'
                    }), 409
                # Initialiser sa progression autoritaire au Step 1
                try:
                    user_manager.upsert_progress(user.username, session_code, 1)
                except Exception as e:
                    logger.warning(f"init progress failed: {e}")
            
            return jsonify({
                'success': True,
                'message': f'Bienvenue {user.username}!',
                'user_info': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'is_kahoot_mode': user.is_kahoot_mode
                },
                'session_code': session_code if session_code else None,
                'game_state': game.get_current_state().value if game else 'login'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Nom d\'utilisateur invalide ou mot de passe incorrect'
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
    template = content
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
        # Authoritative progress update
        try:
            username = session.get('username')
            session_code = session.get('game_session_code')
            if username and session_code:
                user_manager.upsert_progress(username, session_code, 1)
        except Exception as e:
            logger.warning(f"progress update step1 failed: {e}")
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
        # Authoritative progress update
        try:
            username = session.get('username')
            session_code = session.get('game_session_code')
            if username and session_code:
                user_manager.upsert_progress(username, session_code, 2)
        except Exception as e:
            logger.warning(f"progress update step2 failed: {e}")
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
    
    # Vérifier que Phase2 est terminé (in-memory). Si non, fallback sur player_progress en DB.
    if not game.current_path.mot2_choices or len(game.current_path.mot2_choices) != 3:
        try:
            username = session.get('username')
            session_code = session.get('game_session_code')
            if username and session_code:
                next_info = user_manager.get_next_step(username, session_code)
                if next_info and int(next_info.get('next_step', 1)) >= 3:
                    template = content
                    phase3_choices = template.get_phase_choices('phase3') or {}
                    result = {}
                    for category, choices_dict in phase3_choices.items():
                        formatted = []
                        for choice_id, choice_data in choices_dict.items():
                            formatted.append({
                                'id': choice_id,
                                'title': choice_data.get('title', choice_id.replace('_', ' ').title()),
                                'description': choice_data.get('description', '')
                            })
                        result[category] = formatted
                    return jsonify({'success': True, 'choices': result})
        except Exception as e:
            logger.warning(f"phase3 choices DB fallback failed: {e}")
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
        # Authoritative progress update
        try:
            username = session.get('username')
            session_code = session.get('game_session_code')
            if username and session_code:
                user_manager.upsert_progress(username, session_code, 3)
        except Exception as e:
            logger.warning(f"progress update step3 failed: {e}")
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
    
    # Define pillar for each choice (corrected IDs and pillars)
    choice_pillars = {
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
                'pillar': choice_pillars.get(choice.id, 'people_processes'),
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
        # Authoritative progress update
        try:
            username = session.get('username')
            session_code = session.get('game_session_code')
            if username and session_code:
                user_manager.upsert_progress(username, session_code, 4)
        except Exception as e:
            logger.warning(f"progress update step4 failed: {e}")
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
    template = content
    
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
    """API pour faire un choix Phase5 et sauvegarder le score"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'})
    
    data = request.json
    choice_id = data.get('choice_id', '')
    
    game = get_game()
    success = game.make_mot5_choice(choice_id)
    
    if success:
        results = game.get_results()
        game.save_path()
        
        # Sauvegarder le score dans le leaderboard
        username = session.get('username')
        session_code = session.get('game_session_code')  # Code de session Kahoot
        
        user_manager.save_game_score(
            username=username,
            total_score=results['total'],
            stars=results['stars'],
            mot_scores=results['scores'],
            session_id=session_code  # Utiliser le code de session Kahoot
        )

        # Mark progress completed
        try:
            if username and session_code:
                user_manager.mark_completed(username, session_code)
        except Exception as e:
            logger.warning(f"progress mark_completed failed: {e}")
        
        # Retirer le joueur de la liste des joueurs actifs (il a terminé, son score est sauvegardé)
        # La vérification d'unicité continuera de fonctionner grâce à game_scores
        if session_code:
            user_manager.remove_active_player(username, session_code)
        
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

@app.route('/api/next_step')
def api_next_step():
    """Endpoint autoritaire pour connaître le prochain step de l'utilisateur courant."""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    username = session.get('username')
    session_code = session.get('game_session_code')
    if not username or not session_code:
        return jsonify({'success': False, 'message': 'Missing session/user'}), 400
    result = user_manager.get_next_step(username, session_code)
    return jsonify({'success': True, **result})

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
    
    # Utiliser le content manager pour tous les enablers (au lieu du template)
    template = content
    
    # Générer automatiquement les titres et descriptions depuis game_content.json
    enabler_titles = {}
    enabler_descriptions = {}
    enabler_icons = {}
    
    # Utiliser content au lieu de template pour les enablers
    all_enablers = content.get_all_enablers()
    for enabler_id, enabler_data in all_enablers.items():
        enabler_titles[enabler_id] = enabler_data.get("title", enabler_id.replace("_", " ").title())
        enabler_descriptions[enabler_id] = enabler_data.get("description", f"Capability: {enabler_id}")
        enabler_icons[enabler_id] = enabler_data.get("icon", "fas fa-cog")
    
    # Formater les ENABLERS par catégorie
    formatted_enablers_by_category = {}
    category_titles = {
        "technology": "Technology",
        "people": "People",
        "gover": "Governance"
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
    template = content
    all_available_enablers_by_phase = {}
    
    # Pour chaque phase, récupérer tous les enablers disponibles
    for phase_id in ['phase1', 'phase2', 'phase3', 'phase4', 'phase5']:
        all_available_enablers_by_phase[phase_id] = []
        phase_choices = template.get_phase_choices(phase_id)
        print(f"DEBUG web_interface: phase_id={phase_id}, phase_choices={list(phase_choices.keys())}")
        if phase_id == 'phase4':
            print(f"DEBUG web_interface: phase4 phase_choices type={type(phase_choices)}, len={len(phase_choices) if phase_choices else 'None'}")
        
        for choice_id, choice_data in phase_choices.items():
            # Pour la phase 5, ne charger que les enablers du choix réel fait par le joueur
            if phase_id == 'phase5' and game.current_path.mot5_choice and choice_id != game.current_path.mot5_choice:
                print(f"DEBUG web_interface: Skipping choice {choice_id} (player chose {game.current_path.mot5_choice})")
                continue
            
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
            # Pour les enablers du Step 4 et 5, utiliser le mapping direct car les IDs des choix et enablers sont identiques
            if phase == 'phase4':
                # Mapping direct pour les enablers du Step 4
                enabler_to_category = {
                    'adoption_playbook': 'people',
                    'ai_storytelling_communication': 'people',
                    'ai_product_teams_setup': 'people',
                    'talent_mobility_program': 'people',
                    'industrialized_data_pipelines': 'technology',
                    'api_platform': 'technology',
                    'privacy_by_design_data': 'technology',
                    'role_responsibility_matrix': 'gover',
                    'country_level_ai_deployment': 'gover'
                }
                enabler_category = enabler_to_category.get(enabler, 'people')
            elif phase == 'phase5':
                # Mapping direct pour les enablers du Step 5
                enabler_to_category = {
                    'self_service_ai_tools': 'technology',
                    'data_ai_academy': 'people',
                    'ai_collaboration_hub': 'people',
                    'attractive_ai_career_tracks': 'people',
                    'responsible_ai_awareness': 'gover',
                    'trusted_tech_partners': 'technology',
                    'ai_governance_roadmap': 'gover',
                    'ai_value_office': 'gover'
                }
                enabler_category = enabler_to_category.get(enabler, 'people')
            else:
                enabler_category = content.get_enabler_category(enabler)
            
            if enabler_category in category_titles:
                all_available_enablers_by_phase_and_category[phase][enabler_category].append(enabler)
                if phase == 'phase4':
                    print(f"DEBUG web_interface: Added enabler '{enabler}' to category '{enabler_category}' for phase4")
                elif phase == 'phase5':
                    print(f"DEBUG web_interface: Added enabler '{enabler}' to category '{enabler_category}' for phase5")
            else:
                if phase == 'phase4':
                    print(f"DEBUG web_interface: Category '{enabler_category}' not found for enabler '{enabler}' in phase4")
                elif phase == 'phase5':
                    print(f"DEBUG web_interface: Category '{enabler_category}' not found for enabler '{enabler}' in phase5")
    
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
            
            # Only Automated Banners Generation is unlocked for Amira
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

    # Add all_enablers data to pedagogical_data for modal display
    pedagogical_data['all_enablers'] = {}
    for enabler_id in enabler_titles.keys():
        # Get the actual category for this enabler
        enabler_category = content.get_enabler_category(enabler_id)
        
        pedagogical_data['all_enablers'][enabler_id] = {
            'title': enabler_titles.get(enabler_id, enabler_id.replace("_", " ").title()),
            'description': enabler_descriptions.get(enabler_id, f"Capability: {enabler_id}"),
            'icon': enabler_icons.get(enabler_id, "fas fa-cog"),
            'category': enabler_category
        }
    
    # Also add enablers_by_phase data structure for easier access (only unlocked enablers)
    pedagogical_data['enablers_by_phase'] = {}
    for phase in ['phase1', 'phase2', 'phase3', 'phase4', 'phase5']:
        if phase in pedagogical_data:
            pedagogical_data['enablers_by_phase'][phase] = {}
            for category, data in pedagogical_data[phase].items():
                if category != 'title':
                    if category not in pedagogical_data['enablers_by_phase'][phase]:
                        pedagogical_data['enablers_by_phase'][phase][category] = []
                    # Only include unlocked enablers
                    unlocked = [e['id'] for e in data.get('enablers', []) if e.get('unlocked', False)]
                    pedagogical_data['enablers_by_phase'][phase][category] = unlocked
    
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
        },
        'dashboard_pillars': template.get_dashboard_pillars()
    })

def get_personalized_step_message(mot_key, choice, score):
    """Génère un message personnalisé selon le choix et le score pour chaque étape"""
    if mot_key == 'mot1':
        if choice == 'elena' and score == 3:
            return "Excellent! By choosing Elena's approach, you earned 3 stars out of 3. This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap that inspires creativity, empowers teams, and delivers measurable business impact."
        elif choice == 'james' and score == 2:
            return "Good Choice! By selecting James's approach, you earned 2 stars out of 3. You chose a prudent and structured path, focusing on data, technology, and architecture — a wise move for long-term scalability. However, the risk is that your transformation could lose momentum before delivering visible value to business teams."
        elif choice == 'amira' and score == 1:
            return "Interesting Attempt! By following Amira's approach, you earned 1 star out of 3. Your choice shows boldness and a desire to move fast — essential qualities for innovation. But without clear governance or foundations, you risk creating fragmented initiatives and limited long-term impact. Your teams may learn quickly, but results will stay local and unsustainable."
    
    elif mot_key == 'mot2':
        if score == 3:
            return "Excellent! By selecting the good three — Smart Game Design Assistant, Player Journey Optimizer, and Fraud & Integrity Detection — you earned 3 stars out of 3. These initiatives deliver a good balance of visible impact for both players and internal teams, while laying the groundwork for long-term scalability. Additionally, your decisions show a clear understanding of what matters most: combining innovation, player value, and responsibility. PlayForward is now ready to move from vision to action — with focus, purpose, and measurable results."
        elif score == 2:
            return "Good Choice! Your portfolio includes some high-impact initiatives, but could have been even more optimized to balance value and feasibility. To strengthen your transformation, focus on alignment and execution speed."
        elif score == 1:
            return "Interesting Attempt! Your selection shows curiosity and experimentation but lacks strategic coherence. Some of these initiatives may deliver insights, yet they won't create the momentum or credibility needed to drive company-wide transformation. To succeed, narrow your scope — choose higher-impact projects and link them directly to measurable business outcomes."
    
    elif mot_key == 'mot3':
        if score == 3:
            return "Excellent! By selecting the good three, you earned 3 stars out of 3. You focused on what truly accelerates adoption: leadership ownership, solid data foundations, and clear governance. Your teams are now empowered, aligned, and ready to transform early pilots into sustainable business value. PlayForward is now ready to move from vision to action — with focus, purpose, and measurable results."
        elif score == 2:
            return "Good Choice! You made strong decisions. However, your choices could be more cohesive across the three domains. To amplify impact, ensure your enablers connect leaders, tech, and governance together — so adoption grows hand-in-hand with structure and trust. Your pilots will show value, but scaling may take longer than expected."
        elif score == 1:
            return "Interesting Attempt! Some key foundations are missing. Without clear governance or a strong data backbone, pilots may succeed locally yet fail to scale globally. Time to refocus on alignment before moving to scale."
    
    elif mot_key == 'mot4':
        if score == 3:
            return "Excellent! Perfect balance! You earned 3 stars out of 3. You've mastered the art of scaling: solid foundations, empowered teams, and responsible governance. Your organization can now replicate success across markets while maintaining speed, reliability, and trust. PlayForward moves from pilot success to enterprise transformation — AI is now part of the company's daily rhythm."
        elif score == 2:
            return "Good Choice! You focused on impactful enablers, but your portfolio could be better balanced between People, Technology, and Governance. Operational efficiency will increase, yet adoption or risk management might lag behind. Your scaling is on track, but true industrialization still lies ahead."
        elif score == 1:
            return "Interesting Attempt! You activated useful levers, yet missed the full triad of enablers that turn pilots into sustainable impact. Without strong data pipelines or structured adoption support, your AI initiatives risk becoming fragmented or over-dependent on a few champions."
    
    elif mot_key == 'mot5':
        if score == 3:
            return "Excellent! You invested where it truly matters: people and ecosystem. You built an engine for continuous innovation and strengthened your AI delivery capabilities. AI has become part of the company's DNA: human, creative, and sustainable."
        elif score == 2:
            return "Good Choice! You built a solid foundation for sustainable AI adoption: clear governance, reliable partners, and growing internal expertise. The organization can now scale in a controlled way, though acceleration will remain gradual because of adequately train collaborators. Also, true enterprise-wide AI impact still lies ahead and you lack the means to truly control the ROI on AI you promised to your Board of Directors."
        elif score == 1:
            return "Interesting Attempt! You focused on responsible AI alignment, training and self-service, essential for trust and adoption. However, without deeper skills, governance and tech foundations, the transformation risks stalling once enthusiasm fades. The company has made AI visible, but not yet scalable."
    
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
    template = content
    phase_titles = {
        "mot1_hr_approach_selection": template.get_phase_title('phase1'),
        "phase2_hr_portfolio_selection": template.get_phase_title('phase2'),
        "mot3_hr_facilitator_selection": template.get_phase_title('phase3'),
        "mot4_hr_scaling_selection": template.get_phase_title('phase4'),
        "mot5_hr_deployment_selection": template.get_phase_title('phase5'),
        "results": "Résultats Finaux"
    }
    return phase_titles.get(game_state.value, "Phase en cours")

@app.route('/api/leaderboard')
def api_leaderboard():
    """API pour récupérer le classement des meilleurs scores (filtré par session si en mode Kahoot)"""
    try:
        limit = request.args.get('limit', 1000, type=int)
        session_code = session.get('game_session_code')  # Code de session Kahoot
        
        logger.info(f"Leaderboard request: session_code={session_code}, limit={limit}")
        
        # Si on a un code de session, filtrer STRICTEMENT par session (seulement les joueurs de cette session)
        if session_code:
            logger.info(f"Filtering leaderboard for session: {session_code}")
            leaderboard = user_manager.get_leaderboard_for_session(session_code, limit=limit)
            logger.info(f"Found {len(leaderboard)} players for session {session_code}")
        else:
            # Sinon, leaderboard global (mode normal)
            logger.info("No session code, using global leaderboard")
            leaderboard = user_manager.get_leaderboard(limit=limit)
        
        # Ajouter le rang de l'utilisateur actuel s'il est connecté
        user_rank = None
        current_username = None
        if session.get('logged_in'):
            current_username = session.get('username')
            logger.info(f"Current logged-in user: {current_username}")
            # Normalize username for comparison (case-insensitive)
            current_username_normalized = current_username.lower().strip() if current_username else None
            for entry in leaderboard:
                entry_username = entry.get('username', '').strip()
                if entry_username and current_username_normalized:
                    if entry_username.lower() == current_username_normalized:
                        user_rank = entry['rank']
                        logger.info(f"User {current_username} found at rank {user_rank} (normalized comparison)")
                        break
                elif entry_username == current_username:  # Fallback to exact match
                    user_rank = entry['rank']
                    logger.info(f"User {current_username} found at rank {user_rank} (exact match)")
                    break
            
            # Log if user not found in leaderboard
            if user_rank is None and current_username:
                logger.warning(f"User {current_username} NOT FOUND in leaderboard!")
                logger.warning(f"Available usernames in leaderboard: {[e.get('username', 'N/A') for e in leaderboard]}")
        
        # Ensure leaderboard is a list and contains valid data
        leaderboard_list = []
        for entry in leaderboard:
            if isinstance(entry, dict):
                # Ensure all required fields exist
                leaderboard_list.append({
                    'rank': entry.get('rank', 0),
                    'username': entry.get('username', 'Unknown'),
                    'total_score': entry.get('total_score', 0),
                    'stars': entry.get('stars', 0),
                    'mot_scores': entry.get('mot_scores', {}),
                    'completed_at': entry.get('completed_at', '')
                })
            else:
                logger.warning(f"Invalid leaderboard entry format: {entry}")
        
        logger.info(f"Returning leaderboard with {len(leaderboard_list)} entries for session {session_code}")
        
        # DEBUG: Log all usernames in leaderboard and current username for comparison
        if current_username:
            leaderboard_usernames = [e.get('username', 'N/A') for e in leaderboard_list]
            logger.info(f"DEBUG: Current username '{current_username}' looking in: {leaderboard_usernames}")
            if current_username not in leaderboard_usernames:
                logger.warning(f"WARNING: Current username '{current_username}' NOT in leaderboard list!")
                logger.warning(f"  Normalized comparison: Looking for '{current_username.lower().strip()}'")
                logger.warning(f"  Available (normalized): {[u.lower().strip() for u in leaderboard_usernames]}")
        
        # Get the timestamp of the most recent score completion for this session
        last_completion_time = None
        if session_code and leaderboard_list:
            try:
                from datetime import datetime
                completion_times = [e.get('completed_at', '') for e in leaderboard_list if e.get('completed_at')]
                if completion_times:
                    # Get the most recent completion time
                    last_completion_time = max(completion_times)
            except Exception as e:
                logger.warning(f"Error getting last completion time: {e}")
        
        # Stats pour l'en-tête du leaderboard
        total_players = len(leaderboard_list)
        scores = [e.get('total_score', 0) or 0 for e in leaderboard_list]
        top_score = max(scores) if scores else 0
        average_score = round(sum(scores) / len(scores), 2) if scores else 0
        your_score = None
        if current_username:
            try:
                norm = current_username.lower().strip()
                for e in leaderboard_list:
                    if e.get('username', '').lower().strip() == norm:
                        your_score = e.get('total_score', 0)
                        break
            except Exception:
                your_score = None

        return jsonify({
            'success': True,
            'leaderboard': leaderboard_list,
            'user_rank': user_rank,
            'current_username': current_username,  # Inclure le username actuel pour la comparaison frontend
            'total_entries': total_players,
            'session_code': session_code,  # Inclure le code de session dans la réponse
            'last_completion_time': last_completion_time,  # Timestamp du dernier score pour détecter les nouveaux joueurs
            'stats': {
                'total_players': total_players,
                'average_score': average_score,
                'top_score': top_score,
                'your_score': your_score
            },
            'debug_info': {
                'leaderboard_usernames': [e.get('username', 'N/A') for e in leaderboard_list],
                'current_username_normalized': current_username.lower().strip() if current_username else None
            } if current_username else None
        })
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération du leaderboard'
        }), 500

@app.route('/api/user_best_score')
def api_user_best_score():
    """API pour récupérer le meilleur score de l'utilisateur connecté"""
    if not session.get('logged_in'):
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    try:
        username = session.get('username')
        best_score = user_manager.get_user_best_score(username)
        
        if best_score:
            return jsonify({
                'success': True,
                'best_score': best_score
            })
        else:
            return jsonify({
                'success': True,
                'best_score': None,
                'message': 'Aucun score enregistré'
            })
    except Exception as e:
        logger.error(f"Error getting user best score: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération du meilleur score'
        }), 500

if __name__ == '__main__':
    import os
    
    # Initialiser les utilisateurs par défaut au démarrage
    initialize_default_users()
    
    # Configuration pour Railway
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print("🚀 Starting Flask server...")
    print(f"📍 Port: {port}")
    print(f"🐛 Debug mode: {debug}")
    print("=" * 50)
    
    app.run(debug=debug, host='0.0.0.0', port=port)
