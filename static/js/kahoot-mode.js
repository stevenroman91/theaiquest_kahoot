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
                        
                        const details = choiceDetails[choice.id] || { enablers: [], use_cases: [], description: choice.description };
                        
                        // Générer le contenu selon le type de choix
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
                        } else if (details.use_cases && details.use_cases.length > 0) {
                            contentHtml = `
                                <div class="choice-use-cases">
                                    <h5><i class="fas fa-lightbulb me-2"></i>Launch 6 use case pilots immediately</h5>
                                    ${details.use_cases.map(useCase => {
                                        return `
                                        <div class="choice-use-case" data-use-case-id="${useCase.id}">
                                            <div class="use-case-icon">
                                                <i class="${useCase.icon}"></i>
                                            </div>
                                            <div class="use-case-label">${useCase.label}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                    </div>
                            `;
                        }
                        
                        // Define custom titles for each choice with photos (COPIÉ DE GAME.JS)
                        const customTitles = {
                            'elena': '<img src="/static/images/Elena_photo.png" alt="Elena" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Map where AI creates the most value and align with company culture',
                            'james': '<img src="/static/images/James_photo.png" alt="James" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Build strong foundations:<br>secure data, tools,<br>and architecture first',
                            'amira': '<img src="/static/images/Amira_photo.png" alt="Amira" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Act fast - democratize AI,<br>let teams experiment immediately'
                        };
                        
                        const displayTitle = customTitles[choice.id] || choice.title;
                        
                        // Créer l'élément choice-column
                        const choiceColumn = document.createElement('div');
                        choiceColumn.className = 'choice-column';
                        choiceColumn.dataset.choiceId = choice.id;
                        
                        // Ajouter l'event listener pour la sélection
                        choiceColumn.addEventListener('click', () => {
                            handleChoiceSelection(choice.id);
                        });
                        
                        choiceColumn.innerHTML = `
                            <div class="choice-header">
                                <h4 class="choice-title" style="display: flex; align-items: center;">${displayTitle}</h4>
                            </div>
                            <div class="choice-content">
                                ${contentHtml}
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
                                showScoreScreenManually(1, data);
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
                const showScoreScreenManually = (phaseNumber, apiData) => {
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
            const response = await fetch('/api/leaderboard?limit=50');
            const data = await response.json();

            if (data.success) {
                this.populateLeaderboard(data.leaderboard, data.user_rank);
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
                modal.show();
            } else {
                console.error('Error loading leaderboard:', data.message);
            }
        } catch (error) {
            console.error('Leaderboard error:', error);
        }
    }

    populateLeaderboard(leaderboard, userRank) {
        const tbody = document.getElementById('leaderboard-tbody');
        const statsDiv = document.getElementById('leaderboard-stats');
        const tableContainer = document.querySelector('.leaderboard-table-container');
        
        if (!tbody) {
            console.error('Leaderboard tbody not found');
            return;
        }

        console.log(`📊 Populating leaderboard with ${leaderboard.length} players:`, leaderboard.map(e => e.username));

        // Clear existing content
        tbody.innerHTML = '';

        // Get current username from session or somewhere else
        const currentUsername = this.getCurrentUsername();

        // Populate stats
        if (statsDiv) {
            const totalPlayers = leaderboard.length;
            const avgScore = leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.total_score, 0) / leaderboard.length)
                : 0;
            const topScore = leaderboard.length > 0 ? leaderboard[0].total_score : 0;

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
        leaderboard.forEach((entry, index) => {
            console.log(`  Adding player ${index + 1}: ${entry.username} (Rank ${entry.rank}, Score ${entry.total_score})`);
            const row = document.createElement('tr');
            
            // Highlight top 3
            if (entry.rank <= 3) {
                row.classList.add('top-three');
            }
            
            // Add rank class for medal display
            if (entry.rank === 1) {
                row.classList.add('rank-1');
            } else if (entry.rank === 2) {
                row.classList.add('rank-2');
            } else if (entry.rank === 3) {
                row.classList.add('rank-3');
            }
            
            // Highlight current user
            if (entry.username === currentUsername) {
                row.classList.add('user-row');
            }

            // Create stars display
            const starsHTML = this.createStarsDisplay(entry.stars);

            // Add rank class to rank column for medal emojis
            const rankClass = entry.rank <= 3 ? `rank-col rank-${entry.rank}` : 'rank-col';
            const rankDisplay = entry.rank <= 3 ? '' : entry.rank; // Empty for top 3 (shown via ::before)

            row.innerHTML = `
                <td class="${rankClass}">${rankDisplay}</td>
                <td class="name-col">${this.escapeHtml(entry.username)}</td>
                <td class="score-col">${entry.total_score}/15</td>
                <td class="stars-col">${starsHTML}</td>
            `;

            tbody.appendChild(row);
        });

        console.log(`✅ Leaderboard populated: ${tbody.children.length} rows created`);

        // Scroll to top to ensure first player is visible
        if (tableContainer) {
            setTimeout(() => {
                tableContainer.scrollTop = 0;
            }, 100);
        }

        // If leaderboard is empty
        if (leaderboard.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="mb-0">No scores yet. Be the first to play!</p>
                    </td>
                </tr>
            `;
        }
    }

    createStarsDisplay(count) {
        let starsHTML = '<div class="stars-display">';
        for (let i = 0; i < 3; i++) {
            if (i < count) {
                starsHTML += '<i class="fas fa-star star-icon"></i>';
            } else {
                starsHTML += '<i class="far fa-star star-icon" style="opacity: 0.3;"></i>';
            }
        }
        starsHTML += '</div>';
        return starsHTML;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                            
                            // Go directly to next step (skip videos and dashboard)
                            // Wait for GameController to be available if needed
                            const proceedToNextStep = () => {
                                if (window.gameController) {
                                    // Call the appropriate method directly
                                    switch(nextStep) {
                                        case 2:
                                            // Go to Step 2 - use existing GameController methods
                                            if (window.gameController.loadMOT2Choices) {
                                                window.gameController.loadMOT2Choices();
                                            } else if (window.gameController.startPhase2Game) {
                                                window.gameController.startPhase2Game();
                                            }
                                            break;
                                        case 3:
                                            // Go to Step 3
                                            if (window.gameController.loadMOT3Choices) {
                                                window.gameController.loadMOT3Choices();
                                            } else if (window.gameController.startPhase3Game) {
                                                window.gameController.startPhase3Game();
                                            }
                                            break;
                                        case 4:
                                            // Go to Step 4
                                            if (window.gameController.loadMOT4Choices) {
                                                window.gameController.loadMOT4Choices();
                                            } else if (window.gameController.startPhase4Game) {
                                                window.gameController.startPhase4Game();
                                            }
                                            break;
                                        case 5:
                                            // Go to Step 5
                                            if (window.gameController.loadMOT5Choices) {
                                                window.gameController.loadMOT5Choices();
                                            } else if (window.gameController.startPhase5Game) {
                                                window.gameController.startPhase5Game();
                                            }
                                            break;
                                        default:
                                            console.error('Unknown next step number:', nextStep);
                                    }
                                } else {
                                    // GameController not available yet - wait and retry
                                    console.warn('⚠️ GameController not yet available, retrying...');
                                    setTimeout(proceedToNextStep, 100);
                                }
                            };
                            
                            // Small delay to ensure modal is closed, then proceed
                            setTimeout(proceedToNextStep, 200);
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

