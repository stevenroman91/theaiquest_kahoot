#!/usr/bin/env python3
"""
AI Acceleration EXEC - Smart Retail Group HR Managers Edition
Adapté pour les managers RH du Smart Retail Group
"""

import logging
import json
from enum import Enum
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from user_manager import user_manager

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

class AIAccelerationGame:
    """Jeu AI Acceleration EXEC - Smart Retail Group HR Managers Edition"""
    
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
        
    def _initialize_game_data(self) -> Dict:
        """Initialise toutes les données du jeu pour Smart Retail Group HR Managers"""
        return {
            "mot1_hr_approaches": {
                "elena": Choice(
                    id="elena",
                    title="Elena - Strategic Approach",
                    description="Map the transformative potential of GenAI on our HR functions and its impact on our teams. Structured vision, priority identification, leadership engagement, clear prioritized plan.",
                    category="strategy",
                    unlocks_enablers=["strategic_planning", "leadership_alignment", "structured_vision"]
                ),
                "james": Choice(
                    id="james", 
                    title="James - Technical Approach",
                    description="Partnership with a GenAI platform to secure technical foundations. Solid infrastructure, technical support, exclusive conditions.",
                    category="tech",
                    unlocks_enablers=["tech_foundations", "platform_integration", "technical_support"]
                ),
                "amira": Choice(
                    id="amira",
                    title="Amira - Operational Approach", 
                    description="Democratize GenAI and ask HR managers to develop their own tools. Rapid deployment, bottom-up innovation, low initial cost.",
                    category="operational",
                    unlocks_enablers=["rapid_deployment", "bottom_up_innovation", "cost_efficiency"]
                )
            },
            
            "mot2_hr_solutions": {
                "intelligent_recruitment": Choice(
                    id="intelligent_recruitment", 
                    title="Intelligent Recruitment", 
                    description="Automatic candidate-job matching, CV analysis, performance prediction (integrated GenAI)",
                    unlocks_enablers=["candidate_matching", "cv_analysis", "performance_prediction"]
                ),
                "virtual_hr_assistant": Choice(
                    id="virtual_hr_assistant", 
                    title="Virtual HR Assistant", 
                    description="Intelligent chatbot to accompany employees 24/7 (integrated GenAI)",
                    unlocks_enablers=["employee_support", "24_7_assistance", "chatbot_intelligence"]
                ),
                "training_optimization": Choice(
                    id="training_optimization", 
                    title="Training Path Optimization", 
                    description="Personalized recommendations, need prediction (integrated GenAI)",
                    unlocks_enablers=["personalized_training", "need_prediction", "skill_development"]
                ),
                "sentiment_analysis": Choice(
                    id="sentiment_analysis", 
                    title="Employee Sentiment Analysis", 
                    description="Automatic detection of employee satisfaction via text analysis (integrated GenAI)",
                    unlocks_enablers=["sentiment_detection", "employee_satisfaction", "text_analysis"]
                ),
                "hr_automation": Choice(
                    id="hr_automation", 
                    title="HR Process Automation", 
                    description="Intelligent automation of repetitive HR processes (integrated GenAI)",
                    unlocks_enablers=["process_automation", "efficiency_gains", "repetitive_task_reduction"]
                )
            },
            
            "mot3_hr_facilitators": {
                "people_processes": {
                    "hr_ai_training": Choice(
                        id="hr_ai_training",
                        title="HR Team AI Training",
                        description="Comprehensive training program on AI and its HR applications",
                        category="people_processes",
                        unlocks_enablers=["hr_ai_competencies", "team_upskilling", "knowledge_transfer"]
                    ),
                    "hr_role_redefinition": Choice(
                        id="hr_role_redefinition",
                        title="HR Role Redefinition", 
                        description="Adaptation of job descriptions to integrate AI",
                        category="people_processes",
                        unlocks_enablers=["role_evolution", "job_design", "competency_mapping"]
                    ),
                    "cultural_change": Choice(
                        id="cultural_change",
                        title="Cultural Change", 
                        description="Communication campaign on AI",
                        category="people_processes",
                        unlocks_enablers=["change_communication", "cultural_transformation", "employee_engagement"]
                    )
                },
                "platform_partnerships": {
                    "system_integration": Choice(
                        id="system_integration",
                        title="Integration with existing HR systems",
                        description="Connection of AI solutions to current HR systems",
                        category="platform_partnerships",
                        unlocks_enablers=["system_connectivity", "data_integration", "workflow_seamlessness"]
                    ),
                    "tech_partnerships": Choice(
                        id="tech_partnerships",
                        title="Technology partnerships", 
                        description="Agreements with specialized AI suppliers",
                        category="platform_partnerships",
                        unlocks_enablers=["vendor_relationships", "technical_expertise", "innovation_access"]
                    ),
                    "cloud_infrastructure": Choice(
                        id="cloud_infrastructure",
                        title="Cloud infrastructure", 
                        description="Migration to cloud infrastructure",
                        category="platform_partnerships",
                        unlocks_enablers=["cloud_migration", "scalability", "infrastructure_flexibility"]
                    )
                },
                "policies_practices": {
                    "ai_ethics_charter": Choice(
                        id="ai_ethics_charter",
                        title="HR AI Ethics Charter",
                        description="Definition of ethical principles for HR AI",
                        category="policies_practices",
                        unlocks_enablers=["ethical_framework", "ai_governance", "responsible_ai"]
                    ),
                    "data_governance": Choice(
                        id="data_governance",
                        title="Data governance", 
                        description="Rules for HR data management and protection",
                        category="policies_practices",
                        unlocks_enablers=["data_protection", "compliance_framework", "privacy_management"]
                    ),
                    "performance_metrics": Choice(
                        id="performance_metrics",
                        title="Performance metrics", 
                        description="Definition of KPIs to measure AI impact",
                        category="policies_practices",
                        unlocks_enablers=["kpi_definition", "impact_measurement", "performance_tracking"]
                    )
                }
            },
            
            "mot4_hr_scaling_enablers": {
                "apis_hr_systems": Choice(
                    id="apis_hr_systems", 
                    title="APIs between internal and external HR systems", 
                    description="Improved data exchange between all HR systems", 
                    cost=5,
                    unlocks_enablers=["api_connectivity", "system_interoperability", "data_flow_optimization"]
                ),
                "tech_stack_data_pipelines": Choice(
                    id="tech_stack_data_pipelines", 
                    title="Technology stack for HR data pipelines", 
                    description="Industrialization of HR data pipelines", 
                    cost=10,
                    unlocks_enablers=["data_pipeline_automation", "industrialization", "scalable_infrastructure"]
                ),
                "ai_ethics_officer": Choice(
                    id="ai_ethics_officer", 
                    title="Appointment of HR AI Ethics Officer", 
                    description="Dedicated officer for HR AI ethics", 
                    cost=5,
                    unlocks_enablers=["ethics_oversight", "governance_structure", "responsible_leadership"]
                ),
                "risk_mitigation_plan": Choice(
                    id="risk_mitigation_plan", 
                    title="Country-specific risk mitigation plan", 
                    description="Risk management strategy by country", 
                    cost=5,
                    unlocks_enablers=["risk_management", "compliance_readiness", "geographic_adaptation"]
                ),
                "internal_mobility": Choice(
                    id="internal_mobility", 
                    title="Internal mobility program for HR AI talents", 
                    description="Development of internal AI talents", 
                    cost=5,
                    unlocks_enablers=["talent_retention", "skill_mobility", "internal_development"]
                ),
                "data_collection_strategy": Choice(
                    id="data_collection_strategy", 
                    title="Data collection strategy and synthetic HR data", 
                    description="Optimization of data collection and generation", 
                    cost=5,
                    unlocks_enablers=["data_strategy", "synthetic_data_generation", "data_quality"]
                ),
                "ceo_video_series": Choice(
                    id="ceo_video_series", 
                    title="CEO and leadership video series on HR AI", 
                    description="Leadership communication on HR AI", 
                    cost=5,
                    unlocks_enablers=["leadership_communication", "change_narrative", "executive_sponsorship"]
                ),
                "change_management": Choice(
                    id="change_management", 
                    title="Change management to boost adoption", 
                    description="Comprehensive change management program", 
                    cost=10,
                    unlocks_enablers=["change_adoption", "user_engagement", "transformation_support"]
                ),
                "business_sponsors": Choice(
                    id="business_sponsors", 
                    title="Business sponsors responsible for value delivery", 
                    description="Business owners for AI solution value", 
                    cost=5,
                    unlocks_enablers=["business_alignment", "value_delivery", "stakeholder_engagement"]
                )
            },
            
            "mot5_hr_deployment_choices": {
                "genai_for_all": Choice(
                    id="genai_for_all",
                    title="GenAI for all",
                    description="GenAI initiative as a service, Corporate communication of HR AI ethics policies. Rapid deployment, clear communication. But lack of structure, little skill development.",
                    unlocks_enablers=["organization_wide_ai", "rapid_deployment", "corporate_communication", "ethics_policies"]
                ),
                "capability_building": Choice(
                    id="capability_building", 
                    title="Continuous capability building",
                    description="Definition of long-term HR AI ethics roadmap, Value-based AI governance, Preferred supplier panel, creation of HR AI training Academy. Solid structure, clear governance, training. But less focus on people, more technical approach.",
                    unlocks_enablers=["long_term_roadmap", "value_based_governance", "supplier_panel", "training_academy", "structured_approach"]
                ),
                "people_speed": Choice(
                    id="people_speed",
                    title="Full speed on people",
                    description="New GenAI HR Hub, Preferred supplier panel, Investment in recruiting top AI talents and retaining analytics expertise, Creation of HR AI training Academy. Focus on skills, talent recruitment, continuous training. But higher initial investment.",
                    unlocks_enablers=["genai_hub", "talent_recruitment", "analytics_expertise", "continuous_training", "people_focus"]
                )
            }
        }
    
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
        🎯 Welcome to AI Acceleration EXEC - Smart Retail Group HR Managers Edition
        
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
            'intelligent_recruitment': 1,    # Position 1
            'virtual_hr_assistant': 2,        # Position 2  
            'training_optimization': 3,      # Position 3
            'sentiment_analysis': 4,         # Position 4
            'hr_automation': 5               # Position 5
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
        
        return True
    
    def get_mot3_choices(self) -> Dict[str, List[Choice]]:
        """Retourne les choix disponibles pour MOT3 par catégorie"""
        return self.game_data["mot3_hr_facilitators"]
    
    def make_mot3_choices(self, choices: Dict[str, str]) -> bool:
        """Effectue les choix MOT3 (1 par catégorie)"""
        required_categories = ["people_processes", "platform_partnerships", "policies_practices"]
        
        if set(choices.keys()) != set(required_categories):
            return False
            
        # Vérifier que chaque choix existe dans sa catégorie
        for category, choice_id in choices.items():
            if choice_id not in self.game_data["mot3_hr_facilitators"][category]:
                return False
        
        self.current_path.mot3_choices = choices
        self.current_state = GameState.MOT4
        mot3_score = self.calculate_mot_score(3)
        logger.info(f"MOT3 choices made: {choices} - Score: {mot3_score}/3")
        return True
    
    def get_mot4_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT4"""
        return list(self.game_data["mot4_hr_scaling_enablers"].values())
    
    def make_mot4_choices(self, enabler_ids: List[str]) -> bool:
        """Effectue les choix MOT4 (budget entre 1 et 30 points)"""
        total_cost = 0
        valid_enablers = []
        
        for enabler_id in enabler_ids:
            if enabler_id in self.game_data["mot4_hr_scaling_enablers"]:
                cost = self.game_data["mot4_hr_scaling_enablers"][enabler_id].cost
                total_cost += cost
                valid_enablers.append(enabler_id)
        
        if 1 <= total_cost <= 30 and len(valid_enablers) == len(enabler_ids):
            self.current_path.mot4_choices = valid_enablers
            self.current_state = GameState.MOT5
            mot4_score = self.calculate_mot_score(4)
            logger.info(f"MOT4 choices made: {valid_enablers} (total: {total_cost} points) - Score: {mot4_score}/3")
            return True
        
        logger.warning(f"MOT4 invalid: {enabler_ids} = {total_cost} points (need between 1 and 30)")
        return False
    
    def get_mot5_choices(self) -> List[Choice]:
        """Retourne les choix disponibles pour MOT5"""
        return list(self.game_data["mot5_hr_deployment_choices"].values())
    
    def make_mot5_choice(self, choice_id: str) -> bool:
        """Effectue le choix MOT5"""
        if choice_id in self.game_data["mot5_hr_deployment_choices"]:
            self.current_path.mot5_choice = choice_id
            self.current_state = GameState.RESULTS
            mot5_score = self.calculate_mot_score(5)
            self._calculate_final_score()
            logger.info(f"MOT5 choice made: {choice_id} - Score: {mot5_score}/3")
            return True
        return False
    
    def calculate_mot_score(self, mot_number: int) -> int:
        """Calcule le score pour un MOT spécifique (1-3 étoiles) - Version HR Managers"""
        if mot_number == 1:
            # MOT1: Elena=3, James=2, Amira=1
            mot1_scores = {"elena": 3, "james": 2, "amira": 1}
            return mot1_scores.get(self.current_path.mot1_choice, 0)
        
        elif mot_number == 2:
            # MOT2: Positions optimales = 1, 3, 4 (intelligent_recruitment, training_optimization, sentiment_analysis)
            choice_to_matrix_position = {
                'intelligent_recruitment': 1,    # Position 1
                'virtual_hr_assistant': 2,        # Position 2  
                'training_optimization': 3,      # Position 3
                'sentiment_analysis': 4,         # Position 4
                'hr_automation': 5               # Position 5
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
            # MOT3: HR Team Training + Technology Partnerships + Performance Metrics = 3/3
            optimal_choices = {
                "people_processes": "hr_ai_training",
                "platform_partnerships": "tech_partnerships", 
                "policies_practices": "performance_metrics"
            }
            matches = 0
            for category, optimal_choice in optimal_choices.items():
                if self.current_path.mot3_choices.get(category) == optimal_choice:
                    matches += 1
            
            if matches >= 3:
                return 3
            elif matches == 2:
                return 2
            else:
                return 1
        
        elif mot_number == 4:
            # MOT4: Change Management + Technology Stack + Risk Mitigation + Business Sponsors = 3/3
            optimal_enablers = {"change_management", "tech_stack_data_pipelines", "risk_mitigation_plan", "business_sponsors"}
            selected_enablers = set(self.current_path.mot4_choices)
            matches = len(optimal_enablers.intersection(selected_enablers))
            
            if matches >= 4:
                return 3
            elif matches >= 2:
                return 2
            else:
                return 1
        
        elif mot_number == 5:
            # MOT5: people_speed=3, capability_building=2, genai_for_all=1
            mot5_scores = {"people_speed": 3, "capability_building": 2, "genai_for_all": 1}
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
        """Calcule les ENABLERS débloqués par les choix"""
        unlocked_enablers = []
        
        # MOT1 - HR Approach choice
        if self.current_path.mot1_choice:
            choice = self.game_data["mot1_hr_approaches"][self.current_path.mot1_choice]
            if choice.unlocks_enablers:
                unlocked_enablers.extend(choice.unlocks_enablers)
        
        # MOT2 - HR Solution choices
        for solution_id in self.current_path.mot2_choices:
            choice = self.game_data["mot2_hr_solutions"][solution_id]
            if choice.unlocks_enablers:
                unlocked_enablers.extend(choice.unlocks_enablers)
        
        # MOT3 - HR Facilitator choices
        for category, choice_id in self.current_path.mot3_choices.items():
            choice = self.game_data["mot3_hr_facilitators"][category][choice_id]
            if choice.unlocks_enablers:
                unlocked_enablers.extend(choice.unlocks_enablers)
        
        # MOT4 - HR Scaling choices
        for scaling_id in self.current_path.mot4_choices:
            choice = self.game_data["mot4_hr_scaling_enablers"][scaling_id]
            if choice.unlocks_enablers:
                unlocked_enablers.extend(choice.unlocks_enablers)
        
        # MOT5 - HR Deployment choice
        if self.current_path.mot5_choice:
            choice = self.game_data["mot5_hr_deployment_choices"][self.current_path.mot5_choice]
            if choice.unlocks_enablers:
                unlocked_enablers.extend(choice.unlocks_enablers)
        
        self.current_path.unlocked_enablers = list(set(unlocked_enablers))  # Remove duplicates
    
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
        game.make_mot2_choices(["intelligent_recruitment", "training_optimization", "sentiment_analysis"])
        print(f"\n✅ Choix MOT2: {game.current_path.mot2_choices}")
        
        # Continuer avec les autres MOTs...
        print("\n🎯 Le jeu est prêt! Vous pouvez maintenant l'intégrer dans votre interface web.")

if __name__ == "__main__":
    main()
