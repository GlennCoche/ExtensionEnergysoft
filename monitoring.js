// ===== MONITORING.JS - Surveillance des alarmes Energysoft v3.2.0 =====

(function() {
  if (window.monitoringLoaded) return;
  window.monitoringLoaded = true;

  console.log('[MONITORING] Script de surveillance chargé v3.2.0');

  // ===== CONFIGURATION =====
  const CHECK_INTERVAL = 30 * 1000; // 30 secondes
  
  let currentAlarms = [];

  // ===== EXTRACTION DES ALARMES DEPUIS LE DOM =====
  function extractAlarms() {
    const alarms = [];
    
    const allText = document.body.textContent;
    const alarmMatches = allText.match(/A-\d+/g);
    
    if (!alarmMatches) {
      console.log('[MONITORING] Aucune alarme trouvée');
      return alarms;
    }
    
    const uniqueAlarms = [...new Set(alarmMatches)];
    console.log(`[MONITORING] ${uniqueAlarms.length} alarmes uniques trouvées`);
    
    uniqueAlarms.forEach(alarmId => {
      const element = findSmallestElementContaining(alarmId);
      if (element) {
        const alarm = extractAlarmFromElement(element, alarmId);
        if (alarm) {
          alarms.push(alarm);
        }
      }
    });
    
    console.log(`[MONITORING] ${alarms.length} alarmes extraites avec succès`);
    return alarms;
  }

  // ===== TROUVER LE PLUS PETIT ÉLÉMENT CONTENANT UN TEXTE =====
  function findSmallestElementContaining(text) {
    const allElements = document.querySelectorAll('*');
    let smallestElement = null;
    let smallestLength = Infinity;
    
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      const elementText = element.textContent;
      
      if (elementText && elementText.includes(text)) {
        const tag = element.tagName;
        
        if (tag === 'BODY' || tag === 'HTML' || tag === 'MAIN') continue;
        
        const length = elementText.length;
        if (length < smallestLength && length < 500) {
          smallestElement = element;
          smallestLength = length;
        }
      }
    }
    
    return smallestElement;
  }

  // ===== EXTRACTION DEPUIS UN ÉLÉMENT (AMÉLIORÉE) =====
  function extractAlarmFromElement(element, alarmId) {
    try {
      const text = element.textContent.trim();
      
      // Extraire le type d'alarme
      const typeMatch = text.match(new RegExp(`${alarmId}\\s*-\\s*([^\\n]+?)(?:\\n|$)`, 'i'));
      let type = typeMatch ? typeMatch[1].trim() : 'Inconnu';
      type = type.replace(/\s+/g, ' ').trim();
      
      // AMÉLIORATION: Extraire le site avec plusieurs patterns
      let site = 'Inconnu';
      
      // Pattern 1: AP5424 | MARCHAND C ou AP5424│MARCHAND C
      const sitePattern1 = text.match(/([A-Z]{2}\d+)\s*[\|│]\s*([A-Z\s]+)/);
      if (sitePattern1) {
        site = `${sitePattern1[1]} | ${sitePattern1[2].trim()}`;
      } else {
        // Pattern 2: AP5424 MARCHAND C (sans séparateur)
        const sitePattern2 = text.match(/([A-Z]{2}\d+)\s+([A-Z][A-Z\s]+)/);
        if (sitePattern2) {
          site = `${sitePattern2[1]} | ${sitePattern2[2].trim()}`;
        }
      }
      
      // AMÉLIORATION: Extraire l'équipement avec plus de patterns
      let equipment = 'Inconnu';
      
      // Pattern 1: Onduleur X - TYPE
      const equipmentPattern1 = text.match(/(Onduleur|Inverter)\s+\d+\s*-\s*([A-Z0-9\s]+)/i);
      if (equipmentPattern1) {
        equipment = `${equipmentPattern1[1]} ${equipmentPattern1[2].trim()}`;
      } else {
        // Pattern 2: Onduleur X TYPE
        const equipmentPattern2 = text.match(/(Onduleur|Inverter)\s+\d+\s+([A-Z0-9]+)/i);
        if (equipmentPattern2) {
          equipment = `${equipmentPattern2[1]} ${equipmentPattern2[2]}`;
        } else {
          // Pattern 3: Juste "Onduleur" ou "Inverter"
          const equipmentPattern3 = text.match(/(Onduleur|Inverter|String|MPPT|Module)[^\n]*/i);
          if (equipmentPattern3) {
            equipment = equipmentPattern3[0].trim();
          }
        }
      }
      
      // Extraire la date
      const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4}(?:\s+\d{2}:\d{2}(?::\d{2})?)?)/);
      const date = dateMatch ? dateMatch[1] : new Date().toLocaleString('fr-FR');
      
      // Chercher dans le parent pour plus d'infos
      const parent = element.parentElement;
      if (parent) {
        const parentText = parent.textContent;
        
        // Re-chercher le site dans le parent si pas trouvé
        if (site === 'Inconnu') {
          const parentSitePattern1 = parentText.match(/([A-Z]{2}\d+)\s*[\|│]\s*([A-Z\s]+)/);
          if (parentSitePattern1) {
            site = `${parentSitePattern1[1]} | ${parentSitePattern1[2].trim()}`;
          } else {
            const parentSitePattern2 = parentText.match(/([A-Z]{2}\d+)\s+([A-Z][A-Z\s]+)/);
            if (parentSitePattern2) {
              site = `${parentSitePattern2[1]} | ${parentSitePattern2[2].trim()}`;
            }
          }
        }
        
        // Re-chercher l'équipement dans le parent si pas trouvé
        if (equipment === 'Inconnu') {
          const parentEquipmentPattern1 = parentText.match(/(Onduleur|Inverter)\s+\d+\s*-\s*([A-Z0-9\s]+)/i);
          if (parentEquipmentPattern1) {
            equipment = `${parentEquipmentPattern1[1]} ${parentEquipmentPattern1[2].trim()}`;
          } else {
            const parentEquipmentPattern2 = parentText.match(/(Onduleur|Inverter|String|MPPT|Module)[^\n]*/i);
            if (parentEquipmentPattern2) {
              equipment = parentEquipmentPattern2[0].trim();
            }
          }
        }
      }
      
      // Chercher dans les cellules du tableau
      const cells = element.querySelectorAll('td, .gwt-Label, .gwt-HTML, div');
      cells.forEach(cell => {
        const cellText = cell.textContent.trim();
        
        // Chercher le site dans les cellules
        if (site === 'Inconnu') {
          if (cellText.match(/^[A-Z]{2}\d+\s*[\|│]/)) {
            site = cellText.replace(/\s*[\|│]\s*/g, ' | ');
          }
        }
        
        // Chercher l'équipement dans les cellules
        if (equipment === 'Inconnu') {
          if (cellText.match(/Onduleur|Inverter|String|MPPT|Module/i)) {
            equipment = cellText;
          }
        }
      });
      
      const alarm = {
        id: alarmId,
        timestamp: Date.now(),
        site: site,
        equipment: equipment,
        type: type,
        severity: 'Normal',
        status: 'Active',
        date: date
      };
      
      // Log uniquement si on a trouvé des infos utiles
      if (site !== 'Inconnu' || equipment !== 'Inconnu') {
        console.log(`[MONITORING] ${alarmId}: ${site} | ${type}`);
      }
      
      return alarm;
    } catch (error) {
      console.error('[MONITORING] Erreur extraction:', error);
      return null;
    }
  }

  // ===== COMPARAISON DES ALARMES =====
  function compareAlarms(oldAlarms, newAlarms) {
    const oldIds = oldAlarms.map(a => a.id);
    const newIds = newAlarms.map(a => a.id);
    
    const added = newAlarms.filter(a => !oldIds.includes(a.id));
    const resolved = oldAlarms.filter(a => !newIds.includes(a.id));
    
    return { added, resolved };
  }

  // ===== VÉRIFICATION DES CHANGEMENTS =====
  function checkForChanges() {
    const newAlarms = extractAlarms();
    const changes = compareAlarms(currentAlarms, newAlarms);
    
    if (changes.added.length > 0 || changes.resolved.length > 0) {
      console.log('[MONITORING] Changements détectés');
      console.log(`Nouvelles: ${changes.added.length}, Résolues: ${changes.resolved.length}`);
      
      currentAlarms = newAlarms;
      
      try {
        chrome.storage.local.set({ 
          currentAlarms: currentAlarms,
          lastUpdate: Date.now()
        });
        console.log('[MONITORING] Alarmes sauvegardées');
      } catch (error) {
        console.log('[MONITORING] Erreur sauvegarde:', error);
      }
    }
  }

  // ===== GESTION DES MESSAGES =====
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAlarms') {
      sendResponse({
        success: true,
        alarms: currentAlarms,
        count: currentAlarms.length
      });
      return true;
    }
    
    if (request.action === 'forceCheck') {
      checkForChanges();
      sendResponse({ success: true });
      return true;
    }
  });

  // ===== FONCTION SAFE GET STORAGE =====
  function safeGetStorage(keys, callback) {
    try {
      chrome.storage.local.get(keys, function(result) {
        if (chrome.runtime.lastError) {
          console.log('[MONITORING] Extension context invalidated');
          return;
        }
        callback(result);
      });
    } catch (error) {
      console.log('[MONITORING] Extension context invalidated');
      return;
    }
  }

  // ===== DÉMARRAGE DU MONITORING =====
  function startMonitoring() {
    console.log('[MONITORING] Démarrage...');
    
    safeGetStorage(['currentAlarms'], function(result) {
      if (!result) return;
      
      if (result.currentAlarms && result.currentAlarms.length > 0) {
        currentAlarms = result.currentAlarms;
        console.log(`[MONITORING] ${currentAlarms.length} alarmes chargées`);
      }
      
      setTimeout(() => {
        checkForChanges();
      }, 2000);
      
      setInterval(checkForChanges, CHECK_INTERVAL);
    });
  }

  // ===== INITIALISATION =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startMonitoring, 2000);
    });
  } else {
    setTimeout(startMonitoring, 2000);
  }

  console.log('[MONITORING] Script prêt');
})();