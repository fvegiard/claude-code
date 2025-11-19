const { ipcRenderer } = require('electron');
const { useState, useEffect } = require('react');

/**
 * Indicateur de statut du Claude Code CLI
 * Affiche l'état de connexion et permet de ré-authentifier si nécessaire
 */
function CLIStatusIndicator({ onAuthRequired }) {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected, error
    const [cliInfo, setCliInfo] = useState(null);

    useEffect(() => {
        // Vérifier le statut au démarrage
        checkStatus();

        // Vérifier régulièrement
        const interval = setInterval(checkStatus, 30000); // Toutes les 30 secondes

        // Écouter les événements
        const handleAuthRequired = () => {
            setStatus('disconnected');
            if (onAuthRequired) {
                onAuthRequired();
            }
        };

        const handleAuthSuccess = () => {
            setStatus('connected');
            checkStatus();
        };

        const handleCliReady = () => {
            setStatus('connected');
            checkStatus();
        };

        const handleCliError = () => {
            setStatus('error');
        };

        ipcRenderer.on('auth-required', handleAuthRequired);
        ipcRenderer.on('auth-success', handleAuthSuccess);
        ipcRenderer.on('cli-ready', handleCliReady);
        ipcRenderer.on('cli-error', handleCliError);

        return () => {
            clearInterval(interval);
            ipcRenderer.removeListener('auth-required', handleAuthRequired);
            ipcRenderer.removeListener('auth-success', handleAuthSuccess);
            ipcRenderer.removeListener('cli-ready', handleCliReady);
            ipcRenderer.removeListener('cli-error', handleCliError);
        };
    }, [onAuthRequired]);

    const checkStatus = async () => {
        try {
            const result = await ipcRenderer.invoke('get-cli-status');
            if (result.success) {
                setCliInfo(result.data);
                setStatus(result.data.authenticated ? 'connected' : 'disconnected');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    const getStatusInfo = () => {
        switch (status) {
            case 'checking':
                return {
                    icon: '🔄',
                    text: 'Vérification...',
                    className: 'status-checking'
                };
            case 'connected':
                return {
                    icon: '✅',
                    text: 'Claude CLI connecté',
                    className: 'status-connected'
                };
            case 'disconnected':
                return {
                    icon: '⚠️',
                    text: 'Non authentifié',
                    className: 'status-disconnected'
                };
            case 'error':
                return {
                    icon: '❌',
                    text: 'Erreur CLI',
                    className: 'status-error'
                };
            default:
                return {
                    icon: '❓',
                    text: 'Inconnu',
                    className: 'status-unknown'
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`cli-status-indicator ${statusInfo.className}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
            {cliInfo && cliInfo.authenticated && (
                <span className="status-detail">
                    • Session active
                </span>
            )}
            {status === 'disconnected' && (
                <button
                    className="status-action-btn"
                    onClick={onAuthRequired}
                    title="Cliquer pour s'authentifier"
                >
                    Se connecter
                </button>
            )}
        </div>
    );
}

module.exports = CLIStatusIndicator;
