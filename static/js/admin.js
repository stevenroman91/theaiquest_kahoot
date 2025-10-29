// Admin panel for creating game sessions (Kahoot mode)

class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is admin (vérifié côté serveur mais on peut vérifier ici aussi)
        this.checkAdminStatus();
        this.setupEventListeners();
    }

    async checkAdminStatus() {
        try {
            // Le panneau admin est affiché/caché côté serveur via le template
            // On peut ajouter une vérification supplémentaire ici si nécessaire
            const adminSection = document.getElementById('admin-section');
            if (adminSection && adminSection.style.display === 'none') {
                // Si caché par défaut, on ne force pas l'affichage
                return;
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

    setupEventListeners() {
        // Bouton pour créer une session
        const createBtn = document.getElementById('create-session-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.createSession());
        }

        // Boutons pour copier le code et l'URL
        const copyCodeBtn = document.getElementById('copy-code-btn');
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', () => this.copyToClipboard('session-code-display', 'Code copié !'));
        }

        const copyUrlBtn = document.getElementById('copy-url-btn');
        if (copyUrlBtn) {
            copyUrlBtn.addEventListener('click', () => this.copyToClipboard('session-url-display', 'URL copiée !'));
        }
    }

    async createSession() {
        const createBtn = document.getElementById('create-session-btn');
        const resultDiv = document.getElementById('session-result');
        const codeDisplay = document.getElementById('session-code-display');
        const urlDisplay = document.getElementById('session-url-display');
        const qrcodeContainer = document.getElementById('qrcode-container');

        // Désactiver le bouton pendant la création
        createBtn.disabled = true;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Création en cours...';

        try {
            const response = await fetch('/api/admin/create_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Afficher le résultat
                const sessionCode = data.session_code;
                const joinUrl = data.join_url;

                codeDisplay.value = sessionCode;
                urlDisplay.value = joinUrl;

                // Générer le QR code
                qrcodeContainer.innerHTML = '';
                QRCode.toCanvas(qrcodeContainer, joinUrl, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: '#1e40af',  // FDJ blue
                        light: '#ffffff'
                    }
                }, (error) => {
                    if (error) {
                        console.error('Error generating QR code:', error);
                        qrcodeContainer.innerHTML = '<p class="text-danger">Erreur lors de la génération du QR code</p>';
                    }
                });

                // Afficher la section résultat
                resultDiv.style.display = 'block';
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Réinitialiser le bouton
                createBtn.disabled = false;
                createBtn.innerHTML = '<i class="fas fa-play me-2"></i>Lancer une nouvelle session';
            } else {
                alert('Erreur lors de la création de la session: ' + (data.message || 'Erreur inconnue'));
                createBtn.disabled = false;
                createBtn.innerHTML = '<i class="fas fa-play me-2"></i>Lancer une nouvelle session';
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Erreur de connexion au serveur');
            createBtn.disabled = false;
            createBtn.innerHTML = '<i class="fas fa-play me-2"></i>Lancer une nouvelle session';
        }
    }

    copyToClipboard(elementId, successMessage) {
        const element = document.getElementById(elementId);
        if (element) {
            element.select();
            element.setSelectionRange(0, 99999); // Pour mobile

            try {
                document.execCommand('copy');
                
                // Afficher un message de succès temporaire
                const btn = event.target.closest('button');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check me-2"></i>Copié !';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-secondary');
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-secondary');
                }, 2000);
            } catch (err) {
                console.error('Error copying to clipboard:', err);
                alert('Impossible de copier. Veuillez le faire manuellement.');
            }
        }
    }
}

// Initialiser le panneau admin quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminPanel = new AdminPanel();
    });
} else {
    window.adminPanel = new AdminPanel();
}

// Export pour accès global
window.AdminPanel = AdminPanel;

