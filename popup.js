// ===== POPUP.JS - INTERFACE SIMPLIFIÉE =====

document.addEventListener('DOMContentLoaded', function() {
  console.log('[AUTO-FORM-PV] Popup chargé');

  // Éléments du DOM
  const settingsBtn = document.getElementById('settingsBtn');
  const forceReloadBtn = document.getElementById('forceReloadBtn');
  const importDataBtn = document.getElementById('importDataBtn');
  const statusDiv = document.getElementById('status');

  // ===== AFFICHER LE STATUT =====
  function showStatus(message, type = 'info') {
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    }
  }

  // ===== OUVRIR LES SETTINGS =====
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
  }

  // ===== BOUTON DE RECHARGEMENT FORCÉ =====
  if (forceReloadBtn) {
    forceReloadBtn.addEventListener('click', async function() {
      forceReloadBtn.textContent = '⏳ Rechargement...';
      forceReloadBtn.disabled = true;
      
      try {
        // Recharger les données depuis le JSON
        const response = await chrome.runtime.sendMessage({action: 'reloadConfigFromJSON'});
        console.log('[POPUP] Config rechargée:', response);
        
        // Recharger toutes les pages Energysoft
        chrome.tabs.query({url: 'https://energysoft.app/*'}, function(tabs) {
          console.log(`[POPUP] Rechargement de ${tabs.length} onglets Energysoft`);
          tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
          });
        });
        
        forceReloadBtn.textContent = '✅ Rechargé !';
        showStatus('Pages rechargées avec succès !', 'success');
        
        setTimeout(() => {
          forceReloadBtn.textContent = '🔄 Recharger les pages Energysoft';
          forceReloadBtn.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('[POPUP] Erreur rechargement:', error);
        forceReloadBtn.textContent = '❌ Erreur';
        showStatus('Erreur lors du rechargement', 'error');
        
        setTimeout(() => {
          forceReloadBtn.textContent = '🔄 Recharger les pages Energysoft';
          forceReloadBtn.disabled = false;
        }, 2000);
      }
    });
  }

  // ===== BOUTON D'IMPORT DES DONNÉES =====
  if (importDataBtn) {
    importDataBtn.addEventListener('click', async function() {
      importDataBtn.textContent = '⏳ Import...';
      importDataBtn.disabled = true;
      
      try {
        // Forcer le rechargement des données
        const response = await chrome.runtime.sendMessage({action: 'forceReloadData'});
        console.log('[POPUP] Données importées:', response);
        
        if (response && response.success) {
          importDataBtn.textContent = '✅ Importé !';
          showStatus(`${response.count} interventions importées !`, 'success');
          
          // Notifier les autres pages de la mise à jour
          chrome.runtime.sendMessage({action: 'dataUpdated', type: 'interventions', count: response.count});
          
          // Recharger les statistiques
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          throw new Error(response ? response.error : 'Erreur inconnue');
        }
      } catch (error) {
        console.error('[POPUP] Erreur import:', error);
        importDataBtn.textContent = '❌ Erreur';
        showStatus('Erreur lors de l\'import', 'error');
        
        setTimeout(() => {
          importDataBtn.textContent = '📥 Importer les Données';
          importDataBtn.disabled = false;
        }, 2000);
      }
    });
  }

  // ===== AFFICHER LES STATISTIQUES =====
  chrome.storage.local.get(['interventionsData', 'currentAlarms'], function(result) {
    const interventionsCount = result.interventionsData ? result.interventionsData.length : 0;
    const alarmsCount = result.currentAlarms ? result.currentAlarms.length : 0;
    
    const statsDiv = document.getElementById('stats');
    if (statsDiv) {
      statsDiv.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Interventions :</span>
          <span class="stat-value">${interventionsCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Alarmes :</span>
          <span class="stat-value">${alarmsCount}</span>
        </div>
      `;
    }
  });
});