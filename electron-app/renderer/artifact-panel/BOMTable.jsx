function BOMTable({ bomData }) {
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState('item');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { ipcRenderer } = require('electron');

    if (!bomData || !bomData.items) {
        return (
            <div className="bom-empty">
                <p>Aucune BOM disponible</p>
            </div>
        );
    }

    const filteredItems = bomData.items.filter(item => {
        const matchesFilter = !filter ||
            item.description.toLowerCase().includes(filter.toLowerCase()) ||
            item.partNumber?.toLowerCase().includes(filter.toLowerCase());

        const matchesCategory = selectedCategory === 'all' ||
            item.category === selectedCategory;

        return matchesFilter && matchesCategory;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'quantity' || sortBy === 'price') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }

        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleExport = async (format) => {
        try {
            const result = await ipcRenderer.invoke('export-bom', {
                pdfId: bomData.pdfId,
                format
            });

            if (result.success) {
                alert(`BOM exportée: ${result.data.path}`);
            }
        } catch (error) {
            console.error('Erreur export:', error);
            alert('Erreur lors de l\'export');
        }
    };

    const categories = ['all', ...new Set(bomData.items.map(item => item.category))];

    const totalCost = sortedItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
    }, 0);

    return (
        <div className="bom-table-container">
            {/* Header avec filtres et actions */}
            <div className="bom-header">
                <div className="bom-filters">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-input"
                    />

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'Toutes catégories' : cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bom-actions">
                    <button onClick={() => handleExport('csv')} className="export-button">
                        📄 CSV
                    </button>
                    <button onClick={() => handleExport('excel')} className="export-button">
                        📊 Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} className="export-button">
                        📑 PDF
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="bom-summary">
                <div className="summary-item">
                    <span className="summary-label">Total d'articles:</span>
                    <span className="summary-value">{sortedItems.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Quantité totale:</span>
                    <span className="summary-value">
                        {sortedItems.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Coût total estimé:</span>
                    <span className="summary-value">${totalCost.toFixed(2)}</span>
                </div>
            </div>

            {/* Table */}
            <div className="bom-table-wrapper">
                <table className="bom-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('item')}>
                                # {sortBy === 'item' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('category')}>
                                Catégorie {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('description')}>
                                Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('partNumber')}>
                                Numéro de pièce
                            </th>
                            <th onClick={() => handleSort('quantity')}>
                                Quantité {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Spécifications</th>
                            <th>Conformité</th>
                            <th onClick={() => handleSort('price')}>
                                Prix unit. {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.map((item, idx) => (
                            <tr key={idx} className={`bom-row ${item.compliance ? 'compliant' : 'non-compliant'}`}>
                                <td>{idx + 1}</td>
                                <td>
                                    <span className={`category-badge ${item.category}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="description-cell">{item.description}</td>
                                <td className="part-number-cell">{item.partNumber || 'N/A'}</td>
                                <td className="quantity-cell">{item.quantity}</td>
                                <td className="specs-cell">
                                    <ul className="specs-list">
                                        {item.specifications?.map((spec, i) => (
                                            <li key={i}>{spec}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="compliance-cell">
                                    {item.compliance ? (
                                        <span className="compliance-badge compliant">
                                            ✅ {item.complianceStandard}
                                        </span>
                                    ) : (
                                        <span className="compliance-badge non-compliant">
                                            ⚠️ Non vérifié
                                        </span>
                                    )}
                                </td>
                                <td className="price-cell">
                                    ${parseFloat(item.price || 0).toFixed(2)}
                                </td>
                                <td className="total-cell">
                                    ${((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            {bomData.notes && (
                <div className="bom-notes">
                    <h4>📝 Notes:</h4>
                    <ul>
                        {bomData.notes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Quebec specific warnings */}
            <div className="bom-warnings">
                <h4>⚠️ Vérifications CEQ:</h4>
                <ul>
                    <li>✅ Cuisinière électrique ≥5000W vérifiée</li>
                    <li>✅ Matériel certifié CSA confirmé</li>
                    <li>✅ Spécifications hivernales validées</li>
                    <li>✅ Conformité RBQ respectée</li>
                </ul>
            </div>
        </div>
    );
}
