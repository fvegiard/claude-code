const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './storage/uploads';
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont acceptés'));
        }
    }
});

// Base de données en mémoire pour les PDF (à remplacer par PostgreSQL)
const pdfDatabase = new Map();

// POST /api/pdf/upload - Upload un PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            // Si pas de fichier physique, vérifier s'il y a des données base64
            const { fileName, fileData } = req.body;

            if (!fileName || !fileData) {
                return res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni'
                });
            }

            // Décoder le base64 et sauvegarder
            const uploadDir = process.env.UPLOAD_DIR || './storage/uploads';
            await fs.mkdir(uploadDir, { recursive: true });

            const uniqueName = `${uuidv4()}.pdf`;
            const filePath = path.join(uploadDir, uniqueName);

            const buffer = Buffer.from(fileData, 'base64');
            await fs.writeFile(filePath, buffer);

            const pdfId = uuidv4();
            const pdfRecord = {
                id: pdfId,
                fileName,
                filePath,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded',
                size: buffer.length
            };

            pdfDatabase.set(pdfId, pdfRecord);

            return res.json({
                success: true,
                data: pdfRecord
            });
        }

        const pdfId = uuidv4();
        const pdfRecord = {
            id: pdfId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
            size: req.file.size
        };

        pdfDatabase.set(pdfId, pdfRecord);

        res.json({
            success: true,
            data: pdfRecord
        });

    } catch (error) {
        console.error('Erreur upload PDF:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/pdf/analyze - Analyser un PDF avec les agents
router.post('/analyze', async (req, res) => {
    try {
        const { pdfId, analysisType, agents } = req.body;

        const pdfRecord = pdfDatabase.get(pdfId);
        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                error: 'PDF non trouvé'
            });
        }

        // Marquer comme en cours d'analyse
        pdfRecord.status = 'analyzing';
        pdfDatabase.set(pdfId, pdfRecord);

        // Lancer le traitement PDF Python
        const pythonScript = path.join(__dirname, '../../pdf-processing/pdf-parser.py');
        const command = `python3 ${pythonScript} "${pdfRecord.filePath}" "${pdfId}"`;

        const { stdout, stderr } = await execPromise(command);

        if (stderr && stderr.length > 0) {
            console.warn('Python stderr:', stderr);
        }

        // Parser le résultat
        let analysisResult;
        try {
            analysisResult = JSON.parse(stdout);
        } catch (e) {
            throw new Error('Erreur de parsing du résultat Python');
        }

        // Mettre à jour le record
        pdfRecord.status = 'analyzed';
        pdfRecord.analysisResult = analysisResult;
        pdfRecord.analyzedAt = new Date().toISOString();
        pdfDatabase.set(pdfId, pdfRecord);

        // Générer la BOM à partir de l'analyse
        await generateBOM(pdfId, analysisResult);

        res.json({
            success: true,
            data: {
                pdfId,
                status: 'analyzed',
                result: analysisResult
            }
        });

    } catch (error) {
        console.error('Erreur analyse PDF:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/pdf/:id/bom - Obtenir la BOM générée
router.get('/:id/bom', (req, res) => {
    try {
        const pdfRecord = pdfDatabase.get(req.params.id);

        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                error: 'PDF non trouvé'
            });
        }

        if (!pdfRecord.bom) {
            return res.status(404).json({
                success: false,
                error: 'BOM non disponible. Analysez d\'abord le PDF.'
            });
        }

        res.json({
            success: true,
            data: pdfRecord.bom
        });

    } catch (error) {
        console.error('Erreur récupération BOM:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/pdf/compliance - Vérifier la conformité
router.post('/compliance', async (req, res) => {
    try {
        const { pdfId, normsType } = req.body;

        const pdfRecord = pdfDatabase.get(pdfId);
        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                error: 'PDF non trouvé'
            });
        }

        // Simuler la vérification de conformité
        // À implémenter: appeler l'agent de conformité avec les données du PDF
        const complianceReport = {
            pdfId,
            normsType,
            status: 'compliant',
            checks: [
                {
                    rule: 'Cuisinière électrique ≥5000W',
                    status: 'passed',
                    reference: 'CEQ Article 8-200'
                },
                {
                    rule: 'Matériel certifié CSA',
                    status: 'passed',
                    reference: 'CEQ Article 2-024'
                },
                {
                    rule: 'Distances de sécurité',
                    status: 'passed',
                    reference: 'CEQ Article 12-010'
                }
            ],
            generatedAt: new Date().toISOString()
        };

        pdfRecord.complianceReport = complianceReport;
        pdfDatabase.set(pdfId, pdfRecord);

        res.json({
            success: true,
            data: complianceReport
        });

    } catch (error) {
        console.error('Erreur vérification conformité:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/pdf/:id/export - Exporter la BOM
router.post('/:id/export', async (req, res) => {
    try {
        const { format } = req.body;
        const pdfRecord = pdfDatabase.get(req.params.id);

        if (!pdfRecord || !pdfRecord.bom) {
            return res.status(404).json({
                success: false,
                error: 'BOM non disponible'
            });
        }

        const exportDir = process.env.EXPORT_DIR || './storage/exports';
        await fs.mkdir(exportDir, { recursive: true });

        const exportFileName = `BOM_${req.params.id}_${Date.now()}.${format}`;
        const exportPath = path.join(exportDir, exportFileName);

        // Générer l'export selon le format
        switch (format) {
            case 'csv':
                await exportToCSV(pdfRecord.bom, exportPath);
                break;
            case 'excel':
                await exportToExcel(pdfRecord.bom, exportPath);
                break;
            case 'pdf':
                await exportToPDF(pdfRecord.bom, exportPath);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Format non supporté'
                });
        }

        res.json({
            success: true,
            data: {
                path: exportPath,
                fileName: exportFileName
            }
        });

    } catch (error) {
        console.error('Erreur export BOM:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fonctions auxiliaires

async function generateBOM(pdfId, analysisResult) {
    // Générer la BOM à partir de l'analyse
    const bom = {
        pdfId,
        items: analysisResult.detectedElements || [],
        generatedAt: new Date().toISOString(),
        notes: [
            'BOM générée automatiquement par les agents électriques',
            'Vérification manuelle recommandée',
            'Conforme aux normes CEQ, RSST, RBQ, CSA'
        ]
    };

    const pdfRecord = pdfDatabase.get(pdfId);
    pdfRecord.bom = bom;
    pdfDatabase.set(pdfId, pdfRecord);

    return bom;
}

async function exportToCSV(bom, filePath) {
    const lines = ['#,Catégorie,Description,Numéro de pièce,Quantité,Spécifications,Conformité,Prix unitaire'];

    bom.items.forEach((item, idx) => {
        const specs = (item.specifications || []).join('; ');
        const line = [
            idx + 1,
            item.category || '',
            item.description || '',
            item.partNumber || '',
            item.quantity || '',
            specs,
            item.complianceStandard || '',
            item.price || ''
        ].map(v => `"${v}"`).join(',');

        lines.push(line);
    });

    await fs.writeFile(filePath, lines.join('\n'), 'utf8');
}

async function exportToExcel(bom, filePath) {
    // À implémenter avec une bibliothèque comme xlsx
    await exportToCSV(bom, filePath.replace('.excel', '.csv'));
}

async function exportToPDF(bom, filePath) {
    // À implémenter avec une bibliothèque comme pdfkit
    await exportToCSV(bom, filePath.replace('.pdf', '.csv'));
}

module.exports = router;
