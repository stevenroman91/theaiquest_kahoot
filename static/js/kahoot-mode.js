// Kahoot Mode - Simplified Game Flow
// This file adds Kahoot-specific features: simple login, direct step flow, leaderboard

class KahootMode {
    constructor() {
        this.isKahootMode = true;
        this.init();
    }

    init() {
        console.log('🎮 Kahoot Mode initialized');
        this.setupLoginToggle();
        this.setupLoginForm();
        this.setupLeaderboardButtons();
    }

    setupLoginToggle() {
        const toggleBtn = document.getElementById('toggle-password-mode');
        const passwordContainer = document.getElementById('password-container');
        
        if (toggleBtn && passwordContainer) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isVisible = passwordContainer.style.display !== 'none';
                passwordContainer.style.display = isVisible ? 'none' : 'block';
                toggleBtn.innerHTML = isVisible 
                    ? '<small><i class="fas fa-key me-1"></i>Need password? Click here</small>'
                    : '<small><i class="fas fa-user me-1"></i>Kahoot mode (no password)? Click here</small>';
            });
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleKahootLogin();
            });
        }
    }

    async handleKahootLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-submit-btn');
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtnLoading = document.getElementById('login-btn-loading');

        // Validation
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
                    username: username,
                    password: password || undefined // Only send if provided
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Login successful:', data);
                
                // Store username
                if (data.user_info && data.user_info.username) {
                    this.setCurrentUsername(data.user_info.username);
                }
                
                // Hide login section and all intro sections
                document.getElementById('login-section').style.display = 'none';
                
                // Hide all video/intro sections in Kahoot mode and prevent video loading
                const sectionsToHide = [
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
                sectionsToHide.forEach(sectionId => {
                    const el = document.getElementById(sectionId);
                    if (el) {
                        el.style.display = 'none';
                        // Remove video sources to prevent loading
                        const videos = el.querySelectorAll('video');
                        videos.forEach(video => {
                            // Remove all source elements
                            const sources = video.querySelectorAll('source');
                            sources.forEach(source => source.remove());
                            // Clear src and reset
                            video.removeAttribute('src');
                            video.load();
                        });
                    }
                });
                
                // Also disable all remaining video elements on the page
                document.querySelectorAll('video').forEach(video => {
                    const sources = video.querySelectorAll('source');
                    sources.forEach(source => source.remove());
                    video.removeAttribute('src');
                    video.load();
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
                            
                            // Determine which step was just completed from gameController
                            let currentStep = window.gameController?.currentPhaseNumber || 1;
                            
                            // Alternative: check current_path if currentPhaseNumber not set
                            if (!currentStep && currentPath) {
                                if (currentPath.mot5_choice) {
                                    currentStep = 5;
                                } else if (currentPath.mot4_choices && currentPath.mot4_choices.length > 0) {
                                    currentStep = 4;
                                } else if (currentPath.mot3_choices && Object.keys(currentPath.mot3_choices).length > 0) {
                                    currentStep = 3;
                                } else if (currentPath.mot2_choices && currentPath.mot2_choices.length > 0) {
                                    currentStep = 2;
                                } else if (currentPath.mot1_choice) {
                                    currentStep = 1;
                                }
                            }
                            
                            console.log(`🎮 Kahoot mode: Proceeding from Step ${currentStep} to Step ${currentStep + 1}`);
                            
                            // Go directly to next step (skip videos and dashboard)
                            if (window.gameController) {
                                // Small delay to ensure modal is closed
                                setTimeout(() => {
                                    switch(currentStep) {
                                        case 1:
                                            // Step 1 → Step 2 (skip video)
                                            if (window.gameController.startPhase2Game) {
                                                window.gameController.startPhase2Game();
                                            } else if (window.gameController.loadMOT2Choices) {
                                                window.gameController.loadMOT2Choices();
                                            }
                                            break;
                                        case 2:
                                            // Step 2 → Step 3 (skip video)
                                            if (window.gameController.startPhase3Game) {
                                                window.gameController.startPhase3Game();
                                            } else if (window.gameController.loadMOT3Choices) {
                                                window.gameController.loadMOT3Choices();
                                            }
                                            break;
                                        case 3:
                                            // Step 3 → Step 4 (skip video)
                                            if (window.gameController.startPhase4Game) {
                                                window.gameController.startPhase4Game();
                                            } else if (window.gameController.loadMOT4Choices) {
                                                window.gameController.loadMOT4Choices();
                                            }
                                            break;
                                        case 4:
                                            // Step 4 → Step 5 (skip video)
                                            if (window.gameController.startPhase5Game) {
                                                window.gameController.startPhase5Game();
                                            } else if (window.gameController.loadMOT5Choices) {
                                                window.gameController.loadMOT5Choices();
                                            }
                                            break;
                                        default:
                                            console.error('Unknown step number:', currentStep);
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

// Prevent video loading in Kahoot mode
function preventVideoLoading() {
    // Remove video sources immediately to prevent browser preloading
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
            // Store original src in data attribute but remove from DOM
            if (source.src && !source.dataset.originalSrc) {
                source.dataset.originalSrc = source.src;
            }
            source.removeAttribute('src');
        });
        video.removeAttribute('src');
        video.load(); // Reset video element
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        preventVideoLoading(); // Prevent videos from loading immediately
        window.kahootMode = new KahootMode();
        hookScoreModal();
    });
} else {
    preventVideoLoading(); // Prevent videos from loading immediately
    window.kahootMode = new KahootMode();
    hookScoreModal();
}

// Export for global access
window.KahootMode = KahootMode;

