function ChatInterface({ messages, onSendMessage, agents, onInvokeAgent, loading }) {
    const [inputValue, setInputValue] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || loading) return;

        if (selected Agent) {
            // Invoquer un agent spécifique
            onInvokeAgent(selectedAgent, inputValue);
            setSelectedAgent(null);
        } else {
            // Message général
            onSendMessage(inputValue);
        }

        setInputValue('');
    };

    return (
        <div className="chat-interface">
            {/* Agent Selector */}
            <div className="agent-selector">
                <label>Agent spécifique:</label>
                <select
                    value={selectedAgent || ''}
                    onChange={(e) => setSelectedAgent(e.target.value || null)}
                    disabled={loading}
                >
                    <option value="">Tous les agents</option>
                    {agents.map(agent => (
                        <option key={agent.name} value={agent.name}>
                            {agent.displayName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Messages List */}
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />

            {/* Input Box */}
            <InputBox
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                loading={loading}
                selectedAgent={selectedAgent}
            />
        </div>
    );
}
