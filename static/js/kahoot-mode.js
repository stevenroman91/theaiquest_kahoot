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
                
                // Hide login section
                const loginSection = document.getElementById('login-section');
                if (loginSection) loginSection.style.display = 'none';
                
                // Admin ne joue pas, il gère juste les sessions
                // Recharger la page pour voir le panneau admin
                if (data.user_info && data.user_info.role === 'admin') {
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
                
                // Wait a bit to ensure GameController is fully initialized
                const startStep1 = () => {
                    if (window.gameController) {
                        // Stop all videos first
                        if (window.gameController.stopAllVideos) {
                            window.gameController.stopAllVideos();
                        }
                        
                        // Call loadMOT1Choices directly to skip video and show Step 1
                        if (window.gameController.loadMOT1Choices) {
                            window.gameController.loadMOT1Choices();
                            console.log('✅ Loaded Step 1 directly (Kahoot mode)');
                        } else if (window.gameController.startMOT1Game) {
                            // Fallback to startMOT1Game if loadMOT1Choices doesn't exist
                            window.gameController.startMOT1Game();
                            console.log('✅ Started Step 1 via startMOT1Game (Kahoot mode)');
                        } else {
                            console.error('Cannot find method to start Step 1');
                            // Last resort: show phase1-section directly
                            const phase1Section = document.getElementById('phase1-section');
                            if (phase1Section) {
                                phase1Section.style.display = 'block';
                                console.log('✅ Showing Step 1 section directly');
                            }
                        }
                    } else {
                        console.error('GameController not found, retrying...');
                        setTimeout(startStep1, 200);
                    }
                };
                
                // Start after a short delay to ensure everything is initialized
                setTimeout(startStep1, 500);
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
                            if (window.gameController) {
                                // Small delay to ensure modal is closed
                                setTimeout(() => {
                                    // Call loadMOTXChoices directly to skip videos
                                    switch(nextStep) {
                                        case 2:
                                            // Go to Step 2
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
                                }, 200);
                            }
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

