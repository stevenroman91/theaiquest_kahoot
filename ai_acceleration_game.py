#!/usr/bin/env python3
"""
AI Transformation - PlayNext Leader Edition
Adapté pour les managers RH du Smart Retail Group
"""

import logging
import json
from enum import Enum
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from user_manager import user_manager
from template_engine_complete import get_template

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GameState(Enum):
    """États du jeu"""
    LOGIN = "login"
    INTRODUCTION = "introduction"
    MOT1 = "mot1_hr_approach_selection"
    MOT2 = "phase2_hr_portfolio_selection"
    MOT3 = "mot3_hr_facilitator_selection"
    MOT4 = "mot4_hr_scaling_selection"
    MOT5 = "mot5_hr_deployment_selection"
    RESULTS = "results"
    COMPLETED = "completed"

@dataclass
class Choice:
    """Représente un choix dans le jeu"""
    id: str
    title: str
    description: str
    cost: Optional[int] = None
    category: Optional[str] = None
    unlocks_enablers: Optional[List[str]] = None  # ENABLERS débloqués par ce choix
    # Nouveaux champs pour les ENABLERS par niveau de score
    enablers_1_star: Optional[List[str]] = None  # ENABLERS débloqués avec 1 étoile
    enablers_2_stars: Optional[List[str]] = None  # ENABLERS débloqués avec 2 étoiles
    enablers_3_stars: Optional[List[str]] = None  # ENABLERS débloqués avec 3 étoiles

@dataclass
class GamePath:
    """Représente un chemin complet dans le jeu"""
    mot1_choice: str
    mot2_choices: List[str]
    mot3_choices: Dict[str, str]  # category -> choice
    mot4_choices: List[str]
    mot5_choice: str
    total_score: int = 0
    stars: int = 0
    mot_scores: Dict[str, int] = field(default_factory=dict)
    unlocked_enablers: List[str] = field(default_factory=list)  # ENABLERS débloqués
    unlocked_enablers_by_category: Dict[str, List[str]] = field(default_factory=lambda: {
        "technology_partnerships": [],
        "policies_governance": [],
        "transformation_change": []
    })
    # Nouveaux champs pour suivre les ENABLERS par phase
    enablers_by_phase: Dict[str, List[str]] = field(default_factory=lambda: {
        "phase1": [],
        "phase2": [],
        "phase3": [],
        "phase4": [],
        "phase5": []
    })

class AIAccelerationGame:
    """Jeu AI Transformation - PlayNext Leader Edition"""
    
    def __init__(self):
        self.current_state = GameState.LOGIN
        self.current_path = GamePath(
            mot1_choice="",
            mot2_choices=[],
            mot3_choices={},
            mot4_choices=[],
            mot5_choice=""
        )
        self.game_data = self._initialize_game_data()
        self.completed_paths = []
        self.template = get_template()
        
    def _initialize_game_data(self) -> Dict:
        """Initialise toutes les données du jeu depuis le template"""
        from template_engine_complete import get_template
        template = get_template()

        # Phase 1 choices from template
        phase1_choices = {}
        for choice_id, choice_data in template.get_phase_choices("phase1").items():
            enablers = template.get_choice_enablers("phase1", choice_id)
            phase1_choices[choice_id] = Choice(
                id=choice_id,
                title=template.get_choice_title("phase1", choice_id),
                description=template.get_choice_description("phase1", choice_id),
                category=self._get_choice_category(choice_id),
                enablers_1_star=enablers,
                enablers_2_stars=enablers,
                enablers_3_stars=enablers
            )

        # Phase 2 choices from template
        phase2_choices = {}
        for choice_id, choice_data in template.get_phase_choices("phase2").items():
            enablers = template.get_choice_enablers("phase2", choice_id)
            phase2_choices[choice_id] = Choice(
                id=choice_id,
                title=template.get_choice_title("phase2", choice_id),
                description=template.get_choice_description("phase2", choice_id),
                category=self._get_choice_category(choice_id),
                enablers_1_star=enablers,
                enablers_2_stars=enablers,
                enablers_3_stars=enablers
            )

        # Phase 3 choices from template
        phase3_choices = {}
        for choice_id, choice_data in template.get_phase_choices("phase3").items():
            enablers = template.get_choice_enablers("phase3", choice_id)
            phase3_choices[choice_id] = Choice(
                id=choice_id,
                title=template.get_choice_title("phase3", choice_id),
                description=template.get_choice_description("phase3", choice_id),
                category=self._get_choice_category(choice_id),
                enablers_1_star=enablers,
                enablers_2_stars=enablers,
                enablers_3_stars=enablers
            )

        # Phase 4 choices from template
        phase4_choices = {}
        for choice_id, choice_data in template.get_phase_choices("phase4").items():
            enablers = template.get_choice_enablers("phase4", choice_id)
            phase4_choices[choice_id] = Choice(
                id=choice_id,
                title=template.get_choice_title("phase4", choice_id),
                description=template.get_choice_description("phase4", choice_id),
                category=self._get_choice_category(choice_id),
                enablers_1_star=enablers,
                enablers_2_stars=enablers,
                enablers_3_stars=enablers
            )

        # Phase 5 choices from template
        phase5_choices = {}
        for choice_id, choice_data in template.get_phase_choices("phase5").items():
            enablers = template.get_choice_enablers("phase5", choice_id)
            phase5_choices[choice_id] = Choice(
                id=choice_id,
                title=template.get_choice_title("phase5", choice_id),
                description=template.get_choice_description("phase5", choice_id),
                category=self._get_choice_category(choice_id),
                enablers_1_star=enablers,
                enablers_2_stars=enablers,
                enablers_3_stars=enablers
            )

        return {
            "mot1_hr_approaches": phase1_choices,
            "mot2_hr_solutions": phase2_choices,
            "mot3_hr_capabilities": phase3_choices,
            "mot4_hr_implementation": phase4_choices,
            "mot5_hr_scaleup": phase5_choices,
        }

    def _get_choice_category(self, choice_id: str) -> str:
        """Determine category for a choice based on its ID"""
        # Phase 1 character mappings
        if choice_id == "elena":
            return "strategy"
        elif choice_id == "james":
            return "tech"
        elif choice_id == "amira":
            return "operational"

        # Phase 2 mappings
        elif choice_id in ["intelligent_recruitment", "virtual_hr_assistant", "training_optimization", "sentiment_analysis", "hr_automation"]:
            return "solution"

        # Phase 3 mappings
        elif choice_id in ["hr_ai_training", "hr_role_redefinition", "cultural_change"]:
            return "transformation_change"
        elif choice_id in ["system_integration", "tech_partnerships", "cloud_infrastructure"]:
            return "technology_partnerships"
        elif choice_id in ["ai_ethics_charter", "data_governance", "performance_metrics"]:
            return "policies_governance"

        # Phase 4 mappings
        elif choice_id in ["apis_hr_systems", "data_pipeline_automation", "data_strategy"]:
            return "technology_partnerships"
        elif choice_id in ["ethics_oversight", "risk_management", "leadership_communication", "business_alignment"]:
            return "policies_governance"
        elif choice_id in ["talent_retention", "change_adoption"]:
            return "transformation_change"

        # Phase 5 mappings
        elif choice_id == "genai_for_all":
            return "transformation_change"
        elif choice_id == "capability_building":
            return "policies_governance"
        elif choice_id == "people_speed":
            return "technology_partnerships"

        # Default fallback
        return "transformation_change"


    def login(self, username: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
        """Real authentication system with users and hashed passwords"""
        # Input validation
        if not username or not password:
            return False, "Username and password required", None
        
        if len(username.strip()) < 2:
            return False, "Username must contain at least 2 characters", None
        
        if len(password) < 6:
            return False, "Password must contain at least 6 characters", None
        
        # Authenticate user
        success, user = user_manager.authenticate_user(username.strip(), password)
        
        if success and user:
            logger.info(f"Login successful for user: {user.username} (role: {user.role})")
            
            # Reset game for new session
            self.current_state = GameState.INTRODUCTION
            self.current_path = GamePath(
                mot1_choice="",
                mot2_choices=[],
                mot3_choices={},
                mot4_choices=[],
                mot5_choice="",
                mot_scores={}
            )
            
            # Return success with user information
            user_info = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
                "last_login": user.last_login
            }
            
            return True, f"Login successful - Welcome {user.username}!", user_info
        else:
            return False, "Incorrect username or password", None
    
    def start_game(self) -> str:
        """Starts the game and returns the introduction"""
        self.current_state = GameState.MOT1
        return """
        🎯 Welcome to AI Transformation - PlayNext Leader Edition
        
        You are leading a GenAI transformation in your HR department.
        Your mission: make the right strategic decisions to succeed in this HR transformation.
        
        The game unfolds in 5 Moments of Truth (MOT) where you'll need to make crucial choices
        to integrate generative AI into your HR processes.
        
        Each decision influences your final score and the number of stars earned.
        
        Let's start with MOT 1: Choose your initial approach for GenAI HR transformation.
        """
    
    def get_mot1_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT1"""
        return list(self.game_data["mot1_hr_approaches"].values())
    
    def make_mot1_choice(self, approach_id: str) -> bool:
        """Effectue le choix MOT1"""
        if approach_id in self.game_data["mot1_hr_approaches"]:
            self.current_path.mot1_choice = approach_id
            self.current_state = GameState.MOT2
            mot1_score = self.calculate_mot_score(1)
            logger.info(f"MOT1 choice made: {approach_id} - Score: {mot1_score}/3")

            # Calculer les ENABLERS débloqués
            self._calculate_enablers()

            return True
        return False
    
    def get_mot2_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT2"""
        return list(self.game_data["mot2_hr_solutions"].values())
    
    def make_mot2_choices(self, solution_ids: List[str]) -> bool:
        """Effectue les choix MOT2 avec scoring basé sur les positions 1, 3 et 4"""
        if len(solution_ids) != 3:
            return False
        
        # Mapping des choix vers leurs positions dans la matrice
        choice_to_matrix_position = {
            'fraud_integrity_detection': 1,        # Position 1
            'ai_storyline_generator': 2,           # Position 2
            'smart_game_design_assistant': 3,      # Position 3
            'player_journey_optimizer': 4,         # Position 4
            'talent_analytics_dashboard': 5        # Position 5
        }
        
        # Vérifier combien de bonnes positions sont sélectionnées
        selected_positions = []
        for solution_id in solution_ids:
            if solution_id in choice_to_matrix_position:
                selected_positions.append(choice_to_matrix_position[solution_id])
        
        # Les bonnes réponses sont les positions 1, 3 et 4
        correct_positions = {1, 3, 4}
        correct_count = len(set(selected_positions) & correct_positions)
        
        # Toujours permettre la progression, mais avec un score basé sur les bonnes réponses
        self.current_path.mot2_choices = solution_ids
        self.current_state = GameState.MOT3
        
        # Calculer le score basé sur le nombre de bonnes positions
        if correct_count == 3:
            mot2_score = 3  # 3 étoiles
            logger.info(f"MOT2 perfect choices: {solution_ids} (positions 1,3,4) - Score: 3/3")
        elif correct_count == 2:
            mot2_score = 2  # 2 étoiles
            logger.info(f"MOT2 good choices: {solution_ids} (2/3 correct positions) - Score: 2/3")
        elif correct_count == 1:
            mot2_score = 1  # 1 étoile
            logger.info(f"MOT2 partial choices: {solution_ids} (1/3 correct positions) - Score: 1/3")
        else:
            mot2_score = 0  # 0 étoile
            logger.info(f"MOT2 incorrect choices: {solution_ids} (0/3 correct positions) - Score: 0/3")
        
        # Calculer les ENABLERS débloqués
        self._calculate_enablers()
        
        return True
    
    def get_mot3_choices(self) -> Dict[str, List[Choice]]:
        """Retourne les choix disponibles pour MOT3 par catégorie"""
        # Organiser les choix par catégorie selon les nouveaux enablers
        choices_by_category = {
            "technology_partnerships": [],
            "transformation_change": [],
            "policies_governance": []
        }

        # Récupérer tous les choix de Phase 3 depuis le template
        template = get_template()
        phase3_choices = template.get_phase_choices("phase3")

        for choice_id, choice_data in phase3_choices.items():
            # Récupérer les enablers de ce choix
            enablers = template.get_choice_enablers("phase3", choice_id)
            if enablers:
                # Déterminer la catégorie basée sur le premier enabler
                enabler_category = template.get_enabler_category(enablers[0])

                # Créer l'objet Choice
                choice = Choice(
                    id=choice_id,
                    title=template.get_choice_title("phase3", choice_id),
                    description=template.get_choice_description("phase3", choice_id),
                    unlocks_enablers=enablers
                )

                # Ajouter à la bonne catégorie
                if enabler_category in choices_by_category:
                    choices_by_category[enabler_category].append(choice)

        return choices_by_category
    
    def make_mot3_choices(self, choices: Dict[str, str]) -> bool:
        """Effectue les choix MOT3 (1 par catégorie)"""
        required_categories = ["technology_partnerships", "transformation_change", "policies_governance"]
        
        if set(choices.keys()) != set(required_categories):
            return False
            
        # Vérifier que chaque choix existe dans sa catégorie
        choices_by_category = self.get_mot3_choices()
        for category, choice_id in choices.items():
            category_choices = [choice.id for choice in choices_by_category[category]]
            if choice_id not in category_choices:
                return False
        
        self.current_path.mot3_choices = choices
        self.current_state = GameState.MOT4
        mot3_score = self.calculate_mot_score(3)
        logger.info(f"MOT3 choices made: {choices} - Score: {mot3_score}/3")

        # Calculer les ENABLERS débloqués
        self._calculate_enablers()

        return True
    
    def get_mot4_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT4"""
        choices = []

        # Récupérer les choix depuis le template
        phase4_choices = self.template.get_phase_choices('phase4')

        for choice_id, choice_data in phase4_choices.items():
            choice = Choice(
                id=choice_id,
                title=choice_data['title'],
                description=choice_data['description'],
                unlocks_enablers=choice_data.get('enablers', []),
                cost=choice_data.get('cost', 5)  # Coût par défaut de 5 points
            )
            choices.append(choice)

        return choices
    
    def make_mot4_choices(self, enabler_ids: List[str]) -> bool:
        """Effectue les choix MOT4 (budget entre 1 et 30 points)"""
        # Vérifier le budget (maximum 30 points)
        total_cost = 0
        choices = self.get_mot4_choices()
        choice_costs = {choice.id: choice.cost for choice in choices}
        
        for enabler_id in enabler_ids:
            if enabler_id in choice_costs:
                total_cost += choice_costs[enabler_id]
            else:
                logger.warning(f"Unknown enabler ID in MOT4: {enabler_id}")
                return False

        if total_cost > 30:
            logger.warning(f"MOT4 budget exceeded: {total_cost}/30 points")
            return False

        # Enregistrer les choix
        self.current_path.mot4_choices = enabler_ids

        # Calculer le score basé sur les bonnes réponses
        good_choices = {
            'industrial_data_pipelines',
            'business_ai_champions', 
            'adoption_playbook',
            'local_ai_risk_management'
        }

        correct_choices = set(enabler_ids) & good_choices
        correct_count = len(correct_choices)
        
        # Logique de scoring : 4/4 = 3 étoiles, 3/4 = 2 étoiles, 2 ou moins = 1 étoile
        if correct_count == 4:
            score = 3
        elif correct_count == 3:
            score = 2
        else:
            score = 1

        # Enregistrer le score
        self.current_path.mot4_score = score

        # Passer à l'état suivant
        self.current_state = GameState.MOT5
        
        logger.info(f"MOT4 choices made: {enabler_ids}, total cost: {total_cost}/30, score: {score}/4")
        
        return True
    
    def get_mot5_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT5"""
        choices = []
        phase_choices = self.template.get_phase_choices('phase5')
        
        for choice_id, choice_data in phase_choices.items():
            choice = Choice(
                id=choice_id,
                title=choice_data['title'],
                description=choice_data['description']
            )
            choices.append(choice)
        
        return choices
    
    def make_mot5_choice(self, choice_id: str) -> bool:
        """Effectue le choix MOT5"""
        phase_choices = self.template.get_phase_choices('phase5')
        if choice_id in phase_choices:
            self.current_path.mot5_choice = choice_id
            self.current_state = GameState.RESULTS
            mot5_score = self.calculate_mot_score(5)

            # Calculer les ENABLERS débloqués
            self._calculate_enablers()

            self._calculate_final_score()
            logger.info(f"MOT5 choice made: {choice_id} - Score: {mot5_score}/3")
            return True
        return False
    
    def calculate_mot_score(self, mot_number: int) -> int:
        """Calcule le score pour une phase spécifique (1-3 étoiles) - Version HR Managers"""
        if mot_number == 1:
            # Phase 1: Elena=3, James=2, Amira=1
            phase1_scores = {"elena": 3, "james": 2, "amira": 1}
            return phase1_scores.get(self.current_path.mot1_choice, 0)
        
        elif mot_number == 2:
            # MOT2: Positions optimales = 1, 3, 4 (fraud_integrity_detection, smart_game_design_assistant, player_journey_optimizer)
            choice_to_matrix_position = {
                'fraud_integrity_detection': 1,        # Position 1
                'ai_storyline_generator': 2,           # Position 2
                'smart_game_design_assistant': 3,      # Position 3
                'player_journey_optimizer': 4,         # Position 4
                'talent_analytics_dashboard': 5        # Position 5
            }
            
            correct_positions = {1, 3, 4}
            selected_positions = []
            for solution_id in self.current_path.mot2_choices:
                if solution_id in choice_to_matrix_position:
                    selected_positions.append(choice_to_matrix_position[solution_id])
            
            matches = len(set(selected_positions) & correct_positions)
            
            if matches >= 3:
                return 3
            elif matches == 2:
                return 2
            elif matches == 1:
                return 1
            else:
                return 0
        
        elif mot_number == 3:
            # MOT3: Les bons choix sont AI Governance Board, AI Co-Creation Labs et AI & Data Foundations
            good_choices = {"ai_governance_board", "ai_co_creation_labs", "ai_data_foundations"}

            # Compter combien de bons choix ont été sélectionnés
            selected_choices = set()
            for category_choices in self.current_path.mot3_choices.values():
                if isinstance(category_choices, list):
                    selected_choices.update(category_choices)
                else:
                    selected_choices.add(category_choices)

            matches = len(selected_choices & good_choices)
            
            if matches >= 3:
                return 3
            elif matches == 2:
                return 2
            elif matches == 1:
                return 1
            else:
                return 1  # Minimum 1 étoile même si aucun bon choix
        
        elif mot_number == 4:
            # MOT4: Industrial Data Pipelines + Business AI Champions + Adoption Playbook + Local AI Risk Management = 3/3
            optimal_enablers = {"industrial_data_pipelines", "business_ai_champions", "adoption_playbook", "local_ai_risk_management"}
            selected_enablers = set(self.current_path.mot4_choices)
            matches = len(optimal_enablers.intersection(selected_enablers))
            
            if matches == 4:
                return 3
            elif matches == 3:
                return 2
            else:
                return 1
        
        elif mot_number == 5:
            # MOT5: full_speed_on_people=3, continuous_capability_building=2, ai_for_all=1
            mot5_scores = {"full_speed_on_people": 3, "continuous_capability_building": 2, "ai_for_all": 1}
            return mot5_scores.get(self.current_path.mot5_choice, 0)
        
        return 0

    def _calculate_final_score(self):
        """Calcule le score final basé sur les choix"""
        # Calculer les scores par MOT
        mot_scores = {}
        total_score = 0
        
        for mot_num in range(1, 6):
            mot_score = self.calculate_mot_score(mot_num)
            mot_scores[f"mot{mot_num}"] = mot_score
            total_score += mot_score
        
        self.current_path.mot_scores = mot_scores
        self.current_path.total_score = total_score
        
        # Calcul des étoiles globales (sur 15 max)
        if total_score >= 15:
            self.current_path.stars = 3
        elif total_score >= 10:
            self.current_path.stars = 2
        else:
            self.current_path.stars = 1
    
        # Calculer les ENABLERS débloqués
        self._calculate_enablers()

    def _calculate_enablers(self):
        """Calcule les ENABLERS débloqués par les choix selon le score obtenu"""
        print(f"DEBUG _calculate_enablers: Starting calculation")
        print(f"DEBUG _calculate_enablers: mot4_choices = {self.current_path.mot4_choices}")
        
        # Réinitialiser complètement les enablers par catégorie
        enablers_by_category = {
            "technology_partnerships": [],
            "policies_governance": [],
            "transformation_change": []
        }

        # Réinitialiser complètement les enablers par phase
        enablers_by_phase = {
            "phase1": [],
            "phase2": [],
            "phase3": [],
            "phase4": [],
            "phase5": []
        }

        # Mapping des choix vers leurs catégories
        choice_categories = self._get_choice_categories()

        # Phase 1 - HR Approach choice
        if self.current_path.mot1_choice:
            choice = self.game_data["mot1_hr_approaches"][self.current_path.mot1_choice]
            # Utiliser le score calculé directement au lieu de mot_scores
            phase1_score = self.calculate_mot_score(1)

            # Special handling for Amira (use cases instead of enablers)
            if self.current_path.mot1_choice == "amira":
                # Get use cases from template
                template = get_template()
                use_cases = template.get_choice_use_cases("phase1", "amira")
                logger.info(f"Phase 1 DEBUG: Amira choice, use_cases={use_cases}")
                # Store use cases instead of enablers
                enablers_by_phase["phase1"] = use_cases
            else:
                phase_enablers = self._get_enablers_for_score(choice, phase1_score)
                logger.info(f"Phase 1 DEBUG: choice={self.current_path.mot1_choice}, score={phase1_score}, enablers={phase_enablers}")

                if phase_enablers:
                    logger.info(f"Phase 1 DEBUG: adding enablers={phase_enablers}")
                    # Ajouter chaque enabler dans sa propre catégorie selon le template
                    for enabler in phase_enablers:
                        enabler_category = self.template.get_enabler_category(enabler)
                        logger.info(f"Phase 1 DEBUG: enabler '{enabler}' has category '{enabler_category}'")
                        if enabler not in enablers_by_category[enabler_category]:
                            enablers_by_category[enabler_category].append(enabler)
                    # Mettre à jour la phase 1
                    enablers_by_phase["phase1"] = phase_enablers

        # Phase 2 - HR Solution choices
        phase2_score = self.calculate_mot_score(2)
        print(f"DEBUG _calculate_enablers Phase 2: mot2_choices = {self.current_path.mot2_choices}")
        print(f"DEBUG _calculate_enablers Phase 2: phase2_score = {phase2_score}")
        phase2_enablers = []
        for solution_id in self.current_path.mot2_choices:
            choice = self.game_data["mot2_hr_solutions"][solution_id]
            choice_enablers = self._get_enablers_for_score(choice, phase2_score)
            print(f"DEBUG _calculate_enablers Phase 2: Choice '{solution_id}' unlocks {choice_enablers}")
            if choice_enablers:
                # Ajouter chaque enabler dans sa propre catégorie selon le template
                for enabler in choice_enablers:
                    enabler_category = self.template.get_enabler_category(enabler)
                    if enabler not in enablers_by_category[enabler_category]:
                        enablers_by_category[enabler_category].append(enabler)
                phase2_enablers.extend(choice_enablers)
        # Mettre à jour la phase 2
        enablers_by_phase["phase2"] = list(set(phase2_enablers))
        print(f"DEBUG _calculate_enablers Phase 2: Final phase2_enablers = {enablers_by_phase['phase2']}")
        print(f"DEBUG _calculate_enablers Phase 2: enablers_by_category = {enablers_by_category}")

        # Phase 3 - Enabler choices (déjà organisés par catégorie)
        phase3_score = self.calculate_mot_score(3)
        phase3_enablers = []
        for category, choice_id in self.current_path.mot3_choices.items():
            # Récupérer les choix depuis le template
            choices_by_category = self.get_mot3_choices()
            if category in choices_by_category:
                choice_obj = None
                for choice in choices_by_category[category]:
                    if choice.id == choice_id:
                        choice_obj = choice
                        break

                if choice_obj:
                    choice_enablers = self._get_enablers_for_score(choice_obj, phase3_score)
                    if choice_enablers:
                        # Ajouter seulement les nouveaux ENABLERS pour éviter les doublons
                        for enabler in choice_enablers:
                            if enabler not in enablers_by_category[category]:
                                enablers_by_category[category].append(enabler)
                phase3_enablers.extend(choice_enablers)
        enablers_by_phase["phase3"] = list(set(phase3_enablers))

        # Phase 4 - Scaling enabler choices
        phase4_score = self.calculate_mot_score(4)
        phase4_enablers = []
        print(f"DEBUG _calculate_enablers Phase 4: mot4_choices = {self.current_path.mot4_choices}")
        print(f"DEBUG _calculate_enablers Phase 4: phase4_score = {phase4_score}")
        
        for choice_id in self.current_path.mot4_choices:
            print(f"DEBUG _calculate_enablers Phase 4: Processing choice '{choice_id}'")
            # Récupérer les choix depuis le template
            choices = self.get_mot4_choices()
            choice_dict = {choice.id: choice for choice in choices}
            
            if choice_id in choice_dict:
                choice_obj = choice_dict[choice_id]
                choice_enablers = self._get_enablers_for_score(choice_obj, phase4_score)
                print(f"DEBUG _calculate_enablers Phase 4: Choice '{choice_id}' unlocks {choice_enablers}")
                if choice_enablers:
                    # Ajouter chaque enabler dans sa propre catégorie selon le template
                    for enabler in choice_enablers:
                        enabler_category = self.template.get_enabler_category(enabler)
                        print(f"DEBUG _calculate_enablers Phase 4: Enabler '{enabler}' has category '{enabler_category}'")
                        if enabler not in enablers_by_category[enabler_category]:
                            enablers_by_category[enabler_category].append(enabler)
                            print(f"DEBUG _calculate_enablers Phase 4: Added '{enabler}' to category '{enabler_category}'")
                    phase4_enablers.extend(choice_enablers)
            else:
                print(f"DEBUG _calculate_enablers Phase 4: Choice '{choice_id}' not found in choice_dict")
        
        print(f"DEBUG _calculate_enablers Phase 4: Final phase4_enablers = {phase4_enablers}")
        enablers_by_phase["phase4"] = list(set(phase4_enablers))

        # Phase 5 - HR Deployment choice
        logger.info(f"Phase 5 DEBUG: mot5_choice={self.current_path.mot5_choice}")
        if self.current_path.mot5_choice:
            phase5_score = self.calculate_mot_score(5)
            phase_choices = self.template.get_phase_choices('phase5')
            choice_data = phase_choices.get(self.current_path.mot5_choice, {})
            choice_enablers = choice_data.get('enablers', [])
            
            logger.info(f"Phase 5: Choice '{self.current_path.mot5_choice}' unlocks {choice_enablers}")
            
            for enabler_id in choice_enablers:
                enabler_category = self.template.get_enabler_category(enabler_id)
                logger.info(f"Phase 5: Enabler '{enabler_id}' has category '{enabler_category}'")
                
                if enabler_id not in enablers_by_category[enabler_category]:
                    enablers_by_category[enabler_category].append(enabler_id)
                    logger.info(f"Phase 5: Added '{enabler_id}' to category '{enabler_category}'")
            
            logger.info(f"Phase 5: Final phase5_enablers = {choice_enablers}")
            enablers_by_phase["phase5"] = choice_enablers

        # Stocker les enablers débloqués par catégorie (sans doublons)
        for category in enablers_by_category:
            enablers_by_category[category] = list(set(enablers_by_category[category]))

        self.current_path.unlocked_enablers_by_category = enablers_by_category
        self.current_path.enablers_by_phase = enablers_by_phase

        # Garder aussi la liste globale pour compatibilité
        all_enablers = []
        for category_enablers in enablers_by_category.values():
            all_enablers.extend(category_enablers)
        self.current_path.unlocked_enablers = list(set(all_enablers))

        # Debug final
        logger.info(f"FINAL DEBUG: Total enablers={len(self.current_path.unlocked_enablers)}")
        logger.info(f"FINAL DEBUG: Enablers by category={enablers_by_category}")
        logger.info(f"FINAL DEBUG: Enablers by phase={enablers_by_phase}")
        logger.info(f"FINAL DEBUG: Current path mot1_choice={self.current_path.mot1_choice}")
        logger.info(f"FINAL DEBUG: Current path mot2_choices={self.current_path.mot2_choices}")
        logger.info(f"FINAL DEBUG: Current path mot3_choices={self.current_path.mot3_choices}")
        logger.info(f"FINAL DEBUG: Current path mot4_choices={self.current_path.mot4_choices}")

    def _get_enablers_for_score(self, choice: Choice, score: int) -> List[str]:
        """Retourne les ENABLERS débloqués selon le score obtenu"""
        enablers = []

        # Debug: afficher les informations du choix
        logger.info(f"Checking enablers for choice {choice.id} with score {score}")
        logger.info(f"Choice has unlocks_enablers: {choice.unlocks_enablers}")
        logger.info(f"Choice has enablers_1_star: {choice.enablers_1_star}")
        logger.info(f"Choice has enablers_2_stars: {choice.enablers_2_stars}")
        logger.info(f"Choice has enablers_3_stars: {choice.enablers_3_stars}")

        # Si le choix utilise l'ancien système (unlocks_enablers), on l'utilise pour tous les scores
        if choice.unlocks_enablers:
            logger.info(f"Using old system: returning {choice.unlocks_enablers}")
            return choice.unlocks_enablers

        # Nouveau système basé sur les scores
        if score >= 1 and choice.enablers_1_star:
            enablers.extend(choice.enablers_1_star)
            logger.info(f"Added 1-star enablers: {choice.enablers_1_star}")

        if score >= 2 and choice.enablers_2_stars:
            enablers.extend(choice.enablers_2_stars)
            logger.info(f"Added 2-star enablers: {choice.enablers_2_stars}")

        if score >= 3 and choice.enablers_3_stars:
            enablers.extend(choice.enablers_3_stars)
            logger.info(f"Added 3-star enablers: {choice.enablers_3_stars}")

        result = list(set(enablers))  # Supprimer les doublons
        logger.info(f"Final enablers for choice {choice.id}: {result}")
        return result

    def _get_choice_categories(self) -> Dict[str, str]:
        """Retourne le mapping des choix vers leurs catégories"""
        return {
            # Phase 1 - HR Approaches
            "amira": "transformation_change",      # Operational approach
            "james": "technology_partnerships", # Technology-first approach
            "elena": "transformation_change",    # Strategic approach

            # Phase 2 - HR Solutions
            "intelligent_recruitment": "technology_partnerships",
            "virtual_hr_assistant": "transformation_change",
            "training_optimization": "transformation_change",
            "sentiment_analysis": "policies_governance",
            "hr_automation": "transformation_change",

            # Phase 4 - Scaling enablers
            "reusable_api_patterns": "technology_partnerships",
            "industrial_data_pipelines": "technology_partnerships", 
            "privacy_by_design_data": "technology_partnerships",
            "talent_mobility_program": "transformation_change",
            "business_ai_champions": "transformation_change",
            "ai_storytelling_communication": "transformation_change",
            "adoption_playbook": "transformation_change",
            "clear_ownership_accountability": "policies_governance",
            "local_ai_risk_management": "policies_governance",
            "internal_mobility": "transformation_change",
            "data_collection_strategy": "technology_partnerships", # Corrected: data strategy is platform
            "ceo_video_series": "policies_governance", # Corrected: CEO communication is policies
            "change_management": "transformation_change",
            "business_sponsors": "transformation_change",

            # Phase 5 - HR Capabilities
            "genai_for_all": "transformation_change",
            "capability_building": "policies_governance", # Corrected: capability building is policies
            "people_speed": "technology_partnerships" # Corrected: people speed is platform
        }
    
    def get_results(self) -> Dict:
        """Retourne les résultats finaux"""
        return {
            "path": self.current_path,
            "score": self.current_path.total_score,
            "stars": self.current_path.stars,
            "scores": self.current_path.mot_scores,
            "total": self.current_path.total_score,
            "completed": True
        }
    
    def get_current_state(self) -> GameState:
        """Retourne l'état actuel du jeu"""
        return self.current_state
    
    def get_current_score(self) -> Dict:
        """Retourne le score actuel basé sur les choix faits"""
        scores = {}
        total = 0
        
        # Calculer les scores pour chaque MOT complété
        if self.current_path.mot1_choice:
            scores["mot1"] = self.calculate_mot_score(1)
            total += scores["mot1"]
        
        if self.current_path.mot2_choices:
            scores["mot2"] = self.calculate_mot_score(2)
            total += scores["mot2"]
        
        if self.current_path.mot3_choices:
            scores["mot3"] = self.calculate_mot_score(3)
            total += scores["mot3"]
        
        if self.current_path.mot4_choices:
            scores["mot4"] = self.calculate_mot_score(4)
            total += scores["mot4"]
        
        if self.current_path.mot5_choice:
            scores["mot5"] = self.calculate_mot_score(5)
            total += scores["mot5"]
        
        return {
            "scores": scores,
            "total": total,
            "max_possible": len(scores) * 3
        }
    
    def get_all_enablers_by_phase_and_category(self) -> Dict:
        """Retourne tous les ENABLERS possibles organisés par phase et par catégorie pour l'affichage pédagogique"""
        all_enablers = {
            "phase1": {
                "technology_partnerships": ["technical_foundation_setup", "genai_platform_partnership"],
                "policies_governance": ["strategic_vision_mapping", "hr_function_diagnostic"],
                "transformation_change": ["rapid_deployment", "bottom_up_innovation"]
            },
            "phase2": {
                "technology_partnerships": ["candidate_matching"],
                "policies_governance": ["sentiment_detection"],
                "transformation_change": ["employee_support", "personalized_training", "process_automation"]
            },
            "phase3": {
                "technology_partnerships": ["vendor_relationships", "system_connectivity", "cloud_migration"],
                "policies_governance": ["ethical_framework", "kpi_definition", "data_protection"],
                "transformation_change": ["hr_ai_competencies", "role_evolution", "change_communication"]
            },
            "phase4": {
                "technology_partnerships": ["api_connectivity", "data_pipeline_automation", "data_strategy"],
                "policies_governance": ["ethics_oversight", "risk_management", "leadership_communication"],
                "transformation_change": ["talent_retention", "change_adoption", "business_alignment"]
            },
            "phase5": {
                "technology_partnerships": [],
                "policies_governance": ["value_based_governance", "leadership_communication", "long_term_roadmap"],
                "transformation_change": ["organization_wide_ai", "rapid_deployment", "hr_ai_training_academy", "talent_recruitment", "genai_hub"]
            }
        }
        return all_enablers
    
    def save_path(self):
        """Sauvegarde le chemin actuel"""
        self.completed_paths.append(self.current_path)
        
        # Sauvegarder dans un fichier JSON
        with open("completed_paths.json", "w") as f:
            json.dump([path.__dict__ for path in self.completed_paths], f, indent=2)
    
    def get_statistics(self) -> Dict:
        """Retourne les statistiques des chemins complétés"""
        if not self.completed_paths:
            return {"total_paths": 0}
        
        total_paths = len(self.completed_paths)
        avg_score = sum(path.total_score for path in self.completed_paths) / total_paths
        star_distribution = {i: sum(1 for path in self.completed_paths if path.stars == i) for i in range(1, 4)}
        
        return {
            "total_paths": total_paths,
            "average_score": round(avg_score, 2),
            "star_distribution": star_distribution,
            "best_score": max(path.total_score for path in self.completed_paths),
            "worst_score": min(path.total_score for path in self.completed_paths)
        }

def main():
    """Fonction principale pour tester le jeu"""
    game = AIAccelerationGame()
    
    print("🎮 AI Acceleration EXEC - Version Recréée")
    print("=" * 50)
    
    # Login
    if game.login("BASIC_QUICK", "test_user"):
        print("✅ Login réussi!")
        
        # Introduction
        intro = game.start_game()
        print(intro)
        
        # MOT1
        print("\n📋 MOT 1 - Choix du Personnage:")
        choices = game.get_mot1_choices()
        for i, choice in enumerate(choices, 1):
            print(f"{i}. {choice.title}")
            print(f"   {choice.description}")
        
        # Simulation d'un choix
        game.make_mot1_choice("christelle")
        print(f"\n✅ Choix MOT1: {game.current_path.mot1_choice}")
        
        # MOT2
        print("\n📋 MOT 2 - Sélection Portfolio (3 parmi 5):")
        choices = game.get_mot2_choices()
        for i, choice in enumerate(choices, 1):
            print(f"{i}. {choice.title}")
        
        # Simulation d'un choix (positions 1, 3, 4)
        game.make_mot2_choices(["fraud_integrity_detection", "smart_game_design_assistant", "player_journey_optimizer"])
        print(f"\n✅ Choix MOT2: {game.current_path.mot2_choices}")
        
        # Continuer avec les autres MOTs...
        print("\n🎯 Le jeu est prêt! Vous pouvez maintenant l'intégrer dans votre interface web.")

if __name__ == "__main__":
    main()
