/**
 * AI Acceleration EXEC - Game Controller
 * Optimized version with clean architecture and senior-level code practices
 */

class GameController {
    constructor() {
        this.state = {
            current: 'login',
            phaseNumber: 1,
            budget: 0,
            maxBudget: 30,
            selectedChoices: {
                mot1: null,
                mot2: [],
                mot3: {},
                mot4: [],
                mot5: null
            }
        };
        
        this.config = {
            phases: {
                1: { name: 'Phase 1', maxScore: 3 },
                2: { name: 'Phase 2', maxScore: 3 },
                3: { name: 'Phase 3', maxScore: 3 },
                4: { name: 'Phase 4', maxScore: 3 },
                5: { name: 'Phase 5', maxScore: 3 }
            },
            totalMaxScore: 15
        };
        
        this.init();
    }

    /**
     * Initialize the game controller
     */
    init() {
        this.setupEventListeners();
        this.setupVideoHandlers();
        this.setupFormValidation();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Authentication
        this.addEventListener('login-form', 'submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        this.addEventListener('register-form', 'submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Navigation
        this.addEventListener('show-register-form', 'click', () => this.showRegisterForm());
        this.addEventListener('show-login-form', 'click', () => this.showLoginForm());

        // Phase confirmations
        this.addEventListener('phase1-confirm-btn', 'click', () => this.confirmPhase1Choice());
        this.addEventListener('phase2-confirm-btn', 'click', () => this.confirmPhase2Choices());
        this.addEventListener('phase3-confirm-btn', 'click', () => this.confirmPhase3Choices());
        this.addEventListener('phase4-confirm-btn', 'click', () => this.confirmPhase4Choices());
        this.addEventListener('phase5-confirm-btn', 'click', () => this.confirmPhase5Choice());

        // Video controls
        this.addEventListener('skip-video-btn', 'click', () => this.skipVideo());
        this.addEventListener('start-game-btn', 'click', () => this.startGame());
        this.addEventListener('global-continue-btn', 'click', () => this.proceedToNextPhase());
    }

    /**
     * Setup video event handlers
     */
    setupVideoHandlers() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('ended', () => this.handleVideoEnded(video));
            video.addEventListener('error', (e) => this.handleVideoError(e));
        });
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        this.addEventListener('username', 'input', () => this.validateUsername());
        this.addEventListener('password', 'input', () => this.validatePassword());
        this.addEventListener('email', 'input', () => this.validateEmail());
    }

    /**
     * Generic event listener helper
     */
    addEventListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element with id '${elementId}' not found`);
        }
    }

    /**
     * Authentication handlers
     */
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!this.validateCredentials(username, password)) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.startGame();
            } else {
                this.showAlert(response.message || 'Login failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Login error: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister() {
        const formData = this.getFormData('register-form');
        
        if (!this.validateRegistration(formData)) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.success) {
                this.showAlert('Registration successful! Please login.', 'success');
                this.showLoginForm();
            } else {
                this.showAlert(response.message || 'Registration failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Registration error: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Form validation methods
     */
    validateCredentials(username, password) {
        if (!username || username.length < 3) {
            this.showAlert('Username must be at least 3 characters', 'danger');
            return false;
        }
        if (!password || password.length < 6) {
            this.showAlert('Password must be at least 6 characters', 'danger');
            return false;
        }
        return true;
    }

    validateRegistration(data) {
        const { username, email, password, confirmPassword } = data;
        
        if (!this.validateCredentials(username, password)) {
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showAlert('Please enter a valid email address', 'danger');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return false;
        }
        
        return true;
    }

    validateUsername() {
        const username = document.getElementById('username').value;
        const isValid = username.length >= 3;
        this.updateFieldValidation('username', isValid);
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const isValid = password.length >= 6;
        this.updateFieldValidation('password', isValid);
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        const isValid = this.isValidEmail(email);
        this.updateFieldValidation('email', isValid);
    }

    /**
     * Game flow methods
     */
    startGame() {
        this.showSection('intro-video-section');
        this.updateProgress(5, 'Introduction');
        this.playVideo('intro-video');
    }

    async proceedToNextPhase() {
        const currentPhase = this.state.phaseNumber;
        
        switch (currentPhase) {
            case 1:
                await this.showPhase1Video();
                break;
            case 2:
                await this.showPhase2Video();
                break;
            case 3:
                await this.showPhase3Video();
                break;
            case 4:
                await this.showPhase4Video();
                break;
            case 5:
                await this.showPhase5Video();
                break;
            default:
                this.showResults();
        }
    }

    /**
     * Phase-specific methods
     */
    async showPhase1Video() {
        this.stopAllVideos();
        this.hideAllSections();
        this.showSection('phase1-video-section');
        this.updateProgress(20, 'Phase 1 - AI Transformation Approach');
        this.playVideo('phase1-video');
    }

    async showPhase2Video() {
        this.stopAllVideos();
        this.hideAllSections();
        this.showSection('phase2-video-section');
        this.updateProgress(40, 'Phase 2 - Portfolio Prioritization');
        this.playVideo('phase2-video');
    }

    async showPhase3Video() {
        this.stopAllVideos();
        this.hideAllSections();
        this.showSection('phase3-video-section');
        this.updateProgress(60, 'Phase 3 - Facilitator Selection');
        this.playVideo('phase3-video');
    }

    async showPhase4Video() {
        this.stopAllVideos();
        this.hideAllSections();
        this.showSection('phase4-video-section');
        this.updateProgress(80, 'Phase 4 - Scaling Solutions');
        this.playVideo('phase4-video');
    }

    async showPhase5Video() {
        this.stopAllVections();
        this.hideAllSections();
        this.showSection('phase5-video-section');
        this.updateProgress(90, 'Phase 5 - Deployment Strategy');
        this.playVideo('phase5-video');
    }

    /**
     * Phase confirmation methods
     */
    async confirmPhase1Choice() {
        const selectedChoice = this.state.selectedChoices.mot1;
        if (!selectedChoice) {
            this.showAlert('Please select an approach', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/phase1/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ choice_id: selectedChoice })
            });

            if (response.success) {
                this.showScoreScreen(1, response.score.scores.mot1, response.score);
                this.state.phaseNumber = 2;
            } else {
                this.showAlert(response.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error confirming choice: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async confirmPhase2Choices() {
        const selectedChoices = this.state.selectedChoices.mot2;
        if (selectedChoices.length !== 3) {
            this.showAlert('Please select exactly 3 solutions', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/phase2/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solution_ids: selectedChoices })
            });

            if (response.success) {
                this.showScoreScreen(2, response.score.scores.mot2, response.score);
                this.state.phaseNumber = 3;
            } else {
                this.showAlert(response.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error confirming choices: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async confirmPhase3Choices() {
        const selectedChoices = this.state.selectedChoices.mot3;
        const requiredCategories = ['platform_partnerships', 'policies_practices', 'people_processes'];
        
        if (!requiredCategories.every(cat => selectedChoices[cat])) {
            this.showAlert('Please select one facilitator for each category', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/phase3/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ facilitator_ids: selectedChoices })
            });

            if (response.success) {
                this.showScoreScreen(3, response.score.scores.mot3, response.score);
                this.state.phaseNumber = 4;
            } else {
                this.showAlert(response.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error confirming choices: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async confirmPhase4Choices() {
        const selectedChoices = this.state.selectedChoices.mot4;
        if (selectedChoices.length === 0) {
            this.showAlert('Please select at least one enabler', 'warning');
            return;
        }

        if (this.state.budget > this.state.maxBudget) {
            this.showAlert(`Budget exceeded! You have ${this.state.budget - this.state.maxBudget} points over`, 'danger');
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/phase4/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabler_ids: selectedChoices })
            });

            if (response.success) {
                this.showScoreScreen(4, response.score.scores.mot4, response.score);
                this.state.phaseNumber = 5;
            } else {
                this.showAlert(response.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error confirming choices: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async confirmPhase5Choice() {
        const selectedChoice = this.state.selectedChoices.mot5;
        if (!selectedChoice) {
            this.showAlert('Please select a deployment strategy', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await this.apiCall('/api/phase5/choose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ choice_id: selectedChoice })
            });

            if (response.success) {
                this.showScoreScreen(5, response.score.scores.mot5, response.score);
                this.state.phaseNumber = 6;
            } else {
                this.showAlert(response.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error confirming choice: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Video handling methods
     */
    playVideo(videoId) {
        const video = document.getElementById(videoId);
        if (video) {
            video.currentTime = 0;
            video.play().catch(error => {
                console.warn('Video autoplay failed:', error);
                this.showVideoControls(videoId);
            });
        }
    }

    stopAllVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }

    skipVideo() {
        this.stopAllVideos();
        this.proceedToNextPhase();
    }

    handleVideoEnded(video) {
        const videoId = video.id;
        const nextButton = document.getElementById('start-game-btn');
        
        if (nextButton) {
            nextButton.style.display = 'block';
        }
    }

    handleVideoError(error) {
        console.error('Video error:', error);
        this.showAlert('Video playback error. Please refresh the page.', 'danger');
    }

    /**
     * UI helper methods
     */
    showSection(sectionId) {
        this.hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    hideAllSections() {
        const sections = document.querySelectorAll('[id$="-section"]');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    showLoading(show) {
        const loader = document.getElementById('loading-spinner');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showAlert(message, type = 'info') {
        // Create or update alert element
        let alert = document.getElementById('game-alert');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'game-alert';
            alert.className = 'alert alert-dismissible fade show position-fixed';
            alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            document.body.appendChild(alert);
        }

        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
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

    /**
     * Utility methods
     */
    async apiCall(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'include',
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateFieldValidation(fieldId, isValid) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.toggle('is-valid', isValid);
            field.classList.toggle('is-invalid', !isValid);
        }
    }

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }

    /**
     * Score and results methods
     */
    showScoreScreen(phaseNumber, phaseScore, totalScore) {
        // Implementation for score screen
        console.log(`Phase ${phaseNumber} completed with score ${phaseScore}/3`);
        console.log('Total score:', totalScore);
        
        // Show global score recap
        this.showGlobalScoreRecap(phaseNumber, totalScore);
    }

    showGlobalScoreRecap(phaseNumber, scoreData) {
        // Create and show global score modal
        if (!document.getElementById('globalScoreRecapModal')) {
            this.createGlobalScoreRecapModal();
        }
        
        this.updateGlobalScoreRecapContent(phaseNumber, scoreData);
        
        const modal = new bootstrap.Modal(document.getElementById('globalScoreRecapModal'));
        modal.show();
    }

    createGlobalScoreRecapModal() {
        const modalHTML = `
            <div class="modal fade" id="globalScoreRecapModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); border: none;">
                        <div class="modal-body p-0" style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                            <div class="text-center" style="max-width: 1200px; width: 90%;">
                                <!-- Global Score Display -->
                                <div class="global-score-display mb-3">
                                    <div class="global-score-badge" style="background: linear-gradient(135deg, #ffffff, #f8fafc); color: #1e40af; padding: 1rem; border-radius: 10px; box-shadow: 0 0 15px rgba(30, 64, 175, 0.3); border: 2px solid #60a5fa; min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                                        <h1 class="display-1 mb-1" id="global-score-total" style="font-weight: 800; font-size: 2.5rem; line-height: 1; overflow: visible;">0</h1>
                                        <p class="lead mb-0" style="font-size: 1rem; text-transform: uppercase;">Score Global</p>
                                    </div>
                                </div>
                                
                                <!-- Score Breakdown -->
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
                                
                                <!-- Phase Status -->
                                <div class="mot-status mb-3">
                                    <h6 class="mb-2" style="color: #08efff; font-size: 1.1rem; text-transform: uppercase;">Phase Status</h6>
                                    <div class="mot-status-squares" id="global-mot-squares" style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                                        <!-- Phase status squares will be populated here -->
                                    </div>
                                </div>
                                
                                <!-- Continue Button -->
                                <div class="continue-section">
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
    }

    updateGlobalScoreRecapContent(phaseNumber, scoreData) {
        // Update global score total
        const totalElement = document.getElementById('global-score-total');
        if (totalElement) {
            totalElement.textContent = scoreData.total || 0;
        }

        // Update progress bar
        const progressBar = document.getElementById('global-progress-bar');
        const progressText = document.getElementById('global-progress-text');
        if (progressBar && progressText) {
            const percentage = ((scoreData.total || 0) / this.config.totalMaxScore) * 100;
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `Progress: ${scoreData.total || 0}/${this.config.totalMaxScore}`;
        }

        // Update phase squares
        this.updatePhaseSquares(scoreData);
    }

    updatePhaseSquares(scoreData) {
        const squaresContainer = document.getElementById('global-mot-squares');
        if (!squaresContainer) return;

        squaresContainer.innerHTML = '';

        for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
            const phaseKey = `mot${phaseNum}`;
            const score = scoreData.scores[phaseKey] || 0;
            const isCompleted = score > 0;
            const isCurrent = phaseNum === this.state.phaseNumber;

            const square = document.createElement('div');
            square.className = 'mot-square';
            square.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: ${isCompleted ? 'linear-gradient(135deg, #ffffff, #f8fafc)' : 'rgba(255, 255, 255, 0.2)'};
                border: 2px solid ${isCurrent ? '#f85e63' : '#8b71ff'};
                transition: all 0.3s ease;
                position: relative;
                color: ${isCompleted ? '#008dee' : '#ffffff'};
                box-shadow: ${isCompleted ? '0 0 20px rgba(0, 141, 238, 0.3)' : 'none'};
            `;

            square.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2rem;">${phaseNum}</div>
                <div style="font-size: 0.8rem;">${'★'.repeat(score)}${'☆'.repeat(3 - score)}</div>
            `;

            squaresContainer.appendChild(square);
        }
    }

    showResults() {
        // Implementation for final results screen
        console.log('Game completed!');
        this.showSection('results-section');
    }
}

// Initialize the game controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});
