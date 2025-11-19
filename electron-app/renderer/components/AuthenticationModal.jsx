const { ipcRenderer } = require('electron');
const { useState, useEffect } = require('react');

/**
 * Modal d'authentification Claude Max
 * Gère le flow OAuth pour se connecter avec un compte Anthropic
 */
function AuthenticationModal({ isOpen, onClose, onSuccess }) {
    const [status, setStatus] = useState('idle'); // idle, authenticating, waiting, success, error
    const [authUrl, setAuthUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Écouter les événements d'authentification
        const handleAuthUrl = (event, url) => {
            setAuthUrl(url);
            setStatus('waiting');
        };

        const handleAuthSuccess = () => {
            setStatus('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        };

        const handleAuthError = (event, errorMessage) => {
            setError(errorMessage);
            setStatus('error');
        };

        ipcRenderer.on('auth-url', handleAuthUrl);
        ipcRenderer.on('auth-success', handleAuthSuccess);
        ipcRenderer.on('cli-error', handleAuthError);

        return () => {
            ipcRenderer.removeListener('auth-url', handleAuthUrl);
            ipcRenderer.removeListener('auth-success', handleAuthSuccess);
            ipcRenderer.removeListener('cli-error', handleAuthError);
        };
    }, [onSuccess, onClose]);

    const handleStartAuth = async () => {
        setStatus('authenticating');
        setError(null);

        try {
            const result = await ipcRenderer.invoke('start-auth');
            if (!result.success) {
                setError(result.error);
                setStatus('error');
            }
        } catch (err) {
            setError(err.message);
            setStatus('error');
        }
    };

    const handleOpenAuthUrl = async () => {
        if (authUrl) {
            try {
                await ipcRenderer.invoke('open-auth-url', authUrl);
            } catch (err) {
                setError('Erreur lors de l\'ouverture du navigateur');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content auth-modal">
                <div className="modal-header">
                    <h2>🔐 Authentification Claude Max</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {status === 'idle' && (
                        <div className="auth-start">
                            <div className="auth-icon">🤖</div>
                            <p className="auth-description">
                                Pour utiliser le Système d'Agents Électriques Québécois,
                                vous devez vous connecter avec votre compte Claude Max (Anthropic).
                            </p>
                            <button
                                className="btn btn-primary btn-large"
                                onClick={handleStartAuth}
                            >
                                Se connecter avec Claude Max
                            </button>
                            <div className="auth-note">
                                <small>
                                    Vous serez redirigé vers le navigateur pour compléter l'authentification OAuth.
                                </small>
                            </div>
                        </div>
                    )}

                    {status === 'authenticating' && (
                        <div className="auth-loading">
                            <div className="spinner"></div>
                            <p>Initialisation de l'authentification...</p>
                        </div>
                    )}

                    {status === 'waiting' && authUrl && (
                        <div className="auth-waiting">
                            <div className="auth-icon">🌐</div>
                            <h3>Authentification en cours</h3>
                            <p>Un navigateur devrait s'ouvrir automatiquement.</p>
                            <p>Si ce n'est pas le cas, cliquez sur le bouton ci-dessous :</p>
                            <button
                                className="btn btn-primary"
                                onClick={handleOpenAuthUrl}
                            >
                                Ouvrir la page d'authentification
                            </button>
                            <div className="auth-url-display">
                                <small>URL: {authUrl}</small>
                            </div>
                            <div className="auth-instructions">
                                <ol>
                                    <li>Connectez-vous avec votre compte Anthropic</li>
                                    <li>Autorisez l'accès à Claude Code CLI</li>
                                    <li>Revenez à cette application</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="auth-success">
                            <div className="success-icon">✅</div>
                            <h3>Authentification réussie!</h3>
                            <p>Connexion établie avec Claude Max.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="auth-error">
                            <div className="error-icon">❌</div>
                            <h3>Erreur d'authentification</h3>
                            <p className="error-message">{error}</p>
                            <button
                                className="btn btn-secondary"
                                onClick={handleStartAuth}
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="auth-help">
                        <small>
                            Besoin d'aide ? Consultez la <a href="#" onClick={(e) => {
                                e.preventDefault();
                                // Ouvrir la doc
                            }}>documentation</a>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

module.exports = AuthenticationModal;
