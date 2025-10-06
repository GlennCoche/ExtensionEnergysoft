// ===== OPTIONS.JS - GESTION COMPLÈTE DES INTERVENTIONS =====

let interventionsData = [];
let currentAlarms = [];
let editingIndex = -1;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('⚙️ [SETTINGS] Page de configuration chargée v3.2.3');
  
  loadInterventions();
  loadAlarms();
  loadSettings();
  setupEventListeners();
  setupButtonListeners();
});

// ===== GESTION DES ONGLETS =====
function showTab(tabName) {
  // Masquer tous les onglets
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Désactiver tous les boutons d'onglet
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Afficher l'onglet sélectionné
  document.getElementById(tabName).classList.add('active');
  
  // Activer le bouton d'onglet correspondant
  const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Recharger les données selon l'onglet
  if (tabName === 'interventions') {
    loadInterventions();
  } else if (tabName === 'alarms') {
    loadAlarms();
  }
}

// ===== CHARGEMENT DES DONNÉES =====
function loadInterventions() {
  console.log('🔄 [SETTINGS] Chargement des interventions...');
  
  chrome.storage.local.get(['interventionsData'], function(result) {
    console.log('📊 [SETTINGS] Résultat du storage:', {
      hasData: !!result.interventionsData,
      length: result.interventionsData ? result.interventionsData.length : 0,
      firstItem: result.interventionsData ? result.interventionsData[0] : null
    });
    
    if (result.interventionsData && result.interventionsData.length > 0) {
      interventionsData = result.interventionsData;
      console.log(`✅ [SETTINGS] ${interventionsData.length} interventions chargées`);
    } else {
      interventionsData = [];
      console.log('📦 [SETTINGS] Aucune donnée chargée');
    }
    
    updateStats();
    renderInterventionsTable();
  });
}

function loadAlarms() {
  chrome.storage.local.get(['currentAlarms'], function(result) {
    if (result.currentAlarms && result.currentAlarms.length > 0) {
      currentAlarms = result.currentAlarms;
      console.log(`🚨 [SETTINGS] ${currentAlarms.length} alarmes chargées`);
    } else {
      currentAlarms = [];
      console.log('📦 [SETTINGS] Aucune alarme chargée');
    }
    
    updateAlarmStats();
    renderAlarmsTable();
  });
}

function loadSettings() {
  chrome.storage.local.get(['extensionSettings'], function(result) {
    const settings = result.extensionSettings || {
      debugMode: true,
      debounceDelay: 500,
      fillTitre: true,
      fillCategorie: true,
      fillDateEcheance: true,
      fillDescription: true,
      fillCommentaire: true,
      enrichCommentaire: true
    };
    
    document.getElementById('debugMode').value = settings.debugMode.toString();
    document.getElementById('debounceDelay').value = settings.debounceDelay;
    document.getElementById('fillTitre').checked = settings.fillTitre;
    document.getElementById('fillCategorie').checked = settings.fillCategorie;
    document.getElementById('fillDateEcheance').checked = settings.fillDateEcheance;
    document.getElementById('fillDescription').checked = settings.fillDescription;
    document.getElementById('fillCommentaire').checked = settings.fillCommentaire;
    document.getElementById('enrichCommentaire').checked = settings.enrichCommentaire;
  });
}

// ===== SAUVEGARDE DES DONNÉES =====
function saveInterventions() {
  chrome.storage.local.set({ interventionsData: interventionsData }, function() {
    if (chrome.runtime.lastError) {
      console.error('❌ [SETTINGS] Erreur sauvegarde:', chrome.runtime.lastError);
      showAlert('Erreur lors de la sauvegarde', 'danger');
    } else {
      console.log('✅ [SETTINGS] Interventions sauvegardées');
      updateStats();
      renderInterventionsTable();
      showAlert('Interventions sauvegardées avec succès', 'success');
    }
  });
}

function saveSettings() {
  const settings = {
    debugMode: document.getElementById('debugMode').value === 'true',
    debounceDelay: parseInt(document.getElementById('debounceDelay').value),
    fillTitre: document.getElementById('fillTitre').checked,
    fillCategorie: document.getElementById('fillCategorie').checked,
    fillDateEcheance: document.getElementById('fillDateEcheance').checked,
    fillDescription: document.getElementById('fillDescription').checked,
    fillCommentaire: document.getElementById('fillCommentaire').checked,
    enrichCommentaire: document.getElementById('enrichCommentaire').checked
  };
  
  chrome.storage.local.set({ extensionSettings: settings }, function() {
    if (chrome.runtime.lastError) {
      console.error('❌ [SETTINGS] Erreur sauvegarde paramètres:', chrome.runtime.lastError);
      showAlert('Erreur lors de la sauvegarde des paramètres', 'danger');
    } else {
      console.log('✅ [SETTINGS] Paramètres sauvegardés');
      showAlert('Paramètres sauvegardés avec succès', 'success');
    }
  });
}

// ===== MISE À JOUR DES STATISTIQUES =====
function updateStats() {
  const totalInterventions = interventionsData.length;
  const uniqueTitres = new Set(interventionsData.map(i => i.titre)).size;
  
  document.getElementById('totalInterventions').textContent = totalInterventions;
  document.getElementById('totalCodes').textContent = uniqueTitres;
}

function updateAlarmStats() {
  const activeAlarms = currentAlarms.filter(a => a.status === 'Active').length;
  const resolvedAlarms = currentAlarms.filter(a => a.status === 'Resolved').length;
  
  document.getElementById('totalAlarmsActive').textContent = activeAlarms;
  document.getElementById('totalAlarmsResolved').textContent = resolvedAlarms;
  document.getElementById('totalAlarmes').textContent = activeAlarms;
}

// ===== AFFICHAGE DU TABLEAU INTERVENTIONS =====
function renderInterventionsTable() {
  const tbody = document.getElementById('interventionsTableBody');
  tbody.innerHTML = '';
  
  if (interventionsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucune intervention configurée.</td></tr>';
    return;
  }
  
  interventionsData.forEach((intervention, index) => {
    const row = tbody.insertRow();
    
    // Alarme
    const alarmeCell = row.insertCell();
    alarmeCell.textContent = intervention.alarme || 'N/A';
    
    // Titre
    const titreCell = row.insertCell();
    titreCell.textContent = intervention.titre || 'N/A';
    
    // Catégorie
    const categorieCell = row.insertCell();
    categorieCell.textContent = intervention.categorie || 'N/A';
    
    // Sévérité
    const severiteCell = row.insertCell();
    const severity = intervention.severite || 'N/A';
    const badgeClass = severity === 'Haut' ? 'badge-danger' : 
                      severity === 'Moyen' ? 'badge-warning' : 'badge-success';
    severiteCell.innerHTML = `<span class="badge ${badgeClass}">${severity}</span>`;
    
    // Échéance
    const echeanceCell = row.insertCell();
    echeanceCell.textContent = intervention.echeance || 'N/A';
    
    // Actions
    const actionsCell = row.insertCell();
    actionsCell.innerHTML = `
      <div class="btn-group">
        <button class="btn btn-warning btn-sm btn-edit" data-index="${index}" title="Modifier">
          ✏️
        </button>
        <button class="btn btn-danger btn-sm btn-delete" data-index="${index}" title="Supprimer">
          🗑️
        </button>
      </div>
    `;
  });
  
  // Ajouter les event listeners pour les boutons d'action
  attachActionButtonListeners();
}

// ===== ATTACHER LES EVENT LISTENERS AUX BOUTONS D'ACTION =====
function attachActionButtonListeners() {
  // Boutons Modifier
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      editIntervention(index);
    });
  });
  
  // Boutons Supprimer
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      deleteIntervention(index);
    });
  });
}

// ===== AFFICHAGE DU TABLEAU ALARMES =====
function renderAlarmsTable() {
  const tbody = document.getElementById('alarmsTableBody');
  tbody.innerHTML = '';
  
  if (currentAlarms.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aucune alarme active.</td></tr>';
    return;
  }
  
  currentAlarms.forEach(alarm => {
    const row = tbody.insertRow();
    
    // ID
    const idCell = row.insertCell();
    idCell.textContent = alarm.id || 'N/A';
    
    // Site
    const siteCell = row.insertCell();
    siteCell.textContent = alarm.site || 'Inconnu';
    
    // Type
    const typeCell = row.insertCell();
    typeCell.textContent = alarm.type || 'Inconnu';
    
    // Matériel
    const equipmentCell = row.insertCell();
    equipmentCell.textContent = alarm.equipment || 'Inconnu';
    
    // Date
    const dateCell = row.insertCell();
    dateCell.textContent = alarm.date || 'N/A';
    
    // Statut
    const statusCell = row.insertCell();
    const status = alarm.status || 'Active';
    const badgeClass = status === 'Active' ? 'badge-danger' : 'badge-success';
    statusCell.innerHTML = `<span class="badge ${badgeClass}">${status}</span>`;
  });
}

// ===== GESTION DES INTERVENTIONS =====
function showAddModal() {
  editingIndex = -1;
  document.getElementById('modalTitle').textContent = 'Ajouter Intervention';
  document.getElementById('interventionForm').reset();
  document.getElementById('interventionModal').style.display = 'block';
}

function editIntervention(index) {
  editingIndex = index;
  const intervention = interventionsData[index];
  
  document.getElementById('modalTitle').textContent = 'Modifier Intervention';
  document.getElementById('modalAlarme').value = intervention.alarme || '';
  document.getElementById('modalTitre').value = intervention.titre || '';
  document.getElementById('modalCategorie').value = intervention.categorie || 'Maintenance Curative';
  document.getElementById('modalSeverite').value = intervention.severite || 'Haut';
  document.getElementById('modalEcheance').value = intervention.echeance || '';
  document.getElementById('modalPriorite').value = intervention.priorite || 'Normale';
  document.getElementById('modalDescription1').value = intervention.descriptions ? intervention.descriptions[0] || '' : '';
  document.getElementById('modalDescription2').value = intervention.descriptions ? intervention.descriptions[1] || '' : '';
  document.getElementById('modalDescription3').value = intervention.descriptions ? intervention.descriptions[2] || '' : '';
  
  document.getElementById('interventionModal').style.display = 'block';
}

function deleteIntervention(index) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
    interventionsData.splice(index, 1);
    saveInterventions();
    showAlert('Intervention supprimée', 'success');
  }
}

function closeModal() {
  document.getElementById('interventionModal').style.display = 'none';
  editingIndex = -1;
}

// ===== CONFIGURATION DES EVENT LISTENERS POUR LES BOUTONS =====
function setupButtonListeners() {
  // Onglets
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      showTab(tabName);
    });
  });
  
  // Boutons Interventions
  const btnShowAddModal = document.getElementById('btnShowAddModal');
  if (btnShowAddModal) btnShowAddModal.addEventListener('click', showAddModal);
  
  const btnImportJSON = document.getElementById('btnImportJSON');
  if (btnImportJSON) btnImportJSON.addEventListener('click', importJSON);
  
  const btnExportJSON = document.getElementById('btnExportJSON');
  if (btnExportJSON) btnExportJSON.addEventListener('click', exportJSON);
  
  const btnReloadData = document.getElementById('btnReloadData');
  if (btnReloadData) btnReloadData.addEventListener('click', reloadData);
  
  const btnForceReload = document.getElementById('btnForceReload');
  if (btnForceReload) btnForceReload.addEventListener('click', forceReloadFromStorage);
  
  // Boutons Alarmes
  const btnRefreshAlarms = document.getElementById('btnRefreshAlarms');
  if (btnRefreshAlarms) btnRefreshAlarms.addEventListener('click', refreshAlarms);
  
  const btnExportAlarms = document.getElementById('btnExportAlarms');
  if (btnExportAlarms) btnExportAlarms.addEventListener('click', exportAlarms);
  
  const btnClearAlarms = document.getElementById('btnClearAlarms');
  if (btnClearAlarms) btnClearAlarms.addEventListener('click', clearAlarms);
  
  // Boutons Paramètres
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);
  
  const btnResetSettings = document.getElementById('btnResetSettings');
  if (btnResetSettings) btnResetSettings.addEventListener('click', resetSettings);
  
  // Boutons Modal
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  
  const btnCancelModal = document.getElementById('btnCancelModal');
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
  
  // Barre de recherche
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('keyup', filterTable);
  
  console.log('✅ [SETTINGS] Event listeners configurés');
}

// ===== GESTION DU FORMULAIRE =====
function setupEventListeners() {
  document.getElementById('interventionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveInterventionForm();
  });
  
  // Fermer le modal en cliquant à l'extérieur
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('interventionModal');
    if (e.target === modal) {
      closeModal();
    }
  });
}

function saveInterventionForm() {
  const formData = {
    alarme: document.getElementById('modalAlarme').value.trim(),
    titre: document.getElementById('modalTitre').value.trim(),
    categorie: document.getElementById('modalCategorie').value,
    severite: document.getElementById('modalSeverite').value,
    echeance: document.getElementById('modalEcheance').value.trim(),
    priorite: document.getElementById('modalPriorite').value,
    descriptions: [
      document.getElementById('modalDescription1').value.trim(),
      document.getElementById('modalDescription2').value.trim(),
      document.getElementById('modalDescription3').value.trim()
    ]
  };
  
  // Validation
  if (!formData.alarme || !formData.titre) {
    showAlert('L\'alarme et le titre sont obligatoires', 'danger');
    return;
  }
  
  if (editingIndex === -1) {
    // Ajouter
    interventionsData.push(formData);
    showAlert('Intervention ajoutée avec succès', 'success');
  } else {
    // Modifier
    interventionsData[editingIndex] = formData;
    showAlert('Intervention modifiée avec succès', 'success');
  }
  
  saveInterventions();
  closeModal();
}

// ===== GESTION DES ALARMES =====
function refreshAlarms() {
  chrome.runtime.sendMessage({ action: 'forceCheck' }, function(response) {
    if (response && response.success) {
      loadAlarms();
      showAlert('Alarmes actualisées', 'success');
    } else {
      showAlert('Erreur lors de l\'actualisation des alarmes', 'danger');
    }
  });
}

function exportAlarms() {
  const dataStr = JSON.stringify(currentAlarms, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alarmes_export_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showAlert('Alarmes exportées', 'success');
}

function clearAlarms() {
  if (confirm('Êtes-vous sûr de vouloir vider le cache des alarmes ?')) {
    chrome.storage.local.remove(['currentAlarms'], function() {
      loadAlarms();
      showAlert('Cache des alarmes vidé', 'success');
    });
  }
}

// ===== IMPORT/EXPORT =====
function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData)) {
            interventionsData = importedData;
            saveInterventions();
            showAlert('Configuration importée avec succès', 'success');
          } else {
            showAlert('Fichier JSON invalide. Assurez-vous qu\'il contient un tableau.', 'danger');
          }
        } catch (error) {
          console.error('Erreur lecture JSON:', error);
          showAlert('Erreur lors de la lecture du fichier JSON', 'danger');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function exportJSON() {
  const dataStr = JSON.stringify(interventionsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `config_interventions_export_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showAlert('Configuration exportée', 'success');
}

function reloadData() {
  loadInterventions();
  loadAlarms();
  showAlert('Données rechargées', 'success');
}

function forceReloadFromStorage() {
  console.log('🔄 [SETTINGS] Forçage du rechargement depuis le storage...');
  
  // Vérifier le contenu du storage
  chrome.storage.local.get(['interventionsData', 'importCount', 'lastImport'], function(result) {
    console.log('📊 [SETTINGS] Contenu du storage:', {
      interventionsData: result.interventionsData ? result.interventionsData.length : 0,
      importCount: result.importCount,
      lastImport: result.lastImport
    });
    
    if (result.interventionsData && result.interventionsData.length > 0) {
      console.log(`✅ [SETTINGS] ${result.interventionsData.length} interventions trouvées dans le storage`);
      loadInterventions();
      showAlert(`${result.interventionsData.length} interventions chargées depuis le storage !`, 'success');
    } else {
      console.log('❌ [SETTINGS] Aucune donnée trouvée dans le storage');
      showAlert('Aucune donnée trouvée dans le storage. Utilisez le bouton "Importer JSON".', 'error');
    }
  });
}

// ===== RECHERCHE ET FILTRAGE =====
function filterTable() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#interventionsTableBody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// ===== PARAMÈTRES =====
function resetSettings() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
    document.getElementById('debugMode').value = 'true';
    document.getElementById('debounceDelay').value = '500';
    document.getElementById('fillTitre').checked = true;
    document.getElementById('fillCategorie').checked = true;
    document.getElementById('fillDateEcheance').checked = true;
    document.getElementById('fillDescription').checked = true;
    document.getElementById('fillCommentaire').checked = true;
    document.getElementById('enrichCommentaire').checked = true;
    showAlert('Paramètres réinitialisés', 'success');
  }
}

// ===== UTILITAIRES =====
function showAlert(message, type) {
  // Supprimer les alertes existantes
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  // Créer la nouvelle alerte
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  // Insérer au début du contenu
  const activeTab = document.querySelector('.tab-content.active');
  activeTab.insertBefore(alert, activeTab.firstChild);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// ===== ÉCOUTE DES CHANGEMENTS DE STORAGE =====
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local') {
    if (changes.interventionsData) {
      console.log('🔄 [SETTINGS] Données interventions mises à jour, rechargement...');
      loadInterventions();
    }
    if (changes.currentAlarms) {
      console.log('🔄 [SETTINGS] Données alarmes mises à jour, rechargement...');
      loadAlarms();
    }
  }
});

// ===== ÉCOUTE DES MESSAGES DE MISE À JOUR =====
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'dataUpdated') {
    console.log(`🔄 [SETTINGS] Mise à jour reçue: ${request.type} - ${request.count} éléments`);
    
    if (request.type === 'interventions') {
      loadInterventions();
      showAlert(`${request.count} interventions mises à jour !`, 'success');
    } else if (request.type === 'alarms') {
      loadAlarms();
      showAlert(`${request.count} alarmes mises à jour !`, 'success');
    }
    
    sendResponse({success: true});
  }
});

console.log('✅ [SETTINGS] Script de gestion chargé');