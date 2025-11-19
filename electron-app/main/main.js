const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ClaudeAPI = require('./claude-api');
const WindowManager = require('./window-manager');

let mainWindow;
let claudeAPI;
let windowManager;

// Configuration de l'application
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'Système d\'Agents Électriques Québécois',
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Charger l'interface
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Ouvrir DevTools en mode développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Initialiser le gestionnaire de fenêtres
  windowManager = new WindowManager(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialiser l'application
app.whenReady().then(async () => {
  // Initialiser l'API Claude
  claudeAPI = new ClaudeAPI();
  await claudeAPI.initialize();

  // Créer la fenêtre
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter l'application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================================
// IPC Handlers - Communication avec le renderer
// ========================================

// Chat avec les agents
ipcMain.handle('send-message', async (event, message) => {
  try {
    const response = await claudeAPI.sendMessage(message);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Erreur envoi message:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Upload PDF
ipcMain.handle('upload-pdf', async (event, { filePath, fileName }) => {
  try {
    const result = await claudeAPI.uploadPDF(filePath, fileName);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur upload PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Analyser PDF avec les agents
ipcMain.handle('analyze-pdf', async (event, { pdfId, analysisType }) => {
  try {
    const result = await claudeAPI.analyzePDF(pdfId, analysisType);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur analyse PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Obtenir la BOM
ipcMain.handle('get-bom', async (event, { pdfId }) => {
  try {
    const bom = await claudeAPI.getBOM(pdfId);
    return {
      success: true,
      data: bom
    };
  } catch (error) {
    console.error('Erreur récupération BOM:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Invoquer un agent spécifique
ipcMain.handle('invoke-agent', async (event, { agentName, task }) => {
  try {
    const result = await claudeAPI.invokeAgent(agentName, task);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur invocation agent:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Recherche dans la base de connaissances
ipcMain.handle('search-knowledge', async (event, { query, category }) => {
  try {
    const results = await claudeAPI.searchKnowledge(query, category);
    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Erreur recherche connaissances:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Vérifier la conformité CEQ
ipcMain.handle('check-compliance', async (event, { pdfId, normsType }) => {
  try {
    const compliance = await claudeAPI.checkCompliance(pdfId, normsType);
    return {
      success: true,
      data: compliance
    };
  } catch (error) {
    console.error('Erreur vérification conformité:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Obtenir la liste des agents disponibles
ipcMain.handle('get-agents', async (event) => {
  try {
    const agents = await claudeAPI.getAgents();
    return {
      success: true,
      data: agents
    };
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Export BOM
ipcMain.handle('export-bom', async (event, { pdfId, format }) => {
  try {
    const exportPath = await claudeAPI.exportBOM(pdfId, format);
    return {
      success: true,
      data: { path: exportPath }
    };
  } catch (error) {
    console.error('Erreur export BOM:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

console.log('🚀 Application Électrique Québécoise démarrée');
console.log(`📌 Mode: ${isDev ? 'Développement' : 'Production'}`);
console.log('🤖 Claude Code Backend initialisé');
