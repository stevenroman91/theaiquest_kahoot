// AI Acceleration EXEC - Game Logic

class GameController {
    constructor() {
        this.currentState = 'login';
        this.selectedChoices = {
            mot1: null,
            mot2: [],
            mot3: {},
            mot4: [],
            mot5: null
        };
        this.budget = 0;
        this.maxBudget = 30;
        this.currentPhaseNumber = 1;
        this.gameConfig = null;
        
        this.initializeEventListeners();
        this.loadGameConfig();
    }

    async loadGameConfig() {
        // Load game configuration from template
        try {
            const response = await fetch('/api/game_config');
            const data = await response.json();
            
            if (data.success) {
                this.gameConfig = data.config;
                this.updateUIWithConfig();
            } else {
                console.error('Failed to load game config:', data.message);
            }
        } catch (error) {
            console.error('Error loading game config:', error);
        }
    }

    updateUIWithConfig() {
        // Update UI elements with template configuration
        if (!this.gameConfig) return;
        
        // Update page title
        document.title = "The AI Quest - PlayForward";
        
        // Update game title in UI
        const gameTitleElement = document.querySelector('.game-title');
        if (gameTitleElement) {
            gameTitleElement.textContent = "The AI Quest";
        }
        
        // Update company name
        const companyNameElements = document.querySelectorAll('.company-name');
        companyNameElements.forEach(element => {
            element.textContent = "PlayForward - Build your AI journey";
        });
        
        // Update Teams meeting text
        const teamsMeetingText = document.querySelector('.teams-meeting-text');
        if (teamsMeetingText) {
            teamsMeetingText.textContent = this.gameConfig.ui_text.teams_meeting.text;
        }
        
        // Update Teams meeting button text
        const teamsMeetingButton = document.querySelector('#join-teams-meeting-btn');
        if (teamsMeetingButton) {
            teamsMeetingButton.textContent = this.gameConfig.ui_text.teams_meeting.button_text;
        }
        
        // Update terminology throughout the UI
        if (this.gameConfig.terminology) {
            const phaseTerm = this.gameConfig.terminology.phase || 'Phase';
            
            // Update all phase titles
            document.querySelectorAll('.phase-title, .step-title').forEach(element => {
                element.textContent = element.textContent.replace(/Phase \d+/g, (match) => {
                    const number = match.match(/\d+/)[0];
                    return `${phaseTerm} ${number}`;
                });
            });
            
            // Update phase indicators in progress bar
            document.querySelectorAll('.phase-indicator').forEach(element => {
                element.textContent = element.textContent.replace(/Phase/g, phaseTerm);
            });
            
            // Update dashboard titles
            document.querySelectorAll('.dashboard-title').forEach(element => {
                element.textContent = element.textContent.replace(/Phase/g, phaseTerm);
            });
        }
        
        // Update dashboard title
        const dashboardTitle = document.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.textContent = this.gameConfig.ui_text.dashboard.title;
        }
        
        // Update dashboard subtitle
        const dashboardSubtitle = document.querySelector('.dashboard-subtitle');
        if (dashboardSubtitle) {
            dashboardSubtitle.textContent = this.gameConfig.ui_text.dashboard.subtitle;
        }
    }

    initializeEventListeners() {
        // Vérifier si c'est un hard refresh et ajouter reset=1
        if (performance.navigation.type === 1) { // Hard refresh
            const url = new URL(window.location);
            url.searchParams.set('reset', '1');
            window.history.replaceState({}, '', url);
        }
        
        // Bypass login: start immediately
        const loginSection = document.getElementById('login-section');
        if (loginSection) loginSection.style.display = 'none';
        this.handleLoginAndStart();
        
        // Validation en temps réel pour login
        document.getElementById('username').addEventListener('input', () => {
            this.validateUsernameField();
        });
        
        document.getElementById('password').addEventListener('input', () => {
            this.validatePasswordField();
        });

        // Start game button (removed - handled by handleLoginAndStart)

        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            window.location.href = '/?reset=1';
        });

        // Score screen next button
        const scoreNextBtn = document.getElementById('score-next-btn');
        if (scoreNextBtn) {
            scoreNextBtn.addEventListener('click', () => {
                console.log('=== SCORE SCREEN NEXT BUTTON CLICKED ===');
                // Hide score modal
                const scoreModal = bootstrap.Modal.getInstance(document.getElementById('scoreModal'));
                if (scoreModal) {
                    scoreModal.hide();
                }
                // Show executive dashboard
                this.showExecutiveDashboard(this.currentPhaseNumber, this.currentScoreData.scores[this.currentPhaseNumber], this.currentScoreData);
            });
        }

        // Next button in executive dashboard
        document.getElementById('dashboard-next-button').addEventListener('click', () => {
            // Version 1.4: Get Phase number from the modal title or use stored value
            const phaseNumber = this.currentPhaseNumber || 1;
            console.log('Dashboard next button clicked, Phase number:', phaseNumber);
            
            // Hide the executive dashboard modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('executiveDashboardModal'));
            if (modal) {
                modal.hide();
            }
            
            // After Step 1, show Step 1 follow-up screen
            if (phaseNumber === 1) {
                this.showStep1FollowupScreen();
            } else if (phaseNumber === 2) {
                // After Step 2, show Pilot Phase transition screen
                this.showPilotPhaseScreen();
            } else if (phaseNumber === 3) {
                // After Step 3, show Step 4 transition screen
                this.showStep4TransitionScreen();
            } else if (phaseNumber === 4) {
                // After Step 4, show Enterprise Scaling transition screen
                this.showScalingPhaseScreen();
            } else {
                // Proceed directly to next phase for other steps
                this.proceedToNextMOT(phaseNumber);
            }
        });

        // Skip video button
        document.getElementById('skip-video-btn').addEventListener('click', () => {
            this.skipVideo();
        });

        // Start game button (after video)
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGameAfterVideo();
        });

        // Next to Phase1 video button
        const nextToHarnessingBtn = document.getElementById('next-to-harnessing-btn');
        if (nextToHarnessingBtn) {
            nextToHarnessingBtn.addEventListener('click', () => {
                this.showTeamsMeetingSection();
            });
        }

        // Continue after Phase1 video button
        const continueAfterMOT1VideoBtn = document.getElementById('continue-after-phase1-video-btn');
        if (continueAfterMOT1VideoBtn) {
            continueAfterMOT1VideoBtn.addEventListener('click', () => {
                this.startMOT1Game();
            });
        }

        // Continue after Phase2 video button
        const continueAfterPhase2VideoBtn = document.getElementById('continue-after-phase2-video-btn');
        if (continueAfterPhase2VideoBtn) {
            continueAfterPhase2VideoBtn.addEventListener('click', () => {
                this.startPhase2Game();
            });
        }

        // Continue after Phase3 video button
        const continueAfterPhase3VideoBtn = document.getElementById('continue-after-phase3-video-btn');
        if (continueAfterPhase3VideoBtn) {
            continueAfterPhase3VideoBtn.addEventListener('click', () => {
                this.startPhase3Game();
            });
        }

        // Continue after Phase4 video button
        const continueAfterPhase4VideoBtn = document.getElementById('continue-after-phase4-video-btn');
        if (continueAfterPhase4VideoBtn) {
            continueAfterPhase4VideoBtn.addEventListener('click', () => {
                this.startPhase4Game();
            });
        }

        // Call after Phase5-1 video button
        const callAfterPhase5_1VideoBtn = document.getElementById('call-after-phase5-1-video-btn');
        if (callAfterPhase5_1VideoBtn) {
            callAfterPhase5_1VideoBtn.addEventListener('click', () => {
                this.showPhase5_2Video();
            });
        }

        // Continue after Phase5-2 video button
        const continueAfterPhase5_2VideoBtn = document.getElementById('continue-after-phase5-2-video-btn');
        if (continueAfterPhase5_2VideoBtn) {
            continueAfterPhase5_2VideoBtn.addEventListener('click', () => {
                this.startPhase5Game();
            });
        }

        // Finish game button
        const finishGameBtn = document.getElementById('finish-game-btn');
        if (finishGameBtn) {
            finishGameBtn.addEventListener('click', () => {
                this.finishGame();
            });
        }

        // Skip harnessing button
        const skipHarnessingBtn = document.getElementById('skip-harnessing-btn');
        if (skipHarnessingBtn) {
            skipHarnessingBtn.addEventListener('click', () => {
                this.skipHarnessingVideo();
            });
        }

        // Join Teams meeting button
        const joinTeamsMeetingBtn = document.getElementById('join-teams-meeting-btn');
        if (joinTeamsMeetingBtn) {
            joinTeamsMeetingBtn.addEventListener('click', () => {
                this.showMOT1Video();
            });
        }

        // Continue to Step 2 button
        const continueToStep2Btn = document.getElementById('continue-to-step2-btn');
        if (continueToStep2Btn) {
            continueToStep2Btn.addEventListener('click', () => {
                this.proceedToNextMOT(1);
            });
        }

        // Start game after harnessing button
        const startGameAfterHarnessingBtn = document.getElementById('start-game-after-harnessing-btn');
        if (startGameAfterHarnessingBtn) {
            startGameAfterHarnessingBtn.addEventListener('click', () => {
                this.startMOT1Game();
            });
        }

        // Continue Welcome button
        const continueWelcomeBtn = document.getElementById('continue-welcome-btn');
        if (continueWelcomeBtn) {
            continueWelcomeBtn.addEventListener('click', () => {
                this.showIntroductionVideo();
            });
        }

        // Continue Pilot Phase button
        const continuePilotPhaseBtn = document.getElementById('continue-pilot-phase-btn');
        if (continuePilotPhaseBtn) {
            continuePilotPhaseBtn.addEventListener('click', () => {
                console.log('Continue Pilot Phase button clicked!');
                this.proceedToNextMOT(2); // Proceed to Phase 3 after Step 2
            });
        }

        // Continue to Step 4 button
        const continueToStep4Btn = document.getElementById('continue-to-step4-btn');
        if (continueToStep4Btn) {
            continueToStep4Btn.addEventListener('click', () => {
                console.log('Continue to Step 4 button clicked!');
                this.proceedToNextMOT(3); // Proceed to Phase 4 after Step 3
            });
        }

        // Continue Scaling Phase button
        const continueScalingPhaseBtn = document.getElementById('continue-scaling-phase-btn');
        if (continueScalingPhaseBtn) {
            continueScalingPhaseBtn.addEventListener('click', () => {
                console.log('Continue Enterprise Scaling button clicked!');
                this.proceedToNextMOT(4); // Proceed to Phase 5 after Step 4
            });
        }

        // Phase 1 confirm button
        const phase1ConfirmBtn = document.getElementById('phase1-confirm-btn');
        if (phase1ConfirmBtn) {
            phase1ConfirmBtn.addEventListener('click', () => {
                console.log('Phase 1 confirm button clicked!');
                this.confirmPhase1Choice();
            });
        }

        // Phase 2 confirm button
        const mot2ConfirmBtn = document.getElementById('phase2-confirm-btn');
        if (mot2ConfirmBtn) {
            mot2ConfirmBtn.addEventListener('click', () => {
                console.log('Phase 2 confirm button clicked!');
                this.confirmPhase2Choices();
            });
        }

        // Phase 3 confirm button
        const phase3ConfirmBtn = document.getElementById('phase3-confirm-btn');
        console.log('Phase 3 confirm button found:', phase3ConfirmBtn);
        if (phase3ConfirmBtn) {
            phase3ConfirmBtn.addEventListener('click', () => {
                console.log('Phase 3 confirm button clicked!');
                this.confirmMOT3Choices();
            });
        }

        // Phase 4 confirm button
        const phase4ConfirmBtn = document.getElementById('phase4-confirm-btn');
        console.log('Phase 4 confirm button found:', phase4ConfirmBtn);
        if (phase4ConfirmBtn) {
            phase4ConfirmBtn.addEventListener('click', function() {
                console.log('=== Phase 4 CONFIRM BUTTON CLICKED ===');
                gameController.confirmMOT4Choices();
            });
        } else {
            console.log('Phase 4 confirm button NOT FOUND!');
        }

        // Phase 5 confirm button
        const phase5ConfirmBtn = document.getElementById('phase5-confirm-btn');
        if (phase5ConfirmBtn) {
            phase5ConfirmBtn.addEventListener('click', () => {
                console.log('Phase 5 confirm button clicked!');
                this.confirmPhase5Choice();
            });
        }

    }

    // Validation des champs de login
    validateUsernameField() {
        const usernameField = document.getElementById('username');
        const usernameError = document.getElementById('username-error');
        const value = usernameField.value.trim();
        
        if (!value) {
            usernameField.classList.add('is-invalid');
            usernameError.textContent = 'Username is required';
            return false;
        } else if (value.length < 2) {
            usernameField.classList.add('is-invalid');
            usernameError.textContent = 'Username must contain at least 2 characters';
            return false;
        } else if (value.length > 50) {
            usernameField.classList.add('is-invalid');
            usernameError.textContent = 'Username cannot exceed 50 characters';
            return false;
        } else {
            usernameField.classList.remove('is-invalid');
            usernameField.classList.add('is-valid');
            return true;
        }
    }
    
    validatePasswordField() {
        const passwordField = document.getElementById('password');
        const passwordError = document.getElementById('password-error');
        const value = passwordField.value;
        
        if (!value) {
            passwordField.classList.add('is-invalid');
            passwordError.textContent = 'Password is required';
            return false;
        } else if (value.length < 6) {
            passwordField.classList.add('is-invalid');
            passwordError.textContent = 'Password must contain at least 6 characters';
            return false;
        } else {
            passwordField.classList.remove('is-invalid');
            passwordField.classList.add('is-valid');
            return true;
        }
    }
    
    showLoginAlert(message, type = 'danger') {
        const alert = document.getElementById('login-alert');
        const alertMessage = document.getElementById('login-alert-message');
        
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alertMessage.textContent = message;
        alert.style.display = 'block';
        
        // Auto-hide après 5 secondes pour les messages de succès
        if (type === 'success') {
            setTimeout(() => {
                alert.style.display = 'none';
            }, 5000);
        }
    }
    
    hideLoginAlert() {
        const alert = document.getElementById('login-alert');
        alert.style.display = 'none';
    }
    
    setLoginLoading(loading) {
        const submitBtn = document.getElementById('login-submit-btn');
        const btnText = document.getElementById('login-btn-text');
        const btnLoading = document.getElementById('login-btn-loading');
        
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    async handleLoginAndStart() {
        console.log('🔐 handleLoginAndStart called');
        
        // Skip form validation for guest flow
        this.setLoginLoading(true);

        try {
            // Directly start game (guest session is created server-side)
                const startResponse = await fetch('/api/start_game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                const startData = await startResponse.json();
                console.log('🎮 Start game response:', startData);

                if (startData.success) {
                    console.log('🎯 Game started successfully');
                    // Hide login and show video
                    document.getElementById('login-section').style.display = 'none';
                    this.showSection('video-intro-section');
                    document.getElementById('progress-card').style.display = 'block';
                    this.updateProgress(5, 'Introduction Video');
                    
                    // Initialize intro video
                    initializeIntroVideo();
                    
                    // Reset button states
                    document.getElementById('skip-video-btn').style.display = 'inline-block';
                    document.getElementById('start-game-btn').style.display = 'none';
                } else {
                    console.log('❌ Error starting game');
                    this.showLoginAlert('Error starting the game', 'danger');
                }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginAlert('Server connection error', 'danger');
        } finally {
            this.setLoginLoading(false);
        }
    }

    showSection(sectionId) {
        console.log('=== showSection called with:', sectionId, '===');
        // Hide all sections except use-cases-section
        document.querySelectorAll('[id$="-section"]').forEach(section => {
            if (section.id !== 'use-cases-section') {
            section.style.display = 'none';
            }
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        console.log('Target section element:', targetSection);
        if (targetSection) {
            targetSection.style.display = 'block';
            console.log('Section', sectionId, 'should now be visible');
        } else {
            console.error('Section', sectionId, 'not found!');
        }
    }

    updateProgress(percentage, text) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const alertId = 'alert-' + Date.now();
        
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }

    hideAlert() {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = '';
        }
    }

    // Désactiver l'autoplay de toutes les vidéos au chargement (sauf la première)
    disableAllVideoAutoplay() {
        const videoIds = [
            'intro-video', 
            'harnessing-video',
            'phase1-video',
            'phase2-video',
            'phase3-video',
            'phase4-video',
            'phase5-1-video',
            'phase5-2-video',
            'recap-video',
            'recap-video-results'
        ];
        
        videoIds.forEach(videoId => {
            const video = document.getElementById(videoId);
            if (video) {
                video.removeAttribute('autoplay');
                video.pause();
                video.currentTime = 0; // Remettre au début
            }
        });
        
        // La première vidéo (presentation-video) sera lancée quand la section sera visible
        console.log('First video (presentation-video) will be launched when section is visible');
    }

    // Lancer une vidéo spécifique avec le son
    playVideo(videoId) {
        const video = document.getElementById(videoId);
        if (video) {
            // Arrêter toutes les autres vidéos
            this.stopAllVideos();
            
            // Configurer cette vidéo
            video.currentTime = 0; // Remettre au début
            video.muted = false; // Essayer avec le son
            
            // Lancer la vidéo avec le son
            video.play().then(() => {
                console.log(`Video ${videoId} playing with sound`);
            }).catch((error) => {
                console.log(`Video ${videoId} play with sound failed, trying muted:`, error);
                // Si ça échoue, essayer en muet
                video.muted = true;
                video.play().catch((error2) => {
                    console.log(`Video ${videoId} muted play also failed:`, error2);
                });
            });
        }
    }

    stopAllVideos() {
        // Liste de tous les IDs de vidéos possibles
        const videoIds = [
            'presentation-video',
            'intro-video', 
            'harnessing-video',
            'phase1-video',
            'phase2-video',
            'phase3-video',
            'phase4-video',
            'phase5-1-video',
            'phase5-2-video',
            'recap-video',
            'recap-video-results'
        ];
        
        // Arrêter toutes les vidéos
        videoIds.forEach(videoId => {
            const videoElement = document.getElementById(videoId);
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
                console.log(`Stopped video: ${videoId}`);
            }
        });
        
        // Arrêter aussi toutes les vidéos dans la page (au cas où)
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
        
        console.log('All videos stopped');
    }

    skipVideo() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Passer à la page Welcome
        this.showWelcomeSection();
    }

    startGameAfterVideo() {
        // Hide video and show Welcome page
        this.showWelcomeSection();
    }

    showWelcomeSection() {
        console.log('🔵 showWelcomeSection() called');
        
        // Show Welcome section
        this.showSection('welcome-section');
        this.updateProgress(10, 'Welcome');
    }

    showTeamsMeetingSection() {
        console.log('🔵 showTeamsMeetingSection() called');
        
        // Show Teams Meeting section
        this.showSection('teams-meeting-section');
        this.updateProgress(20, 'Teams Meeting');
    }

    showIntroductionVideo() {
        // Hide Welcome section and show intro video (intro.mp4)
        this.showSection('harnessing-video-section');
        this.updateProgress(15, 'Introduction');
        
        // Initialize intro video
        initializeHarnessingVideo();
        
        // Reset button states
        document.getElementById('skip-harnessing-btn').style.display = 'inline-block';
        document.getElementById('start-game-after-harnessing-btn').style.display = 'none';
    }

    showPilotPhaseScreen() {
        console.log('🚀 showPilotPhaseScreen() called');
        
        // Update the text based on selected use cases
        this.updatePilotPhaseText();
        
        // Show Pilot Phase section
        this.showSection('pilot-phase-section');
        this.updateProgress(55, 'Pilot Step');
    }

    updatePilotPhaseText() {
        // Get the selected use cases from Step 2
        const selectedUseCases = this.selectedChoices.mot2 || [];
        console.log('Selected use cases for pilot phase:', selectedUseCases);
        
        // Map use case IDs to their display names
        const useCaseNames = {
            'fraud_integrity_detection': 'Fraud & Integrity Detection',
            'ai_storyline_generator': 'AI-Powered Storyline Generator',
            'smart_game_design_assistant': 'Smart Game Design Assistant',
            'player_journey_optimizer': 'Player Journey Optimizer',
            'talent_analytics_dashboard': 'Talent Analytics Dashboard'
        };
        
        // Get the display names for selected use cases
        const selectedNames = selectedUseCases.map(id => useCaseNames[id] || id);
        
        // Create the dynamic text
        let projectsText = '';
        if (selectedNames.length > 0) {
            if (selectedNames.length === 1) {
                projectsText = `The selected project — ${selectedNames[0]} — is now moving into pilot phase.`;
            } else if (selectedNames.length === 2) {
                projectsText = `The two selected projects — ${selectedNames[0]} and ${selectedNames[1]} — are now moving into pilot phase.`;
            } else {
                const lastProject = selectedNames.pop();
                projectsText = `The ${selectedNames.length + 1} selected projects — ${selectedNames.join(', ')}, and ${lastProject} — are now moving into pilot phase.`;
            }
        } else {
            projectsText = 'The selected projects are now moving into pilot phase.';
        }
        
        // Update the text in the pilot phase section
        const pilotPhaseText = document.getElementById('pilot-phase-text');
        if (pilotPhaseText) {
            pilotPhaseText.innerHTML = `
                The selected projects are now moving into pilot phase. Each team has started working with vendors, datasets, and internal champions.
                <br><br>
                Sophie's next challenge is to ensure that these pilots not only deliver results but also that the teams invest on the right enablers that accelerate transformation, build trust, and make change sustainable. Which enablers will you choose?
            `;
        }
    }

    showStep1FollowupScreen() {
        console.log('📊 showStep1FollowupScreen() called');
        
        // Show Step 1 follow-up section
        this.showSection('step1-followup-section');
        this.updateProgress(40, 'Strategic Assessment Complete');
    }

    showStep4TransitionScreen() {
        console.log('📈 showStep4TransitionScreen() called');
        
        // Show Step 4 transition section
        this.showSection('step4-transition-section');
        this.updateProgress(70, 'STEP 4: Scaling Your AI and GenAI Solutions');
    }

    showScalingPhaseScreen() {
        console.log('📈 showScalingPhaseScreen() called');
        
        // Show Scaling Phase section
        this.showSection('scaling-phase-section');
        this.updateProgress(80, 'Scaling Phase');
    }

    showMOT1Video() {
        // Show all hidden elements again
        const elementsToShow = [
            '.header-brand',
            '.main-container',
            '.progress-container'
        ];
        
        elementsToShow.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) el.style.display = '';
            });
        });
        
        // Show Phase1 video
        this.showSection('phase1-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase1-video');
        this.updateProgress(25, this.gameConfig.phases.phase1.title);
        
        // Initialize Phase1 video
        initializePhase1Video();
    }

    showPhase2Video() {
        // Hide all other sections
        document.getElementById('phase1-video-section').style.display = 'none';
        document.getElementById('phase1-section').style.display = 'none';
        
        // Show Phase2 video
        this.showSection('phase2-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase2-video');
        
        this.updateProgress(45, 'STEP 2: Building Your AI Use Cases Portfolio');
        
        // Initialize Phase2 video
        initializePhase2Video();
    }

    showPhase3Video() {
        // Hide all other sections
        document.getElementById('phase2-video-section').style.display = 'none';
        document.getElementById('phase2-section').style.display = 'none';
        
        // Show Phase3 video
        this.showSection('phase3-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase3-video');
        
        this.updateProgress(60, 'STEP 3: Launching Your Priority AI Pilots');
        
        // Initialize Phase3 video
        initializePhase3Video();
    }

    showPhase4Video() {
        // Hide all other sections
        document.getElementById('phase3-video-section').style.display = 'none';
        document.getElementById('phase3-section').style.display = 'none';
        
        // Show Phase4 video
        this.showSection('phase4-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase4-video');
        
        this.updateProgress(70, 'STEP 4: Scaling Your Priority AI and GenAI Solutions');
        
        // Initialize Phase4 video
        initializePhase4Video();
    }

    showPhase5_1Video() {
        // Hide all other sections
        document.getElementById('phase4-video-section').style.display = 'none';
        document.getElementById('phase4-section').style.display = 'none';
        
        // Show Phase5-1 video
        this.showSection('phase5-1-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase5-1-video');
        
        this.updateProgress(80, 'STEP 5: Deploying AI Across the Organization');
        
        // Initialize Phase5-1 video
        initializePhase5_1Video();
    }

    showPhase5_2Video() {
        // Hide all other sections
        document.getElementById('phase5-1-video-section').style.display = 'none';
        
        // Show Phase5-2 video
        this.showSection('phase5-2-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('phase5-2-video');
        
        this.updateProgress(85, 'STEP 5: Deploying AI Across the Organization');
        
        // Initialize Phase5-2 video
        initializePhase5_2Video();
    }

    showRecapVideo() {
        // Hide all other sections
        document.getElementById('phase5-2-video-section').style.display = 'none';
        document.getElementById('phase5-section').style.display = 'none';
        
        // Show Recap video
        this.showSection('recap-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('recap-video');
        
        this.updateProgress(90, 'Game Recap');
        
        // Initialize Recap video
        this.initializeRecapVideo();
    }

    showHarnessingVideo() {
        // Hide game intro completely
        document.getElementById('game-intro').style.display = 'none';
        
        // Show harnessing video
        this.showSection('harnessing-video-section');
        
        // Lancer la vidéo avec le son
        this.playVideo('harnessing-video');
        
        this.updateProgress(15, 'Vidéo Introduction');
        
        // Initialize harnessing video
        initializeHarnessingVideo();
        
        // Reset button states
        document.getElementById('skip-harnessing-btn').style.display = 'inline-block';
        document.getElementById('start-game-after-harnessing-btn').style.display = 'none';
    }

    skipHarnessingVideo() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide harnessing video section completely
        document.getElementById('harnessing-video-section').style.display = 'none';
        
        // Go to Teams Meeting instead of directly to Step 1
        this.showTeamsMeetingSection();
    }

    startMOT1Game() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide MOT1 video section completely
        document.getElementById('phase1-video-section').style.display = 'none';
        
        // Go directly to MOT1 game
        this.loadMOT1Choices();
        this.updateProgress(25, 'Game Start');
    }

    startPhase2Game() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide Phase2 video section completely
        document.getElementById('phase2-video-section').style.display = 'none';
        
        // Go directly to Phase2 game
        this.loadMOT2Choices();
    }

    startPhase3Game() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide Phase3 video section completely
        document.getElementById('phase3-video-section').style.display = 'none';
        
        // Go directly to Phase3 game
        this.loadMOT3Choices();
    }

    startPhase4Game() {
        console.log('=== startPhase4Game called ===');
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide Phase4 video section completely
        document.getElementById('phase4-video-section').style.display = 'none';
        
        // Go directly to Phase4 game
        console.log('Calling loadMOT4Choices...');
        this.loadMOT4Choices();
    }

    startPhase5Game() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide Phase5-2 video section completely
        document.getElementById('phase5-2-video-section').style.display = 'none';
        
        // Go directly to Phase5 game
        this.loadMOT5Choices();
    }

    finishGame() {
        // Hide recap video section completely
        document.getElementById('recap-video-section').style.display = 'none';
        
        // Show completion message
        this.showAlert('Félicitations ! Vous avez terminé le jeu !', 'success');
        
        // Reset game state if needed
        this.currentPhaseNumber = 1;
    }

    async loadMOT1Choices() {
        try {
            console.log('🔍 Loading MOT1 choices...');
            const response = await fetch('/api/phase1/choices', {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('📡 MOT1 API response:', data);

            if (data.success) {
                console.log('✅ MOT1 choices loaded successfully');
                this.renderMOT1Choices(data.choices);
                this.showSection('phase1-section');
            } else {
                console.error('❌ MOT1 API failed:', data.message);
                this.showAlert('Erreur lors du chargement des choix: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('❌ MOT1 loading error:', error);
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT1Choices(choices) {
        const container = document.getElementById('phase1-choices');
        container.innerHTML = '';

        // Define choice details based on the template
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

        // Define custom descriptions with speaker names
        const customDescriptions = {
            // Descriptions supprimées comme demandé
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
            
            // Define custom titles for each choice with photos
            const customTitles = {
                'elena': '<img src="/static/images/Elena_photo.png" alt="Elena" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Map where AI creates the most value and align with company culture',
                'james': '<img src="/static/images/James_photo.png" alt="James" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Build strong foundations:<br>secure data, tools,<br>and architecture first',
                'amira': '<img src="/static/images/Amira_photo.png" alt="Amira" class="character-photo me-2" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #007bff;">Act fast - democratize AI,<br>let teams experiment immediately'
            };
            
            const displayTitle = customTitles[choice.id] || choice.title;
            const displayDescription = customDescriptions[choice.id] || '';
            
            columnDiv.innerHTML = `
                <div class="choice-column" data-choice-id="${choice.id}" onclick="gameController.selectChoice('${choice.id}')">
                    <div class="choice-header">
                        <h4 class="choice-title" style="display: flex; align-items: center;">${displayTitle}</h4>
                    </div>
                    <div class="choice-content">
                        ${displayDescription ? `<div class="choice-description">${displayDescription}</div>` : ''}
                        ${contentHtml}
                    </div>
                </div>
            `;
            
            container.appendChild(columnDiv);
        });

        // Load descriptions from API and update tooltips
        this.loadEnablerDescriptions();
    }

    async loadEnablerDescriptions() {
        try {
            console.log('🔍 Loading enabler descriptions from template...');
            
            // Charger les descriptions des enablers depuis l'API du template
            const response = await fetch('/api/game_config', {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('📡 Game config response:', data);
            
            if (data.success && data.enablers) {
                console.log('✅ Enablers data loaded from template, creating tooltips...');
                // Créer les tooltips pour les enablers
                const enablerElements = document.querySelectorAll('.choice-enabler[data-enabler-id]');
                console.log(`🔍 Found ${enablerElements.length} enabler elements`);
                
                enablerElements.forEach(enablerEl => {
                    const enablerId = enablerEl.dataset.enablerId;
                    console.log(`🔍 Processing enabler: ${enablerId}`);
                    const enablerData = data.enablers[enablerId];
                    
                    if (enablerData) {
                        console.log(`✅ Creating/updating tooltip for ${enablerId}:`, enablerData);
                        // Créer ou mettre à jour le tooltip
                        let tooltip = enablerEl.querySelector('.enabler-tooltip');
                        if (!tooltip) {
                            // Créer le tooltip s'il n'existe pas
                            tooltip = document.createElement('div');
                            tooltip.className = 'enabler-tooltip';
                            enablerEl.appendChild(tooltip);
                        }
                        tooltip.innerHTML = `
                            <div class="tooltip-title">${enablerData.title}</div>
                            <div class="tooltip-description">${enablerData.description}</div>
                        `;
                        console.log(`✅ Tooltip created/updated for ${enablerId}`);
                    } else {
                        console.log(`❌ No data found for enabler: ${enablerId}`);
                    }
                });
            } else {
                console.log('❌ No enablers data available in template');
            }
        } catch (error) {
            console.error('❌ Error loading enabler descriptions:', error);
        }
    }
    
    findEnablerInData(enablersByCategory, enablerId) {
        for (const category in enablersByCategory) {
            const enablers = enablersByCategory[category];
            for (const enabler of enablers) {
                if (enabler.id === enablerId) {
                    return enabler;
                }
            }
        }
        return null;
    }
    
    createEnablerTooltip(element, title, description) {
        const tooltip = document.createElement('div');
        tooltip.className = 'enabler-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">${title}</div>
            <div class="tooltip-description">${description}</div>
        `;
        
        element.appendChild(tooltip);
        
        // Ajouter les événements hover
        element.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }

    selectChoice(choiceId) {
        // Remove selection from all columns
        document.querySelectorAll('.choice-column').forEach(column => {
            column.classList.remove('selected');
        });
        
        // Add selection to clicked column
        const selectedColumn = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (selectedColumn) {
            selectedColumn.classList.add('selected');
            
            // Detect which phase is currently active and call the appropriate function
            if (document.getElementById('phase1-section').style.display !== 'none') {
                this.selectPhase1Choice(choiceId);
            } else if (document.getElementById('phase5-section').style.display !== 'none') {
                this.selectMOT5Choice(choiceId);
            }
            // Add other phases as needed
        }
    }

    async selectPhase1Choice(choiceId) {
        console.log('Phase 1 choice selected:', choiceId);
        
        // Update visual selection
        document.querySelectorAll('.choice-column').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Enable confirm button
        const confirmBtn = document.getElementById('phase1-confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        }
        
        // Store selection
        this.selectedChoices.mot1 = choiceId;
    }

    async confirmPhase1Choice() {
        if (!this.selectedChoices.mot1) {
            this.showAlert('Please select an approach first', 'warning');
            return;
        }
        
        console.log('Phase 1 choice confirmed:', this.selectedChoices.mot1);
        this.showLoading(true);

        try {
            const response = await fetch('/api/phase1/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ character_id: this.selectedChoices.mot1 })
            });

            const data = await response.json();
            console.log('Phase 1 API response:', data);

            if (data.success) {
                console.log('Full API response:', data);
                
                // Try different possible data structures
                let scoreData, mot1Score;
                if (data.score) {
                    scoreData = data.score;
                    mot1Score = data.score.scores.mot1;
                } else if (data.score_info) {
                    scoreData = data.score_info;
                    mot1Score = data.score_info.scores.mot1;
                } else {
                    console.error('No score data found in response');
                    this.showAlert('Erreur: données de score manquantes', 'danger');
                    return;
                }
                
                this.updateScoreDisplay(scoreData);
                // Add the choice to scoreData for Phase 1
                scoreData.choice = this.selectedChoices.mot1;
                this.showScoreScreen(1, mot1Score, scoreData);
                this.updateProgress(35, `Step 1 completed - Score: ${mot1Score}/3`);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 1 selection error:', error);
            this.showAlert('Erreur lors de la sélection', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async loadMOT2Choices() {
        try {
            const response = await fetch('/api/phase2/choices', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.renderMOT2Choices(data.choices);
                this.showSection('phase2-section');
            }
        } catch (error) {
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT2Choices(choices) {
        // First, render the Impact/Feasibility matrix
        this.renderImpactFeasibilityMatrix();
        
        const container = document.getElementById('phase2-choices');
        container.innerHTML = '';

        // Create all solution cards in a grid layout
        choices.forEach(choice => {
            const card = this.createSolutionCard(choice);
            container.appendChild(card);
        });

        // Initialize priority slots
        this.initializePrioritySlots();
    }

    renderImpactFeasibilityMatrix() {
        const matrixContainer = document.getElementById('impact-feasibility-matrix');
        
        // Create matrix structure
        matrixContainer.innerHTML = `
            <div class="matrix-grid">
                <div class="matrix-quadrant high-impact-low-feasibility"></div>
                <div class="matrix-quadrant high-impact-high-feasibility"></div>
                <div class="matrix-quadrant low-impact-low-feasibility"></div>
                <div class="matrix-quadrant low-impact-high-feasibility"></div>
            </div>
            
            <!-- SVG pour les vraies flèches des axes -->
            <svg class="matrix-axes-svg" width="500" height="350" viewBox="0 0 500 350">
                <!-- Axe horizontal (Feasibility) sur le bord bas -->
                <line x1="0" y1="350" x2="500" y2="350" stroke="#ffffff" stroke-width="3"/>
                <polygon points="490,345 500,350 490,355" fill="#ffffff"/>
                
                <!-- Axe vertical (Impact) sur le bord gauche -->
                <line x1="0" y1="350" x2="0" y2="0" stroke="#ffffff" stroke-width="3"/>
                <polygon points="5,10 0,0 -5,10" fill="#ffffff"/>
            </svg>
            
            <!-- Conteneur pour l'axe IMPACT (vertical) -->
            <div class="axis-container impact-container">
                <div class="axis-label impact-label">IMPACT</div>
                <div class="axis-description impact-desc">ROI potential<br>Asset builds<br>Competitive edge</div>
            </div>
            
            <!-- Conteneur pour l'axe FEASIBILITY (horizontal) -->
            <div class="axis-container feasibility-container">
                <div class="axis-label feasibility-label">FEASIBILITY</div>
                <div class="axis-description feasibility-desc">Data readiness, Technical complexity, Cost, Business engagement, Regulation...</div>
            </div>
        `;

        // Define all 9 solutions with their exact positions based on mathematical coordinates
        // Conversion for 500x350 matrix: X_pixel = 250 + (X_math × 31.25), Y_pixel = 175 - (Y_math × 35)
        const solutions = [
            { id: 1, x: 312, y: 210, grayed: false },   // (2, -1) → Bottom-right quadrant
            { id: 2, x: 188, y: 140, grayed: false },   // (-2, 1) → Top-left quadrant
            { id: 3, x: 375, y: 87, grayed: false },    // (4, 2.5) → Top-right quadrant, ONLY ONE
            { id: 4, x: 219, y: 105, grayed: false },   // (-1, 2) → Top-left quadrant
            { id: 5, x: 281, y: 245, grayed: false },   // (1, -2) → Bottom-right quadrant
            { id: 6, x: 156, y: 280, grayed: true },    // (-3, -3) → Top-left quadrant
            { id: 7, x: 125, y: 228, grayed: true },     // (-4, -1.5) → Bottom-left quadrant, ONLY ONE
            { id: 8, x: 422, y: 298, grayed: true },    // (5.5, -3.5) → Bottom-right quadrant
            { id: 9, x: 47, y: 35, grayed: true }        // (-6.5, 4) → Top-left quadrant
        ];

        // Create solution markers
        solutions.forEach(solution => {
            const marker = document.createElement('div');
            marker.className = `solution-marker ${solution.grayed ? 'grayed' : ''}`;
            marker.dataset.solutionId = solution.id;
            marker.textContent = solution.id;
            marker.style.left = `${solution.x}px`;
            marker.style.top = `${solution.y}px`;
            marker.style.transform = 'translate(-50%, -50%)';
            
            matrixContainer.appendChild(marker);
        });
    }

    createSolutionCard(choice) {
        // Mapping des choix vers leurs positions dans la matrice (seulement 1-5 disponibles)
        const choiceToMatrixPosition = {
            'fraud_integrity_detection': 1,        // Position 1
            'ai_storyline_generator': 2,           // Position 2  
            'smart_game_design_assistant': 3,      // Position 3
            'player_journey_optimizer': 4,          // Position 4
            'talent_analytics_dashboard': 5         // Position 5
        };
        
        const matrixPosition = choiceToMatrixPosition[choice.id] || '?';
        
        // Déterminer si la solution est disponible (positions 1-5) ou grisée (6-9)
        const isAvailable = matrixPosition <= 5;
        const backgroundColor = isAvailable 
            ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'  // Bleu cyan pour disponibles
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'; // Gris pour non disponibles
        
            const card = document.createElement('div');
        card.className = 'solution-card';
        card.draggable = true;
        card.dataset.choiceId = choice.id;
            card.innerHTML = `
            <div class="solution-options">
                <i class="fas fa-ellipsis-v"></i>
                        </div>
        <div class="solution-header">
            <div class="solution-title">${choice.title}</div>
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
        <div class="solution-description">${choice.description}</div>
            `;
        
        // Add drag event listeners
        card.addEventListener('dragstart', this.handleDragStart.bind(this));
        card.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        return card;
    }

    initializePrioritySlots() {
        const slots = document.querySelectorAll('.priority-slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', this.handleDragOver.bind(this));
            slot.addEventListener('drop', this.handleDrop.bind(this));
            slot.addEventListener('dragenter', this.handleDragEnter.bind(this));
            slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.choiceId);
        e.target.classList.add('dragging');
        this.draggedElement = e.target;
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        
        // Remove drag-over class from all slots
        document.querySelectorAll('.priority-slot').forEach(slot => {
            slot.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.closest('.priority-slot').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.closest('.priority-slot').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.priority-slot');
        const choiceId = e.dataTransfer.getData('text/plain');
        
        slot.classList.remove('drag-over');
        
        // Check if slot is already occupied
        if (slot.querySelector('.priority-item')) {
            this.showAlert('This priority slot is already occupied. Please remove the existing item first.', 'warning');
            return;
        }

        // Find the solution card
        const solutionCard = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (!solutionCard) return;

        // Create priority item
        const priorityItem = document.createElement('div');
        priorityItem.className = 'priority-item';
        priorityItem.dataset.choiceId = choiceId;
        priorityItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${solutionCard.querySelector('.solution-title').textContent}</div>
                    <div class="text-muted small">${solutionCard.querySelector('.solution-description').textContent}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="gameController.removeFromPriority('${choiceId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to slot
        slot.innerHTML = '';
        slot.appendChild(priorityItem);
        slot.classList.add('occupied');

        // Mark solution as used
        solutionCard.classList.add('used');
        solutionCard.draggable = false;

        // Update counter
        this.updatePhase2Counter();
    }

    removeFromPriority(choiceId) {
        // Find the priority item
        const priorityItem = document.querySelector(`.priority-item[data-choice-id="${choiceId}"]`);
        if (!priorityItem) return;

        const slot = priorityItem.closest('.priority-slot');
        
        // Restore placeholder
        const slotNumber = slot.dataset.slot;
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
            solutionCard.draggable = true;
        }

        // Update counter
        this.updatePhase2Counter();
    }

    updatePhase2Counter() {
        const selectedCount = document.querySelectorAll('.priority-item').length;
        const counter = document.getElementById('phase2-selected-count');
        const confirmBtn = document.getElementById('phase2-confirm-btn');
        
        counter.textContent = `${selectedCount}/3 selected`;
        
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

    async selectMOT2Choice(choiceId) {
        if (this.selectedChoices.mot2.includes(choiceId)) {
            // Deselect
            this.selectedChoices.mot2 = this.selectedChoices.mot2.filter(id => id !== choiceId);
        } else if (this.selectedChoices.mot2.length < 3) {
            // Select
            this.selectedChoices.mot2.push(choiceId);
        } else {
            this.showAlert('Vous ne pouvez sélectionner que 3 solutions maximum', 'warning');
            return;
        }

        this.updateMOT2UI();
        
        // Show confirm button when 3 choices are made
        console.log('MOT2 selected choices:', this.selectedChoices.mot2.length);
        if (this.selectedChoices.mot2.length === 3) {
            const confirmBtn = document.getElementById('phase2-confirm-btn');
            console.log('Confirm button found:', confirmBtn);
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('btn-secondary');
                confirmBtn.classList.add('btn-primary');
                console.log('Button enabled and styled');
            }
        } else {
            const confirmBtn = document.getElementById('phase2-confirm-btn');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.classList.remove('btn-primary');
                confirmBtn.classList.add('btn-secondary');
            }
        }
    }

    updateMOT2UI() {
        const cards = document.querySelectorAll('#phase2-choices .choice-card');
        cards.forEach(card => {
            const choiceId = card.getAttribute('data-choice-id');
            const button = card.querySelector('button');
            
            if (this.selectedChoices.mot2.includes(choiceId)) {
                card.classList.add('selected');
                button.textContent = 'Désélectionner';
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
            } else {
                card.classList.remove('selected');
                button.textContent = 'Select';
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            }
        });

        // Update counter
        const counter = document.getElementById('phase2-selected-count');
        if (counter) {
            counter.textContent = `${this.selectedChoices.mot2.length}/3 selected`;
        }

    }

    async confirmPhase2Choices() {
        // Get selected choices from priority slots
        const priorityItems = document.querySelectorAll('.priority-item');
        const selectedChoices = Array.from(priorityItems).map(item => item.dataset.choiceId);
        
        if (selectedChoices.length !== 3) {
            this.showAlert('Please select exactly 3 solutions by dragging them to the priority slots.', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/phase2/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ solution_ids: selectedChoices })
            });

            const data = await response.json();

            if (data.success) {
                const mot2Score = data.score.scores.mot2;
                this.updateScoreDisplay(data.score);
                this.showScoreScreen(2, mot2Score, data.score);
                this.updateProgress(50, `Step 2 completed - Score: ${mot2Score}/3`);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('MOT2 confirmation error:', error);
            this.showAlert('Erreur lors de la confirmation', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async loadMOT3Choices() {
        try {
            console.log('Loading Phase 3 choices...');
            const response = await fetch('/api/phase3/choices', {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Phase 3 API response:', data);

            if (data.success) {
                console.log('Phase 3 choices data:', data.choices);
                this.renderMOT3Choices(data.choices);
                this.showSection('phase3-section');
                console.log('Phase 3 section shown');
            } else {
                console.error('Phase 3 API failed:', data.message);
                this.showAlert('Erreur lors du chargement des choix STEP 3: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 3 loading error:', error);
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT3Choices(choices) {
        const container = document.getElementById('phase3-choices');
        container.innerHTML = '';
        
        // Remove grid class - keep original category structure
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
            // Technology
            'ai_data_platform_modernization': 'fas fa-database',
            'automation_ai_models_deployment': 'fas fa-robot',
            'data_quality_tooling': 'fas fa-clipboard-check',
            
            // People
            'ai_leadership_program': 'fas fa-graduation-cap',
            'hands_on_ai_bootcamp': 'fas fa-code',
            'business_ai_champions': 'fas fa-trophy',
            
            // Governance
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
                    <div class="matrix-choice" data-choice-id="${choice.id}" data-category="${category}" onclick="gameController.selectMOT3Choice('${choice.id}', '${category}')">
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
            container.appendChild(categoryDiv);
        });

        // Initialize progress tracking
        this.initializePhase3Progress();
    }

    initializePhase3Progress() {
        // Reset progress
        this.updatePhase3Progress(0);
    }

    updatePhase3Progress(selectedCount) {
        const progressText = document.getElementById('phase3-progress-text');
        const confirmBtn = document.getElementById('phase3-confirm-btn');
        
        progressText.textContent = `${selectedCount}/3 selected`;
        
        // Update progress steps
        for (let i = 1; i <= 3; i++) {
            const step = document.querySelector(`.progress-step[data-step="${i}"]`);
            if (i <= selectedCount) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        }
        
        // Enable/disable confirm button
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

    async selectMOT3Choice(choiceId, category) {
        console.log('MOT3 choice selected:', choiceId, 'for category:', category);
        
        // Remove previous selection from this category
        const previousChoice = this.selectedChoices.mot3[category];
        if (previousChoice) {
            const previousElement = document.querySelector(`[data-choice-id="${previousChoice}"][data-category="${category}"]`);
            if (previousElement) {
                previousElement.classList.remove('selected');
            }
        }
        
        // Add new selection
        this.selectedChoices.mot3[category] = choiceId;
        const selectedElement = document.querySelector(`[data-choice-id="${choiceId}"][data-category="${category}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        console.log('MOT3 selected choices:', this.selectedChoices.mot3);
        
        // Update progress
        const selectedCount = Object.keys(this.selectedChoices.mot3).length;
        this.updatePhase3Progress(selectedCount);
    }

    updateMOT3UI() {
        const cards = document.querySelectorAll('#phase3-choices .choice-card');
        cards.forEach(card => {
            const choiceId = card.getAttribute('data-choice-id');
            const category = card.getAttribute('data-category');
            const button = card.querySelector('button');
            
            if (this.selectedChoices.mot3[category] === choiceId) {
                card.classList.add('selected');
                button.textContent = 'Sélectionné';
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-success');
                button.disabled = true;
            } else {
                card.classList.remove('selected');
                button.textContent = 'Select';
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-primary');
                button.disabled = false;
            }
        });
    }

    async confirmMOT3Choices() {
        this.showLoading(true);

        try {
            const response = await fetch('/api/phase3/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ choices: this.selectedChoices.mot3 })
            });

            const data = await response.json();

            if (data.success) {
                const mot3Score = data.score.scores.mot3;
                this.updateScoreDisplay(data.score);
                this.showScoreScreen(3, mot3Score, data.score);
                this.updateProgress(65, `Step 3 completed - Score: ${mot3Score}/3`);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('MOT3 confirmation error:', error);
            this.showAlert('Erreur lors de la confirmation', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async loadMOT4Choices() {
        console.log('=== loadMOT4Choices called ===');
        // Reset budget for MOT4
        this.budget = 0;
        this.selectedChoices.mot4 = [];
        
        try {
            console.log('Fetching Phase 4 choices...');
            const response = await fetch('/api/phase4/choices');
            const data = await response.json();
            console.log('Phase 4 API response:', data);

            if (data.success) {
                console.log('Phase 4 choices loaded successfully:', data.choices);
                this.renderMOT4Choices(data.choices);
                console.log('About to show phase4-section...');
                this.showSection('phase4-section');
                console.log('Phase 4 section should now be visible');
            } else {
                console.error('Phase 4 API failed:', data.message);
                this.showAlert('Erreur lors du chargement des choix STEP 4: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 4 loading error:', error);
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT4Choices(choices) {
        const container = document.getElementById('phase4-choices');
        container.innerHTML = '';

        // Add grid class for uniform sizing (3x3 grid)
        container.className = 'matrix-choices-grid';

        // Define category colors (consistent with dashboard)
        const categoryColors = {
            'technology': '#8b5cf6', // Purple
            'gover': '#3b82f6', // Blue
            'people': '#f97316' // Orange
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
            'country_level_ai_deployment': 'gover',
            // Step 5 enablers
            'self_service_ai_tools': 'technology',
            'data_ai_academy': 'people',
            'ai_collaboration_hub': 'people',
            'attractive_ai_career_tracks': 'people',
            'responsible_ai_awareness': 'gover',
            'trusted_tech_partners': 'technology',
            'ai_governance_roadmap': 'gover',
            'ai_value_office': 'gover'
        };

        // Create simple grid directly (3x3 matrix)
        choices.forEach(choice => {
            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'matrix-choice';
            choiceDiv.dataset.choiceId = choice.id;
            choiceDiv.dataset.cost = choice.cost;
            choiceDiv.onclick = () => gameController.selectMOT4Choice(choice.id, choice.cost);
            
            const pillar = enablerPillars[choice.id] || 'technology';
            const categoryColor = categoryColors[pillar];
            const specificIcon = this.getEnablerIcon(choice.id);
            
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
            
            container.appendChild(choiceDiv);
        });

        // Initialize budget tracking
        this.initializePhase4Budget();
    }

    getEnablerIcon(enablerId) {
        const iconMap = {
            // Phase 3 enablers
            'ai_data_platform_modernization': 'fas fa-database',
            'automation_ai_models_deployment': 'fas fa-robot',
            'data_quality_tooling': 'fas fa-clipboard-check',
            'ai_leadership_program': 'fas fa-graduation-cap',
            'hands_on_ai_bootcamp': 'fas fa-code',
            'business_ai_champions': 'fas fa-trophy',
            'responsible_ai_guidelines': 'fas fa-shield-alt',
            'ai_governance_roadmap': 'fas fa-map-signs',
            'ai_governance_board': 'fas fa-gavel',
            // Phase 4 enablers
            'adoption_playbook': 'fas fa-book',
            'ai_storytelling_communication': 'fas fa-bullhorn',
            'ai_product_teams_setup': 'fas fa-users',
            'talent_mobility_program': 'fas fa-exchange-alt',
            'industrialized_data_pipelines': 'fas fa-cogs',
            'api_platform': 'fas fa-code',
            'privacy_by_design_data': 'fas fa-shield-alt',
            'role_responsibility_matrix': 'fas fa-clipboard-check',
            'country_level_ai_deployment': 'fas fa-globe',
            // Phase 5 enablers
            'self_service_ai_tools': 'fas fa-tools',
            'data_ai_academy': 'fas fa-book-open',
            'ai_collaboration_hub': 'fas fa-project-diagram',
            'attractive_ai_career_tracks': 'fas fa-user-tie',
            'responsible_ai_awareness': 'fas fa-shield-alt',
            'trusted_tech_partners': 'fas fa-handshake',
            'ai_governance_roadmap': 'fas fa-map-signs',
            'ai_value_office': 'fas fa-chart-line'
        };
        return iconMap[enablerId] || 'fas fa-cog';
    }

    getCategoryTitle(category) {
        const categoryTitles = {
            'technology': 'Technology',
            'gover': 'Governance',
            'people': 'People'
        };
        return categoryTitles[category] || category;
    }

    initializePhase4Budget() {
        // Reset budget
        this.budget = 0;
        this.updatePhase4Budget();
    }

    updatePhase4Budget() {
        const budgetDisplay = document.getElementById('phase4-budget-display');
        const budgetFill = document.getElementById('budget-fill');
        const statusBadge = document.getElementById('budget-status');
        const confirmBtn = document.getElementById('phase4-confirm-btn');
        
        console.log('DEBUG updatePhase4Budget: budget =', this.budget);
        console.log('DEBUG updatePhase4Budget: confirmBtn =', confirmBtn);
        
        // Update budget display
        budgetDisplay.textContent = `${this.budget}/30 points`;
        
        // Update budget bar fill
        const fillPercentage = (this.budget / 30) * 100;
        budgetFill.style.height = `${fillPercentage}%`;
        
        // Update status badge
        statusBadge.className = 'badge';
        
        if (this.budget === 0) {
            statusBadge.classList.add('badge-secondary');
            statusBadge.textContent = 'Select enablers';
        } else if (this.budget < 30) {
            statusBadge.classList.add('badge-warning');
            statusBadge.textContent = `${30 - this.budget} points remaining`;
        } else if (this.budget === 30) {
            statusBadge.classList.add('badge-success');
            statusBadge.textContent = 'Perfect budget!';
        } else {
            statusBadge.classList.add('badge-danger');
            statusBadge.textContent = `${this.budget - 30} points over`;
        }
        
        // Enable/disable confirm button (allow confirmation if budget <= 30)
        if (this.budget > 0 && this.budget <= 30) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        } else {
            confirmBtn.disabled = true;
            confirmBtn.classList.remove('btn-primary');
            confirmBtn.classList.add('btn-secondary');
        }
    }

    async selectMOT4Choice(choiceId, cost) {
        console.log('=== MOT4 CHOICE CLICKED ===');
        console.log('MOT4 choice selected:', choiceId, 'cost:', cost);
        console.log('Current budget:', this.budget, 'max:', this.maxBudget);
        console.log('Current choices:', this.selectedChoices.mot4);
        
        this.hideAlert();
        
        if (this.selectedChoices.mot4.includes(choiceId)) {
            // Deselect
            this.selectedChoices.mot4 = this.selectedChoices.mot4.filter(id => id !== choiceId);
            this.budget -= cost;
            console.log('Deselected, new budget:', this.budget);
        } else {
            // Check if adding this choice would exceed budget
            if (this.budget + cost > this.maxBudget) {
                this.showAlert(`Vous ne pouvez pas dépasser ${this.maxBudget} points`, 'warning');
                return;
            }
            
            // Select
            this.selectedChoices.mot4.push(choiceId);
            this.budget += cost;
            console.log('Selected, new budget:', this.budget);
        }

        // Update visual selection state
        const choiceElement = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (choiceElement) {
            if (this.selectedChoices.mot4.includes(choiceId)) {
                choiceElement.classList.add('selected');
            } else {
                choiceElement.classList.remove('selected');
            }
        }

        // Update budget display and UI
        this.updatePhase4Budget();
        
        // Note: No auto-confirmation for MOT4, user must click confirm button
    }

    updateMOT4UI() {
        const cards = document.querySelectorAll('#phase4-choices .choice-card');
        cards.forEach(card => {
            const choiceId = card.getAttribute('data-choice-id');
            const cost = parseInt(card.getAttribute('data-cost'));
            const button = card.querySelector('button');
            
            if (this.selectedChoices.mot4.includes(choiceId)) {
                card.classList.add('selected');
                button.textContent = 'Désélectionner';
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary');
            } else {
                card.classList.remove('selected');
                button.textContent = 'Select';
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
                
                // Disable if would exceed budget
                if (this.budget + cost > this.maxBudget) {
                    button.disabled = true;
                    button.classList.add('disabled');
                } else {
                    button.disabled = false;
                    button.classList.remove('disabled');
                }
            }
        });

        // Update budget display
        const budgetDisplay = document.getElementById('phase4-budget-display');
        if (budgetDisplay) {
            budgetDisplay.textContent = `${this.budget}/${this.maxBudget} points`;
            budgetDisplay.className = this.budget === this.maxBudget ? 'badge bg-success me-3' : 'badge me-3';
        }
    }

    async confirmMOT4Choices() {
        console.log('=== PHASE 4 CONFIRM CALLED ===');
        console.log('Phase 4 confirm called with choices:', this.selectedChoices.mot4);
        console.log('Phase 4 budget:', this.budget);
        console.log('Full selectedChoices object:', this.selectedChoices);
        this.hideAlert();
        this.showLoading(true);

        try {
            const response = await fetch('/api/phase4/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabler_ids: this.selectedChoices.mot4 })
            });

            const data = await response.json();

            console.log('DEBUG API Response:', data);
            console.log('DEBUG data.success:', data.success);

            if (data.success) {
                const mot4Score = data.score.scores.mot4;
                this.updateScoreDisplay(data.score);
                this.showScoreScreen(4, mot4Score, data.score);
                this.updateProgress(75, `Step 4 completed - Score: ${mot4Score}/3`);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 4 confirmation error:', error);
            this.showAlert('Erreur lors de la confirmation', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async loadMOT5Choices() {
        try {
            const response = await fetch('/api/phase5/choices');
            const data = await response.json();

            if (data.success) {
                this.renderMOT5Choices(data.choices);
                this.showSection('phase5-section');
            }
        } catch (error) {
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT5Choices(choices) {
        const container = document.getElementById('phase5-choices');
        container.innerHTML = '';

        // Define choice details based on the template
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
            
            // Générer le contenu pour les enablers
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
            
            columnDiv.innerHTML = `
                <div class="choice-column" data-choice-id="${choice.id}" onclick="gameController.selectChoice('${choice.id}')">
                    <div class="choice-header">
                        <h4 class="choice-title">${choice.title}</h4>
                    </div>
                    <div class="choice-content">
                        <div class="choice-description">
                            ${choice.description}
                        </div>
                        ${contentHtml}
                    </div>
                </div>
            `;
            
            container.appendChild(columnDiv);
        });

        // Load descriptions from API and update tooltips
        this.loadEnablerDescriptions();
    }

    async selectMOT5Choice(choiceId) {
        console.log('Phase 5 choice selected:', choiceId);
        
        // Update visual selection
        document.querySelectorAll('.choice-column').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Enable confirm button
        const confirmBtn = document.getElementById('phase5-confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('btn-secondary');
            confirmBtn.classList.add('btn-primary');
        }
        
        // Store selection
        this.selectedChoices.mot5 = choiceId;
    }

    async confirmPhase5Choice() {
        if (!this.selectedChoices.mot5) {
            this.showAlert('Please select an approach first', 'warning');
            return;
        }

        console.log('Phase 5 choice confirmed:', this.selectedChoices.mot5);
        this.showLoading(true);

        try {
            const response = await fetch('/api/phase5/choose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ choice_id: this.selectedChoices.mot5 })
            });

            const data = await response.json();
            console.log('Phase 5 API response:', data);

            if (data.success) {
                console.log('Full API response:', data);
                
                        // Phase 5: Show phase score screen first, then dashboard, then final results
                        const scoreData = data.score_data;
                        const motNumber = 5;
                        // Get the actual score for Phase 5 from the results (scores are stored as mot1, mot2, etc.)
                        const score = data.results.scores['mot5'] || 0;
                        
                        console.log('Phase 5 score data:', scoreData);
                        console.log('Phase 5 results.scores:', data.results.scores);
                        console.log('Phase 5 actual score (mot5):', score);
                        
                        // Store results for later use
                        this.finalResults = data.results;
                        
                        // Show phase score screen first (same as other phases)
                        this.showScoreScreen(motNumber, score, scoreData);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 5 selection error:', error);
            this.showAlert('Erreur lors de la sélection', 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    showScoreScreen(motNumber, score, scoreData) {
        console.log('=== showScoreScreen called ===');
        console.log('Step:', motNumber, 'Score:', score, 'ScoreData:', scoreData);
        
        // Store current Phase number for Next button
        this.currentPhaseNumber = motNumber;
        this.currentScoreData = scoreData;
        
        // Hide score display card and total score in header
        const scoreDisplayCard = document.getElementById('score-display-card');
        if (scoreDisplayCard) {
            scoreDisplayCard.style.display = 'none';
        }
        const scoreDisplayContainer = document.querySelector('.score-display-container');
        if (scoreDisplayContainer) {
            scoreDisplayContainer.style.display = 'none';
        }
        
        // Update score display
        this.updateScoreDisplay(scoreData);
        
        // Set Step title dynamically from template
        const stepTitles = {
            1: this.gameConfig?.phases?.phase1?.title || 'Step 1 - Embedding GenAI in your AI transformation program',
            2: this.gameConfig?.phases?.phase2?.title || 'Step 2 - Building the right foundation',
            3: this.gameConfig?.phases?.phase3?.title || 'Step 3 - Scaling across the organization',
            4: this.gameConfig?.phases?.phase4?.title || 'Step 4 - Ensuring sustainable success',
            5: this.gameConfig?.phases?.phase5?.title || 'Step 5 - Accelerating the transformation'
        };
        
        document.getElementById('current-mot-title').textContent = stepTitles[motNumber];
        
        // Generate stars
        const starsContainer = document.getElementById('score-stars-container');
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('span');
            star.className = 'score-star';
            star.textContent = i <= score ? '★' : '☆';
            starsContainer.appendChild(star);
        }
        
        console.log(`Generated ${score} stars for phase ${motNumber}`);
        
        // Set description based on choice and score
        let description = '';
        
        if (motNumber === 1) {
            // Phase 1 specific messages based on choice
            const currentChoice = scoreData.choice || this.currentPath?.mot1_choice;
            console.log('DEBUG showScoreScreen:', { motNumber, score, currentChoice, scoreDataChoice: scoreData.choice, currentPath: this.currentPath });
            
            if (currentChoice === 'elena' && score === 3) {
                description = "Excellent! By choosing Elena's approach, you earned 3 stars out of 3. This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap that inspires creativity, empowers teams, and delivers measurable business impact.";
            } else if (currentChoice === 'james' && score === 2) {
                description = "Good Choice! By selecting James's approach, you earned 2 stars out of 3. You chose a prudent and structured path, focusing on data, technology, and architecture — a wise move for long-term scalability. However, the risk is that your transformation could lose momentum before delivering visible value to business teams.";
            } else if (currentChoice === 'amira' && score === 1) {
                description = "Interesting Attempt! By following Amira's approach, you earned 1 star out of 3. Your choice shows boldness and a desire to move fast — essential qualities for innovation. But without clear governance or foundations, you risk creating fragmented initiatives and limited long-term impact. Your teams may learn quickly, but results will stay local and unsustainable.";
            } else {
                // Fallback for other cases
                console.log('Using fallback message for Phase 1');
                description = `Congratulations! You earned ${score} stars for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`;
            }
        } else if (motNumber === 2) {
            // Phase 2 specific messages based on score
            if (score === 3) {
                description = "Excellent! By selecting the good three — Smart Game Design Assistant, Player Journey Optimizer, and Fraud & Integrity Detection — you earned 3 stars out of 3. These initiatives deliver a good balance of visible impact for both players and internal teams, while laying the groundwork for long-term scalability. Additionally, your decisions show a clear understanding of what matters most: combining innovation, player value, and responsibility. PlayForward is now ready to move from vision to action — with focus, purpose, and measurable results.";
            } else if (score === 2) {
                description = "Good Choice! Your portfolio includes some high-impact initiatives, but could have been even more optimized to balance value and feasibility. To strengthen your transformation, focus on alignment and execution speed.";
            } else if (score === 1) {
                description = "Interesting Attempt! Your selection shows curiosity and experimentation but lacks strategic coherence. Some of these initiatives may deliver insights, yet they won't create the momentum or credibility needed to drive company-wide transformation. To succeed, narrow your scope — choose higher-impact projects and link them directly to measurable business outcomes.";
            } else {
                description = `Congratulations! You earned ${score} stars for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`;
            }
        } else if (motNumber === 3) {
            // Phase 3 specific messages based on score
            console.log('DEBUG Phase 3:', { motNumber, score, scoreData });
            console.log('motNumber === 3:', motNumber === 3);
            if (score === 3) {
                description = "Excellent! By selecting the good three, you earned 3 stars out of 3. You focused on what truly accelerates adoption: leadership ownership, solid data foundations, and clear governance. Your teams are now empowered, aligned, and ready to transform early pilots into sustainable business value. PlayForward is now ready to move from vision to action — with focus, purpose, and measurable results.";
            } else if (score === 2) {
                description = "Good Choice! You made strong decisions. However, your choices could be more cohesive across the three domains. To amplify impact, ensure your enablers connect leaders, tech, and governance together — so adoption grows hand-in-hand with structure and trust. Your pilots will show value, but scaling may take longer than expected.";
            } else if (score === 1) {
                description = "Interesting Attempt! Some key foundations are missing. Without clear governance or a strong data backbone, pilots may succeed locally yet fail to scale globally. Time to refocus on alignment before moving to scale.";
            } else {
                description = `Congratulations! You earned ${score} stars for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`;
            }
            console.log('Phase 3 description selected:', description);
        } else if (motNumber === 4) {
            // Phase 4 specific messages based on score
            console.log('DEBUG Phase 4:', { motNumber, score, scoreData });
            console.log('motNumber === 4:', motNumber === 4);
            if (score === 3) {
                description = "Excellent! Perfect balance! You earned 3 stars out of 3. You've mastered the art of scaling: solid foundations, empowered teams, and responsible governance. Your organization can now replicate success across markets while maintaining speed, reliability, and trust. PlayForward moves from pilot success to enterprise transformation — AI is now part of the company's daily rhythm.";
            } else if (score === 2) {
                description = "Good Choice! You focused on impactful enablers, but your portfolio could be better balanced between People, Technology, and Governance. Operational efficiency will increase, yet adoption or risk management might lag behind. Your scaling is on track, but true industrialization still lies ahead.";
            } else if (score === 1) {
                description = "Interesting Attempt! You activated useful levers, yet missed the full triad of enablers that turn pilots into sustainable impact. Without strong data pipelines or structured adoption support, your AI initiatives risk becoming fragmented or over-dependent on a few champions.";
            } else {
                description = `Congratulations! You earned ${score} stars for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`;
            }
            console.log('Phase 4 description selected:', description);
        } else if (motNumber === 5) {
            // Phase 5 specific messages based on score
            console.log('DEBUG Phase 5:', { motNumber, score, scoreData });
            
            if (score === 3) {
                description = "Excellent! You invested where it truly matters: people and ecosystem. You built an engine for continuous innovation and strengthened your AI delivery capabilities. AI has become part of the company's DNA: human, creative, and sustainable.";
            } else if (score === 2) {
                description = "Good Choice! You built a solid foundation for sustainable AI adoption: clear governance, reliable partners, and growing internal expertise. The organization can now scale in a controlled way, though acceleration will remain gradual because of adequately train collaborators. Also, true enterprise-wide AI impact still lies ahead and you lack the means to truly control the ROI on AI you promised to your Board of Directors.";
            } else if (score === 1) {
                description = "Interesting Attempt! You focused on responsible AI alignment, training and self-service, essential for trust and adoption. However, without deeper skills, governance and tech foundations, the transformation risks stalling once enthusiasm fades. The company has made AI visible, but not yet scalable.";
            } else {
                description = `Congratulations! You earned ${score} stars for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`;
            }
            console.log('Phase 5 description selected:', description);
        } else {
            // Generic messages for other phases
        const descriptions = {
                1: `Congratulations! You earned ${score} star${score > 1 ? 's' : ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`,
                2: `Great work! You earned ${score} star${score > 1 ? 's' : ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`,
                3: `Excellent! You earned ${score} star${score > 1 ? 's' : ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`,
                4: `Outstanding! You earned ${score} star${score > 1 ? 's' : ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`,
                5: `Fantastic! You earned ${score} star${score > 1 ? 's' : ''} for this step. These stars will be a quick visual cue of your overall success throughout the rest of the game.`
            };
            description = descriptions[score] || descriptions[1];
        }
        
        // Set description with Steven's photo for Phase 1, 2, 3, 4, and 5
        if (motNumber === 1 || motNumber === 2 || motNumber === 3 || motNumber === 4 || motNumber === 5) {
            const descriptionElement = document.getElementById('score-description');
            descriptionElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 20px;">
                    <img src="/static/images/Steven_photo.png" alt="Steven" style="width: 160px; height: 160px; border-radius: 50%; object-fit: cover; border: 3px solid #007bff; flex-shrink: 0;">
                    <div style="flex: 1;">"${description}"</div>
                </div>
            `;
        } else {
            document.getElementById('score-description').textContent = description;
        }
        
        // Update progress squares (only if element exists)
        const progressSquares = document.getElementById('progress-squares');
        if (progressSquares) {
            this.updateProgressSquares(scoreData.scores, motNumber);
        }
        
        // Show the score modal
        const modal = new bootstrap.Modal(document.getElementById('scoreModal'));
        modal.show();
    }

    updateScoreDisplay(scoreData) {
        // Update individual MOT scores
        Object.entries(scoreData.scores).forEach(([mot, score]) => {
            const scoreElement = document.getElementById(`${mot}-score`);
            if (scoreElement) {
                scoreElement.textContent = score;
            }
        });

        // Update total score
        const totalElement = document.getElementById('total-score');
        if (totalElement) {
            totalElement.textContent = scoreData.total;
        }
    }

    updateProgressSquares(scores, currentPhase) {
        const progressSquares = document.getElementById('progress-squares');
        if (!progressSquares) {
            console.warn('Progress squares element not found');
            return;
        }
        
        // Clear existing content
        progressSquares.innerHTML = '';
        
        // Create progress squares
        for (let i = 1; i <= 5; i++) {
            const square = document.createElement('div');
            square.className = 'progress-square';
            square.textContent = i;
            
            // Add appropriate classes based on phase status
            if (i < currentPhase) {
                square.classList.add('completed');
            } else if (i === currentPhase) {
                square.classList.add('current');
            }
            
            progressSquares.appendChild(square);
        }
        
        console.log(`Updated progress squares for phase ${currentPhase}`);
    }

    async showExecutiveDashboard(motNumber, score, scoreData) {
        console.log('=== showExecutiveDashboard called ===');
        console.log('Phase:', motNumber, 'Score:', score);
        console.log('=== About to call /api/executive_dashboard ===');
        try {
            // Récupérer les données du dashboard
            const response = await fetch('/api/executive_dashboard');
            const data = await response.json();
            
            if (!data.success) {
                console.error('Erreur lors de la récupération des données du dashboard:', data.message);
                return;
            }
            
            const dashboardData = data.dashboard_data;
            console.log('Dashboard data received:', dashboardData);
            
            // Mettre à jour le titre de la phase
            document.getElementById('current-phase-title').textContent = dashboardData.phase_title || dashboardData.current_phase;
            
                    // Mettre à jour le score total
                    document.getElementById('dashboard-total-score').textContent = dashboardData.current_score.total;
                    
                    // Mettre à jour les carrés de phases
                    this.updateMOTSquares(dashboardData.current_score.scores, dashboardData.current_score.total);
                    
                    // Mettre à jour les ENABLERS par catégorie avec la nouvelle interface pédagogique
                    console.log('pedagogical_data:', dashboardData.pedagogical_data);
                    this.updatePedagogicalPillars(dashboardData.pedagogical_data);
                    
                    // Mettre à jour les Use Cases
                    console.log('🔍 CHECKING USE CASES DATA...');
                    console.log('dashboardData:', dashboardData);
                    console.log('dashboardData.use_cases_data:', dashboardData.use_cases_data);
                    
                    if (dashboardData.use_cases_data) {
                        console.log('✅ USE CASES DATA FOUND!');
                        console.log('use_cases_data:', dashboardData.use_cases_data);
                        console.log('use_cases_data keys:', Object.keys(dashboardData.use_cases_data));
                        this.updateUseCases(dashboardData.use_cases_data);
                    } else {
                        console.log('❌ NO USE CASES DATA FOUND!');
                        console.log('dashboardData keys:', Object.keys(dashboardData));
                    }
            
            // Mettre à jour le message d'impact
            document.getElementById('impact-message').innerHTML = `<p>${dashboardData.impact_message}</p>`;
            
            // S'assurer que la section Use Cases est visible
            const useCasesSection = document.getElementById('use-cases-section');
            if (useCasesSection) {
                useCasesSection.style.display = 'block';
            }
            
            // Afficher le dashboard
            const modal = new bootstrap.Modal(document.getElementById('executiveDashboardModal'));
            modal.show();
            
        // Store current Phase number for Next button
        this.currentPhaseNumber = motNumber;
        
        } catch (error) {
            console.error('Erreur lors de l\'affichage du dashboard:', error);
            console.error('Stack trace:', error.stack);
            this.showAlert('Erreur lors de l\'affichage du dashboard: ' + error.message, 'danger');
        }
    }
    
    updateMOTSquares(scores, totalScore) {
        const motSquares = ['phase1-square', 'phase2-square', 'phase3-square', 'phase4-square', 'phase5-square'];
        const motKeys = ['mot1', 'mot2', 'mot3', 'mot4', 'mot5'];
        
        motSquares.forEach((squareId, index) => {
            const square = document.getElementById(squareId);
            const score = scores[motKeys[index]] || 0;
            
            // Reset classes
            square.className = 'mot-square';
            
            // Add appropriate class based on completion
            if (score > 0) {
                square.classList.add('completed');
            }
            
            // Clear existing content and add number
            const filledStars = '★'.repeat(score);
            const emptyStars = '★'.repeat(3 - score);
            square.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2rem;">${index + 1}</div>
                <div class="stars"><span class="star-filled">${filledStars}</span><span class="star-empty">${emptyStars}</span></div>
            `;
        });
    }
    
    updatePedagogicalPillars(pedagogicalData) {
        const pedagogicalPillars = document.getElementById('pedagogical-pillars');
        pedagogicalPillars.innerHTML = '';
        
        // Déterminer quelles phases sont complétées pour afficher seulement leurs colonnes
        const completedPhases = this.getCompletedPhases();
        console.log('Completed phases:', completedPhases);
        
        // Mettre à jour les en-têtes de phase
        this.updatePhaseHeaders(completedPhases);
        
        // Définir tous les ENABLERS possibles avec leurs icônes
        const allEnablersByCategory = {
            "technology": [
                { id: "genai_platform_partnership", title: "GenAI Platform Partnership", description: "Partenariat avec une plateforme GenAI", icon: "fas fa-handshake" },
                { id: "technical_foundation_setup", title: "Technical Foundation Setup", description: "Mise en place des fondations techniques", icon: "fas fa-cogs" },
                { id: "candidate_matching", title: "Candidate Matching", description: "Correspondance candidats-posts", icon: "fas fa-user-check" },
                { id: "api_connectivity", title: "API Connectivity", description: "Connectivité API", icon: "fas fa-plug" },
                { id: "vendor_relationships", title: "Vendor Relationships", description: "Relations fournisseurs", icon: "fas fa-handshake" },
                { id: "system_connectivity", title: "System Connectivity", description: "Connectivité système", icon: "fas fa-link" },
                { id: "cloud_infrastructure", title: "Cloud Infrastructure", description: "Infrastructure cloud", icon: "fas fa-cloud" },
                { id: "data_pipeline_automation", title: "Data Pipeline Automation", description: "Automatisation des pipelines de données", icon: "fas fa-stream" },
                { id: "cloud_migration", title: "Cloud Migration", description: "Migration vers le cloud", icon: "fas fa-cloud-upload-alt" },
                { id: "data_strategy", title: "Data Strategy", description: "Stratégie de données", icon: "fas fa-database" }
            ],
            "gover": [
                { id: "strategic_vision_mapping", title: "Strategic Vision Mapping", description: "Cartographie de la vision stratégique", icon: "fas fa-space-shuttle" },
                { id: "hr_function_diagnostic", title: "HR Function Diagnostic", description: "Diagnostic des fonctions RH", icon: "fas fa-search" },
                { id: "sentiment_detection", title: "Sentiment Detection", description: "Détection de sentiment", icon: "fas fa-heart" },
                { id: "ethical_framework", title: "Ethical Framework", description: "Cadre éthique", icon: "fas fa-balance-scale" },
                { id: "kpi_definition", title: "KPI Definition", description: "Définition des KPI", icon: "fas fa-bullseye" },
                { id: "ethics_oversight", title: "Ethics Oversight", description: "Surveillance éthique", icon: "fas fa-eye" },
                { id: "risk_management", title: "Risk Management", description: "Gestion des risques", icon: "fas fa-shield-alt" },
                { id: "ai_ethics_charter", title: "AI Ethics Charter", description: "Charte éthique IA", icon: "fas fa-scroll" },
                { id: "leadership_communication", title: "Leadership Communication", description: "Communication du leadership", icon: "fas fa-bullhorn" }
            ],
            "people": [
                { id: "rapid_deployment", title: "Rapid Deployment", description: "Déploiement rapide", icon: "fas fa-rocket" },
                { id: "bottom_up_innovation", title: "Bottom-up Innovation", description: "Innovation bottom-up", icon: "fas fa-lightbulb" },
                { id: "personalized_training", title: "Personalized Training", description: "Formation personnalisée", icon: "fas fa-graduation-cap" },
                { id: "employee_support", title: "Employee Support", description: "Support employés", icon: "fas fa-hands-helping" },
                { id: "process_automation", title: "Process Automation", description: "Automatisation des processus", icon: "fas fa-cogs" },
                { id: "hr_ai_competencies", title: "HR AI Competencies", description: "Compétences RH en IA", icon: "fas fa-user-graduate" },
                { id: "role_evolution", title: "Role Evolution", description: "Évolution des rôles", icon: "fas fa-user-tag" },
                { id: "cultural_change", title: "Cultural Change", description: "Changement culturel", icon: "fas fa-theater-masks" },
                { id: "change_adoption", title: "Change Adoption", description: "Adoption du changement", icon: "fas fa-sync-alt" },
                { id: "business_alignment", title: "Business Alignment", description: "Alignement métier", icon: "fas fa-bullseye" },
                { id: "talent_retention", title: "Talent Retention", description: "Rétention des talents", icon: "fas fa-heart" },
                { id: "organization_wide_ai", title: "Organization-wide AI", description: "IA organisationnelle", icon: "fas fa-building" },
                { id: "long_term_roadmap", title: "Long-term Roadmap", description: "Feuille de route long terme", icon: "fas fa-road" },
                { id: "value_based_governance", title: "Value-based Governance", description: "Gouvernance basée sur la valeur", icon: "fas fa-balance-scale" },
                { id: "hr_ai_training_academy", title: "HR AI Training Academy", description: "Académie de formation RH en IA", icon: "fas fa-university" },
                { id: "change_communication", title: "Change Communication", description: "Communication du changement", icon: "fas fa-comments" },
                { id: "genai_hub", title: "GenAI Hub", description: "Hub GenAI", icon: "fas fa-building" },
                { id: "internal_mobility", title: "Internal Mobility", description: "Mobilité interne", icon: "fas fa-exchange-alt" },
                { id: "business_sponsors", title: "Business Sponsors", description: "Sponsors métier", icon: "fas fa-handshake" }
            ]
        };
        
        const categoryTitles = {
            "technology": "Technology",
            "people": "People",
            "gover": "Governance"
        };
        
        // Créer une ligne pour chaque catégorie
        Object.entries(categoryTitles).forEach(([categoryKey, categoryTitle]) => {
            const categoryRow = document.createElement('div');
            categoryRow.className = 'pedagogical-category-row';
            
            // Titre de la catégorie avec couleur
            const categoryTitleDiv = document.createElement('div');
            categoryTitleDiv.className = `pedagogical-category-title ${categoryKey}`;
            categoryTitleDiv.textContent = categoryTitle;
            categoryRow.appendChild(categoryTitleDiv);
            
            // Colonnes pour chaque phase (toutes les phases avec enablers, masquées si non complétées)
            const phases = ['phase1', 'phase3', 'phase4', 'phase5'];
            phases.forEach((phaseKey, index) => {
                const phaseNumber = phaseKey === 'phase1' ? 1 : (phaseKey === 'phase3' ? 3 : (phaseKey === 'phase4' ? 4 : 5));
                const phaseColumn = document.createElement('div');
                phaseColumn.className = `pedagogical-phase-column ${completedPhases.includes(phaseNumber) ? 'visible' : 'hidden'}`;
                
                // Obtenir les ENABLERS pour cette phase et cette catégorie
                const phaseData = pedagogicalData[phaseKey];
                const categoryData = phaseData ? phaseData[categoryKey] : null;
                const enablers = categoryData ? categoryData.enablers : [];
                
                // Afficher SEULEMENT les ENABLERS débloqués (activés)
                enablers.filter(enabler => enabler.unlocked).forEach(enabler => {
                    const enablerIcon = document.createElement('div');
                    
                    // ENABLER débloqué : vert
                    enablerIcon.className = `pedagogical-enabler-icon unlocked`;
                    
                    // Utiliser l'icône fournie par l'API (cohérence garantie)
                    const iconClass = enabler.icon || 'fas fa-question';
                    
                    enablerIcon.innerHTML = `
                        <div class="enabler-icon-container">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="enabler-title">${enabler.title}</div>
                    `;
                    
                    // Ajouter le tooltip avec seulement la description
                    const tooltip = document.createElement('div');
                    tooltip.className = 'pedagogical-enabler-tooltip';
                    tooltip.innerHTML = `
                        <div class="pedagogical-tooltip-description">${enabler.description}</div>
                    `;
                    enablerIcon.appendChild(tooltip);
                    
                    phaseColumn.appendChild(enablerIcon);
                });
                
                categoryRow.appendChild(phaseColumn);
            });
            
            pedagogicalPillars.appendChild(categoryRow);
        });
    }
    
    updateUseCases(useCasesData) {
        console.log('🎯 updateUseCases CALLED!');
        console.log('useCasesData:', useCasesData);
        
        // Utiliser la section Use Cases existante dans le HTML
        const useCasesContainer = document.getElementById('use-cases-section');
        if (!useCasesContainer) {
            console.error('❌ Could not find use-cases-section in HTML');
            return;
        }
        
        console.log('✅ Use Cases section found:', useCasesContainer);
        
        const useCasesContent = document.getElementById('use-cases-content');
        if (!useCasesContent) {
            console.error('❌ Could not find use-cases-content in HTML');
            return;
        }
        console.log('✅ Use Cases content found:', useCasesContent);
        
        useCasesContent.innerHTML = '';
        
        // Traiter chaque phase avec des Use Cases (Step 2 en premier, puis Step 1)
        console.log('📋 Processing phases:', Object.keys(useCasesData));
        
        // Trier les phases : phase2 en premier, puis phase1
        const sortedPhases = Object.entries(useCasesData).sort(([a], [b]) => {
            if (a === 'phase2') return -1;
            if (b === 'phase2') return 1;
            return 0;
        });
        
        sortedPhases.forEach(([phaseKey, phaseData]) => {
            console.log(`Processing phase: ${phaseKey}`, phaseData);
            const phaseDiv = document.createElement('div');
            // Appliquer des styles différents selon la phase
            if (phaseKey === 'phase1') {
                phaseDiv.className = 'use-cases-phase use-cases-phase-secondary';
            } else {
                phaseDiv.className = 'use-cases-phase use-cases-phase-primary';
            }
            
            // Titre de la phase
            const phaseTitle = document.createElement('h4');
            phaseTitle.textContent = phaseData.title;
            phaseTitle.className = phaseKey === 'phase1' ? 'use-cases-phase-title-secondary' : 'use-cases-phase-title-primary';
            phaseDiv.appendChild(phaseTitle);
            
            // Conteneur des Use Cases
            const useCasesGrid = document.createElement('div');
            useCasesGrid.className = 'use-cases-grid';
            
            // Afficher chaque Use Case
            phaseData.use_cases.forEach(useCase => {
                const useCaseDiv = document.createElement('div');
                useCaseDiv.className = `use-case-item ${useCase.unlocked ? 'unlocked' : 'locked'}`;
                
                // Icône
                const icon = document.createElement('div');
                icon.className = 'use-case-icon';
                icon.innerHTML = `<i class="${useCase.icon || 'fas fa-lightbulb'}"></i>`;
                useCaseDiv.appendChild(icon);
                
                // Titre
                const title = document.createElement('div');
                title.className = 'use-case-title';
                title.textContent = useCase.title;
                useCaseDiv.appendChild(title);
                
                // Description (tooltip)
                const tooltip = document.createElement('div');
                tooltip.className = 'use-case-tooltip';
                tooltip.innerHTML = `
                    <div class="use-case-tooltip-title">${useCase.title}</div>
                    <div class="use-case-tooltip-description">${useCase.description}</div>
                `;
                useCaseDiv.appendChild(tooltip);
                
                useCasesGrid.appendChild(useCaseDiv);
            });
            
            phaseDiv.appendChild(useCasesGrid);
            useCasesContent.appendChild(phaseDiv);
        });
    }
    
    getCompletedPhases() {
        // Déterminer quelles phases sont complétées basé sur l'état actuel du jeu
        const completedPhases = [];
        
        // Vérifier chaque phase
        if (this.currentPhaseNumber >= 1) completedPhases.push(1);
        if (this.currentPhaseNumber >= 2) completedPhases.push(2);
        if (this.currentPhaseNumber >= 3) completedPhases.push(3);
        if (this.currentPhaseNumber >= 4) completedPhases.push(4);
        if (this.currentPhaseNumber >= 5) completedPhases.push(5);
        
        return completedPhases;
    }
    
    updatePhaseHeaders(completedPhases) {
        // Mettre à jour la visibilité des en-têtes de phase (exclure Step 2 qui n'a pas d'enablers)
        const phasesWithEnablers = [1, 3, 4, 5]; // Exclure Step 2
        phasesWithEnablers.forEach(i => {
            const phaseHeader = document.querySelector(`.phase-header-${i}`);
            if (phaseHeader) {
                if (completedPhases.includes(i)) {
                    phaseHeader.classList.remove('hidden');
                    phaseHeader.classList.add('visible');
                } else {
                    phaseHeader.classList.remove('visible');
                    phaseHeader.classList.add('hidden');
                }
            }
        });
        
        // Masquer l'en-tête Step 2
        const phaseHeader2 = document.querySelector(`.phase-header-2`);
        if (phaseHeader2) {
            phaseHeader2.classList.remove('visible');
            phaseHeader2.classList.add('hidden');
        }
    }
    
    updateEnablersGrid(enablers) {
        const enablersGrid = document.getElementById('enablers-grid');
        enablersGrid.innerHTML = '';
        
        if (enablers.length === 0) {
            enablersGrid.innerHTML = '<p style="text-align: center; opacity: 0.7;">Aucun ENABLER débloqué pour le moment</p>';
            return;
        }
        
        enablers.forEach(enabler => {
            const enablerItem = document.createElement('div');
            enablerItem.className = 'enabler-item';
            enablerItem.innerHTML = `
                <h4>${enabler.title}</h4>
                <p>${enabler.description}</p>
            `;
            enablersGrid.appendChild(enablerItem);
        });
    }

    updatePhaseSquares(scoreData) {
        // Update each phase square based on the score data
        for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
            const phaseKey = `mot${phaseNum}`;
            const score = scoreData.scores[phaseKey] || 0;
            const square = document.getElementById(`phase${phaseNum}-square`);
            
            if (square) {
                square.classList.remove('completed');
                if (score > 0) {
                    square.classList.add('completed');
                }
            }
        }
    }

    updateTotalBadge(scoreData) {
        const badge = document.getElementById('total-badge');
        if (badge) {
            badge.textContent = `Total: ${scoreData.total}/15`;
        }
    }

    // Version 1.4: New function to show global score recap
    async getCurrentScoresAndShowRecap(phaseNumber) {
        try {
            const response = await fetch('/api/current_score', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Special case: After Phase 5, show final results with Recap video
                if (phaseNumber === 5) {
                    console.log('Phase 5 completed - showing final results with Recap video');
                    console.log('DEBUG: data.score received:', data.score);
                    this.showFinalResults(data.score);
                } else {
                this.showGlobalScoreRecap(phaseNumber, data.score);
                }
            } else {
                console.error('Failed to get current scores');
                this.showAlert('Erreur lors de la récupération des scores', 'danger');
            }
        } catch (error) {
            console.error('Error getting current scores:', error);
            this.showAlert('Erreur lors de la récupération des scores', 'danger');
        }
    }

    // New scoring system: 14-15 = 3/3, 10-13 = 2/3, 0-9 = 1/3
    calculateNewScore(totalScore) {
        if (totalScore >= 14) return 3;
        if (totalScore >= 10) return 2;
        return 1;
    }

    showGlobalScoreRecap(phaseNumber, scoreData) {
        console.log('=== showGlobalScoreRecap called ===');
        console.log('phaseNumber:', phaseNumber);
        console.log('scoreData:', scoreData);
        
        // Create global score recap modal if it doesn't exist
        if (!document.getElementById('globalScoreRecapModal')) {
            console.log('Creating globalScoreRecapModal...');
            this.createGlobalScoreRecapModal();
        } else {
            console.log('globalScoreRecapModal already exists');
        }
        
        // Update the content
        console.log('Updating modal content...');
        this.updateGlobalScoreRecapContent(phaseNumber, scoreData);
        
        // Show the modal
        console.log('Showing modal...');
        const modalElement = document.getElementById('globalScoreRecapModal');
        console.log('Modal element:', modalElement);
        
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            console.log('Modal shown successfully');
        } else {
            console.error('Modal element not found!');
        }
        
        // Version 1.4: No auto-close - user must click continue button
        // Store current Phase number for continue button
        this.currentPhaseNumber = phaseNumber;
    }

    createGlobalScoreRecapModal() {
        const modalHTML = `
            <div class="modal fade" id="globalScoreRecapModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border: none;">
                        <div class="modal-body p-0" style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <div class="text-center" style="max-width: 1200px; width: 90%;">
                                <!-- Steven's Feedback Section -->
                                <div class="steven-feedback-section mb-4" id="steven-feedback-section" style="display: none;">
                                    <div class="row align-items-center">
                                        <div class="col-md-3 text-center">
                                            <img src="/static/images/Steven_photo.png" alt="Steven" class="steven-photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #08efff; box-shadow: 0 0 20px rgba(8, 239, 255, 0.5);">
                                        </div>
                                        <div class="col-md-9">
                                            <div class="steven-message" id="steven-message" style="background: rgba(255, 255, 255, 0.1); padding: 1.5rem; border-radius: 15px; border-left: 4px solid #08efff; backdrop-filter: blur(10px);">
                                                <!-- Steven's message will be populated here -->
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Global Score Display - Compact -->
                                <div class="global-score-display mb-3">
                                    <div class="global-score-badge" style="background: linear-gradient(135deg, #ffffff, #f8fafc); color: #1e40af; padding: 1rem; border-radius: 10px; box-shadow: 0 0 15px rgba(30, 64, 175, 0.3); border: 2px solid #60a5fa; min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                                        <h1 class="display-1 mb-1" id="global-score-total" style="font-weight: 800; font-size: 2.5rem; line-height: 1; overflow: visible;">0</h1>
                                        <p class="lead mb-0" style="font-size: 1rem; text-transform: uppercase;">Score Final</p>
                                    </div>
                                </div>
                                
                                <!-- Score Breakdown - Compact -->
                                <div class="score-breakdown mb-3">
                                    <h5 class="mb-2" style="color: #ffffff; font-size: 1.2rem; text-transform: uppercase; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);">Detail by Phase</h5>
                                    <div class="row justify-content-center" id="global-score-breakdown">
                                        <!-- Score breakdown will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Progress Bar -->
                                <div class="progress-info mb-3">
                                    <div class="progress" style="height: 20px; background: rgba(8, 239, 255, 0.2); border-radius: 10px;">
                                        <div class="progress-bar" id="global-progress-bar" role="progressbar" style="width: 0%; background: linear-gradient(90deg, #08efff, #00b3bc); border-radius: 10px;"></div>
                                    </div>
                                    <div class="mt-2" id="global-progress-text" style="color: #08efff; font-size: 1rem;">Progress: 0/15</div>
                                </div>
                                
                                <!-- MOT Status Squares -->
                                <div class="mot-status mb-3">
                                    <h6 class="mb-2" style="color: #08efff; font-size: 1.1rem; text-transform: uppercase;">Step Status</h6>
                                    <div class="mot-status-squares" id="global-mot-squares" style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                                        <!-- MOT status squares will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="action-buttons d-flex gap-3 justify-content-center">
                                    <button id="pedagogical-summary-btn" class="btn btn-outline-light" style="border: 2px solid #ffffff; border-radius: 10px; color: #ffffff; background: rgba(255, 255, 255, 0.1); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem; padding: 12px 25px; text-transform: uppercase; transition: all 0.3s ease;">
                                        <i class="fas fa-graduation-cap me-2"></i>Pedagogical Summary
                                    </button>
                                    <button id="global-continue-btn" class="NeonButton" style="border: 3px solid #08efff; border-radius: 10px; color: #08efff; background: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; padding: 12px 30px; text-transform: uppercase; filter: drop-shadow(0 0 5px #08EFFF); transition: all 0.3s ease;">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener for continue button
        document.getElementById('global-continue-btn').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('globalScoreRecapModal'));
            modal.hide();
            this.proceedToActualNextMOT(this.currentPhaseNumber);
        });

        // Add event listener for pedagogical summary button
        document.getElementById('pedagogical-summary-btn').addEventListener('click', () => {
            this.showPedagogicalSummary();
        });
    }

    showPedagogicalSummary() {
        console.log('DEBUG: showPedagogicalSummary() called');
        const modalHTML = `
            <div class="modal fade" id="pedagogicalSummaryModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border: none;">
                        <div class="modal-header" style="border-bottom: 2px solid rgba(255, 255, 255, 0.2);">
                            <h5 class="modal-title text-white" style="font-weight: 600;">
                                <i class="fas fa-graduation-cap me-2"></i>Pedagogical Summary
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                            <div class="text-white" style="line-height: 1.6;">
                                <div class="mb-4">
                                    <h6 class="text-warning mb-3" style="font-weight: 600; text-transform: uppercase;">Objective achieved:</h6>
                                    <p class="mb-3">Leaders and managers now understand how to embed AI and GenAI within their organization — not as a technology project, but as a true business transformation.</p>
                                    <p class="mb-3">Through The AI Quest, they discovered how to combine innovation, scalability, and responsibility to create lasting impact across the gaming and entertainment ecosystem.</p>
                                    <p class="mb-4"><strong>Estimated duration:</strong> ≈ 45 minutes (around 9 minutes per phase)</p>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-warning mb-3" style="font-weight: 600; text-transform: uppercase;">Key learnings:</h6>
                                    <div class="mb-3">
                                        <strong>1️⃣ Experience-focused strategy</strong><br>
                                        AI transformation starts with people and purpose. Participants learned how to design an AI strategy that aligns innovation with culture and long-term vision.
                                    </div>
                                    <div class="mb-3">
                                        <strong>2️⃣ Portfolio thinking and prioritization</strong><br>
                                        Not every use case is equal. Choosing where AI creates the most value — balancing impact, feasibility, and cultural fit — is key to generating momentum and credibility.
                                    </div>
                                    <div class="mb-3">
                                        <strong>3️⃣ Enablers for acceleration</strong><br>
                                        Scaling success requires more than pilots. Participants identified the practical enablers — in People, Technology, and Governance — that turn experiments into sustainable operations.
                                    </div>
                                    <div class="mb-3">
                                        <strong>4️⃣ From pilots to scale</strong><br>
                                        True scaling means changing roles, systems, and ways of working. Leaders explored how to embed AI in production, connect it to real processes, and maintain trust and alignment as adoption grows.
                                    </div>
                                    <div class="mb-3">
                                        <strong>5️⃣ Enterprise-wide expansion</strong><br>
                                        The final phase emphasized sustainability. AI becomes part of the company's DNA when it's supported by continuous learning, clear governance, and empowered people — across all studios, markets, and teams.
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-warning mb-3" style="font-weight: 600; text-transform: uppercase;">Learning outcomes</h6>
                                    <p class="mb-3">After completing The AI Quest, participants are able to:</p>
                                    <ul class="mb-3">
                                        <li>Identify the stages of a successful AI transformation — from vision to scale.</li>
                                        <li>Recognize the balance between technology, people, and governance.</li>
                                        <li>Understand how to prioritize use cases and structure enablers for sustainable growth.</li>
                                        <li>Apply responsible AI principles to ensure trust, transparency, and ethical use.</li>
                                        <li>Lead with confidence, creativity, and purpose in an AI-augmented organization.</li>
                                    </ul>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-warning mb-3" style="font-weight: 600; text-transform: uppercase;">Practical application and call to action</h6>
                                    <p class="mb-3">Managers leave the simulation with a clear roadmap:</p>
                                    <p class="mb-3">They can now identify key stakeholders, define priorities, and launch their first AI enablers within their teams.</p>
                                    <p class="mb-3">They understand that AI success is not about tools — it's about collaboration, curiosity, and continuous learning.</p>
                                    <p class="mb-3"><strong>The next move is theirs: Integrate. Scale. Inspire.</strong></p>
                                    <p class="mb-0">Because at PlayForward — as in every organization — the future of AI is already in play.</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="border-top: 2px solid rgba(255, 255, 255, 0.2);">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                                <i class="fas fa-check me-2"></i>Understood
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if it exists
        const existingModal = document.getElementById('pedagogicalSummaryModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show the modal
        console.log('DEBUG: About to show pedagogical summary modal');
        const modalElement = document.getElementById('pedagogicalSummaryModal');
        console.log('DEBUG: Modal element:', modalElement);
        
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            console.log('DEBUG: Modal shown successfully');
        } else {
            console.error('DEBUG: Bootstrap Modal not available');
            // Fallback: show modal manually
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
        }
    }

    updateGlobalScoreRecapContent(phaseNumber, scoreData) {
        console.log('=== updateGlobalScoreRecapContent called ===');
        console.log('phaseNumber:', phaseNumber);
        console.log('scoreData:', scoreData);
        
        // Show Steven's feedback for Phase 1 only
        const stevenSection = document.getElementById('steven-feedback-section');
        const stevenMessage = document.getElementById('steven-message');
        
        if (phaseNumber === 1 && stevenSection && stevenMessage) {
            stevenSection.style.display = 'block';
            
            // Get the choice made in Phase 1
            const phase1Choice = this.selectedChoices.mot1;
            console.log('Phase 1 choice:', phase1Choice);
            
            let message = '';
            if (phase1Choice === 'elena') {
                message = `
                    <h4 style="color: #08efff; margin-bottom: 1rem; font-weight: 600;">Excellent!</h4>
                    <p style="color: #ffffff; font-size: 1.1rem; line-height: 1.6; margin-bottom: 0;">
                        By choosing Elena's approach, you earned 3 stars out of 3.<br>
                        This value-driven and culture-aligned strategy ensures you'll build a sustainable AI roadmap that inspires creativity, empowers teams, and delivers measurable business impact.
                    </p>
                `;
            } else if (phase1Choice === 'james') {
                message = `
                    <h4 style="color: #08efff; margin-bottom: 1rem; font-weight: 600;">Good Choice!</h4>
                    <p style="color: #ffffff; font-size: 1.1rem; line-height: 1.6; margin-bottom: 0;">
                        By selecting James's approach, you earned 2 stars out of 3. You chose a prudent and structured path, focusing on data, technology, and architecture — a wise move for long-term scalability.<br>
                        However, the risk is that your transformation could lose momentum before delivering visible value to business teams.
                    </p>
                `;
            } else if (phase1Choice === 'amira') {
                message = `
                    <h4 style="color: #08efff; margin-bottom: 1rem; font-weight: 600;">Interesting Attempt!</h4>
                    <p style="color: #ffffff; font-size: 1.1rem; line-height: 1.6; margin-bottom: 0;">
                        By following Amira's approach, you earned 1 star out of 3. Your choice shows boldness and a desire to move fast — essential qualities for innovation. But without clear governance or foundations, you risk creating fragmented initiatives and limited long-term impact.<br>
                        Your teams may learn quickly, but results will stay local and unsustainable.
                    </p>
                `;
            }
            
            stevenMessage.innerHTML = message;
        } else if (stevenSection) {
            stevenSection.style.display = 'none';
        }
        
        // Update global score total with new scoring system
        const totalElement = document.getElementById('global-score-total');
        console.log('global-score-total element:', totalElement);
        if (totalElement) {
            const newScore = this.calculateNewScore(scoreData.total);
            totalElement.textContent = `${newScore}/3`;
            console.log('Updated global score total to:', `${newScore}/3 (from ${scoreData.total})`);
        } else {
            console.error('global-score-total element not found!');
        }
        
        // Update progress bar with new scoring system
        const newScore = this.calculateNewScore(scoreData.total);
        const progressPercentage = (newScore / 3) * 100;
        document.getElementById('global-progress-bar').style.width = `${progressPercentage}%`;
        document.getElementById('global-progress-text').textContent = `Score: ${newScore}/3 (${scoreData.total} points)`;
        
        // Update score breakdown with original game style
        const breakdownContainer = document.getElementById('global-score-breakdown');
        breakdownContainer.innerHTML = '';
        
        Object.entries(scoreData.scores).forEach(([mot, score]) => {
            const phaseNum = mot.replace('mot', '');
            const phaseTitles = {
                1: 'Embedding GenAI',
                2: 'Building Foundation',
                3: 'Scaling Organization',
                4: 'Ensuring Success',
                5: 'Accelerating Transformation'
            };
            
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-3 mb-3';
            col.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.15); padding: 1.5rem; border-radius: 12px; border-left: 3px solid #60a5fa; margin-bottom: 0.8rem; backdrop-filter: blur(10px);">
                    <div style="color: #ffffff; font-size: 18pt; font-weight: bold; text-transform: uppercase;">Step ${phaseNum}: ${score}/3</div>
                    <div style="color: #f8fafc; font-size: 14pt; margin-top: 0.3rem;">${phaseTitles[phaseNum] || mot}</div>
                </div>
            `;
            breakdownContainer.appendChild(col);
        });
        
        // Update Phase status squares with original game style
        const squaresContainer = document.getElementById('global-mot-squares');
        squaresContainer.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const phaseKey = `mot${i}`;
            const score = scoreData.scores[phaseKey] || 0;
            const isCompleted = score > 0;
            const isCurrent = i === phaseNumber;
            
            const square = document.createElement('div');
            square.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: ${isCompleted ? 'linear-gradient(135deg, #ffffff, #f8fafc)' : 'rgba(255, 255, 255, 0.2)'};
                border: 2px solid ${isCurrent ? '#f59e0b' : '#60a5fa'};
                transition: all 0.3s ease;
                position: relative;
                color: ${isCompleted ? '#1e40af' : '#ffffff'};
                box-shadow: ${isCompleted ? '0 0 20px rgba(30, 64, 175, 0.3)' : 'none'};
            `;
            
            if (isCurrent) {
                square.style.animation = 'pulse 1s infinite';
            }
            
            const filledStars = '★'.repeat(score);
            const emptyStars = '★'.repeat(3 - score);
            square.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2rem;">${i}</div>
                <div style="font-size: 0.8rem; margin-top: 0.1rem;"><span class="star-filled">${filledStars}</span><span class="star-empty">${emptyStars}</span></div>
            `;
            squaresContainer.appendChild(square);
        }
    }


    // Version 1.4: Function to get current score data from DOM elements
    getCurrentScoreData() {
        const scores = {};
        let total = 0;
        
        // Get scores from DOM elements
        for (let i = 1; i <= 5; i++) {
            const scoreElement = document.getElementById(`phase${i}-score`);
            if (scoreElement) {
                const score = parseInt(scoreElement.textContent) || 0;
                scores[`mot${i}`] = score;
                total += score;
            } else {
                scores[`mot${i}`] = 0;
            }
        }
        
        return {
            scores: scores,
            total: total
        };
    }
    
    proceedToNextMOT(currentMOT) {
        console.log('=== proceedToNextMOT called ===');
        console.log('Current MOT:', currentMOT);
        console.log('this.currentPhaseNumber:', this.currentPhaseNumber);
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('executiveDashboardModal'));
        console.log('Modal instance:', modal);
        if (modal) {
            modal.hide();
            console.log('Modal hidden');
        }
        
        // Force remove modal backdrop and body classes
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Proceed to next phase using original flow
        this.proceedToActualNextMOT(currentMOT);
    }

    proceedToActualNextMOT(currentMOT) {
        console.log('=== proceedToActualNextMOT called ===');
        console.log('Actually proceeding to next MOT from:', currentMOT);
        console.log('Current selectedChoices:', this.selectedChoices);
        console.log('Current phase number:', this.currentPhaseNumber);
        
        switch(currentMOT) {
            case 1:
                console.log('Showing Phase2 video...');
                this.currentPhaseNumber = 2;
                this.showPhase2Video();
                break;
            case 2:
                console.log('Showing Phase3 video...');
                this.currentPhaseNumber = 3;
                this.showPhase3Video();
                break;
            case 3:
                console.log('Showing Phase4 video...');
                this.currentPhaseNumber = 4;
                this.showPhase4Video();
                break;
            case 4:
                console.log('Showing Phase5-1 video...');
                this.currentPhaseNumber = 5;
                this.showPhase5_1Video();
                break;
            case 5:
                console.log('Showing final results...');
                // Fetch final results and show them
                this.showFinalResults();
                break;
            default:
                console.error('Unknown phase number:', currentMOT);
        }
        
        console.log('=== proceedToActualNextMOT completed ===');
    }

    loadNextSection() {
        if (!this.selectedChoices.mot1) {
            this.loadMOT1Choices();
        } else if (this.selectedChoices.mot2.length === 0) {
            this.loadMOT2Choices();
        } else if (Object.keys(this.selectedChoices.mot3).length === 0) {
            this.loadMOT3Choices();
        } else if (this.selectedChoices.mot4.length === 0) {
            this.loadMOT4Choices();
        } else if (!this.selectedChoices.mot5) {
            this.loadMOT5Choices();
        }
    }

    showFinalResults(scoreData) {
        console.log('DEBUG: showFinalResults called with scoreData:', scoreData);
        const newScore = this.calculateNewScore(scoreData.total);
        console.log('DEBUG: calculateNewScore result:', newScore, 'for total:', scoreData.total);
        
        // Format the score data for the results screen
        const results = {
            total: scoreData.total,
            stars: newScore,
            scores: scoreData.scores
        };
        
        console.log('DEBUG: Final results object:', results);
        this.showResults(results);
    }

    calculateStars(totalScore) {
        if (totalScore >= 14) return 3;
        if (totalScore >= 11) return 2;
        return 1;
    }

    showFinalResults() {
        console.log('Showing final results...');
        if (this.finalResults) {
            console.log('DEBUG: this.finalResults before update:', this.finalResults);
            // Recalculate stars with new system
            this.finalResults.stars = this.calculateNewScore(this.finalResults.total);
            console.log('DEBUG: this.finalResults after update:', this.finalResults);
            this.showResults(this.finalResults);
            this.updateProgress(100, 'Game completed!');
        } else {
            console.error('No final results available');
            this.showAlert('Aucun résultat final disponible', 'danger');
        }
    }

    showResults(results) {
        console.log('DEBUG: showResults called with results:', results);
        console.log('DEBUG: results.stars value:', results.stars);
        console.log('DEBUG: Star calculation:', '★'.repeat(results.stars) + '☆'.repeat(3 - results.stars));
        
        // Determine the congratulations message based on score
        let congratulationMessage = '';
        let congratulationIcon = '';
        if (results.stars === 3) {
            congratulationMessage = 'Excellent!';
            congratulationIcon = '🎯';
        } else if (results.stars === 2) {
            congratulationMessage = 'Well done!';
            congratulationIcon = '👍';
        } else {
            congratulationMessage = 'Let\'s try again!';
            congratulationIcon = '💪';
        }
        
        const container = document.getElementById('results-content');
        container.innerHTML = `
            <div class="text-center" style="font-size: 0.8rem; padding: 10px;">
                <h3 class="mb-2" style="font-size: 1.2rem !important; margin-bottom: 0.5rem !important;">${congratulationIcon} ${congratulationMessage}</h3>
                
                <!-- Recap Video Section -->
                <div class="mb-2" style="margin-bottom: 0.5rem !important;">
                    <h3><i class="fas fa-video me-2"></i>Game Recap</h3>
                    <div class="video-container mb-2" style="margin-bottom: 0.5rem !important;">
                        <div class="embed-responsive embed-responsive-16by9" style="max-height: 150px !important;">
                            <video 
                                id="recap-video-results"
                                class="embed-responsive-item" 
                                controls
                                autoplay
                                playsinline
                                style="width: 100%; height: 100%; border-radius: 8px;">
                                <source src="/static/videos/recap_${results.stars}.mp4" type="video/mp4">
                                <track kind="subtitles" src="/static/videos/recap_${results.stars}.vtt" srclang="en" label="English" default>
                                Votre navigateur ne supporte pas la lecture vidéo.
                            </video>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-2" style="margin-bottom: 0.5rem !important;">
                    <div class="col-md-6">
                        <h5 class="mb-1" style="font-size: 0.9rem !important; margin-bottom: 0.25rem !important;">Score Final</h5>
                        <div class="score-total-display text-primary" style="font-size: 1.8rem !important; font-weight: bold;">${results.total}/15</div>
                        <div class="stars-display" style="font-size: 1.1rem !important;">
                            ${'★'.repeat(results.stars)}${'☆'.repeat(3 - results.stars)}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5 class="mb-1" style="font-size: 0.9rem !important; margin-bottom: 0.25rem !important;">Detail by Step</h5>
                        <div class="text-start">
                            <div class="mb-1" style="font-size: 0.75rem !important; margin-bottom: 0.25rem !important;">${this.gameConfig?.phases?.phase1?.title || 'Step 1 - Embedding GenAI in your AI transformation program'}: <span class="score-badge">${results.scores.mot1}/3</span></div>
                            <div class="mb-1" style="font-size: 0.75rem !important; margin-bottom: 0.25rem !important;">${this.gameConfig?.phases?.phase2?.title || 'Step 2 - Building the right foundation'}: <span class="score-badge">${results.scores.mot2}/3</span></div>
                            <div class="mb-1" style="font-size: 0.75rem !important; margin-bottom: 0.25rem !important;">${this.gameConfig?.phases?.phase3?.title || 'Step 3 - Scaling across the organization'}: <span class="score-badge">${results.scores.mot3}/3</span></div>
                            <div class="mb-1" style="font-size: 0.75rem !important; margin-bottom: 0.25rem !important;">${this.gameConfig?.phases?.phase4?.title || 'Step 4 - Ensuring sustainable success'}: <span class="score-badge">${results.scores.mot4}/3</span></div>
                            <div class="mb-1" style="font-size: 0.75rem !important; margin-bottom: 0.25rem !important;">${this.gameConfig?.phases?.phase5?.title || 'Step 5 - Accelerating the transformation'}: <span class="score-badge">${results.scores.mot5}/3</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="d-flex gap-2 justify-content-center mt-2">
                    <button id="pedagogical-summary-final-btn" class="btn btn-outline-primary btn-sm" style="font-size: 0.7rem !important; padding: 0.4rem 0.8rem;" onclick="window.gameController.showPedagogicalSummary()">
                        <i class="fas fa-graduation-cap me-1"></i>Pedagogical Summary
                    </button>
                </div>
            </div>
        `;
        
        this.showSection('results-section');
        
        // Initialize Recap video after the content is loaded
        setTimeout(() => {
            initializeRecapVideoResults();
        }, 100);
    }

    getPerformanceMessage(stars) {
        switch (stars) {
            case 3:
                return 'Excellent travail ! Vous avez maîtrisé tous les aspects de la transformation GenAI.';
            case 2:
                return 'Bon travail ! Vous avez une bonne compréhension de la transformation GenAI.';
            case 1:
                return 'Continuez à apprendre ! Il y a encore des opportunités d\'amélioration.';
            default:
                return 'Merci d\'avoir joué !';
        }
    }

    resetGame() {
        // Stop all videos first
        this.stopAllVideos();
        
        // Reset game state to initial state
        this.currentState = 'intro';
        this.currentPhaseNumber = 0;
        this.selectedChoices = {
            mot1: null,
            mot2: [],
            mot3: {},
            mot4: [],
            mot5: null
        };
        this.budget = 0;
        
        // Reset UI - go back to introduction video
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('progress-card').style.display = 'none';
        
        // Show introduction section
        this.showSection('video-intro-section');
        
        // Reset progress
        this.updateProgress(0, 'Starting new game...');
        
        // Start the introduction video
        initializeIntroVideo();
        
        console.log('Game reset - starting from Introduction Video');
    }

    showLoading(show) {
        const modalElement = document.getElementById('loadingModal');
        
        if (show) {
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
        } else {
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    }

    forceCloseModal() {
        this.showLoading(false);
    }
}

// YouTube API Integration
let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('intro-video', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.getElementById('skip-video-btn').style.display = 'none';
        document.getElementById('start-game-btn').style.display = 'inline-block';
    }
}

// Harnessing Video Management
let harnessingVideoElement;

function initializeHarnessingVideo() {
    harnessingVideoElement = document.getElementById('harnessing-video');
    if (harnessingVideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Quand la vidéo se termine, juste cacher les boutons (ne pas passer automatiquement à Teams Meeting)
        harnessingVideoElement.addEventListener('ended', function() {
            // Ne rien faire - le bouton "Continue" reste visible et fonctionnel
        });
        
        // Démarrer la vidéo automatiquement
        harnessingVideoElement.play().catch(function(error) {
            console.log('Harnessing video autoplay failed:', error);
            // Si l'autoplay échoue, afficher le bouton play
            document.getElementById('start-game-after-harnessing-btn').style.display = 'inline-block';
        });
    }
}

// Intro Video Management
function initializeIntroVideo() {
    const introVideoElement = document.getElementById('presentation-video');
    if (introVideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideo('presentation-video');
        }
        
        // Ajouter un événement pour montrer le bouton "Start Game" quand la vidéo se termine
        introVideoElement.addEventListener('ended', function() {
            const startGameBtn = document.getElementById('start-game-btn');
            if (startGameBtn) {
                startGameBtn.style.display = 'inline-block';
            }
        });
    }
}
function initializePhase1Video() {
    const mot1VideoElement = document.getElementById('phase1-video');
    if (mot1VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase1-video');
        }
    }
}

function initializePhase2Video() {
    const phase2VideoElement = document.getElementById('phase2-video');
    if (phase2VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase2-video');
        }
    }
}

function initializePhase3Video() {
    const phase3VideoElement = document.getElementById('phase3-video');
    if (phase3VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase3-video');
        }
    }
}

function initializePhase4Video() {
    const phase4VideoElement = document.getElementById('phase4-video');
    if (phase4VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase4-video');
        }
    }
}

function initializePhase5_1Video() {
    const phase5_1VideoElement = document.getElementById('phase5-1-video');
    if (phase5_1VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase5-1-video');
        }
    }
}

function initializePhase5_2Video() {
    const phase5_2VideoElement = document.getElementById('phase5-2-video');
    if (phase5_2VideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('phase5-2-video');
        }
    }
}

function initializeRecapVideo() {
    const recapVideoElement = document.getElementById('recap-video');
    if (recapVideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('recap-video');
        }
    }
}

function initializeRecapVideoResults() {
    const recapVideoElement = document.getElementById('recap-video-results');
    if (recapVideoElement) {
        // Utiliser la nouvelle méthode pour lancer la vidéo avec le son
        if (window.gameController) {
            window.gameController.playVideoWithSound('recap-video-results');
        }
    }
}

// Initialize game controller
const gameController = new GameController();
window.gameController = gameController;

// Désactiver l'autoplay de toutes les vidéos au chargement
gameController.disableAllVideoAutoplay();

// Global function for MOT2 choice selection
function selectMOT2Choice(choiceId) {
    if (window.gameController) {
        gameController.selectMOT2Choice(choiceId);
    }
}


// Global function for MOT4 choice selection
function selectMOT4Choice(choiceId, cost) {
    if (window.gameController) {
        gameController.selectMOT4Choice(choiceId, cost);
    }
}

// Test simple pour vérifier que le JavaScript fonctionne
console.log('GameController initialized:', gameController);
console.log('selectMOT1Choice function exists:', typeof gameController.selectMOT1Choice);
