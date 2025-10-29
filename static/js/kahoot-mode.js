// Kahoot Mode - Simplified Game Flow
// This file adds Kahoot-specific features: simple login, direct step flow, leaderboard

class KahootMode {
    constructor() {
        this.isKahootMode = true;
        this.init();
    }

    init() {
        console.log('🎮 Kahoot Mode initialized');
        this.initializeEventListeners();
        this.setupLeaderboardButtons();
    }

    initializeEventListeners() {
        // Setup mode toggle buttons
        const playerModeBtn = document.getElementById('player-mode-btn');
        const adminModeBtn = document.getElementById('admin-mode-btn');
        
        if (playerModeBtn && adminModeBtn) {
            playerModeBtn.addEventListener('click', () => this.switchToPlayerMode());
            adminModeBtn.addEventListener('click', () => this.switchToAdminMode());
        }

        // Hook login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const isAdminMode = adminModeBtn && adminModeBtn.classList.contains('active');
                if (isAdminMode) {
                    await this.handleAdminLogin();
                } else {
                    await this.handleKahootLogin();
                }
            });
        }
    }

    switchToPlayerMode() {
        const playerModeBtn = document.getElementById('player-mode-btn');
        const adminModeBtn = document.getElementById('admin-mode-btn');
        const playerFields = document.getElementById('player-mode-fields');
        const adminFields = document.getElementById('admin-mode-fields');
        const loginBtnText = document.getElementById('login-btn-text-content');

        if (playerModeBtn) playerModeBtn.classList.add('active');
        if (adminModeBtn) adminModeBtn.classList.remove('active');
        if (playerFields) playerFields.style.display = 'block';
        if (adminFields) adminFields.style.display = 'none';
        if (loginBtnText) loginBtnText.textContent = 'Start Game';
        
        // Reset form validation
        const form = document.getElementById('login-form');
        if (form) form.reset();
    }

    switchToAdminMode() {
        const playerModeBtn = document.getElementById('player-mode-btn');
        const adminModeBtn = document.getElementById('admin-mode-btn');
        const playerFields = document.getElementById('player-mode-fields');
        const adminFields = document.getElementById('admin-mode-fields');
        const loginBtnText = document.getElementById('login-btn-text-content');

        if (adminModeBtn) adminModeBtn.classList.add('active');
        if (playerModeBtn) playerModeBtn.classList.remove('active');
        if (playerFields) playerFields.style.display = 'none';
        if (adminFields) adminFields.style.display = 'block';
        if (loginBtnText) loginBtnText.textContent = 'Login Admin';
        
        // Reset form validation
        const form = document.getElementById('login-form');
        if (form) form.reset();
    }

    async handleAdminLogin() {
        const username = document.getElementById('admin-username');
        const password = document.getElementById('admin-password');
        const loginBtn = document.getElementById('login-submit-btn');
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtnLoading = document.getElementById('login-btn-loading');

        if (!username || !password) {
            this.showLoginAlert('Erreur: champs manquants', 'danger');
            return;
        }

        const usernameValue = username.value.trim();
        const passwordValue = password.value;

        // Validation
        if (!usernameValue || usernameValue.length < 2) {
            this.showLoginAlert('Username must be at least 2 characters', 'danger');
            return;
        }

        if (!passwordValue || passwordValue.length < 6) {
            this.showLoginAlert('Password must be at least 6 characters', 'danger');
            return;
        }

        // Show loading
        loginBtn.disabled = true;
        loginBtnText.style.display = 'none';
        loginBtnLoading.style.display = 'inline';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: usernameValue,
                    password: passwordValue
                    // Pas de session_code pour admin
                })
            });

            const data = await response.json();

            if (!data.success) {
                // Afficher l'erreur
                this.showLoginAlert(data.message || 'Erreur de connexion', 'danger');
                loginBtn.disabled = false;
                loginBtnText.style.display = 'inline';
                loginBtnLoading.style.display = 'none';
                return;
            }

            if (data.success) {
                console.log('✅ Admin login successful:', data);
                
                // Store username
                if (data.user_info && data.user_info.username) {
                    this.setCurrentUsername(data.user_info.username);
                }
                
                // Admin ne joue pas, il gère juste les sessions
                // Afficher directement le panneau admin sans recharger
                if (data.user_info && (data.user_info.role === 'admin' || data.user_info.role === 'trainer')) {
                    // Hide login section
                    const loginSection = document.getElementById('login-section');
                    if (loginSection) {
                        loginSection.style.display = 'none';
                    }
                    
                    // Show admin section
                    const adminSection = document.getElementById('admin-section');
                    if (adminSection) {
                        adminSection.style.display = 'block';
                        console.log('✅ Admin panel displayed');
                        
                        // Réinitialiser le panneau admin pour s'assurer que les event listeners sont bien attachés
                        if (window.adminPanel) {
                            window.adminPanel.setupEventListeners();
                        } else if (window.AdminPanel) {
                            window.adminPanel = new window.AdminPanel();
                        }
                    } else {
                        console.error('Admin section not found, reloading page');
                        window.location.reload();
                    }
                } else {
                    // Non-admin: reload for normal flow
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Admin login error:', error);
            this.showLoginAlert('Erreur de connexion au serveur', 'danger');
            loginBtn.disabled = false;
            loginBtnText.style.display = 'inline';
            loginBtnLoading.style.display = 'none';
        }
    }

    async handleKahootLogin() {
        const sessionCodeInput = document.getElementById('session-code');
        const usernameInput = document.getElementById('username');
        const loginBtn = document.getElementById('login-submit-btn');
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtnLoading = document.getElementById('login-btn-loading');
        
        if (!sessionCodeInput || !usernameInput) {
            this.showLoginAlert('Erreur: champs manquants', 'danger');
            return;
        }
        
        // Get and validate session code (obligatoire pour joueurs)
        let sessionCode = sessionCodeInput.value.trim().toUpperCase();
        const username = usernameInput.value.trim();
        
        // Validation
        if (!sessionCode || sessionCode.length !== 6) {
            this.showLoginAlert('Code de session requis (6 caractères)', 'danger');
            sessionCodeInput.focus();
            return;
        }
        
        if (!username || username.length < 2) {
            this.showLoginAlert('Username must be at least 2 characters', 'danger');
            return;
        }

        // Show loading
        loginBtn.disabled = true;
        loginBtnText.style.display = 'none';
        loginBtnLoading.style.display = 'inline';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    session_code: sessionCode,
                    username: username
                    // Pas de password en mode joueur
                })
            });

            const data = await response.json();

            if (!data.success) {
                // Afficher l'erreur
                this.showLoginAlert(data.message || 'Erreur de connexion', 'danger');
                loginBtn.disabled = false;
                loginBtnText.style.display = 'inline';
                loginBtnLoading.style.display = 'none';
                return;
            }

            if (data.success) {
                console.log('✅ Login successful:', data);
                
                // Store username and session code
                if (data.user_info && data.user_info.username) {
                    this.setCurrentUsername(data.user_info.username);
                }
                if (data.session_code) {
                    console.log('📋 Session code:', data.session_code);
                }
                
                // Hide login section and all intro sections
                document.getElementById('login-section').style.display = 'none';
                
                // Remove all video/intro sections completely in Kahoot mode
                const sectionsToRemove = [
                    'video-intro-section',
                    'game-intro',
                    'welcome-section',
                    'teams-meeting-section',
                    'harnessing-video-section',
                    'step1-followup-section',
                    'phase1-video-section',
                    'phase2-video-section',
                    'phase3-video-section',
                    'phase4-video-section',
                    'phase5-1-video-section',
                    'phase5-2-video-section',
                    'recap-video-section'
                ];
                sectionsToRemove.forEach(sectionId => {
                    const el = document.getElementById(sectionId);
                    if (el) {
                        // Remove the entire section from DOM
                        el.remove();
                    }
                });
                
                // Also remove any remaining video elements on the page
                document.querySelectorAll('video').forEach(video => {
                    video.remove();
                });
                
                // Start game directly to Step 1 (skip all videos/intro)
                // In Kahoot mode, we want to go directly to Step 1 choices
                
                // Définir d'abord les fonctions helper (avant de les utiliser)
                
                // Supprimé loadPhase1ChoicesDirectly - on utilise uniquement GameController.loadMOT1Choices()
                // qui gère à la fois le chargement de l'API et le rendu complet avec les photos
                
                // Helper function pour rendre les choix avec le RENDU COMPLET (comme GameController.renderMOT1Choices)
                // Copie de la logique de game.js pour garantir le même rendu visuel
                const renderMOT1ChoicesFull = (choices) => {
                    const container = document.getElementById('phase1-choices');
                    if (!container) {
                        console.error('❌ phase1-choices container not found');
                        return;
                    }
                    
                    container.innerHTML = '';

                    // Define choice details based on the template (copié de game.js)
                    const choiceDetails = {
                        'elena': {
                            enablers: [
                                { id: 'ai_value_opportunities_gaming', icon: 'fas fa-chart-line', label: 'AI Value Opportunities in gaming', category: 'gover' },
                                { id: 'ai_tech_benchmark', icon: 'fas fa-search', label: 'AI Tech benchmark', category: 'technology' }
                            ]
                        },
                        'james': {
                            enablers: [
                                { id: 'sourcing_ai_tech', icon: 'fas fa-shopping-cart', label: 'Sourcing of an AI-tech Platform', category: 'technology' },
                                { id: 'bulk_data_migration', icon: 'fas fa-exchange-alt', label: 'Bulk Data Migration', category: 'technology' }
                            ]
                        },
                        'amira': {
                            use_cases: [
                                { id: 'automated_banners_generation', icon: 'fas fa-image', label: 'Automated Banners\nGeneration' },
                                { id: 'customer_email_classifier', icon: 'fas fa-envelope', label: 'Customer Email\nClassifier' },
                                { id: 'virtual_learning_coach_prototype', icon: 'fas fa-graduation-cap', label: 'Virtual Learning\nCoach Prototype' },
                                { id: 'supplier_risk_scoring', icon: 'fas fa-shield-alt', label: 'Supplier Risk\nScoring' },
                                { id: 'simulated_game_design', icon: 'fas fa-gamepad', label: 'Simulated Game\nDesign' },
                                { id: 'predictive_maintenance_sandbox', icon: 'fas fa-tools', label: 'Predictive Maintenance\nSandbox' }
                            ]
                        }
                    };
                    
                    // Reorder choices: Amira, Elena, James
                    const reorderedChoices = [];
                    const order = ['amira', 'elena', 'james'];
                    
                    order.forEach(id => {
                        const choice = choices.find(c => c.id === id);
                        if (choice) {
                            reorderedChoices.push(choice);
                        }
                    });
                    
                    reorderedChoices.forEach((choice, index) => {
                        const columnDiv = document.createElement('div');
                        columnDiv.className = 'col-md-4 col-sm-12';
                        
                        // Simplified: removed all enablers, use_cases, and description content generation
                        // Only photo and title will be displayed
                        
                        // Simplified for mobile: only photo and title (supprime enablers, use cases, descriptions)
                        const characterPhotos = {
                            'elena': '/static/images/Elena_photo.png',
                            'james': '/static/images/James_photo.png',
                            'amira': '/static/images/Amira_photo.png'
                        };
                        
                        const choiceTitles = {
                            'elena': 'Map where AI creates the most value and align with company culture',
                            'james': 'Build strong foundations: secure data, tools, and architecture first',
                            'amira': 'Act fast - democratize AI, let teams experiment immediately'
                        };
                        
                        const photo = characterPhotos[choice.id] || '';
                        const title = choiceTitles[choice.id] || choice.title;
                        
                        // Créer l'élément choice-column
                        const choiceColumn = document.createElement('div');
                        choiceColumn.className = 'choice-column';
                        choiceColumn.dataset.choiceId = choice.id;
                        
                        // Ajouter l'event listener pour la sélection
                        choiceColumn.addEventListener('click', () => {
                            handleChoiceSelection(choice.id);
                        });
                        
                        choiceColumn.innerHTML = `
                            <div class="choice-header text-center">
                                ${photo ? `<img src="${photo}" alt="${choice.id}" class="character-photo mb-3" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--fdj-blue-primary); display: block; margin: 0 auto;">` : ''}
                                <h4 class="choice-title" style="font-weight: 700; color: var(--fdj-blue-primary);">${title}</h4>
                            </div>
                        `;
                        
                        columnDiv.appendChild(choiceColumn);
                        container.appendChild(columnDiv);
                    });
                    
                    console.log(`✅ Rendered ${choices.length} choices with FULL VISUAL (photos, enablers, use cases)`);
                };
                
                // Helper function pour gérer la sélection d'un choix
                const handleChoiceSelection = (choiceId) => {
                    console.log('🔘 Choice selected:', choiceId);
                    
                    // Retirer la sélection de toutes les colonnes
                    document.querySelectorAll('.choice-column').forEach(column => {
                        column.classList.remove('selected');
                    });
                    
                    // Ajouter la sélection à la colonne cliquée
                    const selectedColumn = document.querySelector(`[data-choice-id="${choiceId}"]`);
                    if (selectedColumn) {
                        selectedColumn.classList.add('selected');
                    }
                    
                    // Activer le bouton "Confirm Selection"
                    const confirmBtn = document.getElementById('phase1-confirm-btn');
                    if (confirmBtn) {
                        confirmBtn.disabled = false;
                        confirmBtn.classList.remove('btn-secondary');
                        confirmBtn.classList.add('btn-primary');
                        
                        // Stocker le choix sélectionné pour la confirmation
                        confirmBtn.dataset.selectedChoice = choiceId;
                    }
                    
                    // Si GameController est disponible, utiliser sa méthode aussi
                    if (window.gameController && window.gameController.selectPhase1Choice) {
                        window.gameController.selectPhase1Choice(choiceId);
                    }
                };
                
                // Setup confirm button listener after choices are rendered
                const setupConfirmButton = () => {
                    const confirmBtn = document.getElementById('phase1-confirm-btn');
                    if (confirmBtn) {
                        // Remove existing listeners by cloning
                        const newConfirmBtn = confirmBtn.cloneNode(true);
                        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                        
                        // Add new listener
                        newConfirmBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            const choiceId = newConfirmBtn.dataset.selectedChoice;
                            if (choiceId) {
                                confirmPhase1Choice(choiceId);
                            } else {
                                // Try to find selected choice manually
                                const selectedColumn = document.querySelector('.choice-column.selected');
                                if (selectedColumn && selectedColumn.dataset.choiceId) {
                                    confirmPhase1Choice(selectedColumn.dataset.choiceId);
                                } else {
                                    alert('Veuillez sélectionner un choix avant de confirmer');
                                }
                            }
                        });
                    }
                };
                
                // Setup confirm button after a short delay to ensure it exists
                setTimeout(setupConfirmButton, 200);
                
                // Helper function pour confirmer le choix Phase 1
                const confirmPhase1Choice = (choiceId) => {
                    fetch('/api/phase1/choose', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ character_id: choiceId })  // API attend 'character_id', pas 'choice_id'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            console.log('✅ Phase 1 choice confirmed:', choiceId);
                            console.log('📊 Score data received:', data);
                            
                            // Aller à l'écran de score
                            if (window.gameController && window.gameController.showScoreScreen) {
                                // Utiliser showScoreScreen si disponible (avec les bons paramètres)
                                const score = data.score || data.score_info || {};
                                const mot1Score = score.scores ? score.scores.mot1 : (score.mot1 || 0);
                                // Ajouter le choix au scoreData pour l'affichage
                                score.choice = choiceId;
                                window.gameController.showScoreScreen(1, mot1Score, score);
                            } else if (window.gameController && window.gameController.showScore) {
                                const scoreData = data.score || data.score_info || {};
                                scoreData.choice = choiceId;
                                window.gameController.showScore(scoreData);
                            } else {
                                // Fallback : afficher l'écran de score manuellement sans recharger
                                showScoreScreenManuallyLocal(1, data);
                            }
                        } else {
                            console.error('❌ Error confirming choice:', data.message);
                            alert('Erreur lors de la confirmation du choix: ' + data.message);
                        }
                    })
                    .catch(err => {
                        console.error('Error confirming choice:', err);
                        alert('Erreur de connexion');
                    });
                };
                
                // Helper function to show Step 1 directly
                const showPhase1Directly = () => {
                    const phase1Section = document.getElementById('phase1-section');
                    if (phase1Section) {
                        phase1Section.style.display = 'block';
                        console.log('✅ Showing Step 1 section directly (fallback)');
                        
                        // Essayer d'utiliser GameController une dernière fois
                        if (window.gameController && window.gameController.loadMOT1Choices) {
                            window.gameController.loadMOT1Choices();
                        } else {
                            // En dernier recours, charger les choix et utiliser le rendu complet
                            fetch('/api/phase1/choices', {
                                credentials: 'include'
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success && data.choices) {
                                    renderMOT1ChoicesFull(data.choices);
                                }
                            })
                            .catch(err => console.error('Error loading choices:', err));
                        }
                    } else {
                        console.error('❌ Phase 1 section not found in DOM');
                    }
                };
                
                // Helper function pour afficher l'écran de score manuellement (fallback si GameController n'est pas disponible)
                // Note: Cette fonction est aussi définie au niveau global ci-dessous pour être accessible partout
                const showScoreScreenManuallyLocal = (phaseNumber, apiData) => {
                    console.log('📊 Showing score screen manually for phase', phaseNumber, apiData);
                    
                    const scoreData = apiData.score || apiData.score_info || {};
                    const mot1Score = scoreData.scores ? scoreData.scores.mot1 : (scoreData.mot1 || 0);
                    
                    // Cacher la section phase1
                    const phase1Section = document.getElementById('phase1-section');
                    if (phase1Section) {
                        phase1Section.style.display = 'none';
                    }
                    
                    // Chercher le modal de score et le remplir
                    const scoreModal = document.getElementById('scoreModal');
                    if (scoreModal) {
                        // Remplir les données du score
                        const scoreTitle = scoreModal.querySelector('#score-phase-title');
                        const scoreValue = scoreModal.querySelector('#score-value');
                        const scoreDescription = scoreModal.querySelector('#score-description');
                        const starsContainer = scoreModal.querySelector('#score-stars-container');
                        
                        if (scoreTitle) {
                            scoreTitle.textContent = `Step ${phaseNumber}`;
                        }
                        if (scoreValue) {
                            scoreValue.textContent = `${mot1Score}/3`;
                        }
                        
                        // Générer les étoiles visuelles
                        if (starsContainer) {
                            starsContainer.innerHTML = '';
                            for (let i = 1; i <= 3; i++) {
                                const star = document.createElement('span');
                                star.className = 'score-star';
                                star.textContent = i <= mot1Score ? '★' : '☆';
                                starsContainer.appendChild(star);
                            }
                            console.log(`⭐ Generated ${mot1Score} stars for phase ${phaseNumber}`);
                        }
                        
                        if (scoreDescription) {
                            // Description basée sur le choix
                            let description = '';
                            if (apiData.choice_id || scoreData.choice) {
                                const choiceId = apiData.choice_id || scoreData.choice;
                                if (choiceId === 'elena' && mot1Score === 3) {
                                    description = "Excellent! By choosing Elena's approach, you earned 3 stars out of 3. This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap.";
                                } else if (choiceId === 'james' && mot1Score === 2) {
                                    description = "Good Choice! By selecting James's approach, you earned 2 stars out of 3. You chose a prudent and structured path, focusing on data, technology, and architecture.";
                                } else if (choiceId === 'amira' && mot1Score === 1) {
                                    description = "Interesting Choice! By selecting Amira's approach, you earned 1 star out of 3. This fast-paced, experimentation-focused strategy can deliver quick wins.";
                                } else {
                                    description = `You earned ${mot1Score} star${mot1Score > 1 ? 's' : ''} out of 3 for Step ${phaseNumber}.`;
                                }
                            } else {
                                description = `You earned ${mot1Score} star${mot1Score > 1 ? 's' : ''} out of 3 for Step ${phaseNumber}.`;
                            }
                            scoreDescription.textContent = description;
                        }
                        
                        // Afficher le modal avec Bootstrap
                        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modalInstance = new bootstrap.Modal(scoreModal);
                            modalInstance.show();
                        } else {
                            // Fallback si Bootstrap n'est pas disponible
                            scoreModal.style.display = 'block';
                            scoreModal.classList.add('show');
                        }
                    } else {
                        console.error('❌ Score modal not found');
                        // Si le modal n'existe pas, on ne peut pas afficher le score, mais on ne recharge pas la page
                        alert(`Score: ${mot1Score}/3`);
                    }
                };
                
                // Load choices immediately and render with full visual
                // This ensures the choices appear even if GameController isn't available
                const loadAndRenderStep1 = () => {
                    console.log('🎮 Loading Step 1 choices with full visual render...');
                    
                    // S'assurer que la section est visible
                    const phase1Section = document.getElementById('phase1-section');
                    if (phase1Section) {
                        phase1Section.style.display = 'block';
                    }
                    
                    // Hide all other sections
                    document.querySelectorAll('.phase-section').forEach(section => {
                        if (section.id !== 'phase1-section') {
                            section.style.display = 'none';
                        }
                    });
                    
                    // Stop videos if GameController is available
                    if (window.gameController && window.gameController.stopAllVideos) {
                        window.gameController.stopAllVideos();
                    }
                    
                    // Load choices and render immediately with full visual
                    fetch('/api/phase1/choices', {
                        credentials: 'include'
                    })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (data.success && data.choices) {
                            console.log('✅ Choices loaded, rendering with full visual (photos, enablers, use cases)');
                            // Utiliser le rendu complet avec photos (même logique que game.js)
                            renderMOT1ChoicesFull(data.choices);
                            
                            // Si GameController devient disponible plus tard, on peut essayer de charger les descriptions
                            if (window.gameController && window.gameController.loadEnablerDescriptions) {
                                // Charger les descriptions des enablers en arrière-plan
                                window.gameController.loadEnablerDescriptions();
                            }
                        } else {
                            console.error('❌ Failed to load choices:', data.message);
                        }
                    })
                    .catch(err => {
                        console.error('❌ Error loading choices:', err);
                    });
                };
                
                // Start loading immediately - don't wait for GameController
                // The full visual render function is self-contained
                setTimeout(loadAndRenderStep1, 100);
            } else {
                this.showLoginAlert(data.message || 'Login failed', 'danger');
                loginBtn.disabled = false;
                loginBtnText.style.display = 'inline';
                loginBtnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginAlert('Connection error. Please try again.', 'danger');
            loginBtn.disabled = false;
            loginBtnText.style.display = 'inline';
            loginBtnLoading.style.display = 'none';
        }
    }

    showLoginAlert(message, type) {
        const alertDiv = document.getElementById('login-alert');
        const alertMessage = document.getElementById('login-alert-message');
        
        if (alertDiv && alertMessage) {
            alertMessage.textContent = message;
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 150);
            }, 5000);
        }
    }

    setupLeaderboardButtons() {
        // Leaderboard close button
        const closeBtn = document.getElementById('leaderboard-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('leaderboardModal'));
                if (modal) modal.hide();
            });
        }

        // Play again button
        const playAgainBtn = document.getElementById('leaderboard-play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                // Reload page to start fresh
                window.location.reload();
            });
        }
    }

    async showLeaderboard() {
        try {
            // Show modal first to ensure DOM is ready
            const modalElement = document.getElementById('leaderboardModal');
            if (!modalElement) {
                console.error('❌ leaderboardModal not found in DOM');
                alert('Erreur: Modal de leaderboard introuvable');
                return;
            }
            
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Wait a bit for modal to be fully displayed
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Now fetch and populate data (with cache-busting to ensure fresh data)
            const cacheBuster = `?_t=${Date.now()}&limit=50`;
            const response = await fetch(`/api/leaderboard${cacheBuster}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const data = await response.json();

            console.log('📊 Leaderboard API response:', data);
            console.log('📊 Leaderboard type:', typeof data.leaderboard, 'isArray:', Array.isArray(data.leaderboard));
            console.log('📊 Leaderboard content:', data.leaderboard);

            if (data.success) {
                const leaderboard = data.leaderboard || [];
                console.log(`📊 Received ${leaderboard.length} players in leaderboard`);
                console.log(`📊 Current session username from API:`, data.current_username || 'not provided');
                
                if (leaderboard.length > 0) {
                    console.log('📊 First entry:', leaderboard[0]);
                    console.log('📊 First entry keys:', Object.keys(leaderboard[0]));
                    console.log('📊 First entry full:', JSON.stringify(leaderboard[0], null, 2));
                    console.log('📊 All usernames in leaderboard:', leaderboard.map(e => e?.username || e?.['username']));
                }
                
                // Update current username from API response if available
                if (data.current_username) {
                    this.setCurrentUsername(data.current_username);
                    console.log(`📊 Updated current username to: ${data.current_username}`);
                }
                
                // Populate the leaderboard (this will now work because modal is shown)
                this.populateLeaderboard(leaderboard, data.user_rank);
            } else {
                console.error('Leaderboard API error:', data.message);
                alert('Erreur lors du chargement du leaderboard: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Leaderboard error:', error);
            alert('Erreur lors du chargement du leaderboard: ' + error.message);
        }
    }

    populateLeaderboard(leaderboard, userRank) {
        console.log('🔧 populateLeaderboard called with:', { leaderboard: leaderboard?.length, userRank });
        
        const tbody = document.getElementById('leaderboard-tbody');
        const statsDiv = document.getElementById('leaderboard-stats');
        const tableContainer = document.querySelector('.leaderboard-table-container');
        
        console.log('🔧 DOM elements:', { tbody: !!tbody, statsDiv: !!statsDiv, tableContainer: !!tableContainer });
        
        if (!tbody) {
            console.error('❌ Leaderboard tbody not found!');
            alert('Erreur: Tableau de classement introuvable. Veuillez rafraîchir la page.');
            return;
        }

        // Ensure leaderboard is an array
        if (!Array.isArray(leaderboard)) {
            console.error('❌ Leaderboard is not an array:', typeof leaderboard, leaderboard);
            leaderboard = [];
        }

        // Safe logging to prevent errors if username doesn't exist
        const playerNames = leaderboard.map(e => e?.username || e?.['username'] || 'Unknown').filter(name => name !== 'Unknown');
        console.log(`📊 Populating leaderboard with ${leaderboard.length} players:`, playerNames);

        // Clear existing content
        tbody.innerHTML = '';

        // Get current username from session or somewhere else
        const currentUsername = this.getCurrentUsername();
        console.log('🔧 Current username for comparison:', currentUsername);
        console.log('🔧 Usernames in leaderboard:', leaderboard.map(e => (e?.username || e?.['username'] || '').trim()));

        // Populate stats
        if (statsDiv) {
            const totalPlayers = leaderboard.length;
            const avgScore = leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, entry) => {
                    const score = entry?.total_score || entry?.['total_score'] || 0;
                    return sum + score;
                }, 0) / leaderboard.length)
                : 0;
            const topScore = leaderboard.length > 0 
                ? (leaderboard[0]?.total_score || leaderboard[0]?.['total_score'] || 0)
                : 0;

            statsDiv.innerHTML = `
                <div class="stat-card">
                    <span class="stat-value">${totalPlayers}</span>
                    <span class="stat-label">Total Players</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${avgScore}</span>
                    <span class="stat-label">Average Score</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${topScore}</span>
                    <span class="stat-label">Top Score</span>
                </div>
            `;
        }

        // Populate table
        if (!leaderboard || leaderboard.length === 0) {
            console.warn('⚠️ Leaderboard is empty, showing empty message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="mb-0">No scores yet. Be the first to play!</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Convert to array if needed and ensure we have valid data
        const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];
        
        console.log(`📊 Starting to populate ${leaderboardArray.length} entries`);
        console.log(`📊 Raw leaderboard data:`, JSON.stringify(leaderboardArray, null, 2));
        
        // Clear tbody completely before adding rows
        tbody.innerHTML = '';
        
        // Track which entries were successfully added
        const addedEntries = [];
        const failedEntries = [];
        
        leaderboardArray.forEach((entry, index) => {
            try {
                // Handle both object and dict formats (Python dict becomes JS object, but check structure)
                const username = (entry.username || entry['username'] || '').trim();
                const rank = entry.rank !== undefined ? entry.rank : (entry['rank'] !== undefined ? entry['rank'] : index + 1);
                const totalScore = entry.total_score !== undefined ? entry.total_score : (entry['total_score'] !== undefined ? entry['total_score'] : 0);
                const stars = entry.stars !== undefined ? entry.stars : (entry['stars'] !== undefined ? entry['stars'] : 0);
                
                console.log(`  [${index + 1}/${leaderboardArray.length}] Processing: "${username}" (Rank ${rank}, Score ${totalScore}, Stars ${stars})`);
                
                // Validate entry data - stricter validation
                if (!entry) {
                    console.error(`⚠️ Entry at index ${index} is null/undefined`);
                    failedEntries.push({ index, entry, reason: 'null_entry' });
                    return;
                }
                
                if (!username || username.length === 0) {
                    console.error(`⚠️ Entry at index ${index} has no username:`, entry);
                    failedEntries.push({ index, entry, reason: 'no_username' });
                    return;
                }
                
                // Ensure rank is valid
                if (rank === undefined || rank === null || isNaN(rank) || rank < 1) {
                    console.error(`⚠️ Entry at index ${index} has invalid rank ${rank}:`, entry);
                    failedEntries.push({ index, entry, reason: 'invalid_rank' });
                    return;
                }
                
                const row = document.createElement('tr');
                
                // Only highlight current user (case-insensitive comparison)
                const currentUsernameTrimmed = (currentUsername || '').trim();
                if (username.toLowerCase() === currentUsernameTrimmed.toLowerCase()) {
                    console.log(`    ✅ Match found! Highlighting user row for "${username}"`);
                    row.classList.add('user-row');
                }

                // Create stars display
                const starsHTML = this.createStarsDisplay(stars || 0);

                // Display rank number for all players
                const rankClass = 'rank-col';
                const rankDisplay = String(rank); // Always show the rank number

                // Build row HTML with explicit error handling
                try {
                    const escapedUsername = this.escapeHtml(username);
                    row.innerHTML = `
                        <td class="${rankClass}">${rankDisplay}</td>
                        <td class="name-col">${escapedUsername}</td>
                        <td class="score-col">${totalScore}/15</td>
                        <td class="stars-col">${starsHTML}</td>
                    `;
                    
                    // Verify row was created correctly
                    const testRank = row.querySelector('.rank-col');
                    const testName = row.querySelector('.name-col');
                    if (!testRank || !testName) {
                        throw new Error('Row HTML structure invalid');
                    }
                    
                    // Append to DOM
                    tbody.appendChild(row);
                    
                    // Verify row was actually added
                    const lastChild = tbody.lastElementChild;
                    if (lastChild !== row) {
                        throw new Error('Row not added to DOM');
                    }
                    
                    addedEntries.push({ rank, username, totalScore, stars });
                    console.log(`    ✅ Successfully added: Rank ${rank} - "${username}" (${addedEntries.length} total rows in DOM)`);
                } catch (htmlErr) {
                    console.error(`    ❌ HTML error for "${username}":`, htmlErr);
                    failedEntries.push({ index, entry, reason: 'html_error', error: htmlErr.message });
                }
            } catch (err) {
                console.error(`❌ Critical error adding player ${index + 1}:`, err);
                console.error(`    Entry data:`, entry);
                console.error(`    Error stack:`, err.stack);
                failedEntries.push({ index, entry, reason: 'exception', error: err.message });
            }
        });
        
        // Log summary
        console.log(`📊 Population complete: ${addedEntries.length} succeeded, ${failedEntries.length} failed`);
        if (failedEntries.length > 0) {
            console.error(`❌ Failed entries:`, failedEntries);
        }

        // Final verification
        const rowsCreated = tbody.children.length;
        const expectedRows = Array.isArray(leaderboard) ? leaderboard.length : 0;
        
        console.log(`\n📊 FINAL VERIFICATION:`);
        console.log(`    Expected rows: ${expectedRows}`);
        console.log(`    Rows in DOM: ${rowsCreated}`);
        console.log(`    Added entries: ${addedEntries.length}`);
        
        if (tbody.children.length > 0) {
            console.log(`\n📋 Rows in DOM (in order):`);
            Array.from(tbody.children).forEach((row, idx) => {
                const rankCell = row.querySelector('.rank-col');
                const nameCell = row.querySelector('.name-col');
                const rankText = rankCell ? rankCell.textContent.trim() : '?';
                const nameText = nameCell ? nameCell.textContent.trim() : '?';
                const isVisible = row.offsetHeight > 0 && row.offsetWidth > 0;
                const display = window.getComputedStyle(row).display;
                console.log(`    Row ${idx + 1}: rank="${rankText}", name="${nameText}", visible=${isVisible}, display=${display}`);
            });
        }
        
        // Check for missing ranks
        if (rowsCreated < expectedRows) {
            const expectedRanks = leaderboardArray.map(e => e.rank || e['rank'] || 0).filter(r => r > 0);
            const presentRanks = Array.from(tbody.children).map(row => {
                const rankCell = row.querySelector('.rank-col');
                return rankCell ? parseInt(rankCell.textContent.trim()) : null;
            }).filter(r => r !== null && r > 0);
            const missingRanks = expectedRanks.filter(r => !presentRanks.includes(r));
            
            console.error(`\n❌ MISSING RANKS DETECTED:`);
            console.error(`    Expected ranks: ${expectedRanks.join(', ')}`);
            console.error(`    Present ranks: ${presentRanks.join(', ')}`);
            console.error(`    Missing ranks: ${missingRanks.join(', ')}`);
            
            // Try to recover missing ranks immediately
            if (missingRanks.length > 0) {
                console.log(`\n🔄 Attempting to recover ${missingRanks.length} missing rank(s)...`);
                missingRanks.forEach(missingRank => {
                    const missingEntry = leaderboardArray.find(e => (e.rank || e['rank']) === missingRank);
                    if (missingEntry) {
                        this.addLeaderboardRow(missingEntry, tbody, currentUsername);
                    }
                });
            }
        }
        
        if (rowsCreated === 0 && expectedRows > 0) {
            console.error('❌ CRITICAL: No rows created despite having leaderboard data!');
            console.error('    Leaderboard data:', JSON.stringify(leaderboard, null, 2));
            console.error('    tbody element:', tbody);
            console.error('    tbody parent:', tbody?.parentElement);
            
            // Force show an error row
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-danger">
                        <p class="mb-0"><strong>Erreur d'affichage</strong></p>
                        <p class="mb-0 small">${expectedRows} joueur(s) trouvé(s) mais impossible d'afficher</p>
                    </td>
                </tr>
            `;
        } else if (rowsCreated === 0 && expectedRows === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="mb-0">Aucun score pour le moment. Soyez le premier à jouer !</p>
                    </td>
                </tr>
            `;
        } else if (rowsCreated < expectedRows) {
            console.error(`❌ WARNING: Only ${rowsCreated} rows created but ${expectedRows} expected!`);
            console.error('    Missing rows - checking which ranks are missing...');
            
            // Check which ranks are present and which are missing
            const presentRanks = Array.from(tbody.children).map(row => {
                const rankCell = row.querySelector('.rank-col');
                return rankCell ? parseInt(rankCell.textContent.trim()) : null;
            }).filter(r => r !== null);
            
            const expectedRanks = leaderboard.map(e => e.rank || e['rank'] || 0);
            const missingRanks = expectedRanks.filter(r => !presentRanks.includes(r));
            
            console.error(`    Present ranks:`, presentRanks);
            console.error(`    Expected ranks:`, expectedRanks);
            console.error(`    Missing ranks:`, missingRanks);
            
            // Try to add missing rows
            if (missingRanks.length > 0) {
                console.log(`    Attempting to add missing ranks:`, missingRanks);
                missingRanks.forEach(missingRank => {
                    const missingEntry = leaderboard.find(e => (e.rank || e['rank']) === missingRank);
                    if (missingEntry) {
                        console.log(`    Adding missing rank ${missingRank}:`, missingEntry);
                        try {
                            const username = (missingEntry.username || missingEntry['username'] || '').trim();
                            const totalScore = missingEntry.total_score !== undefined ? missingEntry.total_score : (missingEntry['total_score'] !== undefined ? missingEntry['total_score'] : 0);
                            const stars = missingEntry.stars !== undefined ? missingEntry.stars : (missingEntry['stars'] !== undefined ? missingEntry['stars'] : 0);
                            const starsHTML = this.createStarsDisplay(stars);
                            
                            const row = document.createElement('tr');
                            if (username.toLowerCase() === currentUsername.toLowerCase()) {
                                row.classList.add('user-row');
                            }
                            
                            row.innerHTML = `
                                <td class="rank-col">${missingRank}</td>
                                <td class="name-col">${this.escapeHtml(username)}</td>
                                <td class="score-col">${totalScore}/15</td>
                                <td class="stars-col">${starsHTML}</td>
                            `;
                            
                            // Insert at correct position
                            const existingRows = Array.from(tbody.children);
                            let insertIndex = existingRows.findIndex(r => {
                                const rRank = parseInt(r.querySelector('.rank-col')?.textContent?.trim() || '999');
                                return rRank > missingRank;
                            });
                            if (insertIndex === -1) insertIndex = existingRows.length;
                            
                            if (insertIndex === 0) {
                                tbody.insertBefore(row, tbody.firstChild);
                            } else if (insertIndex >= existingRows.length) {
                                tbody.appendChild(row);
                            } else {
                                tbody.insertBefore(row, existingRows[insertIndex]);
                            }
                            
                            console.log(`    ✅ Added missing rank ${missingRank} at position ${insertIndex}`);
                        } catch (err) {
                            console.error(`    ❌ Error adding missing rank ${missingRank}:`, err);
                        }
                    }
                });
            }
        }

        // Scroll to top to ensure first player is visible
        if (tableContainer) {
            // Force scroll to top and ensure first row is visible
            setTimeout(() => {
                tableContainer.scrollTop = 0;
                // Also try to scroll the first row into view
                const firstRow = tbody.querySelector('tr:first-child');
                if (firstRow) {
                    firstRow.scrollIntoView({ behavior: 'auto', block: 'nearest' });
                    console.log('📊 Scrolled to show first row');
                }
            }, 200);
        }
        
        // Log final state for debugging
        console.log(`📊 Final leaderboard state: ${tbody.children.length} rows in DOM, ${leaderboard.length} in data`);
    }

    createStarsDisplay(count) {
        try {
            const starsCount = parseInt(count) || 0;
            let starsHTML = '<div class="stars-display">';
            for (let i = 0; i < 3; i++) {
                if (i < starsCount) {
                    starsHTML += '<i class="fas fa-star star-icon"></i>';
                } else {
                    starsHTML += '<i class="far fa-star star-icon" style="opacity: 0.3;"></i>';
                }
            }
            starsHTML += '</div>';
            return starsHTML;
        } catch (err) {
            console.error('Error creating stars display:', err);
            return '<div class="stars-display"><i class="far fa-star star-icon" style="opacity: 0.3;"></i></div>';
        }
    }
    
    addLeaderboardRow(entry, tbody, currentUsername) {
        try {
            const username = (entry.username || entry['username'] || '').trim();
            const rank = entry.rank || entry['rank'] || 0;
            const totalScore = entry.total_score || entry['total_score'] || 0;
            const stars = entry.stars || entry['stars'] || 0;
            
            if (!username || rank < 1) {
                console.error('Cannot add row: invalid data', { username, rank });
                return false;
            }
            
            const row = document.createElement('tr');
            if (username.toLowerCase() === (currentUsername || '').toLowerCase()) {
                row.classList.add('user-row');
            }
            
            const starsHTML = this.createStarsDisplay(stars);
            const escapedUsername = this.escapeHtml(username);
            
            row.innerHTML = `
                <td class="rank-col">${rank}</td>
                <td class="name-col">${escapedUsername}</td>
                <td class="score-col">${totalScore}/15</td>
                <td class="stars-col">${starsHTML}</td>
            `;
            
            // Find correct insertion point
            const existingRows = Array.from(tbody.children);
            let insertIndex = existingRows.findIndex(r => {
                const rRank = parseInt(r.querySelector('.rank-col')?.textContent?.trim() || '999');
                return rRank > rank;
            });
            
            if (insertIndex === -1) {
                tbody.appendChild(row);
            } else if (insertIndex === 0) {
                tbody.insertBefore(row, tbody.firstChild);
            } else {
                tbody.insertBefore(row, existingRows[insertIndex]);
            }
            
            console.log(`✅ Recovered: Added rank ${rank} - ${username}`);
            return true;
        } catch (err) {
            console.error(`❌ Error adding row for rank ${entry.rank}:`, err);
            return false;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        try {
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        } catch (err) {
            console.error('Error escaping HTML:', err, text);
            return String(text).replace(/[&<>"']/g, (m) => {
                const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                return map[m];
            });
        }
    }

    getCurrentUsername() {
        // Try to get from cookie or session
        // For now, we'll store it when login is successful
        return window.currentUsername || 'Unknown';
    }

    setCurrentUsername(username) {
        window.currentUsername = username;
    }
}

// Store username on successful login
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0] && args[0].includes('/api/login') && args[1] && args[1].method === 'POST') {
        return originalFetch.apply(this, args).then(response => {
            return response.clone().json().then(data => {
                if (data.success && data.user_info && data.user_info.username) {
                    if (window.kahootMode) {
                        window.kahootMode.setCurrentUsername(data.user_info.username);
                    }
                    window.currentUsername = data.user_info.username;
                }
                return response;
            }).catch(() => response); // Return original response if JSON parse fails
        });
    }
    return originalFetch.apply(this, args);
};

// Global function to show score screen manually (fallback if GameController not available)
// This is used by Step 2 and other steps that don't have access to the local function
function showScoreScreenManually(phaseNumber, apiData) {
    console.log('📊 Showing score screen manually for phase', phaseNumber, apiData);
    
    const scoreData = apiData.score || apiData.score_info || {};
    let motScore = 0;
    
    // Get score for the specific phase
    // Handle Step 5 which might have score in apiData.results.scores or apiData.mot5_score
    if (phaseNumber === 5 && apiData.mot5_score !== undefined) {
        motScore = apiData.mot5_score;
    } else if (phaseNumber === 5 && apiData.results && apiData.results.scores) {
        // Step 5 has score in results.scores.mot5
        const scores = apiData.results.scores;
        motScore = scores.mot5 || (typeof scores === 'object' && scores.get ? scores.get('mot5') : null) || 0;
    } else if (scoreData.scores) {
        motScore = scoreData.scores[`mot${phaseNumber}`] || scoreData.scores.mot1 || 0;
    } else {
        motScore = scoreData[`mot${phaseNumber}`] || scoreData.mot1 || 0;
    }
    
    console.log(`📊 Score extracted for Step ${phaseNumber}:`, motScore, 'from data:', { scoreData, apiData });
    
    // Hide the current phase section
    const phaseSection = document.getElementById(`phase${phaseNumber}-section`);
    if (phaseSection) {
        phaseSection.style.display = 'none';
    }
    
    // Find score modal and populate it
    const scoreModal = document.getElementById('scoreModal');
    if (scoreModal) {
        // Populate score data
        // Update the step title (current-mot-title is the element used in the modal)
        const stepTitleElement = document.getElementById('current-mot-title');
        const scorePhaseTitle = scoreModal.querySelector('#score-phase-title'); // Fallback if this element exists
        const scoreDescription = scoreModal.querySelector('#score-description');
        const starsContainer = scoreModal.querySelector('#score-stars-container');
        
        // Define step titles (same as GameController)
        const stepTitles = {
            1: 'STEP 1: Get started with the right AI strategy',
            2: 'STEP 2: Building your AI use cases portfolio',
            3: 'STEP 3: Launching your priority AI pilots',
            4: 'STEP 4: Scaling your AI and GenAI solutions',
            5: 'STEP 5: Deploying AI across the organization'
        };
        
        const stepTitleText = stepTitles[phaseNumber] || `Step ${phaseNumber}`;
        
        // Update current-mot-title (primary element)
        if (stepTitleElement) {
            stepTitleElement.textContent = stepTitleText;
        }
        
        // Also update score-phase-title if it exists (fallback)
        if (scorePhaseTitle) {
            scorePhaseTitle.textContent = stepTitleText;
        }
        // Note: score-value might not exist in this modal structure, but we update stars instead
        
        // Generate visual stars
        if (starsContainer) {
            starsContainer.innerHTML = '';
            for (let i = 1; i <= 3; i++) {
                const star = document.createElement('span');
                star.className = 'score-star';
                star.textContent = i <= motScore ? '★' : '☆';
                starsContainer.appendChild(star);
            }
            console.log(`⭐ Generated ${motScore} stars for phase ${phaseNumber}`);
        }
        
        if (scoreDescription) {
            // Generic description based on score
            let description = '';
            if (apiData.choice_id || scoreData.choice) {
                const choiceId = apiData.choice_id || scoreData.choice;
                if (choiceId === 'elena' && motScore === 3) {
                    description = "Excellent! By choosing Elena's approach, you earned 3 stars out of 3. This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap.";
                } else if (choiceId === 'james' && motScore === 2) {
                    description = "Good Choice! By selecting James's approach, you earned 2 stars out of 3. You chose a prudent and structured path, focusing on data, technology, and architecture.";
                } else if (choiceId === 'amira' && motScore === 1) {
                    description = "Interesting Choice! By selecting Amira's approach, you earned 1 star out of 3. This fast-paced, experimentation-focused strategy can deliver quick wins.";
                } else {
                    description = `You earned ${motScore} star${motScore > 1 ? 's' : ''} out of 3 for Step ${phaseNumber}.`;
                }
            } else {
                description = `You earned ${motScore} star${motScore > 1 ? 's' : ''} out of 3 for Step ${phaseNumber}.`;
            }
            scoreDescription.textContent = description;
        }
        
        // Show modal with Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalInstance = new bootstrap.Modal(scoreModal);
            modalInstance.show();
        } else {
            // Fallback if Bootstrap not available
            scoreModal.style.display = 'block';
            scoreModal.classList.add('show');
        }
    } else {
        console.error('❌ Score modal not found');
        alert(`Score: ${motScore}/3`);
    }
}

// Helper functions to load steps directly (fallback if GameController not available)
function loadStep2Directly() {
    console.log('📥 Loading Step 2 directly via API...');
    const phase2Section = document.getElementById('phase2-section');
    if (phase2Section) {
        phase2Section.style.display = 'block';
    }
    
    // Hide other sections
    document.querySelectorAll('.phase-section').forEach(section => {
        if (section.id !== 'phase2-section') {
            section.style.display = 'none';
        }
    });
    
    fetch('/api/phase2/choices', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.choices) {
                // Try to use GameController first
                if (window.gameController && window.gameController.renderMOT2Choices) {
                    window.gameController.renderMOT2Choices(data.choices);
                    // Also initialize priority slots if available
                    if (window.gameController.initializePrioritySlots) {
                        window.gameController.initializePrioritySlots();
                    }
                } else {
                    // Fallback: use GameController.createSolutionCard if available, otherwise renderMOT2ChoicesFull
                    renderMOT2ChoicesFull(data.choices);
                }
            }
        })
        .catch(err => console.error('Error loading Step 2:', err));
}

// Full rendering function for Step 2 choices (fallback if GameController not fully available)
function renderMOT2ChoicesFull(choices) {
    const container = document.getElementById('phase2-choices');
    if (!container) {
        console.error('❌ phase2-choices container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Mapping des choix vers leurs positions dans la matrice
    const choiceToMatrixPosition = {
        'fraud_integrity_detection': 1,
        'ai_storyline_generator': 2,
        'smart_game_design_assistant': 3,
        'player_journey_optimizer': 4,
        'talent_analytics_dashboard': 5
    };
    
    // Create all solution cards
    choices.forEach(choice => {
        const matrixPosition = choiceToMatrixPosition[choice.id] || '?';
        const isAvailable = matrixPosition <= 5;
        const backgroundColor = isAvailable 
            ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
        
        const card = document.createElement('div');
        card.className = 'solution-card';
        card.draggable = isAvailable;
        card.dataset.choiceId = choice.id;
        // Simplified for mobile: only title and number, no description or image
        card.innerHTML = `
            <div class="solution-header d-flex align-items-center justify-content-between" style="width: 100%;">
                <div class="solution-title fw-bold" style="flex: 1; margin-right: 10px;">${choice.title}</div>
                <div class="matrix-number-square" style="
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: ${backgroundColor};
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    box-shadow: ${isAvailable ? '0 2px 8px rgba(6, 182, 212, 0.3)' : '0 2px 8px rgba(107, 114, 128, 0.3)'};
                    flex-shrink: 0;
                    border: 2px solid white;
                ">${matrixPosition}</div>
            </div>
        `;
        
        // Mobile-friendly interaction: simple tap to select, then tap slot to drop
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectCardForMobile(card);
        });
        
        // Also work with click for desktop hybrid devices
        card.addEventListener('click', (e) => {
            if ('ontouchstart' in window) {
                // Mobile device - click is just a fallback
                return;
            }
        });
        
        // Keep drag-and-drop for desktop (mouse events)
        if (!('ontouchstart' in window)) {
            card.addEventListener('dragstart', (e) => {
                const choiceId = card.dataset.choiceId;
                e.dataTransfer.setData('text/plain', choiceId);
                e.dataTransfer.effectAllowed = 'move';
                card.classList.add('dragging');
                
                if (window.gameController && window.gameController.handleDragStart) {
                    const originalHandler = window.gameController.handleDragStart.bind(window.gameController);
                    originalHandler(e);
                }
            });
            
            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
                
                document.querySelectorAll('.priority-slot').forEach(slot => {
                    slot.classList.remove('drag-over');
                });
                
                if (window.gameController && window.gameController.handleDragEnd) {
                    const originalHandler = window.gameController.handleDragEnd.bind(window.gameController);
                    originalHandler(e);
                }
            });
        }
        
        container.appendChild(card);
    });
    
    // Initialize priority slots
    // Always try to use GameController methods first (with proper binding)
    if (window.gameController && window.gameController.initializePrioritySlots) {
        window.gameController.initializePrioritySlots();
    }
    
    // Setup handlers for both mobile (touch) and desktop (drag-drop)
    const slots = document.querySelectorAll('.priority-slot');
    slots.forEach(slot => {
        // Remove existing listeners by cloning (if any)
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Mobile: tap on slot to drop selected card
        newSlot.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const selectedCard = document.querySelector('.solution-card.selected-mobile');
            if (selectedCard && selectedCard.dataset.choiceId) {
                handleMobileDrop(newSlot, selectedCard.dataset.choiceId);
            }
        });
        
        // Desktop: drag and drop
        newSlot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        newSlot.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const slotElement = e.target.closest('.priority-slot');
            if (!slotElement) return;
            
            const choiceId = e.dataTransfer.getData('text/plain');
            if (!choiceId) return;
            
            slotElement.classList.remove('drag-over');
            handleDropToSlot(slotElement, choiceId);
        });
        
        newSlot.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slotElement = e.target.closest('.priority-slot');
            if (slotElement) {
                slotElement.classList.add('drag-over');
            }
        });
        
        newSlot.addEventListener('dragleave', (e) => {
            const slotElement = e.target.closest('.priority-slot');
            if (slotElement) {
                slotElement.classList.remove('drag-over');
            }
        });
    });
    
    // Mobile helper: Select card for mobile interaction
    function selectCardForMobile(card) {
        // If card is already selected and clicked again, deselect it
        if (card.classList.contains('selected-mobile')) {
            card.classList.remove('selected-mobile');
            card.style.opacity = '1';
            card.style.border = '';
            card.style.borderRadius = '';
            return;
        }
        
        // Remove selection from all cards
        document.querySelectorAll('.solution-card').forEach(c => {
            c.classList.remove('selected-mobile');
            c.style.opacity = '1';
            c.style.border = '';
            c.style.borderRadius = '';
        });
        
        // Select this card
        card.classList.add('selected-mobile');
        card.style.opacity = '0.8';
        card.style.border = '3px solid var(--fdj-blue-primary)';
        card.style.borderRadius = '8px';
        
        // Brief instruction (less intrusive)
        const existingAlert = document.querySelector('.mobile-card-selected-hint');
        if (!existingAlert) {
            const hint = document.createElement('div');
            hint.className = 'mobile-card-selected-hint alert alert-info';
            hint.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 8px 16px; font-size: 0.85rem; border-radius: 8px;';
            hint.textContent = 'Tap sur un slot pour l\'ajouter';
            document.body.appendChild(hint);
            setTimeout(() => hint.remove(), 2000);
        }
    }
    
    // Mobile helper: Handle drop to slot
    function handleMobileDrop(slotElement, choiceId) {
        // Check if slot is already occupied
        if (slotElement.querySelector('.priority-item')) {
            if (window.gameController && window.gameController.showAlert) {
                window.gameController.showAlert('This priority slot is already occupied. Please remove the existing item first.', 'warning');
            } else {
                alert('Ce slot est déjà occupé. Veuillez retirer l\'élément existant d\'abord.');
            }
            return;
        }
        
        // Find the solution card
        const solutionCard = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (!solutionCard) return;
        
        handleDropToSlot(slotElement, choiceId);
    }
    
    // Shared helper: Handle drop to slot (used by both mobile and desktop)
    function handleDropToSlot(slotElement, choiceId) {
        // Find the solution card
        const solutionCard = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (!solutionCard) return;
        
        // Create priority item - simplified: only title and number
        const priorityItem = document.createElement('div');
        priorityItem.className = 'priority-item';
        priorityItem.dataset.choiceId = choiceId;
        
        const titleText = solutionCard.querySelector('.solution-title')?.textContent || 'Unknown';
        const numberSquare = solutionCard.querySelector('.matrix-number-square');
        const numberText = numberSquare ? numberSquare.textContent : '';
        
        priorityItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center" style="flex: 1;">
                    ${numberText ? `<div class="matrix-number-square me-2" style="
                        width: 30px;
                        height: 30px;
                        border-radius: 6px;
                        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 0.9rem;
                    ">${numberText}</div>` : ''}
                    <div class="fw-bold">${titleText}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger remove-priority-btn" data-choice-id="${choiceId}" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add click handler for remove button
        priorityItem.querySelector('.remove-priority-btn').addEventListener('click', () => {
            removeFromPrioritySlot(choiceId);
        });
        
        // Add to slot
        slotElement.innerHTML = '';
        slotElement.appendChild(priorityItem);
        slotElement.classList.add('occupied');
        
        // Mark solution as used and deselect mobile
        solutionCard.classList.add('used');
        solutionCard.classList.remove('selected-mobile');
        solutionCard.style.opacity = '0.5';
        solutionCard.style.border = '';
        solutionCard.draggable = false;
        
        // Update counter
        updatePhase2Counter();
    }
    
    // Helper function to remove from priority slot
    function removeFromPrioritySlot(choiceId) {
        const priorityItem = document.querySelector(`.priority-item[data-choice-id="${choiceId}"]`);
        if (!priorityItem) return;
        
        const slot = priorityItem.closest('.priority-slot');
        if (!slot) return;
        
        // Restore placeholder
        const slotNumber = slot.dataset.slot || '?';
        slot.innerHTML = `
            <div class="priority-placeholder">
                <i class="fas fa-plus-circle me-2"></i>Priority ${slotNumber}
            </div>
        `;
        slot.classList.remove('occupied');
        
        // Restore solution card
        const solutionCard = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (solutionCard) {
            solutionCard.classList.remove('used');
            solutionCard.classList.remove('selected-mobile');
            solutionCard.style.opacity = '1';
            solutionCard.style.border = '';
            solutionCard.draggable = true;
        }
        
        // Update counter
        updatePhase2Counter();
    }
    
    // Helper function to update Phase 2 counter
    function updatePhase2Counter() {
        const selectedCount = document.querySelectorAll('.priority-item').length;
        const counter = document.getElementById('phase2-selected-count');
        const confirmBtn = document.getElementById('phase2-confirm-btn');
        
        if (counter) {
            counter.textContent = `${selectedCount}/3 selected`;
        }
        
        if (confirmBtn) {
            if (selectedCount === 3) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('btn-secondary');
                confirmBtn.classList.add('btn-primary');
            } else {
                confirmBtn.disabled = true;
                confirmBtn.classList.remove('btn-primary');
                confirmBtn.classList.add('btn-secondary');
            }
        }
    }
    
    console.log(`✅ Rendered ${choices.length} Step 2 choices with full visual`);
    
    // Setup confirm button listener
    const confirmBtn = document.getElementById('phase2-confirm-btn');
    if (confirmBtn) {
        // Remove existing listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', async () => {
            // Get selected choices from priority slots
            const priorityItems = document.querySelectorAll('.priority-item');
            const selectedChoices = Array.from(priorityItems).map(item => item.dataset.choiceId);
            
            if (selectedChoices.length !== 3) {
                if (window.gameController && window.gameController.showAlert) {
                    window.gameController.showAlert('Please select exactly 3 solutions by dragging them to the priority slots.', 'warning');
                } else {
                    alert('Veuillez sélectionner exactement 3 solutions en les glissant dans les slots de priorité.');
                }
                return;
            }
            
            // Use GameController method if available
            if (window.gameController && window.gameController.confirmPhase2Choices) {
                await window.gameController.confirmPhase2Choices();
            } else {
                // Direct API call as fallback
                try {
                    const response = await fetch('/api/phase2/choose', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ solution_ids: selectedChoices })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        // Show score screen
                        if (window.gameController && window.gameController.showScoreScreen) {
                            const score = data.score || data.score_info || {};
                            const mot2Score = score.scores ? score.scores.mot2 : (score.mot2 || 0);
                            window.gameController.showScoreScreen(2, mot2Score, score);
                        } else {
                            showScoreScreenManually(2, data);
                        }
                    }
                } catch (err) {
                    console.error('Error confirming Step 2 choices:', err);
                }
            }
        });
    }
}

function loadStep3Directly() {
    console.log('📥 Loading Step 3 directly via API...');
    const phase3Section = document.getElementById('phase3-section');
    if (phase3Section) {
        phase3Section.style.display = 'block';
    }
    
    // Hide other sections
    document.querySelectorAll('.phase-section').forEach(section => {
        if (section.id !== 'phase3-section') {
            section.style.display = 'none';
        }
    });
    
    fetch('/api/phase3/choices', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.choices) {
                // Try to use GameController first
                if (window.gameController && window.gameController.renderMOT3Choices) {
                    window.gameController.renderMOT3Choices(data.choices);
                    if (window.gameController.initializePhase3Progress) {
                        window.gameController.initializePhase3Progress();
                    }
                } else {
                    // Fallback: use full rendering function
                    renderMOT3ChoicesFull(data.choices);
                }
            }
        })
        .catch(err => console.error('Error loading Step 3:', err));
}

// Full rendering function for Step 3 choices (fallback if GameController not fully available)
function renderMOT3ChoicesFull(choices) {
    const container = document.getElementById('phase3-choices');
    if (!container) {
        console.error('❌ phase3-choices container not found');
        return;
    }
    
    container.innerHTML = '';
    container.className = '';
    
    // Define category metadata
    const categoryMetadata = {
        'people': {
            title: 'People',
            icon: 'fas fa-users',
            class: 'people'
        },
        'technology': {
            title: 'Technology',
            icon: 'fas fa-handshake',
            class: 'technology'
        },
        'gover': {
            title: 'Governance',
            icon: 'fas fa-shield-alt',
            class: 'gover'
        }
    };
    
    // Define specific icons for each choice
    const choiceIcons = {
        'ai_data_platform_modernization': 'fas fa-database',
        'automation_ai_models_deployment': 'fas fa-robot',
        'data_quality_tooling': 'fas fa-clipboard-check',
        'ai_leadership_program': 'fas fa-graduation-cap',
        'hands_on_ai_bootcamp': 'fas fa-code',
        'business_ai_champions': 'fas fa-trophy',
        'responsible_ai_guidelines': 'fas fa-shield-alt',
        'ai_governance_roadmap': 'fas fa-map-signs',
        'ai_governance_board': 'fas fa-gavel'
    };
    
    // Create matrix structure - Original category columns
    Object.entries(choices).forEach(([category, categoryChoices]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'matrix-category';
        
        const metadata = categoryMetadata[category] || { title: category, icon: 'fas fa-cog', class: '' };
        
        categoryDiv.innerHTML = `
            <div class="category-header ${metadata.class}">
                <i class="${metadata.icon} me-2"></i>${metadata.title}
            </div>
            ${categoryChoices.map(choice => `
                <div class="matrix-choice" data-choice-id="${choice.id}" data-category="${category}">
                    <div class="choice-header">
                        <div style="background-color: ${category === 'people' ? '#f97316' : category === 'technology' ? '#8b5cf6' : '#3b82f6'}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="${choiceIcons[choice.id] || 'fas fa-cog'}" style="color: white; font-size: 1rem;"></i>
                        </div>
                        <div class="choice-title">${choice.title}</div>
                    </div>
                    <div class="choice-description">${choice.description}</div>
                </div>
            `).join('')}
        `;
        
        // Add click listeners to choices
        categoryDiv.querySelectorAll('.matrix-choice').forEach(choiceEl => {
            choiceEl.addEventListener('click', () => {
                const choiceId = choiceEl.dataset.choiceId;
                const category = choiceEl.dataset.category;
                
                // Remove previous selection from this category
                categoryDiv.querySelectorAll('.matrix-choice').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Add new selection
                choiceEl.classList.add('selected');
                
                // Update progress if GameController available
                if (window.gameController && window.gameController.selectMOT3Choice) {
                    window.gameController.selectMOT3Choice(choiceId, category);
                } else {
                    // Manual progress update
                    updatePhase3ProgressManual();
                }
            });
        });
        
        container.appendChild(categoryDiv);
    });
    
    // Initialize progress
    updatePhase3ProgressManual();
    
    console.log('✅ Rendered Step 3 choices with full visual');
    
    // Setup confirm button listener
    const confirmBtn = document.getElementById('phase3-confirm-btn');
    if (confirmBtn) {
        // Remove existing listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', async () => {
            // Get selected choices from all categories
            const selectedChoices = {};
            document.querySelectorAll('#phase3-choices .matrix-choice.selected').forEach(choiceEl => {
                const category = choiceEl.dataset.category;
                const choiceId = choiceEl.dataset.choiceId;
                if (category && choiceId) {
                    selectedChoices[category] = choiceId;
                }
            });
            
            const selectedCount = Object.keys(selectedChoices).length;
            if (selectedCount !== 3) {
                if (window.gameController && window.gameController.showAlert) {
                    window.gameController.showAlert('Please select exactly 3 choices (one per category).', 'warning');
                } else {
                    alert('Veuillez sélectionner exactement 3 choix (un par catégorie).');
                }
                return;
            }
            
            // Use GameController method if available
            if (window.gameController && window.gameController.confirmMOT3Choices) {
                // Store selections in GameController first
                window.gameController.selectedChoices.mot3 = selectedChoices;
                await window.gameController.confirmMOT3Choices();
            } else {
                // Direct API call as fallback
                try {
                    const response = await fetch('/api/phase3/choose', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ choices: selectedChoices })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        // Show score screen
                        if (window.gameController && window.gameController.showScoreScreen) {
                            const score = data.score || data.score_info || {};
                            const mot3Score = score.scores ? score.scores.mot3 : (score.mot3 || 0);
                            window.gameController.showScoreScreen(3, mot3Score, score);
                        } else {
                            showScoreScreenManually(3, data);
                        }
                    }
                } catch (err) {
                    console.error('Error confirming Step 3 choices:', err);
                }
            }
        });
    }
}

// Helper to update Phase 3 progress manually
function updatePhase3ProgressManual() {
    const selectedCount = document.querySelectorAll('#phase3-choices .matrix-choice.selected').length;
    const progressText = document.getElementById('phase3-progress-text');
    const confirmBtn = document.getElementById('phase3-confirm-btn');
    
    if (progressText) {
        progressText.textContent = `${selectedCount}/3 selected`;
    }
    
    // Update progress steps
    for (let i = 1; i <= 3; i++) {
        const step = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (step) {
            if (i <= selectedCount) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        }
    }
    
    // Enable/disable confirm button
    if (confirmBtn) {
        if (selectedCount === 3) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.remove('btn-primary');
            confirmBtn.classList.add('btn-secondary');
        }
    }
}

function loadStep4Directly() {
    console.log('📥 Loading Step 4 directly via API...');
    const phase4Section = document.getElementById('phase4-section');
    if (phase4Section) {
        phase4Section.style.display = 'block';
    }
    
    // Hide other sections
    document.querySelectorAll('.phase-section').forEach(section => {
        if (section.id !== 'phase4-section') {
            section.style.display = 'none';
        }
    });
    
    fetch('/api/phase4/choices', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.choices) {
                // Try to use GameController first
                if (window.gameController && window.gameController.renderMOT4Choices) {
                    window.gameController.renderMOT4Choices(data.choices);
                    if (window.gameController.initializePhase4Budget) {
                        window.gameController.initializePhase4Budget();
                    }
                } else {
                    // Fallback: use full rendering function
                    renderMOT4ChoicesFull(data.choices);
                }
            }
        })
        .catch(err => console.error('Error loading Step 4:', err));
}

// Full rendering function for Step 4 choices (fallback if GameController not fully available)
function renderMOT4ChoicesFull(choices) {
    const container = document.getElementById('phase4-choices');
    if (!container) {
        console.error('❌ phase4-choices container not found');
        return;
    }
    
    container.innerHTML = '';
    container.className = 'matrix-choices-grid';
    
    // Define category colors
    const categoryColors = {
        'technology': '#8b5cf6',
        'gover': '#3b82f6',
        'people': '#f97316'
    };
    
    // Map enabler IDs to pillars
    const enablerPillars = {
        'adoption_playbook': 'people',
        'ai_storytelling_communication': 'people',
        'ai_product_teams_setup': 'people',
        'talent_mobility_program': 'people',
        'industrialized_data_pipelines': 'technology',
        'api_platform': 'technology',
        'privacy_by_design_data': 'technology',
        'role_responsibility_matrix': 'gover',
        'country_level_ai_deployment': 'gover'
    };
    
    // Icon mapping
    const iconMap = {
        'adoption_playbook': 'fas fa-book',
        'ai_storytelling_communication': 'fas fa-bullhorn',
        'ai_product_teams_setup': 'fas fa-users',
        'talent_mobility_program': 'fas fa-exchange-alt',
        'industrialized_data_pipelines': 'fas fa-cogs',
        'api_platform': 'fas fa-code',
        'privacy_by_design_data': 'fas fa-shield-alt',
        'role_responsibility_matrix': 'fas fa-clipboard-check',
        'country_level_ai_deployment': 'fas fa-globe'
    };
    
    choices.forEach(choice => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'matrix-choice';
        choiceDiv.dataset.choiceId = choice.id;
        choiceDiv.dataset.cost = choice.cost;
        
        const pillar = enablerPillars[choice.id] || 'technology';
        const categoryColor = categoryColors[pillar];
        const specificIcon = iconMap[choice.id] || 'fas fa-cog';
        
        choiceDiv.innerHTML = `
            <div class="choice-header">
                <div style="background-color: ${categoryColor}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    <i class="${specificIcon}" style="color: white; font-size: 1rem;"></i>
                </div>
                <div class="choice-title">${choice.title}</div>
            </div>
            <div class="choice-description">${choice.description}</div>
            <div class="choice-cost">${choice.cost} points</div>
        `;
        
        // Add click listener
        choiceDiv.addEventListener('click', () => {
            if (window.gameController && window.gameController.selectMOT4Choice) {
                window.gameController.selectMOT4Choice(choice.id, choice.cost);
            } else {
                // Toggle selection manually
                choiceDiv.classList.toggle('selected');
                updatePhase4BudgetManual();
            }
        });
        
        container.appendChild(choiceDiv);
    });
    
    // Initialize budget
    updatePhase4BudgetManual();
    
    console.log('✅ Rendered Step 4 choices with full visual');
    
    // Setup confirm button listener
    const confirmBtn = document.getElementById('phase4-confirm-btn');
    if (confirmBtn) {
        // Remove existing listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', async () => {
            // Get selected choices
            const selectedChoices = [];
            document.querySelectorAll('#phase4-choices .matrix-choice.selected').forEach(choiceEl => {
                selectedChoices.push(choiceEl.dataset.choiceId);
            });
            
            // Calculate total cost
            let totalCost = 0;
            selectedChoices.forEach(choiceId => {
                const choiceEl = document.querySelector(`#phase4-choices [data-choice-id="${choiceId}"]`);
                if (choiceEl) {
                    totalCost += parseInt(choiceEl.dataset.cost) || 0;
                }
            });
            
            if (selectedChoices.length === 0) {
                if (window.gameController && window.gameController.showAlert) {
                    window.gameController.showAlert('Please select at least one choice.', 'warning');
                } else {
                    alert('Veuillez sélectionner au moins un choix.');
                }
                return;
            }
            
            if (totalCost > 30) {
                if (window.gameController && window.gameController.showAlert) {
                    window.gameController.showAlert(`Budget exceeded: ${totalCost}/30 points. Please adjust your selections.`, 'warning');
                } else {
                    alert(`Budget dépassé: ${totalCost}/30 points. Veuillez ajuster vos sélections.`);
                }
                return;
            }
            
            // Use GameController method if available
            if (window.gameController && window.gameController.confirmMOT4Choices) {
                // Store selections in GameController first
                window.gameController.selectedChoices.mot4 = selectedChoices;
                window.gameController.budget = totalCost;
                await window.gameController.confirmMOT4Choices();
            } else {
                // Direct API call as fallback
                try {
                    const response = await fetch('/api/phase4/choose', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ enabler_ids: selectedChoices })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        // Show score screen
                        if (window.gameController && window.gameController.showScoreScreen) {
                            const score = data.score || data.score_info || {};
                            const mot4Score = score.scores ? score.scores.mot4 : (score.mot4 || 0);
                            window.gameController.showScoreScreen(4, mot4Score, score);
                        } else {
                            showScoreScreenManually(4, data);
                        }
                    }
                } catch (err) {
                    console.error('Error confirming Step 4 choices:', err);
                }
            }
        });
    }
}

// Helper to update Phase 4 budget manually
function updatePhase4BudgetManual() {
    const selectedChoices = document.querySelectorAll('#phase4-choices .matrix-choice.selected');
    let totalCost = 0;
    selectedChoices.forEach(choice => {
        totalCost += parseInt(choice.dataset.cost) || 0;
    });
    
    const budgetText = document.getElementById('phase4-budget-text');
    const budgetDisplay = document.getElementById('phase4-budget-display'); // Also check this element
    const confirmBtn = document.getElementById('phase4-confirm-btn');
    
    if (budgetText) {
        budgetText.textContent = `${totalCost}/30 points`;
    }
    
    if (budgetDisplay) {
        budgetDisplay.textContent = `${totalCost}/30 points`;
    }
    
    if (confirmBtn) {
        if (totalCost > 0 && totalCost <= 30 && selectedChoices.length > 0) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.remove('btn-primary');
            confirmBtn.classList.add('btn-secondary');
        }
    }
}

function loadStep5Directly() {
    console.log('📥 Loading Step 5 directly via API...');
    const phase5Section = document.getElementById('phase5-section');
    if (phase5Section) {
        phase5Section.style.display = 'block';
    }
    
    // Hide other sections
    document.querySelectorAll('.phase-section').forEach(section => {
        if (section.id !== 'phase5-section') {
            section.style.display = 'none';
        }
    });
    
    fetch('/api/phase5/choices', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.choices) {
                // Try to use GameController first
                if (window.gameController && window.gameController.renderMOT5Choices) {
                    window.gameController.renderMOT5Choices(data.choices);
                    if (window.gameController.loadEnablerDescriptions) {
                        window.gameController.loadEnablerDescriptions();
                    }
                } else {
                    // Fallback: use full rendering function
                    renderMOT5ChoicesFull(data.choices);
                }
            }
        })
        .catch(err => console.error('Error loading Step 5:', err));
}

// Full rendering function for Step 5 choices (fallback if GameController not fully available)
function renderMOT5ChoicesFull(choices) {
    const container = document.getElementById('phase5-choices');
    if (!container) {
        console.error('❌ phase5-choices container not found');
        return;
    }
    
    container.innerHTML = '';
    
    // Define choice details
    const choiceDetails = {
        'boost_self_service_ai': {
            enablers: [
                { id: 'self_service_ai_tools', icon: 'fas fa-tools', label: 'Self-service AI tools', category: 'technology' },
                { id: 'data_ai_academy', icon: 'fas fa-book-open', label: 'Data & AI Academy', category: 'people' },
                { id: 'ai_collaboration_hub', icon: 'fas fa-project-diagram', label: 'AI Collaboration Hub', category: 'people' },
                { id: 'attractive_ai_career_tracks', icon: 'fas fa-user-tie', label: 'Attractive AI career tracks', category: 'people' },
                { id: 'responsible_ai_awareness', icon: 'fas fa-shield-alt', label: 'Responsible AI awareness', category: 'gover' }
            ]
        },
        'build_to_scale': {
            enablers: [
                { id: 'trusted_tech_partners', icon: 'fas fa-handshake', label: 'Trusted tech partners', category: 'technology' },
                { id: 'ai_collaboration_hub', icon: 'fas fa-project-diagram', label: 'AI Collaboration Hub', category: 'people' },
                { id: 'attractive_ai_career_tracks', icon: 'fas fa-user-tie', label: 'Attractive AI career tracks', category: 'people' },
                { id: 'ai_governance_roadmap', icon: 'fas fa-map-signs', label: 'AI Governance Roadmap', category: 'gover' },
                { id: 'responsible_ai_awareness', icon: 'fas fa-shield-alt', label: 'Responsible AI awareness', category: 'gover' }
            ]
        },
        'empower_people_amplify_impact': {
            enablers: [
                { id: 'trusted_tech_partners', icon: 'fas fa-handshake', label: 'Trusted tech partners', category: 'technology' },
                { id: 'data_ai_academy', icon: 'fas fa-book-open', label: 'Data & AI Academy', category: 'people' },
                { id: 'attractive_ai_career_tracks', icon: 'fas fa-user-tie', label: 'Attractive AI career tracks', category: 'people' },
                { id: 'ai_value_office', icon: 'fas fa-chart-line', label: 'AI Value Office', category: 'gover' },
                { id: 'ai_governance_roadmap', icon: 'fas fa-map-signs', label: 'AI Governance Roadmap', category: 'gover' }
            ]
        }
    };
    
    choices.forEach((choice, index) => {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'col-md-4 col-sm-12';
        
        const details = choiceDetails[choice.id] || { enablers: [], description: choice.description };
        
        // Generate content for enablers
        let contentHtml = '';
        if (details.enablers && details.enablers.length > 0) {
            contentHtml = `
                <div class="choice-enablers">
                    ${details.enablers.map(enabler => `
                        <div class="choice-enabler" data-enabler-id="${enabler.id}">
                            <div class="enabler-icon ${enabler.category}">
                                <i class="${enabler.icon}"></i>
                            </div>
                            <div class="enabler-label">${enabler.label}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        const choiceColumn = document.createElement('div');
        choiceColumn.className = 'choice-column';
        choiceColumn.dataset.choiceId = choice.id;
        
        choiceColumn.innerHTML = `
            <div class="choice-header">
                <h4 class="choice-title">${choice.title}</h4>
            </div>
            <div class="choice-content">
                <div class="choice-description">
                    ${choice.description}
                </div>
                ${contentHtml}
            </div>
        `;
        
        // Add click listener
        choiceColumn.addEventListener('click', () => {
            // Remove selection from all
            document.querySelectorAll('.choice-column').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selection to clicked
            choiceColumn.classList.add('selected');
            
            // Enable confirm button
            const confirmBtn = document.getElementById('phase5-confirm-btn');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('btn-secondary');
                confirmBtn.classList.add('btn-primary');
            }
            
            // Also call GameController if available
            if (window.gameController && window.gameController.selectMOT5Choice) {
                window.gameController.selectMOT5Choice(choice.id);
            }
        });
        
        columnDiv.appendChild(choiceColumn);
        container.appendChild(columnDiv);
    });
    
    // Load descriptions if GameController available
    if (window.gameController && window.gameController.loadEnablerDescriptions) {
        window.gameController.loadEnablerDescriptions();
    }
    
    console.log('✅ Rendered Step 5 choices with full visual');
    
    // Setup confirm button listener
    const confirmBtn = document.getElementById('phase5-confirm-btn');
    if (confirmBtn) {
        // Remove existing listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', async () => {
            // Get selected choice
            const selectedColumn = document.querySelector('#phase5-choices .choice-column.selected');
            if (!selectedColumn) {
                if (window.gameController && window.gameController.showAlert) {
                    window.gameController.showAlert('Please select an approach first', 'warning');
                } else {
                    alert('Veuillez sélectionner une approche d\'abord.');
                }
                return;
            }
            
            const choiceId = selectedColumn.dataset.choiceId;
            
            // Use GameController method if available
            if (window.gameController && window.gameController.confirmPhase5Choice) {
                // Store selection in GameController first
                window.gameController.selectedChoices.mot5 = choiceId;
                await window.gameController.confirmPhase5Choice();
            } else {
                // Direct API call as fallback
                try {
                    const response = await fetch('/api/phase5/choose', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ choice_id: choiceId })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        // Show score screen
                        if (window.gameController && window.gameController.showScoreScreen) {
                            // Phase 5 uses results.scores.mot5 from the API response
                            let score = 0;
                            if (data.results && data.results.scores) {
                                score = data.results.scores.mot5 || data.results.scores.get('mot5') || 0;
                            } else if (data.score && data.score.scores) {
                                score = data.score.scores.mot5 || data.score.scores.get('mot5') || 0;
                            }
                            
                            // Use score_data if available, otherwise construct from results
                            const scoreData = data.score_data || {
                                scores: data.results?.scores || {},
                                total: data.results?.total || 0,
                                stars: data.results?.stars || 0
                            };
                            
                            console.log('📊 Step 5 score data:', { score, scoreData, results: data.results });
                            window.gameController.showScoreScreen(5, score, scoreData);
                        } else {
                            // For fallback, ensure we extract the score correctly
                            let score = 0;
                            if (data.results && data.results.scores) {
                                score = data.results.scores.mot5 || (typeof data.results.scores === 'object' && data.results.scores.get ? data.results.scores.get('mot5') : 0) || 0;
                            }
                            console.log('📊 Step 5 score (fallback):', { score, data });
                            showScoreScreenManually(5, { ...data, mot5_score: score });
                        }
                    }
                } catch (err) {
                    console.error('Error confirming Step 5 choice:', err);
                }
            }
        });
    }
}

// Hook into score display to show leaderboard after Step 5
function hookScoreModal() {
    // Check if score modal exists and hook the button
    const setupScoreButton = () => {
        const scoreNextBtn = document.getElementById('score-next-btn');
        if (scoreNextBtn) {
            // Remove any existing listeners by cloning
            const newBtn = scoreNextBtn.cloneNode(true);
            scoreNextBtn.parentNode.replaceChild(newBtn, scoreNextBtn);
            
            newBtn.addEventListener('click', async () => {
                try {
                    // Get current game state
                    const res = await fetch('/api/game_state');
                    const data = await res.json();
                    
                    if (data.success) {
                        const gameState = data.game_state;
                        const currentPath = data.current_path || {};
                        
                        // Check if we just completed Step 5 (results state)
                        if (gameState === 'results' || gameState === 'completed') {
                            // Close score modal first
                            const scoreModal = bootstrap.Modal.getInstance(document.getElementById('scoreModal'));
                            if (scoreModal) {
                                scoreModal.hide();
                            }
                            
                            // Wait a bit then show leaderboard
                            setTimeout(() => {
                                if (window.kahootMode) {
                                    window.kahootMode.showLeaderboard();
                                }
                            }, 300);
                        } else {
                            // Not final step - proceed directly to next step (Kahoot mode: skip dashboard)
                            const scoreModal = bootstrap.Modal.getInstance(document.getElementById('scoreModal'));
                            if (scoreModal) {
                                scoreModal.hide();
                            }
                            
                            // Determine which step was just completed
                            // Use currentPhaseNumber from gameController (set when score modal is shown)
                            let completedStep = window.gameController?.currentPhaseNumber;
                            
                            // If not available, infer from current_path
                            if (!completedStep && currentPath) {
                                if (currentPath.mot5_choice) {
                                    completedStep = 5;
                                } else if (currentPath.mot4_choices && currentPath.mot4_choices.length > 0) {
                                    completedStep = 4;
                                } else if (currentPath.mot3_choices && Object.keys(currentPath.mot3_choices).length > 0) {
                                    completedStep = 3;
                                } else if (currentPath.mot2_choices && currentPath.mot2_choices.length > 0) {
                                    completedStep = 2;
                                } else if (currentPath.mot1_choice) {
                                    completedStep = 1;
                                }
                            }
                            
                            // If still not found, default to 1
                            if (!completedStep) {
                                completedStep = 1;
                            }
                            
                            // Next step is completedStep + 1
                            const nextStep = completedStep + 1;
                            
                            console.log(`🎮 Kahoot mode: Completed Step ${completedStep}, proceeding to Step ${nextStep}`);
                            
                            // Small delay to ensure modal is closed, then proceed
                            setTimeout(() => {
                                // Try to use GameController first (preferred)
                                if (window.gameController) {
                                    console.log('✅ Using GameController methods for Step', nextStep);
                                    switch(nextStep) {
                                        case 2:
                                            if (window.gameController.loadMOT2Choices) {
                                                window.gameController.loadMOT2Choices();
                                            } else {
                                                // Fallback: load directly
                                                loadStep2Directly();
                                            }
                                            break;
                                        case 3:
                                            if (window.gameController.loadMOT3Choices) {
                                                window.gameController.loadMOT3Choices();
                                            } else {
                                                loadStep3Directly();
                                            }
                                            break;
                                        case 4:
                                            if (window.gameController.loadMOT4Choices) {
                                                window.gameController.loadMOT4Choices();
                                            } else {
                                                loadStep4Directly();
                                            }
                                            break;
                                        case 5:
                                            if (window.gameController.loadMOT5Choices) {
                                                window.gameController.loadMOT5Choices();
                                            } else {
                                                loadStep5Directly();
                                            }
                                            break;
                                        default:
                                            console.error('Unknown next step number:', nextStep);
                                    }
                                } else {
                                    // GameController not available - use direct API calls (fallback)
                                    console.warn('⚠️ GameController not available, using direct API calls for Step', nextStep);
                                    switch(nextStep) {
                                        case 2:
                                            loadStep2Directly();
                                            break;
                                        case 3:
                                            loadStep3Directly();
                                            break;
                                        case 4:
                                            loadStep4Directly();
                                            break;
                                        case 5:
                                            loadStep5Directly();
                                            break;
                                        default:
                                            console.error('Unknown next step number:', nextStep);
                                    }
                                }
                            }, 200);
                        }
                    }
                } catch (error) {
                    console.error('Error checking game state:', error);
                }
            });
        } else {
            // Retry after a short delay
            setTimeout(setupScoreButton, 200);
        }
    };
    
    // Start checking
    setupScoreButton();
    
    // Also listen for modal show events to re-setup button
    const scoreModal = document.getElementById('scoreModal');
    if (scoreModal) {
        scoreModal.addEventListener('shown.bs.modal', () => {
            setTimeout(setupScoreButton, 100);
        });
    }
}

// Remove all video sections immediately in Kahoot mode
function removeVideoSections() {
    // Remove video sections immediately to prevent browser preloading
    const sectionsToRemove = [
        'video-intro-section',
        'game-intro',
        'welcome-section',
        'teams-meeting-section',
        'harnessing-video-section',
        'step1-followup-section',
        'phase1-video-section',
        'phase2-video-section',
        'phase3-video-section',
        'phase4-video-section',
        'phase5-1-video-section',
        'phase5-2-video-section',
        'recap-video-section'
    ];
    
    sectionsToRemove.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.remove();
        }
    });
    
    // Remove any remaining video elements
    document.querySelectorAll('video').forEach(video => {
        video.remove();
    });
}

// Initialize when DOM is ready
function initializeKahootMode() {
    removeVideoSections(); // Remove video sections immediately
    
    // Vérifier si l'utilisateur est déjà connecté en admin
    // Si oui, afficher le panneau admin et cacher le login
    const adminSection = document.getElementById('admin-section');
    const loginSection = document.getElementById('login-section');
    
    // Vérifier si on est sur la page après une connexion admin réussie
    // En vérifiant si la section admin doit être affichée (cachée par défaut maintenant)
    // On vérifie plutôt via un indicateur dans la session ou via un élément du DOM
    
    // Pour l'instant, on se base sur le fait que si login-section existe,
    // on affiche le formulaire de connexion. Sinon, l'utilisateur est déjà connecté.
    
    // Pré-remplir le code de session depuis l'URL ou la variable Jinja (uniquement en mode joueur)
    const sessionCodeInput = document.getElementById('session-code');
    if (sessionCodeInput) {
        // Vérifier l'URL pour le paramètre ?session=CODE
        const urlParams = new URLSearchParams(window.location.search);
        const sessionCodeFromUrl = urlParams.get('session');
        
        // Vérifier aussi la variable Jinja si disponible
        const sessionCodeFromTemplate = typeof sessionCode !== 'undefined' ? sessionCode : null;
        
        // Utiliser celui de l'URL en priorité, sinon celui du template
        const codeToUse = sessionCodeFromUrl || sessionCodeFromTemplate;
        
        if (codeToUse) {
            sessionCodeInput.value = codeToUse.toUpperCase();
            // Basculer automatiquement en mode joueur si code présent
            // Doit être fait après la création de l'instance
            setTimeout(() => {
                if (window.kahootMode) {
                    window.kahootMode.switchToPlayerMode();
                }
            }, 100);
        }
        
        // Forcer les majuscules lors de la saisie
        sessionCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
    }
    
    window.kahootMode = new KahootMode();
    hookScoreModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeKahootMode);
} else {
    initializeKahootMode();
}

// Export for global access
window.KahootMode = KahootMode;

