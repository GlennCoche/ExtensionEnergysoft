// ===== BACKGROUND.JS - SERVICE WORKER =====

console.log('[BACKGROUND] Service Worker démarré');

// ===== CHARGEMENT DU JSON PAR DÉFAUT =====
async function loadDefaultConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL('config_interventions_export.json'));
    const defaultData = await response.json();
    console.log(`[BACKGROUND] ${defaultData.length} interventions chargées`);
    
    // Sauvegarder immédiatement dans le storage
    await chrome.storage.local.set({ 
      interventionsData: defaultData,
      lastImport: new Date().toISOString(),
      importCount: defaultData.length
    });
    
    console.log(`[BACKGROUND] ${defaultData.length} interventions sauvegardées dans le storage`);
    return defaultData;
  } catch (error) {
    console.error('[BACKGROUND] Erreur chargement config:', error);
    return [];
  }
}

// ===== CHARGEMENT DES PARAMÈTRES PAR DÉFAUT =====
async function loadDefaultSettings() {
  try {
    const response = await fetch(chrome.runtime.getURL('default-settings.json'));
    const defaultSettings = await response.json();
    console.log('[BACKGROUND] Paramètres par défaut chargés');
    return defaultSettings;
  } catch (error) {
    console.error('[BACKGROUND] Erreur chargement paramètres:', error);
    return {
      extensionSettings: {
        debugMode: true,
        debounceDelay: 500,
        fillTitre: true,
        fillCategorie: true,
        fillDateEcheance: true,
        fillDescription: true,
        fillCommentaire: true,
        enrichCommentaire: true
      }
    };
  }
}

// ===== INSTALLATION =====
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[BACKGROUND] Extension installée');
    
    // Charger le JSON par défaut
    const defaultData = await loadDefaultConfig();
    if (defaultData.length > 0) {
      chrome.storage.local.set({ interventionsData: defaultData });
    }
    
    // Charger les paramètres par défaut
    const defaultSettings = await loadDefaultSettings();
    chrome.storage.local.set(defaultSettings);
    
    // Ouvrir la page de settings
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('[BACKGROUND] Extension mise à jour');
    
    // Recharger le JSON par défaut
    const defaultData = await loadDefaultConfig();
    if (defaultData.length > 0) {
      chrome.storage.local.set({ interventionsData: defaultData });
    }
    
    // Vérifier si les paramètres existent, sinon les initialiser
    chrome.storage.local.get(['extensionSettings'], (result) => {
      if (!result.extensionSettings) {
        loadDefaultSettings().then(defaultSettings => {
          chrome.storage.local.set(defaultSettings);
        });
      }
    });
  }
});

// ===== GESTION DES MESSAGES =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Recharger la configuration depuis le JSON
  if (request.action === 'reloadConfigFromJSON') {
    loadDefaultConfig().then(defaultData => {
      if (defaultData.length > 0) {
        chrome.storage.local.set({ interventionsData: defaultData }, () => {
          console.log(`[BACKGROUND] ${defaultData.length} interventions rechargées`);
          sendResponse({success: true, count: defaultData.length});
        });
      } else {
        sendResponse({success: false, error: 'Aucune donnée chargée'});
      }
    });
    return true;
  }
  
  // Recharger tous les onglets Energysoft
  if (request.action === 'reloadAllTabs') {
    chrome.tabs.query({url: 'https://energysoft.app/*'}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.reload(tab.id, () => {
          if (chrome.runtime.lastError) {
            // Ignorer les erreurs (onglet fermé, etc.)
          }
        });
      });
      sendResponse({success: true, count: tabs.length});
    });
    return true;
  }
  
  // Forcer le rechargement des données
  if (request.action === 'forceReloadData') {
    loadDefaultConfig().then(defaultData => {
      if (defaultData.length > 0) {
        console.log(`[BACKGROUND] ${defaultData.length} interventions rechargées`);
        sendResponse({success: true, count: defaultData.length});
      } else {
        sendResponse({success: false, error: 'Aucune donnée chargée'});
      }
    });
    return true;
  }
});

console.log('[BACKGROUND] Service Worker prêt');