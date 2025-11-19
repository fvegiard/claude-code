function InputBox({ value, onChange, onSubmit, loading, selectedAgent }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    const placeholderText = selectedAgent
        ? `Demander à ${selectedAgent}...`
        : 'Posez votre question aux agents électriques...';

    return (
        <form className="input-box" onSubmit={onSubmit}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                disabled={loading}
                rows={3}
                className="input-textarea"
            />
            <div className="input-actions">
                <div className="input-hints">
                    <span className="hint">💡 Exemples: "Vérifie la conformité CEQ", "Calcule la charge totale", "Génère la BOM"</span>
                </div>
                <button
                    type="submit"
                    disabled={loading || !value.trim()}
                    className="send-button"
                >
                    {loading ? '⏳ Traitement...' : '📤 Envoyer'}
                </button>
            </div>
        </form>
    );
}
