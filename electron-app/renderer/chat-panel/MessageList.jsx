function MessageList({ messages }) {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-CA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMessage = (message) => {
        switch (message.type) {
            case 'system':
                return (
                    <div key={message.id} className={`message message-system message-${message.subtype || 'info'}`}>
                        <div className="message-icon">ℹ️</div>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                        </div>
                    </div>
                );

            case 'user':
                return (
                    <div key={message.id} className="message message-user">
                        <div className="message-icon">👤</div>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                        </div>
                    </div>
                );

            case 'assistant':
                return (
                    <div key={message.id} className="message message-assistant">
                        <div className="message-icon">🤖</div>
                        <div className="message-content">
                            <div className="message-label">Claude</div>
                            <div className="message-text">{message.content}</div>
                            <div className="message-meta">
                                <span className="message-time">{formatTime(message.timestamp)}</span>
                                {message.usage && (
                                    <span className="message-tokens">
                                        {message.usage.input_tokens + message.usage.output_tokens} tokens
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'agent':
                return (
                    <div key={message.id} className="message message-agent">
                        <div className="message-icon">⚡</div>
                        <div className="message-content">
                            <div className="message-label">{message.agent}</div>
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="message-list">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>Bienvenue au Système d'Agents Électriques</h3>
                    <p>Posez vos questions ou glissez un plan électrique PDF dans le panneau de droite</p>
                </div>
            ) : (
                messages.map(renderMessage)
            )}
        </div>
    );
}
