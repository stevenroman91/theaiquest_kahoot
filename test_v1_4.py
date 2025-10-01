#!/usr/bin/env python3
"""
Test script pour la version 1.4 - Vérification de l'écran de récapitulatif du score global
"""

import sys
import os
import time
import subprocess
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

def test_version_1_4():
    """Test complet de la version 1.4"""
    print("🧪 Test de la version 1.4 - Écran de récapitulatif du score global")
    print("=" * 70)
    
    # Vérifier que le serveur est lancé
    if not check_server_running():
        print("❌ Le serveur n'est pas lancé. Veuillez lancer 'python start_game.py' d'abord.")
        return False
    
    # Test avec Selenium
    success = test_with_selenium()
    
    if success:
        print("✅ Tous les tests sont passés ! La version 1.4 fonctionne correctement.")
    else:
        print("❌ Certains tests ont échoué.")
    
    return success

def check_server_running():
    """Vérifier que le serveur Flask est lancé"""
    try:
        response = requests.get("http://localhost:5001", timeout=5)
        return response.status_code == 200
    except:
        return False

def test_with_selenium():
    """Test avec Selenium pour vérifier l'interface utilisateur"""
    print("\n🔍 Test de l'interface utilisateur avec Selenium...")
    
    # Configuration Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Mode sans interface
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.get("http://localhost:5001")
        
        # Test 1: Vérifier que la page se charge
        print("  ✓ Test 1: Chargement de la page")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login-form"))
        )
        
        # Test 2: Login
        print("  ✓ Test 2: Connexion")
        username_input = driver.find_element(By.ID, "username")
        username_input.send_keys("test_user_v1_4")
        
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()
        
        # Attendre que la vidéo d'introduction se charge
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "video-intro-section"))
        )
        
        # Test 3: Passer la vidéo d'introduction
        print("  ✓ Test 3: Passage de la vidéo d'introduction")
        skip_video_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "skip-video-btn"))
        )
        skip_video_btn.click()
        
        # Attendre la vidéo harnessing
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "harnessing-video-section"))
        )
        
        # Test 4: Passer la vidéo harnessing
        print("  ✓ Test 4: Passage de la vidéo harnessing")
        skip_harnessing_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "skip-harnessing-btn"))
        )
        skip_harnessing_btn.click()
        
        # Attendre la vidéo MOT1
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "mot1-video-section"))
        )
        
        # Test 5: Passer la vidéo MOT1
        print("  ✓ Test 5: Passage de la vidéo MOT1")
        continue_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "continue-after-mot1-video-btn"))
        )
        continue_btn.click()
        
        # Attendre les choix MOT1
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "mot1-section"))
        )
        
        # Test 6: Faire un choix MOT1
        print("  ✓ Test 6: Choix MOT1")
        choice_buttons = driver.find_elements(By.CSS_SELECTOR, "#mot1-choices .btn")
        if choice_buttons:
            choice_buttons[0].click()
        
        # Attendre l'écran de score MOT1
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "scoreModal"))
        )
        
        # Test 7: Vérifier l'écran de score MOT1
        print("  ✓ Test 7: Écran de score MOT1")
        score_modal = driver.find_element(By.ID, "scoreModal")
        assert score_modal.is_displayed(), "L'écran de score MOT1 devrait être visible"
        
        # Attendre l'écran de récapitulatif global (nouveau en v1.4)
        print("  ✓ Test 8: Écran de récapitulatif global (NOUVEAU v1.4)")
        global_recap_modal = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "globalScoreRecapModal"))
        )
        
        # Vérifier les éléments de l'écran de récapitulatif
        global_score_total = driver.find_element(By.ID, "global-score-total")
        assert global_score_total.is_displayed(), "Le score global devrait être affiché"
        
        global_score_breakdown = driver.find_element(By.ID, "global-score-breakdown")
        assert global_score_breakdown.is_displayed(), "Le détail des scores devrait être affiché"
        
        global_progress_bar = driver.find_element(By.ID, "global-progress-bar")
        assert global_progress_bar.is_displayed(), "La barre de progression devrait être affichée"
        
        global_mot_squares = driver.find_element(By.ID, "global-mot-squares")
        assert global_mot_squares.is_displayed(), "Les carrés de statut des MOTs devraient être affichés"
        
        countdown_timer = driver.find_element(By.ID, "countdown-timer")
        assert countdown_timer.is_displayed(), "Le compte à rebours devrait être affiché"
        
        print("    ✅ Tous les éléments de l'écran de récapitulatif sont présents")
        
        # Attendre que l'écran de récapitulatif se ferme automatiquement
        WebDriverWait(driver, 10).until(
            EC.invisibility_of_element_located((By.ID, "globalScoreRecapModal"))
        )
        
        # Test 9: Vérifier le passage au MOT2
        print("  ✓ Test 9: Passage automatique au MOT2")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "mot2-section"))
        )
        
        print("    ✅ Le passage automatique au MOT2 fonctionne")
        
        driver.quit()
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur lors du test Selenium: {e}")
        driver.quit()
        return False

def test_api_endpoints():
    """Test des endpoints API"""
    print("\n🔍 Test des endpoints API...")
    
    base_url = "http://localhost:5001"
    
    try:
        # Test login
        login_response = requests.post(f"{base_url}/api/login", 
                                     json={"code": "BASIC_QUICK", "username": "test_api"})
        assert login_response.status_code == 200, "Login API devrait fonctionner"
        print("  ✓ API Login fonctionne")
        
        # Test start game
        start_response = requests.post(f"{base_url}/api/start_game")
        assert start_response.status_code == 200, "Start game API devrait fonctionner"
        print("  ✓ API Start game fonctionne")
        
        # Test MOT1 choices
        mot1_response = requests.get(f"{base_url}/api/mot1/choices")
        assert mot1_response.status_code == 200, "MOT1 choices API devrait fonctionner"
        print("  ✓ API MOT1 choices fonctionne")
        
        # Test MOT1 choice
        mot1_choice_response = requests.post(f"{base_url}/api/mot1/choose",
                                           json={"character_id": "christelle"})
        assert mot1_choice_response.status_code == 200, "MOT1 choose API devrait fonctionner"
        print("  ✓ API MOT1 choose fonctionne")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur lors du test API: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Démarrage des tests de la version 1.4")
    print("=" * 70)
    
    # Test des endpoints API
    api_success = test_api_endpoints()
    
    # Test de l'interface utilisateur
    ui_success = test_with_selenium()
    
    # Résumé des tests
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 70)
    print(f"API Endpoints: {'✅ PASSÉ' if api_success else '❌ ÉCHOUÉ'}")
    print(f"Interface Utilisateur: {'✅ PASSÉ' if ui_success else '❌ ÉCHOUÉ'}")
    
    if api_success and ui_success:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS !")
        print("La version 1.4 avec l'écran de récapitulatif du score global fonctionne correctement.")
        return 0
    else:
        print("\n❌ CERTAINS TESTS ONT ÉCHOUÉ")
        return 1

if __name__ == "__main__":
    sys.exit(main())
