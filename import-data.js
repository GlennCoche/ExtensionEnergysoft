// ===== SCRIPT D'IMPORT DES DONNÉES =====
// Ce script importe le fichier config_interventions_export.json dans le storage de l'extension

(async function() {
  console.log('🔄 [IMPORT] Début de l\'import des données...');
  
  try {
    // Charger le fichier JSON
    const response = await fetch('./config_interventions_export.json');
    const interventionsData = await response.json();
    
    console.log(`📦 [IMPORT] ${interventionsData.length} interventions chargées depuis le fichier JSON`);
    
    // Sauvegarder dans le storage de l'extension
    await chrome.storage.local.set({ 
      interventionsData: interventionsData,
      lastImport: new Date().toISOString(),
      importCount: interventionsData.length
    });
    
    console.log('✅ [IMPORT] Données sauvegardées dans le storage de l\'extension');
    console.log('📊 [IMPORT] Statistiques:');
    console.log(`   - Interventions: ${interventionsData.length}`);
    
    // Calculer les codes uniques
    const uniqueTitres = new Set(interventionsData.map(i => i.titre)).size;
    console.log(`   - Codes uniques: ${uniqueTitres}`);
    
    // Calculer les catégories
    const categories = [...new Set(interventionsData.map(i => i.categorie))];
    console.log(`   - Catégories: ${categories.join(', ')}`);
    
    // Calculer les sévérités
    const severites = [...new Set(interventionsData.map(i => i.severite))];
    console.log(`   - Sévérités: ${severites.join(', ')}`);
    
    // Afficher quelques exemples
    console.log('📋 [IMPORT] Exemples d\'interventions:');
    interventionsData.slice(0, 3).forEach((intervention, index) => {
      console.log(`   ${index + 1}. ${intervention.alarme} → ${intervention.titre} (${intervention.severite})`);
    });
    
    console.log('🎉 [IMPORT] Import terminé avec succès !');
    console.log('💡 [IMPORT] Rechargez la page des paramètres pour voir les données.');
    
  } catch (error) {
    console.error('❌ [IMPORT] Erreur lors de l\'import:', error);
  }
})();
