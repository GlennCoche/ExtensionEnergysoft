// ===== CONTENT.JS v3.2.7 - CORRECTIONS BOUCLE + GPA + SEVERITE =====

(function() {
  if (window.autoFormPVLoaded) return;
  window.autoFormPVLoaded = true;

  // ===== CONFIGURATION =====
  const DEBUG_MODE = true;
  const DEBOUNCE_DELAY = 500;
  
  // ===== FLAGS =====
  let isProcessing = false;
  let pageAlreadyProcessed = false; // NOUVEAU: Empêcher re-traitement
  let debounceTimer = null;
  let observer = null;
  let interventionsCache = new Map();
  let interventionsData = [];

  // ===== LOGGING =====
  function log(message, level = 'info') {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[AUTO-FORM-PV] [${timestamp}]`;
    
    switch(level) {
      case 'error': console.error(prefix, message); break;
      case 'warn': console.warn(prefix, message); break;
      case 'success': console.log(`%c${prefix} ${message}`, 'color: #4CAF50; font-weight: bold'); break;
      default: console.log(prefix, message);
    }
  }

  log('Extension chargée v3.2.7');

  // ===== DETECTION PAGE =====
  function isNouvelleInterventionPage() {
    const titleField = findTitleField();
    const hasRequiredFields = titleField !== null;
    
    if (hasRequiredFields) {
      log('Page "Nouvelle intervention" détectée via champs');
      return true;
    }
    return false;
  }

  // ===== RECHERCHE CHAMPS =====
  function findTitleField() {
    const inputs = document.querySelectorAll('input[type="text"]');
    for (let input of inputs) {
      const label = findLabelForInput(input);
      if (label && label.textContent.includes('Titre')) {
        return input;
      }
    }
    return null;
  }

  function findSiteField() {
    const inputs = document.querySelectorAll('input[type="text"]');
    for (let input of inputs) {
      const label = findLabelForInput(input);
      if (label && label.textContent.includes('Site')) {
        return input;
      }
    }
    return null;
  }

  function findCategorieSelect() {
    const labels = Array.from(document.querySelectorAll('label'));
    const categorieLabel = labels.find(l => l.textContent.includes('Catégorie'));
    
    if (categorieLabel) {
      const select = categorieLabel.parentElement.querySelector('select');
      if (select) {
        log(`Select catégorie trouvé: ${select.id || 'no-id'}`);
        return select;
      }
    }
    
    return null;
  }

  function findSeveriteSelect() {
    // Méthode 1: Par label
    const labels = Array.from(document.querySelectorAll('label'));
    const severiteLabel = labels.find(l => 
      l.textContent.includes('Sévérité') || 
      l.textContent.includes('Severité') ||
      l.textContent.includes('Severite')
    );
    
    if (severiteLabel) {
      const select = severiteLabel.parentElement.querySelector('select');
      if (select) {
        log(`Select sévérité trouvé via label: ${select.id || 'no-id'}`);
        return select;
      }
    }
    
    // Méthode 2: Chercher un select avec les bonnes options
    const allSelects = document.querySelectorAll('select');
    for (let select of allSelects) {
      const options = Array.from(select.options).map(o => o.text.toLowerCase());
      if (options.some(o => 
        o.includes('normal') || 
        o.includes('urgent') || 
        o.includes('haut') ||
        o.includes('bas')
      )) {
        log(`Select sévérité trouvé via options: ${select.id || 'no-id'}`);
        log(`Options disponibles: ${Array.from(select.options).map(o => o.text).join(', ')}`);
        return select;
      }
    }
    
    log('❌ Select sévérité non trouvé', 'warn');
    return null;
  }

  function findDateEcheanceField() {
    const inputs = document.querySelectorAll('input[type="text"]');
    
    for (let input of inputs) {
      const label = findLabelForInput(input);
      if (label && label.textContent.includes("Date d'échéance")) {
        log(`Champ date échéance trouvé (via label): ${input.id || 'no-id'}`);
        return input;
      }
      
      const parent = input.parentElement;
      if (parent && parent.textContent.includes("Date d'échéance")) {
        log(`Champ date échéance trouvé (via parent): ${input.id || 'no-id'}`);
        return input;
      }
    }
    
    return null;
  }

  function findLabelForInput(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label;
    }
    
    let parent = input.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      const label = parent.querySelector('label');
      if (label) return label;
      parent = parent.parentElement;
    }
    
    return null;
  }

  // ===== EXTRACTION DONNEES =====
  function extractSite() {
    const siteField = findSiteField();
    if (!siteField || !siteField.value) return null;
    
    const site = siteField.value.trim();
    log(`Site extrait: ${site}`);
    return site;
  }

  function extractAlarm() {
    const allText = document.body.textContent;
    const alarmMatch = allText.match(/A-\d+\s*-\s*([^\n]+)/);
    
    if (alarmMatch) {
      const alarmInfo = {
        id: alarmMatch[0].match(/A-\d+/)[0],
        name: alarmMatch[1].trim()
      };
      log(`✅ Alarme extraite: ${alarmInfo.id} - ${alarmInfo.name}`, 'success');
      return alarmInfo;
    }
    
    log('❌ Aucune alarme trouvée', 'warn');
    return null;
  }

  // ===== CORRESPONDANCE INTERVENTION =====
  function findInterventionByAlarm(alarmInfo) {
    if (!alarmInfo || !alarmInfo.name) return null;
    
    const cacheKey = alarmInfo.name;
    if (interventionsCache.has(cacheKey)) {
      log(`✅ Cache hit pour: ${cacheKey}`, 'success');
      return interventionsCache.get(cacheKey);
    }
    
    log(`Recherche intervention pour: ${alarmInfo.name}`);
    
    // Recherche exacte
    for (let intervention of interventionsData) {
      if (intervention.alarms) {
        for (let alarmPattern of intervention.alarms) {
          if (alarmInfo.name.includes(alarmPattern)) {
            log(`✅ Correspondance exacte: ${intervention.code}`, 'success');
            interventionsCache.set(cacheKey, intervention);
            log(`Mise en cache: ${cacheKey} -> ${intervention.code}`);
            return intervention;
          }
        }
      }
    }
    
    log(`❌ Aucune correspondance trouvée pour: ${alarmInfo.name}`, 'warn');
    interventionsCache.set(cacheKey, null);
    return null;
  }

  // ===== REMPLISSAGE CHAMPS =====
  function fillField(field, value) {
    if (!field || !value) return;
    
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillSeverite(severite) {
    const select = findSeveriteSelect();
    if (!select) {
      log('❌ Select sévérité non trouvé', 'error');
      return false;
    }
    
    log(`Tentative de remplissage sévérité: ${severite}`);
    
    // Chercher l'option correspondante
    const option = Array.from(select.options).find(o => {
      const optionText = o.text.toLowerCase();
      const targetText = severite.toLowerCase();
      return optionText.includes(targetText) || o.value.toLowerCase().includes(targetText);
    });
    
    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('blur', { bubbles: true }));
      log(`✅ Sévérité remplie: ${severite} (option: ${option.text})`, 'success');
      return true;
    }
    
    log(`❌ Option sévérité "${severite}" non trouvée dans: ${Array.from(select.options).map(o => o.text).join(', ')}`, 'error');
    return false;
  }

  function calculateDeadline(echeanceStr) {
    const match = echeanceStr.match(/J\+(\d+)/);
    if (!match) return null;
    
    const days = parseInt(match[1]);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    
    const day = String(deadline.getDate()).padStart(2, '0');
    const month = String(deadline.getMonth() + 1).padStart(2, '0');
    const year = deadline.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  function autoFillForm(intervention, alarmInfo, site) {
    log(`Remplissage automatique: ${intervention.code}`);
    
    // 1. Titre
    const titleField = findTitleField();
    if (titleField && intervention.titles && intervention.titles[0]) {
      fillField(titleField, intervention.titles[0]);
      log('✅ Titre rempli', 'success');
      
      // Créer le bouton GPA après remplissage du titre
      setTimeout(() => createGPAButton(), 100);
    }
    
    // 2. Catégorie
    setTimeout(() => {
      const categorieSelect = findCategorieSelect();
      if (categorieSelect && intervention.categorie) {
        const option = Array.from(categorieSelect.options).find(o => 
          o.text.includes(intervention.categorie)
        );
        if (option) {
          categorieSelect.value = option.value;
          categorieSelect.dispatchEvent(new Event('change', { bubbles: true }));
          log(`✅ Catégorie remplie: ${intervention.categorie}`, 'success');
        }
      }
      
      // 3. Sévérité
      if (intervention.severite) {
        setTimeout(() => fillSeverite(intervention.severite), 200);
      }
      
      // 4. Date d'échéance
      const dateField = findDateEcheanceField();
      if (dateField && intervention.echeance) {
        const calculatedDate = calculateDeadline(intervention.echeance);
        if (calculatedDate) {
          fillField(dateField, calculatedDate);
          log(`✅ Date échéance calculée: ${intervention.echeance} → ${calculatedDate}`, 'success');
          log(`✅ Date échéance remplie: ${calculatedDate}`, 'success');
        }
      }
      
      // 5. Description et Commentaire
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        log(`${textareas.length} textareas trouvés`);
        
        let descriptionField = null;
        let commentaireField = null;
        
        for (let i = 0; i < textareas.length; i++) {
          const ta = textareas[i];
          const value = ta.value || '';
          
          if (value.includes('Maintenance liée à l\'alarme')) {
            descriptionField = ta;
            log(`Description trouvée: textarea[${i}]`);
          }
          
          if (ta.rows === 6 || ta.rows === '6') {
            commentaireField = ta;
            log(`Commentaire trouvé: textarea[${i}] (rows=6)`);
          }
        }
        
        if (!descriptionField && textareas.length > 0) {
          descriptionField = textareas[0];
          log('Description fallback: textarea[0]');
        }
        
        if (!commentaireField && textareas.length > 1) {
          commentaireField = textareas[1];
          log('Commentaire fallback: textarea[1]');
        }
        
        if (descriptionField && intervention.descriptions && intervention.descriptions[0]) {
          fillField(descriptionField, intervention.descriptions[0]);
          log('✅ Description remplie', 'success');
        }
        
        if (commentaireField) {
          log('Champ commentaire laissé vide (pas de remplissage automatique)');
          log('✅ Commentaire laissé vide', 'success');
        }
      }, 500);
    }, 500);
  }

  // ===== BOUTON GPA =====
  function createGPAButton() {
    const titleField = findTitleField();
    if (!titleField) return;
    
    // Vérifier si le bouton existe déjà
    if (document.getElementById('gpa-button')) return;
    
    const button = document.createElement('button');
    button.id = 'gpa-button';
    button.textContent = 'GPA';
    button.style.cssText = `
      position: absolute;
      top: -35px;
      left: 0;
      background: #FFD700;
      color: #000;
      border: 2px solid #FFA500;
      border-radius: 4px;
      padding: 6px 16px;
      font-weight: bold;
      cursor: pointer;
      z-index: 9999;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = '#FFA500';
      button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = '#FFD700';
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const currentValue = titleField.value;
      if (!currentValue.endsWith('_GPA')) {
        titleField.value = currentValue + '_GPA';
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('change', { bubbles: true }));
        log('✅ _GPA ajouté au titre: ' + titleField.value, 'success');
        
        // Animation de feedback
        button.textContent = '✓';
        button.style.background = '#4CAF50';
        setTimeout(() => {
          button.textContent = 'GPA';
          button.style.background = '#FFD700';
        }, 1000);
      } else {
        log('_GPA déjà présent dans le titre', 'info');
      }
    });
    
    // S'assurer que le parent a position relative
    const parent = titleField.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.insertBefore(button, titleField);
      log('✅ Bouton GPA créé', 'success');
    }
  }

  // ===== BOUTON DEBUG =====
  function createDebugButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('debug-export-button')) return;
    
    const button = document.createElement('button');
    button.id = 'debug-export-button';
    button.textContent = '🐛 Debug Export';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      cursor: pointer;
      z-index: 99999;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = '#1976D2';
      button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = '#2196F3';
      button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', exportDebugInfo);
    document.body.appendChild(button);
    log('✅ Bouton Debug créé', 'success');
  }

  function exportDebugInfo() {
    const debug = {
      timestamp: new Date().toISOString(),
      version: '3.2.7',
      url: location.href,
      pageProcessed: pageAlreadyProcessed,
      fields: {
        title: {
          value: findTitleField()?.value || 'NON TROUVÉ',
          element: findTitleField() ? 'TROUVÉ' : 'NON TROUVÉ'
        },
        site: {
          value: extractSite() || 'NON TROUVÉ',
          element: findSiteField() ? 'TROUVÉ' : 'NON TROUVÉ'
        },
        categorie: {
          value: findCategorieSelect()?.value || 'NON TROUVÉ',
          selectedText: findCategorieSelect()?.selectedOptions[0]?.text || 'NON TROUVÉ',
          element: findCategorieSelect() ? 'TROUVÉ' : 'NON TROUVÉ'
        },
        severite: {
          value: findSeveriteSelect()?.value || 'NON TROUVÉ',
          selectedText: findSeveriteSelect()?.selectedOptions[0]?.text || 'NON TROUVÉ',
          element: findSeveriteSelect() ? 'TROUVÉ' : 'NON TROUVÉ',
          allOptions: findSeveriteSelect() ? 
            Array.from(findSeveriteSelect().options).map(o => ({ value: o.value, text: o.text })) : []
        },
        dateEcheance: {
          value: findDateEcheanceField()?.value || 'NON TROUVÉ',
          element: findDateEcheanceField() ? 'TROUVÉ' : 'NON TROUVÉ'
        }
      },
      alarm: extractAlarm() || 'NON TROUVÉ',
      allSelects: Array.from(document.querySelectorAll('select')).map((s, idx) => ({
        index: idx,
        id: s.id || 'no-id',
        name: s.name || 'no-name',
        className: s.className,
        value: s.value,
        selectedText: s.selectedOptions[0]?.text || '',
        options: Array.from(s.options).map(o => ({
          value: o.value,
          text: o.text
        }))
      })),
      allTextareas: Array.from(document.querySelectorAll('textarea')).map((ta, idx) => ({
        index: idx,
        id: ta.id || 'no-id',
        name: ta.name || 'no-name',
        rows: ta.rows,
        value: ta.value.substring(0, 100) + (ta.value.length > 100 ? '...' : '')
      })),
      interventionsDataCount: interventionsData.length,
      cacheSize: interventionsCache.size
    };
    
    const blob = new Blob([JSON.stringify(debug, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-form-pv-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    log('✅ Debug exporté', 'success');
    console.log('Debug info:', debug);
  }

  // ===== PROCESSUS PRINCIPAL =====
  function processNouvelleIntervention() {
    // NOUVEAU: Vérifier si déjà traité
    if (isProcessing || pageAlreadyProcessed) {
      log('Page déjà traitée, arrêt', 'info');
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
    
    const alarmInfo = extractAlarm();
    if (!alarmInfo) {
      log('❌ Aucune alarme trouvée', 'error');
      isProcessing = false;
      return;
    }
    
    const intervention = findInterventionByAlarm(alarmInfo);
    if (!intervention) {
      log('❌ Aucune intervention correspondante', 'warn');
      isProcessing = false;
      return;
    }
    
    autoFillForm(intervention, alarmInfo, site);
    
    // NOUVEAU: Marquer comme traité et arrêter l'observer
    pageAlreadyProcessed = true;
    if (observer) {
      observer.disconnect();
      log('✅ Observer arrêté - Page traitée avec succès', 'success');
    }
    
    log('✅ === TRAITEMENT TERMINÉ ===', 'success');
    isProcessing = false;
  }

  // ===== OBSERVER DOM =====
  function setupObserver() {
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver(() => {
      // Ne pas traiter si déjà fait
      if (pageAlreadyProcessed) return;
      
      const siteField = findSiteField();
      if (siteField && siteField.value && !isProcessing) {
        log('Champ "Site" détecté, relance du traitement (debounced)');
        
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          log('Timer debounce annulé');
        }
        
        debounceTimer = setTimeout(() => {
          log('Timer debounce déclenché');
          processNouvelleIntervention();
        }, DEBOUNCE_DELAY);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value']
    });
    
    log('Observer DOM activé');
  }

  // ===== DETECTION CHANGEMENT PAGE =====
  let lastUrl = location.href;
  function checkUrlChange() {
    if (location.href !== lastUrl) {
      log(`Changement d'URL détecté: ${lastUrl} → ${location.href}`);
      lastUrl = location.href;
      pageAlreadyProcessed = false; // NOUVEAU: Réinitialiser pour nouvelle page
      interventionsCache.clear();
      setupObserver();
      
      if (isNouvelleInterventionPage()) {
        setTimeout(processNouvelleIntervention, 1000);
        createDebugButton(); // Créer bouton debug sur nouvelle page
      }
    }
  }
  
  setInterval(checkUrlChange, 1000);

  // ===== CHARGEMENT DONNEES =====
  chrome.storage.local.get(['interventionsData'], (result) => {
    if (result.interventionsData && result.interventionsData.length > 0) {
      interventionsData = result.interventionsData;
      log(`✅ ${interventionsData.length} interventions chargées`, 'success');
      
      if (isNouvelleInterventionPage()) {
        setupObserver();
        setTimeout(processNouvelleIntervention, 1000);
        createDebugButton();
      }
    } else {
      log('❌ Aucune donnée d\'intervention trouvée', 'error');
    }
  });

  log('Extension initialisée');
})();
