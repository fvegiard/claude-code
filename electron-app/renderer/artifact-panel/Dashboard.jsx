function Dashboard({ currentPDF, bomData, onFileUpload, loading }) {
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState('pdf');
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                onFileUpload(file);
            } else {
                alert('Veuillez déposer un fichier PDF');
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf') {
                onFileUpload(file);
            } else {
                alert('Veuillez sélectionner un fichier PDF');
            }
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="dashboard">
            {/* Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'pdf' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pdf')}
                >
                    📄 Plan PDF
                </button>
                <button
                    className={`tab ${activeTab === 'bom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bom')}
                    disabled={!bomData}
                >
                    📋 BOM
                </button>
                <button
                    className={`tab ${activeTab === 'compliance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('compliance')}
                    disabled={!currentPDF}
                >
                    ✅ Conformité
                </button>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {activeTab === 'pdf' && (
                    <div className="tab-content">
                        {currentPDF ? (
                            <PDFViewer pdfData={currentPDF} />
                        ) : (
                            <div
                                className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="drop-zone-content">
                                    <div className="drop-icon">📁</div>
                                    <h3>Glissez-déposez un plan électrique PDF ici</h3>
                                    <p>ou</p>
                                    <button
                                        className="browse-button"
                                        onClick={handleBrowseClick}
                                        disabled={loading}
                                    >
                                        Parcourir les fichiers
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="drop-info">
                                        <p>Formats supportés: PDF</p>
                                        <p>Analyse automatique selon: CEQ, RSST, RBQ, CSA</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bom' && bomData && (
                    <div className="tab-content">
                        <BOMTable bomData={bomData} />
                    </div>
                )}

                {activeTab === 'compliance' && currentPDF && (
                    <div className="tab-content">
                        <ComplianceReport pdfId={currentPDF.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
