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
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form avec validation améliorée
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoginAndStart();
        });
        
        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Navigation entre login et register
        document.getElementById('show-register-form').addEventListener('click', () => {
            this.showRegisterForm();
        });
        
        document.getElementById('show-login-form').addEventListener('click', () => {
            this.showLoginForm();
        });
        
        // Validation en temps réel pour login
        document.getElementById('username').addEventListener('input', () => {
            this.validateUsernameField();
        });
        
        document.getElementById('password').addEventListener('input', () => {
            this.validatePasswordField();
        });
        
        // Validation en temps réel pour register
        document.getElementById('reg-username').addEventListener('input', () => {
            this.validateRegUsernameField();
        });
        
        document.getElementById('reg-email').addEventListener('input', () => {
            this.validateRegEmailField();
        });
        
        document.getElementById('reg-password').addEventListener('input', () => {
            this.validateRegPasswordField();
        });
        
        document.getElementById('reg-confirm-password').addEventListener('input', () => {
            this.validateRegConfirmPasswordField();
        });

        // Start game button (removed - handled by handleLoginAndStart)

        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });

        // Next button in score screen
        document.getElementById('next-button').addEventListener('click', () => {
            // Version 1.4: Get Phase number from the modal title or use stored value
            const phaseNumber = this.currentPhaseNumber || 1;
            console.log('Next button clicked, Phase number:', phaseNumber);
            
            // Hide the score modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('scoreModal'));
            if (modal) {
                modal.hide();
            }
            
            // Get current scores and show global score recap
            this.getCurrentScoresAndShowRecap(phaseNumber);
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
                this.showMOT1Video();
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

        // Start game after harnessing button
        const startGameAfterHarnessingBtn = document.getElementById('start-game-after-harnessing-btn');
        if (startGameAfterHarnessingBtn) {
            startGameAfterHarnessingBtn.addEventListener('click', () => {
                this.showMOT1Video();
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
            phase4ConfirmBtn.addEventListener('click', () => {
                console.log('=== Phase 4 CONFIRM BUTTON CLICKED ===');
                this.confirmMOT4Choices();
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
    
    // Validation des champs d'inscription
    validateRegUsernameField() {
        const usernameField = document.getElementById('reg-username');
        const usernameError = document.getElementById('reg-username-error');
        const value = usernameField.value.trim();
        
        // Clear previous validation states
        usernameField.classList.remove('is-invalid', 'is-valid');
        
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
            usernameField.classList.add('is-valid');
            usernameError.textContent = '';
            return true;
        }
    }
    
    validateRegEmailField() {
        const emailField = document.getElementById('reg-email');
        const emailError = document.getElementById('reg-email-error');
        const value = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // Clear previous validation states
        emailField.classList.remove('is-invalid', 'is-valid');
        
        if (!value) {
            emailField.classList.add('is-invalid');
            emailError.textContent = 'Email address is required';
            return false;
        } else if (!emailRegex.test(value)) {
            emailField.classList.add('is-invalid');
            emailError.textContent = 'Invalid email address';
            return false;
        } else {
            emailField.classList.add('is-valid');
            emailError.textContent = '';
            return true;
        }
    }
    
    validateRegPasswordField() {
        const passwordField = document.getElementById('reg-password');
        const passwordError = document.getElementById('reg-password-error');
        const value = passwordField.value;
        
        // Clear previous validation states
        passwordField.classList.remove('is-invalid', 'is-valid');
        
        if (!value) {
            passwordField.classList.add('is-invalid');
            passwordError.textContent = 'Password is required';
            return false;
        } else if (value.length < 6) {
            passwordField.classList.add('is-invalid');
            passwordError.textContent = 'Password must contain at least 6 characters';
            return false;
        } else {
            passwordField.classList.add('is-valid');
            passwordError.textContent = '';
            return true;
        }
    }
    
    validateRegConfirmPasswordField() {
        const passwordField = document.getElementById('reg-password');
        const confirmField = document.getElementById('reg-confirm-password');
        const confirmError = document.getElementById('reg-confirm-password-error');
        const value = confirmField.value;
        
        // Clear previous validation states
        confirmField.classList.remove('is-invalid', 'is-valid');
        
        if (!value) {
            confirmField.classList.add('is-invalid');
            confirmError.textContent = 'Password confirmation is required';
            return false;
        } else if (value !== passwordField.value) {
            confirmField.classList.add('is-invalid');
            confirmError.textContent = 'Passwords do not match';
            return false;
        } else {
            confirmField.classList.add('is-valid');
            confirmError.textContent = '';
            return true;
        }
    }
    
    // Navigation entre formulaires
    showLoginForm() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('register-section').style.display = 'none';
    }
    
    showRegisterForm() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
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
    
    showRegisterAlert(message, type = 'danger') {
        const alert = document.getElementById('register-alert');
        const alertMessage = document.getElementById('register-alert-message');
        
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
    
    hideRegisterAlert() {
        const alert = document.getElementById('register-alert');
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
    
    setRegisterLoading(loading) {
        const submitBtn = document.getElementById('register-submit-btn');
        const btnText = document.getElementById('register-btn-text');
        const btnLoading = document.getElementById('register-btn-loading');
        
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
        
        // Validation côté client
        const isUsernameValid = this.validateUsernameField();
        const isPasswordValid = this.validatePasswordField();
        
        console.log('✅ Validation:', { isUsernameValid, isPasswordValid });
        
        if (!isUsernameValid || !isPasswordValid) {
            this.showLoginAlert('Please correct the errors in the form', 'warning');
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('📝 Login attempt:', { username, passwordLength: password.length });
        
        this.setLoginLoading(true);
        this.hideLoginAlert();

        try {
            // Login
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const loginData = await loginResponse.json();
            console.log('📡 Login response:', loginData);
            
            if (loginData.success) {
                console.log('✅ Login successful, starting game...');
                
                // Start game
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
                    this.updateProgress(10, 'Introduction Video');
                    
                    // Initialize intro video
                    initializeIntroVideo();
                    
                    // Reset button states
                    document.getElementById('skip-video-btn').style.display = 'inline-block';
                    document.getElementById('start-game-btn').style.display = 'none';
                } else {
                    console.log('❌ Error starting game');
                    this.showLoginAlert('Error starting the game', 'danger');
                }
            } else {
                console.log('❌ Login failed:', loginData.message);
                this.showLoginAlert(loginData.message, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginAlert('Server connection error', 'danger');
        } finally {
            this.setLoginLoading(false);
        }
    }
    
    async handleRegister() {
        // Validation côté client
        const isUsernameValid = this.validateRegUsernameField();
        const isEmailValid = this.validateRegEmailField();
        const isPasswordValid = this.validateRegPasswordField();
        const isConfirmPasswordValid = this.validateRegConfirmPasswordField();
        
        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            this.showRegisterAlert('Please correct the errors in the form', 'warning');
            return;
        }
        
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        
        this.setRegisterLoading(true);
        this.hideRegisterAlert();
        
        try {
            // Register
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            const registerData = await registerResponse.json();

            if (registerData.success) {
                this.showRegisterAlert(registerData.message, 'success');
                
                // Retourner au formulaire de login après 2 secondes
                setTimeout(() => {
                    this.showLoginForm();
                    // Pré-remplir le nom d'utilisateur
                    document.getElementById('username').value = username;
                }, 2000);
            } else {
                this.showRegisterAlert(registerData.message, 'danger');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showRegisterAlert('Server connection error', 'danger');
        } finally {
            this.setRegisterLoading(false);
        }
    }

    showSection(sectionId) {
        console.log('=== showSection called with:', sectionId, '===');
        // Hide all sections
        document.querySelectorAll('[id$="-section"]').forEach(section => {
            section.style.display = 'none';
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
        
        // Passer directement à la vidéo intro (intro.mp4)
        this.showSection('harnessing-video-section');
        this.updateProgress(20, 'Introduction');
        
        // Initialize intro video
        initializeHarnessingVideo();
        
        // Reset button states
        document.getElementById('skip-harnessing-btn').style.display = 'inline-block';
        document.getElementById('start-game-after-harnessing-btn').style.display = 'none';
    }

    startGameAfterVideo() {
        // Hide video and show intro video (intro.mp4)
        this.showSection('harnessing-video-section');
        this.updateProgress(20, 'Introduction');
        
        // Initialize intro video
        initializeHarnessingVideo();
        
        // Reset button states
        document.getElementById('skip-harnessing-btn').style.display = 'inline-block';
        document.getElementById('start-game-after-harnessing-btn').style.display = 'none';
    }

    showMOT1Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide harnessing video section completely
        document.getElementById('harnessing-video-section').style.display = 'none';
        
        // Show Phase1 video
        this.showSection('phase1-video-section');
        this.updateProgress(30, 'Phase 1 - Embedding GenAI');
        
        // Initialize Phase1 video
        initializePhase1Video();
    }

    showPhase2Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase1-video-section').style.display = 'none';
        document.getElementById('phase1-section').style.display = 'none';
        
        // Show Phase2 video
        this.showSection('phase2-video-section');
        this.updateProgress(50, 'Phase 2 - HR Portfolio Selection');
        
        // Initialize Phase2 video
        initializePhase2Video();
    }

    showPhase3Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase2-video-section').style.display = 'none';
        document.getElementById('phase2-section').style.display = 'none';
        
        // Show Phase3 video
        this.showSection('phase3-video-section');
        this.updateProgress(70, 'Phase 3 - Launching your priority HR and GenAI pilots');
        
        // Initialize Phase3 video
        initializePhase3Video();
    }

    showPhase4Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase3-video-section').style.display = 'none';
        document.getElementById('phase3-section').style.display = 'none';
        
        // Show Phase4 video
        this.showSection('phase4-video-section');
        this.updateProgress(90, 'Phase 4 - Scaling your AI and GenAI solutions');
        
        // Initialize Phase4 video
        initializePhase4Video();
    }

    showPhase5_1Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase4-video-section').style.display = 'none';
        document.getElementById('phase4-section').style.display = 'none';
        
        // Show Phase5-1 video
        this.showSection('phase5-1-video-section');
        this.updateProgress(95, 'Phase 5 - Final Decision');
        
        // Initialize Phase5-1 video
        initializePhase5_1Video();
    }

    showPhase5_2Video() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase5-1-video-section').style.display = 'none';
        
        // Show Phase5-2 video
        this.showSection('phase5-2-video-section');
        this.updateProgress(98, 'Phase 5 - Final Decision');
        
        // Initialize Phase5-2 video
        initializePhase5_2Video();
    }

    showRecapVideo() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide all other sections
        document.getElementById('phase5-2-video-section').style.display = 'none';
        document.getElementById('phase5-section').style.display = 'none';
        
        // Show Recap video
        this.showSection('recap-video-section');
        this.updateProgress(100, 'Game Recap');
        
        // Initialize Recap video
        this.initializeRecapVideo();
    }

    showHarnessingVideo() {
        // Hide game intro completely
        document.getElementById('game-intro').style.display = 'none';
        
        // Show harnessing video
        this.showSection('harnessing-video-section');
        this.updateProgress(30, 'Vidéo Introduction');
        
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
        
        // Go to MOT1 video
        this.showMOT1Video();
    }

    startMOT1Game() {
        // Arrêter toutes les vidéos en cours
        this.stopAllVideos();
        
        // Hide MOT1 video section completely
        document.getElementById('phase1-video-section').style.display = 'none';
        
        // Go directly to MOT1 game
        this.loadMOT1Choices();
        this.updateProgress(50, 'Game Start');
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
            const response = await fetch('/api/phase1/choices', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                this.renderMOT1Choices(data.choices);
                this.showSection('phase1-section');
            }
        } catch (error) {
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT1Choices(choices) {
        const container = document.getElementById('phase1-choices');
        container.innerHTML = '';

        // Define choice details based on the scripts
        const choiceDetails = {
            'elena': {
                options: [
                    { icon: 'fas fa-brain', label: 'Strategic vision mapping', class: 'strategy' },
                    { icon: 'fas fa-search', label: 'HR function diagnostic', class: 'diagnostic' }
                ],
                description: 'Transformation must be anchored in a solid strategy. We need to identify the HR areas where generative AI and AI have the most transformative potential to improve employee experience and HR productivity. I would also like to understand what\'s feasible now, estimate associated costs and get an idea of the overall impact of generative AI on our HR teams.'
            },
            'james': {
                options: [
                    { icon: 'fas fa-handshake', label: 'GenAI platform partnership', class: 'partnership' },
                    { icon: 'fas fa-cogs', label: 'Technical foundation setup', class: 'technical' }
                ],
                description: 'We don\'t have the technological infrastructure to support generative AI. First, we need to build solid technical foundations. I suggest we select a generative AI platform to manage our future needs. HRTech Pro has the best capabilities on the market today.'
            },
            'amira': {
                options: [
                    { icon: 'fas fa-rocket', label: 'Rapid deployment', class: 'deployment' },
                    { icon: 'fas fa-users', label: 'Bottom-up innovation', class: 'innovation' }
                ],
                description: 'We don\'t have time to waste in this competitiveness race, generative AI is so powerful that we should go all out. I suggest we ask our HR managers to experiment with generative AI and develop their own HR tools.'
            }
        };

        choices.forEach((choice, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-choice';
            accordionItem.dataset.choiceId = choice.id;
            
            const details = choiceDetails[choice.id] || { options: [], description: choice.description };
            
            accordionItem.innerHTML = `
                <div class="accordion-header" onclick="gameController.toggleAccordion('${choice.id}')">
                    <h4 class="accordion-title">${choice.title}</h4>
                    <i class="fas fa-chevron-down accordion-arrow"></i>
                        </div>
                <div class="accordion-content">
                    <div class="accordion-details">
                        <div class="choice-options">
                            ${details.options.map(option => `
                                <div class="choice-option">
                                    <div class="option-icon ${option.class}">
                                        <i class="${option.icon}"></i>
                                    </div>
                                    <div class="option-label">${option.label}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="choice-description">
                            "${details.description}"
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(accordionItem);
        });

        // Initialize accordion functionality
        this.initializeAccordion();
    }

    initializeAccordion() {
        // Add click handlers for selection
        document.querySelectorAll('.accordion-choice').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.accordion-header')) {
                    this.selectPhase1Choice(item.dataset.choiceId);
                }
            });
        });
    }

    toggleAccordion(choiceId) {
        const accordionItem = document.querySelector(`[data-choice-id="${choiceId}"]`);
        const isExpanded = accordionItem.classList.contains('expanded');
        
        // Close all accordions
        document.querySelectorAll('.accordion-choice').forEach(item => {
            item.classList.remove('expanded');
        });
        
        // Open clicked accordion if it wasn't expanded
        if (!isExpanded) {
            accordionItem.classList.add('expanded');
        }
    }

    async selectPhase1Choice(choiceId) {
        console.log('Phase 1 choice selected:', choiceId);
        
        // Update visual selection
        document.querySelectorAll('.accordion-choice').forEach(item => {
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
                this.showScoreScreen(1, mot1Score, scoreData);
                this.updateProgress(40, `Phase 1 completed - Score: ${mot1Score}/3`);
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
        const container = document.getElementById('phase2-choices');
        container.innerHTML = '';

        choices.forEach(choice => {
            const card = document.createElement('div');
            card.className = 'solution-card';
            card.draggable = true;
            card.dataset.choiceId = choice.id;
            card.innerHTML = `
                <div class="solution-options">
                    <i class="fas fa-ellipsis-v"></i>
                        </div>
                <div class="solution-title">${choice.title}</div>
                <div class="solution-description">${choice.description}</div>
                <div class="solution-badges">
                    <span class="badge-feasibility">F: ${choice.feasibility || 'High'}</span>
                    <span class="badge-impact">I: ${choice.impact || 'High'}</span>
                </div>
            `;
            
            // Add drag event listeners
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            container.appendChild(card);
        });

        // Initialize priority slots
        this.initializePrioritySlots();
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
                this.updateProgress(60, `Phase 2 completed - Score: ${mot2Score}/3`);
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
                this.showAlert('Erreur lors du chargement des choix Phase 3: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 3 loading error:', error);
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT3Choices(choices) {
        const container = document.getElementById('phase3-choices');
        container.innerHTML = '';

        // Define category metadata
        const categoryMetadata = {
            'people_processes': {
                title: 'People & Processes',
                icon: 'fas fa-users',
                class: 'people-processes'
            },
            'platform_partnerships': {
                title: 'Platform & Partnerships',
                icon: 'fas fa-handshake',
                class: 'platform-partnerships'
            },
            'policies_practices': {
                title: 'Policies & Practices',
                icon: 'fas fa-shield-alt',
                class: 'policies-practices'
            }
        };

        // Create matrix structure
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
                        <div class="choice-icon">
                            <i class="fas fa-cog"></i>
                                    </div>
                        <div class="choice-title">${choice.title}</div>
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
                this.updateProgress(80, `Phase 3 completed - Score: ${mot3Score}/3`);
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
                this.showAlert('Erreur lors du chargement des choix Phase 4: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('Phase 4 loading error:', error);
            this.showAlert('Erreur lors du chargement des choix', 'danger');
        }
    }

    renderMOT4Choices(choices) {
        const container = document.getElementById('phase4-choices');
        container.innerHTML = '';

        // Define category colors and icons
        const categoryStyles = {
            'platform_partnerships': {
                color: '#8b5cf6', // Purple
                icon: 'fas fa-handshake'
            },
            'policies_practices': {
                color: '#06b6d4', // Blue
                icon: 'fas fa-shield-alt'
            },
            'people_processes': {
                color: '#f59e0b', // Yellow
                icon: 'fas fa-users'
            }
        };

        // Create 3x3 matrix directly (no grouping by category)
        choices.forEach(choice => {
            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'matrix-choice';
            choiceDiv.dataset.choiceId = choice.id;
            choiceDiv.dataset.cost = choice.cost;
            choiceDiv.onclick = () => gameController.selectMOT4Choice(choice.id, choice.cost);
            
            const style = categoryStyles[choice.category] || { color: '#6b7280', icon: 'fas fa-cog' };
            
            choiceDiv.innerHTML = `
                <div class="choice-icon" style="color: ${style.color};">
                    <i class="${style.icon}"></i>
                        </div>
                <div class="choice-title">${choice.title}</div>
                <div class="choice-description">${choice.description}</div>
                <div class="choice-cost">${choice.cost}</div>
            `;
            container.appendChild(choiceDiv);
        });

        // Initialize budget tracking
        this.initializePhase4Budget();
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
            statusBadge.textContent = `${30 - this.budget} points needed`;
        } else if (this.budget === 30) {
            statusBadge.classList.add('badge-success');
            statusBadge.textContent = 'Perfect budget!';
        } else {
            statusBadge.classList.add('badge-danger');
            statusBadge.textContent = `${this.budget - 30} points over`;
        }
        
        // Enable/disable confirm button
        if (this.budget === 30) {
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
        console.log('=== MOT4 CONFIRM CALLED ===');
        console.log('MOT4 confirm called with choices:', this.selectedChoices.mot4);
        console.log('MOT4 budget:', this.budget);
        console.log('Full selectedChoices object:', this.selectedChoices);
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

            if (data.success) {
                const mot4Score = data.score.scores.mot4;
                this.updateScoreDisplay(data.score);
                this.showScoreScreen(4, mot4Score, data.score);
                this.updateProgress(90, `Phase 4 completed - Score: ${mot4Score}/3`);
            } else {
                this.showAlert(data.message, 'danger');
            }
        } catch (error) {
            console.error('MOT4 confirmation error:', error);
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

        // Define choice details based on the scripts
        const choiceDetails = {
            'genai_for_all': {
                options: [
                    { icon: 'fas fa-rocket', label: 'Rapid deployment', class: 'deployment' },
                    { icon: 'fas fa-bullhorn', label: 'Clear communication', class: 'communication' }
                ],
                description: 'GenAI initiative as a service, Corporate communication of HR AI ethics policies. Rapid deployment, clear communication. But lack of structure, little skill development.'
            },
            'capability_building': {
                options: [
                    { icon: 'fas fa-cogs', label: 'Solid structure', class: 'structure' },
                    { icon: 'fas fa-shield-alt', label: 'Clear governance', class: 'governance' },
                    { icon: 'fas fa-graduation-cap', label: 'Training focus', class: 'training' }
                ],
                description: 'Definition of long-term HR AI ethics roadmap, Value-based AI governance, Preferred supplier panel, creation of HR AI training Academy. Solid structure, clear governance, training. But less focus on people, more technical approach.'
            },
            'people_speed': {
                options: [
                    { icon: 'fas fa-users', label: 'Focus on skills', class: 'skills' },
                    { icon: 'fas fa-user-plus', label: 'Talent recruitment', class: 'recruitment' },
                    { icon: 'fas fa-sync', label: 'Continuous training', class: 'training' }
                ],
                description: 'New GenAI HR Hub, Preferred supplier panel, Investment in recruiting top AI talents and retaining analytics expertise, Creation of HR AI training Academy. Focus on skills, talent recruitment, continuous training. But higher initial investment.'
            }
        };

        choices.forEach((choice, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-choice';
            accordionItem.dataset.choiceId = choice.id;
            
            const details = choiceDetails[choice.id] || { options: [], description: choice.description };
            
            accordionItem.innerHTML = `
                <div class="accordion-header" onclick="gameController.toggleAccordion('${choice.id}')">
                    <h4 class="accordion-title">${choice.title}</h4>
                    <i class="fas fa-chevron-down accordion-arrow"></i>
                        </div>
                <div class="accordion-content">
                    <div class="accordion-details">
                        <div class="choice-options">
                            ${details.options.map(option => `
                                <div class="choice-option">
                                    <div class="option-icon ${option.class}">
                                        <i class="${option.icon}"></i>
                                    </div>
                                    <div class="option-label">${option.label}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="choice-description">
                            ${details.description}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(accordionItem);
        });

        // Initialize accordion functionality for Phase 5
        this.initializePhase5Accordion();
    }

    initializePhase5Accordion() {
        // Add click handlers for selection
        document.querySelectorAll('.accordion-choice').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.accordion-header')) {
                    this.selectMOT5Choice(item.dataset.choiceId);
                }
            });
        });
    }

    async selectMOT5Choice(choiceId) {
        console.log('Phase 5 choice selected:', choiceId);
        
        // Update visual selection
        document.querySelectorAll('.accordion-choice').forEach(item => {
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
                
                // Phase 5 goes directly to final results
                this.showResults(data.results);
                this.updateProgress(100, 'Game completed!');
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

    showScoreScreen(motNumber, score, scoreData) {
        // Store current Phase number for Next button
        this.currentPhaseNumber = motNumber;
        
        // Version 1.4: Hide score display card and total score in header
        document.getElementById('score-display-card').style.display = 'none';
        document.querySelector('.score-display-container').style.display = 'none';
        
        // Update score display
        this.updateScoreDisplay(scoreData);
        
        // Set MOT title
        const motTitles = {
            1: 'Embedding GenAI in your AI transformation program',
            2: 'Building the right foundation',
            3: 'Scaling across the organization',
            4: 'Ensuring sustainable success',
            5: 'Accelerating the transformation'
        };
        
        document.getElementById('current-mot-title').textContent = motTitles[motNumber];
        
        // Generate stars
        const starsContainer = document.getElementById('score-stars-container');
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const star = document.createElement('span');
            star.className = 'score-star';
            star.textContent = i <= score ? '★' : '☆';
            starsContainer.appendChild(star);
        }
        
        // Set description
        const descriptions = {
            1: score === 3 ? 'Excellent! You chose the optimal approach for embedding GenAI.' : 
               score === 2 ? 'Good choice! You\'re on the right track.' : 
               'Consider reviewing your approach for better results.',
            2: score === 3 ? 'Perfect! You selected the ideal foundation solutions.' : 
               score === 2 ? 'Good foundation! You made solid choices.' : 
               'Your foundation could be stronger.',
            3: score === 3 ? 'Outstanding! You\'ve mastered organizational scaling.' : 
               score === 2 ? 'Well done! Good scaling strategy.' : 
               'Consider improving your scaling approach.',
            4: score === 3 ? 'Excellent! You\'ve ensured sustainable success.' : 
               score === 2 ? 'Good sustainability planning!' : 
               'Your sustainability strategy needs work.',
            5: score === 3 ? 'Perfect! You\'ve accelerated the transformation.' : 
               score === 2 ? 'Good acceleration strategy!' : 
               'Consider optimizing your acceleration approach.'
        };
        
        document.getElementById('score-description').textContent = descriptions[motNumber];
        
        // Update MOT squares
        this.updatePhaseSquares(scoreData);
        
        // Update total badge
        this.updateTotalBadge(scoreData);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('scoreModal'));
        modal.show();
        
        // Version 1.4: Keep the original behavior - user clicks NEXT button
        // The global score recap will be shown after the user clicks NEXT
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

    showGlobalScoreRecap(phaseNumber, scoreData) {
        // Create global score recap modal if it doesn't exist
        if (!document.getElementById('globalScoreRecapModal')) {
            this.createGlobalScoreRecapModal();
        }
        
        // Update the content
        this.updateGlobalScoreRecapContent(phaseNumber, scoreData);
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('globalScoreRecapModal'));
        modal.show();
        
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
                                <!-- Global Score Display - Smaller -->
                                <div class="global-score-display mb-4">
                                    <div class="global-score-badge" style="background: linear-gradient(135deg, #ffffff, #f8fafc); color: #1e40af; padding: 2rem; border-radius: 15px; box-shadow: 0 0 20px rgba(30, 64, 175, 0.3); border: 2px solid #60a5fa; min-height: 200px; display: flex; flex-direction: column; justify-content: center;">
                                        <h1 class="display-1 mb-2" id="global-score-total" style="font-weight: 800; font-size: 60pt; line-height: 1; overflow: visible;">0</h1>
                                        <p class="lead mb-0" style="font-size: 20pt; text-transform: uppercase;">Score Global</p>
                                    </div>
                                </div>
                                
                                <!-- Score Breakdown - Smaller -->
                                <div class="score-breakdown mb-4">
                                    <h5 class="mb-3" style="color: #ffffff; font-size: 20pt; text-transform: uppercase; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);">Detail by Phase</h5>
                                    <div class="row justify-content-center" id="global-score-breakdown">
                                        <!-- Score breakdown will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Progress Bar -->
                                <div class="progress-info mb-5">
                                    <div class="progress" style="height: 30px; background: rgba(8, 239, 255, 0.2); border-radius: 15px;">
                                        <div class="progress-bar" id="global-progress-bar" role="progressbar" style="width: 0%; background: linear-gradient(90deg, #08efff, #00b3bc); border-radius: 15px;"></div>
                                    </div>
                                    <div class="mt-3" id="global-progress-text" style="color: #08efff; font-size: 20pt;">Progress: 0/15</div>
                                </div>
                                
                                <!-- MOT Status Squares -->
                                <div class="mot-status mb-5">
                                    <h6 class="mb-4" style="color: #08efff; font-size: 25pt; text-transform: uppercase;">Phase Status</h6>
                                    <div class="mot-status-squares" id="global-mot-squares" style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                                        <!-- MOT status squares will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Continue Button -->
                                <div class="continue-section">
                                    <button id="global-continue-btn" class="NeonButton" style="border: 6px solid #08efff; border-radius: 20px; color: #08efff; background: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 25pt; padding: 25px 50px; text-transform: uppercase; filter: drop-shadow(0 0 5px #08EFFF); transition: all 0.3s ease;">
                                        Continuer
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
    }

    updateGlobalScoreRecapContent(phaseNumber, scoreData) {
        console.log('=== updateGlobalScoreRecapContent called ===');
        console.log('phaseNumber:', phaseNumber);
        console.log('scoreData:', scoreData);
        
        // Update global score total
        const totalElement = document.getElementById('global-score-total');
        console.log('global-score-total element:', totalElement);
        if (totalElement) {
            totalElement.textContent = scoreData.total;
            console.log('Updated global score total to:', scoreData.total);
        } else {
            console.error('global-score-total element not found!');
        }
        
        // Update progress bar
        const progressPercentage = (scoreData.total / 15) * 100;
        document.getElementById('global-progress-bar').style.width = `${progressPercentage}%`;
        document.getElementById('global-progress-text').textContent = `Progress: ${scoreData.total}/15`;
        
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
                    <div style="color: #ffffff; font-size: 18pt; font-weight: bold; text-transform: uppercase;">Phase ${phaseNum}: ${score}/3</div>
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
            
            square.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2rem;">${i}</div>
                <div style="font-size: 0.8rem; margin-top: 0.1rem;">${'★'.repeat(score)}${'☆'.repeat(3 - score)}</div>
            `;
            squaresContainer.appendChild(square);
        }
    }


    hideScoreScreen() {
        // Hide score display card
        document.getElementById('score-display-card').style.display = 'none';
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
        const modal = bootstrap.Modal.getInstance(document.getElementById('scoreModal'));
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
        
        // Version 1.4: Show global score recap before proceeding to next MOT
        // Get score data from the current score display elements
        const currentScore = this.getCurrentScoreData();
        console.log('Current score data:', currentScore);
        console.log('About to show global score recap for MOT:', currentMOT);
        this.showGlobalScoreRecap(currentMOT, currentScore);
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
                console.log('Starting Phase4 game...');
                this.currentPhaseNumber = 4;
                this.startPhase4Game();
                break;
            case 4:
                console.log('Showing Phase5-1 video...');
                this.currentPhaseNumber = 5;
                this.showPhase5_1Video();
                break;
            case 5:
                console.log('Showing Recap video...');
                this.showRecapVideo();
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
        // Format the score data for the results screen
        const results = {
            total: scoreData.total,
            stars: this.calculateStars(scoreData.total),
            scores: scoreData.scores
        };
        
        this.showResults(results);
    }

    calculateStars(totalScore) {
        if (totalScore >= 15) return 3;
        if (totalScore >= 10) return 2;
        return 1;
    }

    showResults(results) {
        const container = document.getElementById('results-content');
        container.innerHTML = `
            <div class="text-center">
                <h2 class="mb-4">🎉 Félicitations !</h2>
                
                <!-- Recap Video Section -->
                <div class="mb-4">
                    <h4 class="mb-3"><i class="fas fa-video me-2"></i>Game Recap</h4>
                    <div class="video-container mb-4">
                        <div class="embed-responsive embed-responsive-16by9">
                            <video 
                                id="recap-video-results"
                                class="embed-responsive-item" 
                                controls
                                autoplay
                                playsinline
                                style="width: 100%; height: 100%; border-radius: 15px;">
                                <source src="/static/videos/recap_web.mp4" type="video/mp4">
                                Votre navigateur ne supporte pas la lecture vidéo.
                            </video>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h4>Score Final</h4>
                        <div class="display-4 text-primary">${results.total}/15</div>
                        <div class="h3">
                            ${'★'.repeat(results.stars)}${'☆'.repeat(3 - results.stars)}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4>Detail by Phase</h4>
                        <div class="text-start">
                            <div class="mb-2">Embedding GenAI in your AI transformation program: <span class="score-badge">${results.scores.mot1}/3</span></div>
                            <div class="mb-2">Building the right foundation: <span class="score-badge">${results.scores.mot2}/3</span></div>
                            <div class="mb-2">Scaling across the organization: <span class="score-badge">${results.scores.mot3}/3</span></div>
                            <div class="mb-2">Ensuring sustainable success: <span class="score-badge">${results.scores.mot4}/3</span></div>
                            <div class="mb-2">Accelerating the transformation: <span class="score-badge">${results.scores.mot5}/3</span></div>
                        </div>
                    </div>
                </div>
                <div class="alert alert-info">
                    <h5>Votre Performance</h5>
                    <p>${this.getPerformanceMessage(results.stars)}</p>
                </div>
            </div>
        `;
        
        this.showSection('results-section');
        
        // Initialize Recap video after the content is loaded
        setTimeout(() => {
            this.initializeRecapVideoResults();
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
        
        this.currentState = 'login';
        this.selectedChoices = {
            mot1: null,
            mot2: [],
            mot3: {},
            mot4: [],
            mot5: null
        };
        this.budget = 0;
        
        // Reset UI
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('progress-card').style.display = 'none';
        
        // Reset form
        document.getElementById('username').value = '';
        
        this.updateProgress(0, 'Ready to start again');
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
        
        // Quand la vidéo se termine, afficher le bouton "Démarrer le Jeu"
        harnessingVideoElement.addEventListener('ended', function() {
            document.getElementById('skip-harnessing-btn').style.display = 'none';
            document.getElementById('start-game-after-harnessing-btn').style.display = 'inline-block';
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
    const introVideoElement = document.getElementById('intro-video');
    if (introVideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        introVideoElement.play().catch(function(error) {
            console.log('Intro video autoplay failed:', error);
        });
        
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
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        mot1VideoElement.play().catch(function(error) {
            console.log('MOT1 video autoplay failed:', error);
        });
    }
}

function initializePhase2Video() {
    const phase2VideoElement = document.getElementById('phase2-video');
    if (phase2VideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        phase2VideoElement.play().catch(function(error) {
            console.log('Phase2 video autoplay failed:', error);
        });
    }
}

function initializePhase3Video() {
    const phase3VideoElement = document.getElementById('phase3-video');
    if (phase3VideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        phase3VideoElement.play().catch(function(error) {
            console.log('Phase3 video autoplay failed:', error);
        });
    }
}

function initializePhase4Video() {
    const phase4VideoElement = document.getElementById('phase4-video');
    if (phase4VideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        phase4VideoElement.play().catch(function(error) {
            console.log('Phase4 video autoplay failed:', error);
        });
    }
}

function initializePhase5_1Video() {
    const phase5_1VideoElement = document.getElementById('phase5-1-video');
    if (phase5_1VideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        phase5_1VideoElement.play().catch(function(error) {
            console.log('Phase5-1 video autoplay failed:', error);
        });
    }
}

function initializePhase5_2Video() {
    const phase5_2VideoElement = document.getElementById('phase5-2-video');
    if (phase5_2VideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        phase5_2VideoElement.play().catch(function(error) {
            console.log('Phase5-2 video autoplay failed:', error);
        });
    }
}

function initializeRecapVideo() {
    const recapVideoElement = document.getElementById('recap-video');
    if (recapVideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        recapVideoElement.play().catch(function(error) {
            console.log('Recap video autoplay failed:', error);
        });
    }
}

function initializeRecapVideoResults() {
    const recapVideoElement = document.getElementById('recap-video-results');
    if (recapVideoElement) {
        // Arrêter toutes les autres vidéos avant de démarrer celle-ci
        if (window.gameController) {
            window.gameController.stopAllVideos();
        }
        
        // Démarrer la vidéo automatiquement
        recapVideoElement.play().catch(function(error) {
            console.log('Recap video results autoplay failed:', error);
        });
    }
}

// Initialize game controller
const gameController = new GameController();
window.gameController = gameController;

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
