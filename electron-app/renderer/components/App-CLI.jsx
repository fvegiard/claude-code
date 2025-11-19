const { ipcRenderer } = require('electron');
const { useState, useEffect } = require('react');
const ChatInterface = require('./chat-panel/ChatInterface');
const Dashboard = require('./artifact-panel/Dashboard');
const AuthenticationModal = require('./AuthenticationModal');
const CLIStatusIndicator = require('./CLIStatusIndicator');

/**
 * Composant principal de l'application
 * Version CLI avec authentification Claude Max
 */
function App() {
    const [agents, setAgents] = useState([]);
    const [currentPDF, setCurrentPDF] = useState(null);
    const [messages, setMessages] = useState([]);
    const [bomData, setBomData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [cliInitialized, setCliInitialized] = useState(false);

    useEffect(() => {
        // Initialiser le CLI au démarrage
        initializeCLI();

        // Écouter les événements du CLI
        const handleAuthRequired = () => {
            setShowAuthModal(true);
        };

        const handleCliReady = () => {
            setCliInitialized(true);
            loadAgents();
            addSystemMessage('✅ Claude Code CLI prêt', 'success');
        };

        const handleCliResponse = (event, data) => {
            // Ajouter la réponse du CLI aux messages
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'assistant',
                content: data.message || data.text || JSON.stringify(data),
                timestamp: new Date(),
                source: 'claude-cli'
            }]);
        };

        const handleCliError = (event, errorMessage) => {
            addSystemMessage(`❌ Erreur CLI: ${errorMessage}`, 'error');
        };

        ipcRenderer.on('auth-required', handleAuthRequired);
        ipcRenderer.on('cli-ready', handleCliReady);
        ipcRenderer.on('cli-response', handleCliResponse);
        ipcRenderer.on('cli-error', handleCliError);

        return () => {
            ipcRenderer.removeListener('auth-required', handleAuthRequired);
            ipcRenderer.removeListener('cli-ready', handleCliReady);
            ipcRenderer.removeListener('cli-response', handleCliResponse);
            ipcRenderer.removeListener('cli-error', handleCliError);
        };
    }, []);

    const initializeCLI = async () => {
        try {
            addSystemMessage('🔄 Initialisation du Claude Code CLI...');
            const result = await ipcRenderer.invoke('initialize-cli');

            if (result.success) {
                setCliInitialized(true);
                addSystemMessage('✅ CLI initialisé avec succès', 'success');
            } else {
                addSystemMessage(`⚠️ ${result.error}`, 'warning');
                if (result.error.includes('auth')) {
                    setShowAuthModal(true);
                }
            }
        } catch (error) {
            console.error('Erreur initialisation CLI:', error);
            addSystemMessage('❌ Erreur d\'initialisation du CLI', 'error');
        }
    };

    const loadAgents = async () => {
        try {
            const result = await ipcRenderer.invoke('get-agents');
            if (result.success) {
                setAgents(result.data);
                addSystemMessage(`${result.data.length} agents chargés et prêts`, 'success');
            }
        } catch (error) {
            console.error('Erreur chargement agents:', error);
            addSystemMessage('Erreur de chargement des agents', 'error');
        }
    };

    const addSystemMessage = (text, type = 'info') => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            subtype: type,
            content: text,
            timestamp: new Date()
        }]);
    };

    const handleSendMessage = async (message) => {
        if (!cliInitialized) {
            addSystemMessage('⚠️ CLI non initialisé. Veuillez vous authentifier.', 'warning');
            setShowAuthModal(true);
            return;
        }

        // Ajouter le message utilisateur
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date()
        }]);

        setLoading(true);

        try {
            const result = await ipcRenderer.invoke('send-message', message);

            if (result.success) {
                // La réponse sera ajoutée via l'événement 'cli-response'
                // Mais on peut aussi l'ajouter directement si disponible
                if (result.data && result.data.response) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        type: 'assistant',
                        content: result.data.response,
                        timestamp: new Date(),
                        source: 'claude-cli'
                    }]);
                }
            } else {
                addSystemMessage(`Erreur: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            addSystemMessage('Erreur de communication avec le CLI', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!cliInitialized) {
            addSystemMessage('⚠️ CLI non initialisé. Veuillez vous authentifier.', 'warning');
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        addSystemMessage(`📄 Upload de ${file.name}...`);

        try {
            const result = await ipcRenderer.invoke('upload-pdf', {
                filePath: file.path,
                fileName: file.name
            });

            if (result.success) {
                setCurrentPDF({
                    name: file.name,
                    path: file.path,
                    ...result.data
                });
                addSystemMessage(`✅ PDF "${file.name}" chargé avec succès`, 'success');
                addSystemMessage(`🔍 Lancement de l'analyse automatique...`);

                // L'analyse sera gérée par le CLI via MCP
                handleSendMessage(`Analyse le plan électrique PDF que je viens de charger: ${file.name}`);
            } else {
                addSystemMessage(`❌ Erreur upload: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            addSystemMessage('❌ Erreur lors de l\'upload', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInvokeAgent = async (agentName, task) => {
        if (!cliInitialized) {
            addSystemMessage('⚠️ CLI non initialisé. Veuillez vous authentifier.', 'warning');
            setShowAuthModal(true);
            return;
        }

        setLoading(true);
        addSystemMessage(`🤖 Invocation de l'agent: ${agentName}...`);

        try {
            const result = await ipcRenderer.invoke('invoke-agent', {
                agentName,
                task
            });

            if (result.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'agent',
                    agent: agentName,
                    content: result.data.response || result.data,
                    timestamp: new Date()
                }]);
                addSystemMessage(`✅ Tâche complétée par ${agentName}`, 'success');
            } else {
                addSystemMessage(`❌ Erreur agent: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur invocation agent:', error);
            addSystemMessage('❌ Erreur d\'invocation de l\'agent', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        setCliInitialized(true);
        loadAgents();
        addSystemMessage('🎉 Authentification réussie! Système prêt.', 'success');
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <h1>⚡ Système d'Agents Électriques Québécois</h1>
                    <div className="header-info">
                        <CLIStatusIndicator onAuthRequired={() => setShowAuthModal(true)} />
                        <span className="agent-count">{agents.length} agents actifs</span>
                        {loading && <span className="loading-indicator">⏳ Traitement...</span>}
                    </div>
                </div>
            </header>

            {/* Main Content - Dual Panel Layout */}
            <div className="main-content">
                {/* Left Panel - Chat */}
                <div className="chat-panel">
                    <div className="panel-header">
                        <h2>💬 Discussion avec les Agents</h2>
                        {!cliInitialized && (
                            <button
                                className="btn btn-auth"
                                onClick={() => setShowAuthModal(true)}
                            >
                                🔐 S'authentifier
                            </button>
                        )}
                    </div>
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        agents={agents}
                        onInvokeAgent={handleInvokeAgent}
                        loading={loading}
                        disabled={!cliInitialized}
                    />
                </div>

                {/* Right Panel - Artifacts/Dashboard */}
                <div className="artifact-panel">
                    <div className="panel-header">
                        <h2>📊 Dashboard Électrique</h2>
                    </div>
                    <Dashboard
                        currentPDF={currentPDF}
                        bomData={bomData}
                        onFileUpload={handleFileUpload}
                        loading={loading}
                        disabled={!cliInitialized}
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="app-footer">
                <div className="footer-content">
                    <span>Conforme aux normes: CEQ • RSST • RBQ • CSA</span>
                    <span>Propulsé par Claude Code CLI + Claude Max</span>
                </div>
            </footer>

            {/* Authentication Modal */}
            <AuthenticationModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}

module.exports = App;
