const { ipcRenderer } = require('electron');

function App() {
    const [agents, setAgents] = useState([]);
    const [currentPDF, setCurrentPDF] = useState(null);
    const [messages, setMessages] = useState([]);
    const [bomData, setBomData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Charger les agents au démarrage
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            const result = await ipcRenderer.invoke('get-agents');
            if (result.success) {
                setAgents(result.data);
                addSystemMessage(`${result.data.length} agents chargés et prêts`);
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
                // Ajouter la réponse de l'assistant
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: result.data.message,
                    timestamp: new Date(result.data.timestamp),
                    usage: result.data.usage
                }]);
            } else {
                addSystemMessage(`Erreur: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            addSystemMessage('Erreur de communication', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file) => {
        setLoading(true);
        addSystemMessage(`Upload de ${file.name}...`);

        try {
            const result = await ipcRenderer.invoke('upload-pdf', {
                filePath: file.path,
                fileName: file.name
            });

            if (result.success) {
                setCurrentPDF(result.data);
                addSystemMessage(`PDF "${file.name}" chargé avec succès`, 'success');

                // Lancer l'analyse automatique
                handleAnalyzePDF(result.data.id);
            } else {
                addSystemMessage(`Erreur upload: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            addSystemMessage('Erreur lors de l\'upload', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzePDF = async (pdfId) => {
        setLoading(true);
        addSystemMessage('Analyse du plan en cours avec les agents électriques...');

        try {
            const result = await ipcRenderer.invoke('analyze-pdf', {
                pdfId,
                analysisType: 'full'
            });

            if (result.success) {
                addSystemMessage('Analyse terminée!', 'success');

                // Charger la BOM générée
                const bomResult = await ipcRenderer.invoke('get-bom', { pdfId });
                if (bomResult.success) {
                    setBomData(bomResult.data);
                    addSystemMessage(`BOM générée: ${bomResult.data.items.length} éléments détectés`, 'success');
                }
            } else {
                addSystemMessage(`Erreur analyse: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur analyse:', error);
            addSystemMessage('Erreur lors de l\'analyse', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInvokeAgent = async (agentName, task) => {
        setLoading(true);

        try {
            const result = await ipcRenderer.invoke('invoke-agent', {
                agentName,
                task
            });

            if (result.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'agent',
                    agent: result.data.displayName,
                    content: result.data.result,
                    timestamp: new Date(result.data.timestamp)
                }]);
            } else {
                addSystemMessage(`Erreur agent: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Erreur invocation agent:', error);
            addSystemMessage('Erreur d\'invocation de l\'agent', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <h1>⚡ Système d'Agents Électriques Québécois</h1>
                    <div className="header-info">
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
                    </div>
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        agents={agents}
                        onInvokeAgent={handleInvokeAgent}
                        loading={loading}
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
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="app-footer">
                <div className="footer-content">
                    <span>Conforme aux normes: CEQ • RSST • RBQ • CSA</span>
                    <span>Propulsé par Claude Code</span>
                </div>
            </footer>
        </div>
    );
}
