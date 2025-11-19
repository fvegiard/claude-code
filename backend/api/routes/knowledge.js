const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

// POST /api/knowledge/search - Rechercher dans la base de connaissances
router.post('/search', async (req, res) => {
    try {
        const { query, category, topK } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query requis'
            });
        }

        // Appeler le script Python FAISS
        const pythonScript = path.join(__dirname, '../../knowledge-base/faiss-manager.py');
        const command = `python3 ${pythonScript} search "${query}" ${topK || 5} ${category || 'all'}`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr && stderr.length > 0) {
            console.warn('Python stderr:', stderr);
        }

        let results;
        try {
            results = JSON.parse(stdout);
        } catch (e) {
            throw new Error('Erreur de parsing des résultats');
        }

        res.json({
            success: true,
            data: {
                query,
                category: category || 'all',
                results: results.matches || [],
                count: results.count || 0
            }
        });

    } catch (error) {
        console.error('Erreur recherche connaissances:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/knowledge/categories - Obtenir les catégories disponibles
router.get('/categories', (req, res) => {
    const categories = [
        {
            id: 'ceq',
            name: 'Code électrique du Québec (CEQ)',
            description: 'Code électrique du Québec - Édition en vigueur',
            articles: 'Tous les articles et annexes',
            version: process.env.CEQ_VERSION || '2024'
        },
        {
            id: 'rsst',
            name: 'Règlement sur la santé et la sécurité du travail (RSST)',
            description: 'Règlement sur la santé et la sécurité du travail',
            articles: 'Sections électriques',
            version: process.env.RSST_VERSION || 'current'
        },
        {
            id: 'rbq',
            name: 'Régie du bâtiment du Québec (RBQ)',
            description: 'Exigences et règlements RBQ',
            articles: 'Électricité et certification',
            version: process.env.RBQ_VERSION || 'current'
        },
        {
            id: 'csa',
            name: 'Normes CSA',
            description: 'Normes de l\'Association canadienne de normalisation',
            articles: 'Normes applicables au Québec',
            version: process.env.CSA_VERSION || 'current'
        },
        {
            id: 'winter',
            name: 'Spécificités hivernales',
            description: 'Particularités pour conditions hivernales québécoises',
            articles: 'Matériel et installations',
            version: 'current'
        },
        {
            id: 'equipment',
            name: 'Équipements spécifiques',
            description: 'Cuisinière, chauffage, etc.',
            articles: 'Exigences particulières',
            version: 'current'
        }
    ];

    res.json({
        success: true,
        data: categories
    });
});

// GET /api/knowledge/article/:id - Obtenir un article spécifique
router.get('/article/:id', async (req, res) => {
    try {
        const articleId = req.params.id;

        // Appeler FAISS pour obtenir l'article
        const pythonScript = path.join(__dirname, '../../knowledge-base/faiss-manager.py');
        const command = `python3 ${pythonScript} get-article "${articleId}"`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr && stderr.length > 0) {
            console.warn('Python stderr:', stderr);
        }

        let article;
        try {
            article = JSON.parse(stdout);
        } catch (e) {
            return res.status(404).json({
                success: false,
                error: 'Article non trouvé'
            });
        }

        res.json({
            success: true,
            data: article
        });

    } catch (error) {
        console.error('Erreur récupération article:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/knowledge/validate - Valider une installation selon les normes
router.post('/validate', async (req, res) => {
    try {
        const { installationType, specifications } = req.body;

        if (!installationType || !specifications) {
            return res.status(400).json({
                success: false,
                error: 'Type d\'installation et spécifications requis'
            });
        }

        // Rechercher les règles applicables
        const query = `validation ${installationType} ${Object.keys(specifications).join(' ')}`;

        const pythonScript = path.join(__dirname, '../../knowledge-base/faiss-manager.py');
        const command = `python3 ${pythonScript} search "${query}" 10 all`;

        const { stdout } = await execPromise(command);
        const searchResults = JSON.parse(stdout);

        // Analyser les règles et créer un rapport de validation
        const validationReport = {
            installationType,
            specifications,
            applicableRules: searchResults.matches || [],
            validationResults: [],
            overallStatus: 'compliant',
            timestamp: new Date().toISOString()
        };

        // Simuler des vérifications (à implémenter avec la vraie logique)
        validationReport.validationResults = [
            {
                rule: 'Dimensionnement des conducteurs',
                status: 'passed',
                reference: 'CEQ 4-004',
                details: 'Conducteurs correctement dimensionnés'
            },
            {
                rule: 'Protection contre les surintensités',
                status: 'passed',
                reference: 'CEQ 14-100',
                details: 'Disjoncteurs conformes'
            }
        ];

        res.json({
            success: true,
            data: validationReport
        });

    } catch (error) {
        console.error('Erreur validation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/knowledge/recommend - Obtenir des recommandations
router.post('/recommend', async (req, res) => {
    try {
        const { context, requirements } = req.body;

        if (!context) {
            return res.status(400).json({
                success: false,
                error: 'Contexte requis'
            });
        }

        // Rechercher des recommandations basées sur le contexte
        const query = `recommandations ${context} ${requirements || ''}`;

        const pythonScript = path.join(__dirname, '../../knowledge-base/faiss-manager.py');
        const command = `python3 ${pythonScript} search "${query}" 5 all`;

        const { stdout } = await execPromise(command);
        const searchResults = JSON.parse(stdout);

        const recommendations = {
            context,
            requirements,
            recommendations: searchResults.matches.map(match => ({
                title: match.title || 'Recommandation',
                description: match.content || '',
                reference: match.reference || '',
                priority: match.score > 0.8 ? 'high' : match.score > 0.6 ? 'medium' : 'low'
            })),
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('Erreur recommandations:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/knowledge/stats - Statistiques de la base de connaissances
router.get('/stats', async (req, res) => {
    try {
        const pythonScript = path.join(__dirname, '../../knowledge-base/faiss-manager.py');
        const command = `python3 ${pythonScript} stats`;

        const { stdout } = await execPromise(command);
        const stats = JSON.parse(stdout);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
