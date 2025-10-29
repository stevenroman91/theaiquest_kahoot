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
            // Vérifier si l'utilisateur est admin en vérifiant la session
            // On affiche le panneau si l'utilisateur est déjà connecté en admin
            const adminSection = document.getElementById('admin-section');
            const loginSection = document.getElementById('login-section');
            
            if (!adminSection || !loginSection) return;
            
            // Vérifier côté serveur si l'utilisateur est admin
            try {
                const response = await fetch('/api/game_config');
                const data = await response.json();
                
                // Si on peut récupérer la config sans erreur, on vérifie la session côté client
                // La vraie vérification se fait via la présence de la section admin dans le DOM
                // On va plutôt utiliser un cookie ou vérifier si le panneau admin existe
            } catch (e) {
                // Ignore
            }
            
            // Si l'admin section est cachée mais qu'on veut l'afficher après login,
            // on la laisse cachée pour le moment et on attend que kahoot-mode.js la révèle
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

            // Vérifier le status HTTP avant de parser le JSON
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Erreur de connexion au serveur';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = `Erreur ${response.status}: ${errorText || errorMessage}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                // Afficher le résultat
                const sessionCode = data.session_code;
                const joinUrl = data.join_url;

                codeDisplay.value = sessionCode;
                urlDisplay.value = joinUrl;

                // Générer le QR code avec attente de la bibliothèque si nécessaire
                qrcodeContainer.innerHTML = '<p class="text-info"><i class="fas fa-spinner fa-spin me-2"></i>Génération du QR code...</p>';
                
                // Fonction pour générer le QR code une fois la bibliothèque disponible
                const generateQRCode = (retryCount = 0) => {
                    const maxRetries = 100; // 10 secondes max (100 * 100ms)
                    
                    // Vérifier si la bibliothèque est chargée (vérifier à la fois le flag et l'objet global)
                    const isLibraryLoaded = (typeof QRCode !== 'undefined') || (window.qrcodeLibraryLoaded === true);
                    
                    if (!isLibraryLoaded) {
                        if (retryCount < maxRetries) {
                            if (retryCount % 10 === 0) { // Log tous les 10 essais pour éviter trop de logs
                                console.log(`QRCode library not yet loaded, retrying... (${retryCount + 1}/${maxRetries})`);
                            }
                            setTimeout(() => generateQRCode(retryCount + 1), 100);
                            return;
                        } else {
                            console.error('QRCode library failed to load after retries');
                            qrcodeContainer.innerHTML = '<p class="text-danger">Bibliothèque QR Code non chargée. Veuillez vérifier votre connexion et rafraîchir la page.<br><small>Vous pouvez toujours utiliser l\'URL pour partager la session.</small></p>';
                            return;
                        }
                    }
                    
                    console.log('✅ QRCode library loaded, generating QR code...');
                    qrcodeContainer.innerHTML = '';
                    
                    try {
                        // Utiliser toDataURL (méthode la plus fiable)
                        QRCode.toDataURL(joinUrl, {
                            width: 256,
                            margin: 2,
                            color: {
                                dark: '#1e40af',  // FDJ blue
                                light: '#ffffff'
                            },
                            errorCorrectionLevel: 'M'
                        }, (error, url) => {
                            if (error) {
                                console.error('Error generating QR code with toDataURL:', error);
                                // Fallback: essayer toCanvas
                                try {
                                    const canvas = document.createElement('canvas');
                                    qrcodeContainer.innerHTML = '';
                                    qrcodeContainer.appendChild(canvas);
                                    QRCode.toCanvas(canvas, joinUrl, {
                                        width: 256,
                                        margin: 2,
                                        color: {
                                            dark: '#1e40af',
                                            light: '#ffffff'
                                        },
                                        errorCorrectionLevel: 'M'
                                    }, (canvasError) => {
                                        if (canvasError) {
                                            console.error('Canvas error:', canvasError);
                                            qrcodeContainer.innerHTML = '<p class="text-danger">Erreur lors de la génération du QR code. Veuillez utiliser l\'URL manuellement.</p>';
                                        } else {
                                            console.log('✅ QR code generated successfully with toCanvas');
                                        }
                                    });
                                } catch (e) {
                                    console.error('Fallback error:', e);
                                    qrcodeContainer.innerHTML = '<p class="text-danger">Erreur lors de la génération du QR code. Veuillez utiliser l\'URL manuellement.</p>';
                                }
                            } else {
                                // Afficher l'image du QR code
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = 'QR Code';
                                img.style.maxWidth = '256px';
                                img.style.height = 'auto';
                                img.style.border = '2px solid #e5e7eb';
                                img.style.borderRadius = '8px';
                                img.style.padding = '8px';
                                img.style.background = 'white';
                                qrcodeContainer.innerHTML = '';
                                qrcodeContainer.appendChild(img);
                                console.log('✅ QR code generated successfully with toDataURL');
                            }
                        });
                    } catch (e) {
                        console.error('Exception in QR code generation:', e);
                        qrcodeContainer.innerHTML = '<p class="text-danger">Erreur lors de la génération du QR code. Veuillez utiliser l\'URL manuellement.</p>';
                    }
                };
                
                // Démarrer la génération (avec retry si nécessaire)
                generateQRCode();

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
            const errorMessage = error.message || 'Erreur de connexion au serveur';
            alert(errorMessage);
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

