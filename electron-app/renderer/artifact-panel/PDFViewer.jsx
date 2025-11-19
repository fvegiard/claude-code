function PDFViewer({ pdfData }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const canvasRef = useRef(null);
    const pdfDocRef = useRef(null);

    useEffect(() => {
        if (pdfData && pdfData.path) {
            loadPDF();
        }
    }, [pdfData]);

    useEffect(() => {
        if (pdfDocRef.current) {
            renderPage(currentPage);
        }
    }, [currentPage, scale]);

    const loadPDF = async () => {
        try {
            // Note: Ceci nécessite une implémentation complète avec PDF.js
            // Pour simplifier, on montre juste la structure
            console.log('Loading PDF:', pdfData.path);

            // Simuler le chargement
            setTotalPages(pdfData.pages || 1);
            setCurrentPage(1);
        } catch (error) {
            console.error('Erreur chargement PDF:', error);
        }
    };

    const renderPage = async (pageNum) => {
        if (!pdfDocRef.current) return;

        try {
            // Rendu de la page avec PDF.js
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            // Code de rendu PDF ici...

            console.log(`Rendering page ${pageNum} at scale ${scale}`);
        } catch (error) {
            console.error('Erreur rendu page:', error);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleZoomIn = () => {
        setScale(Math.min(scale + 0.25, 3.0));
    };

    const handleZoomOut = () => {
        setScale(Math.max(scale - 0.25, 0.5));
    };

    return (
        <div className="pdf-viewer">
            {/* Toolbar */}
            <div className="pdf-toolbar">
                <div className="pdf-navigation">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                        className="nav-button"
                    >
                        ◀ Précédent
                    </button>
                    <span className="page-info">
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className="nav-button"
                    >
                        Suivant ▶
                    </button>
                </div>

                <div className="pdf-zoom">
                    <button onClick={handleZoomOut} className="zoom-button">
                        🔍−
                    </button>
                    <span className="zoom-level">
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={handleZoomIn} className="zoom-button">
                        🔍+
                    </button>
                </div>

                <div className="pdf-info">
                    <span className="pdf-name">{pdfData.fileName}</span>
                </div>
            </div>

            {/* Canvas pour le rendu PDF */}
            <div className="pdf-canvas-container">
                <canvas ref={canvasRef} className="pdf-canvas" />
                {pdfData.annotations && pdfData.annotations.length > 0 && (
                    <PlanAnnotator annotations={pdfData.annotations} />
                )}
            </div>

            {/* Légende des annotations */}
            {pdfData.detectedElements && (
                <div className="pdf-legend">
                    <h4>Éléments détectés:</h4>
                    <ul>
                        {pdfData.detectedElements.map((elem, idx) => (
                            <li key={idx} className={`legend-item ${elem.type}`}>
                                <span className="legend-icon">{elem.icon}</span>
                                <span className="legend-label">{elem.label}</span>
                                <span className="legend-count">{elem.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
