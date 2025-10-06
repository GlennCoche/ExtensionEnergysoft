// ===== AUTO FORM PV ULTIMATE - v3.2.6 OPTIMISÉ =====

(function() {
  // Protection contre les injections multiples
  if (window.autoFormPVLoaded) return;
  window.autoFormPVLoaded = true;

  // ===== CONFIGURATION =====
  const DEBUG_MODE = true; // Mode debug activable
  const DEBOUNCE_DELAY = 500; // Délai pour le debouncing (ms)

  // ===== FONCTION DE LOG CONDITIONNELLE =====
  function log(message, level = 'info') {
    if (!DEBUG_MODE) return;
    
    const prefix = '[AUTO-FORM-PV]';
    const timestamp = new Date().toLocaleTimeString();
    
    switch(level) {
      case 'error':
        console.error(`${prefix} [${timestamp}] ❌`, message);
        break;
      case 'warn':
        console.warn(`${prefix} [${timestamp}] ⚠️`, message);
        break;
      case 'success':
        console.log(`${prefix} [${timestamp}] ✅`, message);
        break;
      default:
        console.log(`${prefix} [${timestamp}]`, message);
    }
  }

  log('Extension chargée v3.2.6');

  // ===== VARIABLES GLOBALES =====
  let interventionsData = [];
  let isProcessing = false;
  let debounceTimer = null;

  // ===== CACHE DES INTERVENTIONS =====
  const interventionsCache = new Map();

  function getCachedIntervention(alarmName) {
    if (interventionsCache.has(alarmName)) {
      log(`Cache hit pour: ${alarmName}`, 'success');
      return interventionsCache.get(alarmName);
    }
    return null;
  }

  function setCachedIntervention(alarmName, intervention) {
    interventionsCache.set(alarmName, intervention);
    log(`Mise en cache: ${alarmName} -> ${intervention ? intervention.titre : 'null'}`);
  }

  function clearCache() {
    interventionsCache.clear();
    log('Cache vidé', 'warn');
  }

  // ===== EXPORT DEBUG =====
  function exportDebugData() {
    const debugData = {
      timestamp: new Date().toISOString(),
      version: '3.2.0',
      url: window.location.href,
      interventionsCount: interventionsData.length,
      cacheSize: interventionsCache.size,
      
      // Informations de la page
      pageInfo: {
        title: document.title,
        url: window.location.href,
        readyState: document.readyState
      },
      
      // Champs détectés
      fields: {
        site: extractSiteDebug(),
        titre: findTitreFieldDebug(),
        ticketParent: extractTicketParentDebug(),
        categorie: findCategorieFieldDebug(),
        dateEcheance: findDateEcheanceFieldDebug(),
        textareas: findTextareasDebug()
      },
      
      // Alarmes en storage
      storageAlarms: null,
      
      // Interventions chargées
      interventions: interventionsData.slice(0, 5), // 5 premières
      
      // DOM structure
      domStructure: {
        labels: Array.from(document.querySelectorAll('label')).map(l => l.textContent.trim()).slice(0, 20),
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          id: s.id,
          name: s.name,
          options: Array.from(s.options).map(o => o.textContent.trim()).slice(0, 10)
        })),
        inputs: Array.from(document.querySelectorAll('input[type="text"]')).map(i => ({
          id: i.id,
          name: i.name,
          value: i.value,
          readOnly: i.readOnly
        })).slice(0, 20)
      }
    };
    
    // Récupérer les alarmes du storage
    chrome.storage.local.get(['currentAlarms'], function(result) {
      debugData.storageAlarms = result.currentAlarms || [];
      
      // Télécharger le fichier
      const dataStr = JSON.stringify(debugData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auto-form-pv-debug-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      log('Export debug téléchargé', 'success');
    });
  }

  // Fonctions debug pour l'export
  function extractSiteDebug() {
    const siteField = findSiteField();
    return {
      found: !!siteField,
      value: siteField ? siteField.value : null,
      id: siteField ? siteField.id : null,
      name: siteField ? siteField.name : null
    };
  }

  function findTitreFieldDebug() {
    const titreField = findTitreField();
    return {
      found: !!titreField,
      value: titreField ? titreField.value : null,
      id: titreField ? titreField.id : null,
      type: titreField ? titreField.tagName : null
    };
  }

  function extractTicketParentDebug() {
    const alarmInfo = extractAlarmInfo();
    return {
      found: !!alarmInfo,
      number: alarmInfo ? alarmInfo.number : null,
      name: alarmInfo ? alarmInfo.name : null,
      fullText: alarmInfo ? alarmInfo.fullText : null
    };
  }

  function findCategorieFieldDebug() {
    const selects = document.querySelectorAll('select');
    return Array.from(selects).map(s => ({
      id: s.id,
      name: s.name,
      optionsCount: s.options.length,
      firstOptions: Array.from(s.options).slice(0, 5).map(o => o.textContent.trim())
    }));
  }

  function findDateEcheanceFieldDebug() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      if (label.textContent.toLowerCase().includes('échéance')) {
        return {
          found: true,
          labelText: label.textContent.trim(),
          forId: label.getAttribute('for')
        };
      }
    }
    return { found: false };
  }

  function findTextareasDebug() {
    const textareas = document.querySelectorAll('textarea');
    return Array.from(textareas).map((ta, index) => ({
      index: index,
      id: ta.id,
      name: ta.name,
      rows: ta.rows,
      value: ta.value ? ta.value.substring(0, 100) : '',
      hasMaintenanceText: ta.value ? ta.value.includes('Maintenance liée à l\'alarme') : false
    }));
  }


  // ===== DÉTECTION DE LA PAGE "NOUVELLE INTERVENTION" =====
  function isNouvelleInterventionPage() {
    const url = window.location.href;
    if (!url.includes('energysoft.app')) {
      return false;
    }
    
    const pageTitle = document.querySelector('h1, h2, h3, .page-title, .modal-title');
    if (pageTitle && pageTitle.textContent.includes('Nouvelle intervention')) {
      log('Page "Nouvelle intervention" détectée via titre');
      return true;
    }
    
    const hasSiteField = findSiteField() !== null;
    const hasTitreField = findTitreField() !== null;
    const hasTicketParent = findTicketParent() !== null;
    
    const isValid = hasSiteField && hasTitreField && hasTicketParent;
    
    if (isValid) {
      log('Page "Nouvelle intervention" détectée via champs');
    } else {
      log(`Champs manquants: Site=${hasSiteField}, Titre=${hasTitreField}, Ticket=${hasTicketParent}`, 'warn');
    }
    
    return isValid;
  }

  // ===== EXTRACTION DU CHAMP "SITE" =====
  function findSiteField() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      if (label.textContent.trim().toLowerCase() === 'site') {
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input) return input;
        }
        
        const parent = label.parentElement;
        if (parent) {
          const input = parent.querySelector('input[type="text"]');
          if (input) return input;
        }
      }
    }
    return null;
  }

  // ===== EXTRACTION DU SITE (NORMALISATION) =====
  function extractSite() {
    const siteField = findSiteField();
    if (siteField && siteField.value) {
      let site = siteField.value.trim();
      // Normaliser le séparateur (| ou |)
      site = site.replace(/\s*[\|│]\s*/g, ' | ');
      log(`Site extrait: ${site}`);
      return site;
    }
    log('Champ "Site" vide', 'warn');
    return null;
  }

  // ===== EXTRACTION DU TICKET PARENT =====
  function findTicketParent() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      if (label.textContent.trim().toLowerCase() === 'ticket parent') {
        let nextElement = label.nextElementSibling;
        while (nextElement) {
          const link = nextElement.querySelector('a');
          if (link && link.textContent.trim().startsWith('A-')) {
            return link;
          }
          nextElement = nextElement.nextElementSibling;
        }
      }
    }
    return null;
  }

  // ===== EXTRACTION DE L'ALARME DEPUIS LE TICKET PARENT =====
  function extractAlarmInfo() {
    const ticketLink = findTicketParent();
    if (!ticketLink) {
      log('Pas de ticket parent trouvé', 'warn');
      return null;
    }
    
    const ticketText = ticketLink.textContent.trim();
    const match = ticketText.match(/^(A-\d+)\s*-\s*(.+)$/);
    
    if (match) {
      const alarmNumber = match[1];
      const alarmName = match[2].trim();
      
      log(`Alarme extraite: ${alarmNumber} - ${alarmName}`, 'success');
      return {
        number: alarmNumber,
        name: alarmName,
        fullText: ticketText
      };
    }
    
    log('Format de ticket parent invalide', 'error');
    return null;
  }

  // ===== VALIDATION DE LA CORRESPONDANCE SITE (AMÉLIORÉE) =====
  function validateSiteMatch(alarmSite, formSite) {
    if (!alarmSite || !formSite || alarmSite === 'Inconnu') {
      log('Validation site: données manquantes ou Inconnu', 'warn');
      return true;
    }
    
    // Normaliser les sites (enlever espaces, séparateurs, mettre en minuscules)
    const normalizedAlarmSite = alarmSite.toLowerCase()
      .replace(/\s*[\|│]\s*/g, '')
      .replace(/\s+/g, '');
    const normalizedFormSite = formSite.toLowerCase()
      .replace(/\s*[\|│]\s*/g, '')
      .replace(/\s+/g, '');
    
    // Extraire le code site (ex: AP5424)
    const alarmCode = normalizedAlarmSite.match(/^[a-z]{2}\d+/);
    const formCode = normalizedFormSite.match(/^[a-z]{2}\d+/);
    
    if (alarmCode && formCode) {
      const match = alarmCode[0] === formCode[0];
      if (match) {
        log(`✅ Validation site OK: "${alarmSite}" ↔ "${formSite}"`, 'success');
      } else {
        log(`⚠️ Sites différents: Alarme="${alarmSite}" vs Formulaire="${formSite}"`, 'warn');
      }
      return match;
    }
    
    // Fallback: vérification par inclusion
    const match = normalizedAlarmSite.includes(normalizedFormSite) || 
                  normalizedFormSite.includes(normalizedAlarmSite);
    
    if (match) {
      log(`✅ Validation site OK (partielle): "${alarmSite}" ↔ "${formSite}"`, 'success');
    } else {
      log(`⚠️ Sites différents: Alarme="${alarmSite}" vs Formulaire="${formSite}"`, 'warn');
    }
    
    return match;
  }

  // ===== RECHERCHE D'UNE INTERVENTION PAR ALARME =====
  function findInterventionByAlarm(alarmInfo) {
    if (!alarmInfo || !interventionsData.length) {
      log('Recherche impossible: données manquantes', 'error');
      return null;
    }
    
    const alarmName = alarmInfo.name;
    
    const cached = getCachedIntervention(alarmName);
    if (cached !== null) {
      return cached;
    }
    
    log(`Recherche intervention pour: ${alarmName}`);
    
    let intervention = interventionsData.find(item => 
      item.alarme && item.alarme.toLowerCase() === alarmName.toLowerCase()
    );
    
    if (intervention) {
      log(`Correspondance exacte: ${intervention.titre}`, 'success');
      setCachedIntervention(alarmName, intervention);
      return intervention;
    }
    
    intervention = interventionsData.find(item => 
      item.alarme && alarmName.toLowerCase().includes(item.alarme.toLowerCase())
    );
    
    if (intervention) {
      log(`Correspondance partielle: ${intervention.titre}`, 'success');
      setCachedIntervention(alarmName, intervention);
      return intervention;
    }
    
    intervention = interventionsData.find(item => 
      item.alarme && item.alarme.toLowerCase().includes(alarmName.toLowerCase())
    );
    
    if (intervention) {
      log(`Correspondance inversée: ${intervention.titre}`, 'success');
      setCachedIntervention(alarmName, intervention);
      return intervention;
    }
    
    log(`Aucune intervention trouvée pour: ${alarmName}`, 'error');
    setCachedIntervention(alarmName, null);
    return null;
  }

  // ===== RECHERCHE DU CHAMP TITRE =====
  function findTitreField() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      if (label.textContent.trim().toLowerCase() === 'titre') {
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input && !input.readOnly) return input;
        }
      }
    }
    return null;
  }

  // ===== RECHERCHE DU SELECT CATÉGORIE =====
  function findCategorieSelect() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = label.textContent.trim().toLowerCase();
      if (text === 'catégorie' || text === 'categorie') {
        const forId = label.getAttribute('for');
        if (forId) {
          const select = document.getElementById(forId);
          if (select && select.tagName === 'SELECT') {
            log(`Select catégorie trouvé: ${select.id}`);
            return select;
          }
        }
        
        // Chercher dans le parent
        let parent = label.parentElement;
        if (parent) {
          const select = parent.querySelector('select');
          if (select) {
            log(`Select catégorie trouvé (via parent): ${select.id || 'no-id'}`);
            return select;
          }
        }
      }
    }
    
    // Fallback: chercher tous les selects et trouver celui avec des catégories
    const selects = document.querySelectorAll('select');
    for (const select of selects) {
      const options = Array.from(select.options).map(o => o.textContent.toLowerCase());
      if (options.some(o => o.includes('maintenance') || o.includes('curative') || o.includes('préventive'))) {
        log(`Select catégorie trouvé (fallback): ${select.id || 'no-id'}`);
        return select;
      }
    }
    
    log('Select catégorie non trouvé', 'warn');
    return null;
  }

  // ===== RECHERCHE DU CHAMP DATE D'ÉCHÉANCE =====
  function findDateEcheanceField() {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = label.textContent.trim().toLowerCase();
      if (text.includes('échéance') || text.includes('echeance')) {
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input) {
            log(`Champ date échéance trouvé: ${input.id}`);
            return input;
          }
        }
        
        // Chercher dans le parent
        const parent = label.parentElement;
        if (parent) {
          const input = parent.querySelector('input');
          if (input) {
            log(`Champ date échéance trouvé (via parent): ${input.id || 'no-id'}`);
            return input;
          }
        }
      }
    }
    
    log('Champ date échéance non trouvé', 'warn');
    return null;
  }

  // ===== REMPLISSAGE D'UN CHAMP =====
  function fillField(field, value) {
    if (!field || !value) return;
    
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // ===== ENRICHISSEMENT DU COMMENTAIRE AVEC DONNÉES D'ALARME =====
  function enrichCommentWithAlarmData(commentField, intervention, alarmInfo, site) {
    if (!commentField) {
      log('Enrichissement commentaire: champ manquant', 'warn');
      return;
    }
    
    // Vérifier que le contexte de l'extension est toujours valide
    if (!chrome.runtime || !chrome.runtime.id) {
      log('Contexte extension invalidé, arrêt du traitement', 'warn');
      return;
    }
    
    log('Champ commentaire laissé vide (pas de remplissage automatique)');
    
    // Laisser le champ vide - pas de remplissage automatique
    fillField(commentField, '');
    log('Commentaire laissé vide', 'success');
  }

  // ===== REMPLISSAGE AUTOMATIQUE DU FORMULAIRE =====
  function autoFillForm(intervention, alarmInfo, site) {
    if (!intervention) {
      log('Pas d\'intervention à remplir', 'warn');
      return;
    }
    
    log(`Remplissage automatique: ${intervention.titre}`);
    
    // Champ Titre
    const titreField = findTitreField();
    if (titreField) {
      fillField(titreField, intervention.titre);
      log('Titre rempli', 'success');
    } else {
      log('Champ Titre non trouvé', 'error');
    }
    
    setTimeout(() => {
      // Champ Catégorie
      const categorieSelect = findCategorieSelect();
      if (categorieSelect && intervention.categorie) {
        const options = categorieSelect.querySelectorAll('option');
        for (const option of options) {
          if (option.textContent.toLowerCase().includes(intervention.categorie.toLowerCase())) {
            categorieSelect.value = option.value;
            categorieSelect.dispatchEvent(new Event('change', { bubbles: true }));
            log(`Catégorie remplie: ${intervention.categorie}`, 'success');
            break;
          }
        }
      }
      
      // Date d'échéance (calculer la date si format "J + X")
      const dateEcheanceField = findDateEcheanceField();
      if (dateEcheanceField && intervention.echeance) {
        let dateValue = intervention.echeance;
        
        // Si format "J + 5" ou "J+5", calculer la date
        const match = dateValue.match(/J\s*\+\s*(\d+)/i);
        if (match) {
          const daysToAdd = parseInt(match[1]);
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + daysToAdd);
          
          // Format: JJ/MM/AAAA
          const day = String(futureDate.getDate()).padStart(2, '0');
          const month = String(futureDate.getMonth() + 1).padStart(2, '0');
          const year = futureDate.getFullYear();
          dateValue = `${day}/${month}/${year}`;
          
          log(`Date échéance calculée: ${intervention.echeance} → ${dateValue}`, 'success');
        }
        
        fillField(dateEcheanceField, dateValue);
        log(`Date échéance remplie: ${dateValue}`, 'success');
      }
      
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        log(`${textareas.length} textareas trouvés`);
        
        // Identifier les textareas par leur contenu ou position
        let descriptionField = null;
        let commentaireField = null;
        
        // Chercher le textarea "Description" (celui qui contient "Maintenance liée à l'alarme")
        for (let i = 0; i < textareas.length; i++) {
          const ta = textareas[i];
          const value = ta.value || '';
          
          // Si contient "Maintenance liée à l'alarme", c'est la description auto du formulaire
          if (value.includes('Maintenance liée à l\'alarme')) {
            descriptionField = ta;
            log(`Description trouvée: textarea[${i}]`);
          }
          
          // Si rows = 6, c'est probablement le commentaire
          if (ta.rows === 6 || ta.rows === '6') {
            commentaireField = ta;
            log(`Commentaire trouvé: textarea[${i}] (rows=6)`);
          }
        }
        
        // Fallback: utiliser les premiers textareas trouvés
        if (!descriptionField && textareas.length > 0) {
          descriptionField = textareas[0];
          log('Description fallback: textarea[0]');
        }
        
        if (!commentaireField && textareas.length > 1) {
          commentaireField = textareas[1];
          log('Commentaire fallback: textarea[1]');
        }
        
        // Remplir la Description
        if (descriptionField && intervention.descriptions && intervention.descriptions[0]) {
          fillField(descriptionField, intervention.descriptions[0]);
          log('Description remplie', 'success');
        }
        
        // Remplir le Commentaire
        if (commentaireField) {
          enrichCommentWithAlarmData(commentaireField, intervention, alarmInfo, site);
        }
      }, 500);
    }, 500);
  }

  // ===== PROCESSUS PRINCIPAL =====
  function processNouvelleIntervention() {
    if (isProcessing) {
      log('Traitement déjà en cours, ignoré');
      return;
    }
    
    isProcessing = true;
    log('=== DÉMARRAGE DU TRAITEMENT ===');
    
    if (!isNouvelleInterventionPage()) {
      log('Pas sur la page "Nouvelle intervention"', 'warn');
      isProcessing = false;
      return;
    }
    
    const site = extractSite();
    if (!site) {
      log('Champ "Site" vide, attente...', 'warn');
      isProcessing = false;
      return;
    }
    
    const alarmInfo = extractAlarmInfo();
    if (!alarmInfo) {
      log('Pas d\'alarme détectée', 'error');
      isProcessing = false;
      return;
    }
    
    const intervention = findInterventionByAlarm(alarmInfo);
    if (!intervention) {
      log(`Aucune intervention trouvée pour: ${alarmInfo.name}`, 'error');
      isProcessing = false;
      return;
    }
    
    autoFillForm(intervention, alarmInfo, site);
    
    log('=== TRAITEMENT TERMINÉ ===', 'success');
    isProcessing = false;
  }

  // ===== PROCESSUS AVEC DEBOUNCING =====
  function debouncedProcess() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      log('Timer debounce annulé');
    }
    
    debounceTimer = setTimeout(() => {
      log('Timer debounce déclenché');
      processNouvelleIntervention();
    }, DEBOUNCE_DELAY);
  }

  // ===== CHARGEMENT DES DONNÉES =====
  function loadInterventionsData() {
    chrome.storage.local.get(['interventionsData'], function(result) {
      if (chrome.runtime.lastError) {
        log(`Erreur chargement: ${chrome.runtime.lastError.message}`, 'error');
        return;
      }
      
      if (result.interventionsData && result.interventionsData.length > 0) {
        interventionsData = result.interventionsData;
        log(`${interventionsData.length} interventions chargées`, 'success');
        
        clearCache();
        
        setTimeout(debouncedProcess, 1000);
      } else {
        log('Aucune donnée chargée', 'warn');
      }
    });
  }

  // ===== ÉCOUTE DES MISES À JOUR DE DONNÉES =====
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.interventionsData) {
      log('Données mises à jour - rechargement', 'warn');
      location.reload();
    }
  });

  // ===== OBSERVER LES CHANGEMENTS DU DOM (AVEC DEBOUNCING) =====
  const observer = new MutationObserver(() => {
    const siteField = findSiteField();
    if (siteField && siteField.value && !isProcessing) {
      log('Champ "Site" détecté, relance du traitement (debounced)');
      debouncedProcess();
    }
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value']
    });
    log('Observer DOM activé');
  }

  // ===== DÉMARRAGE =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadInterventionsData();
    });
  } else {
    loadInterventionsData();
  }
})();