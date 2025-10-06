# 🔄 Mise à Jour Configuration - v3.2.4

## 📝 **CONFIGURATION À JOUR**

Le fichier `config_interventions_export.json` a été remplacé par la version la plus récente exportée depuis l'extension.

### **Fichier Source :**
- **Nom** : `config_interventions_export_1759681276995.json`
- **Date** : 5 octobre 2025, 18:21
- **Taille** : 37 KB
- **Contenu** : Configuration complète et à jour des interventions

### **Fichier de Destination :**
- **Nom** : `config_interventions_export.json`
- **Rôle** : Fichier chargé par défaut par l'extension
- **Emplacement** : Racine du dossier de l'extension

---

## 🔧 **FONCTIONNEMENT**

### **Chargement Automatique :**

L'extension charge automatiquement le fichier `config_interventions_export.json` dans les cas suivants :

#### **1. Installation de l'Extension**
```javascript
// background.js
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const defaultData = await loadDefaultConfig();
    chrome.storage.local.set({ interventionsData: defaultData });
  }
});
```

#### **2. Mise à Jour de l'Extension**
```javascript
if (details.reason === 'update') {
  const defaultData = await loadDefaultConfig();
  chrome.storage.local.set({ interventionsData: defaultData });
}
```

#### **3. Bouton "Importer les Données" dans le Popup**
```javascript
// popup.js
importDataBtn.addEventListener('click', async function() {
  const response = await chrome.runtime.sendMessage({action: 'forceReloadData'});
  // Charge config_interventions_export.json
});
```

#### **4. Bouton "Forcer Import" dans les Settings**
```javascript
// options.js
function forceReloadFromStorage() {
  chrome.storage.local.get(['interventionsData'], function(result) {
    // Recharge les données depuis le storage
  });
}
```

---

## 📊 **CONTENU DE LA CONFIGURATION**

### **Statistiques :**
- **Interventions** : 73
- **Codes Uniques** : ~8
- **Catégories** : Maintenance Curative
- **Sévérités** : Normal, Haut, Urgent, Bas

### **Exemples d'Interventions :**

1. **Défaut onduleur Huawei**
   - Titre : `DIAG_ONDL`
   - Catégorie : Maintenance Curative
   - Sévérité : Normal
   - Échéance : J+7

2. **Alerte voisinage**
   - Titre : `DIAG_SITE`
   - Catégorie : Maintenance Curative
   - Sévérité : Normal
   - Échéance : J+7

3. **Webdyn hors tension**
   - Titre : `REARM_AGCP`
   - Catégorie : Maintenance Curative
   - Sévérité : Urgent
   - Échéance : J+3

4. **GOODWE ERROR [4096]**
   - Titre : `REPAR_ONDL`
   - Catégorie : Maintenance Curative
   - Sévérité : Haut
   - Échéance : J+5

---

## 🚀 **DÉPLOIEMENT**

### **Étapes pour Appliquer la Nouvelle Configuration :**

#### **Méthode 1 : Recharger l'Extension**
1. **Aller** dans `chrome://extensions/`
2. **Trouver** "Auto Form PV Ultimate"
3. **Cliquer** sur "Recharger" (🔄)
4. **Résultat** : La nouvelle configuration est chargée automatiquement

#### **Méthode 2 : Bouton "Importer les Données"**
1. **Cliquer** sur l'icône de l'extension
2. **Cliquer** sur "📥 Importer les Données"
3. **Attendre** le message de confirmation
4. **Résultat** : 73 interventions importées

#### **Méthode 3 : Bouton "Forcer Import"**
1. **Ouvrir** les Settings de l'extension
2. **Cliquer** sur "📥 Forcer Import"
3. **Vérifier** le message de confirmation
4. **Résultat** : Données rechargées depuis le storage

---

## ✅ **VÉRIFICATION**

### **Après le Rechargement :**

#### **Popup :**
- [ ] Affiche "73 Interventions"
- [ ] Affiche "0 Alarmes" (ou nombre d'alarmes actives)

#### **Settings - Onglet Interventions :**
- [ ] Affiche "73 Interventions"
- [ ] Affiche "8 Codes Uniques"
- [ ] Tableau rempli avec 73 lignes
- [ ] Toutes les interventions sont visibles

#### **Console :**
```
[BACKGROUND] 73 interventions chargées
[BACKGROUND] 73 interventions sauvegardées dans le storage
[SETTINGS] 73 interventions chargées
```

---

## 📋 **GESTION DES VERSIONS**

### **Fichiers de Configuration :**

1. **config_interventions_export.json**
   - ✅ **Fichier actif** : Chargé par l'extension
   - ✅ **Mis à jour** : 5 octobre 2025, 18:24
   - ✅ **Contenu** : 73 interventions

2. **config_interventions_export_1759681276995.json**
   - ✅ **Backup** : Version exportée
   - ✅ **Date** : 5 octobre 2025, 18:21
   - ✅ **Utilité** : Sauvegarde de la configuration

### **Bonnes Pratiques :**

#### **Avant de Modifier :**
1. **Exporter** la configuration actuelle
2. **Sauvegarder** le fichier avec timestamp
3. **Modifier** la configuration
4. **Tester** les modifications

#### **Après Modification :**
1. **Exporter** la nouvelle configuration
2. **Remplacer** `config_interventions_export.json`
3. **Recharger** l'extension
4. **Vérifier** que tout fonctionne

---

## 🔄 **SYNCHRONISATION**

### **Workflow de Mise à Jour :**

```
1. Modifier les interventions dans Settings
   ↓
2. Cliquer sur "📤 Exporter JSON"
   ↓
3. Fichier téléchargé : config_interventions_export_[timestamp].json
   ↓
4. Remplacer config_interventions_export.json
   ↓
5. Recharger l'extension
   ↓
6. Configuration à jour chargée automatiquement
```

---

## 🎯 **AVANTAGES**

### **Configuration Par Défaut :**
- ✅ **Chargement automatique** : Au démarrage de l'extension
- ✅ **Pas de configuration manuelle** : Prêt à l'emploi
- ✅ **Données à jour** : Toujours la dernière version
- ✅ **Facilité de mise à jour** : Un seul fichier à remplacer

### **Gestion Simplifiée :**
- ✅ **Export facile** : Bouton dans l'interface
- ✅ **Import automatique** : Au rechargement
- ✅ **Backup automatique** : Fichiers avec timestamp
- ✅ **Traçabilité** : Historique des versions

---

## 📝 **COMMANDES UTILES**

### **Remplacer le Fichier de Configuration :**
```bash
cp config_interventions_export_[timestamp].json config_interventions_export.json
```

### **Sauvegarder la Configuration Actuelle :**
```bash
cp config_interventions_export.json config_interventions_export_backup_$(date +%s).json
```

### **Vérifier les Fichiers :**
```bash
ls -lh config_interventions_export*.json
```

---

## ✅ **STATUT**

**Version** : v3.2.4

**Configuration :**
- ✅ **Fichier mis à jour** : `config_interventions_export.json`
- ✅ **73 interventions** : Prêtes à l'emploi
- ✅ **Chargement automatique** : Fonctionnel
- ✅ **Export/Import** : Opérationnel

**Résultat :**
- ✅ **Extension prête** : Configuration à jour
- ✅ **Données cohérentes** : Entre Settings et formulaires
- ✅ **Facilité de mise à jour** : Un seul fichier à remplacer

**🎊 La configuration de l'extension est maintenant à jour et chargée automatiquement ! 🎊**
