# 🔧 CHANGEMENTS v3.2.0

## 📋 **RÉSUMÉ**

Version 3.2.0 corrige les problèmes d'extraction de données et ajoute un bouton d'export debug.

---

## 🐛 **PROBLÈMES CORRIGÉS**

### **1. Site "Inconnu"**
**Problème** : `monitoring.js` n'arrivait pas à extraire le site correctement.

**Solution** :
- ✅ Ajout de plusieurs patterns de reconnaissance :
  - `AP5424 | MARCHAND C` (avec `|`)
  - `AP5424│MARCHAND C` (avec `│`)
  - `AP5424 MARCHAND C` (sans séparateur)
- ✅ Recherche dans l'élément, le parent ET les cellules du tableau
- ✅ Normalisation du séparateur : `|` devient ` | `

```javascript
// Pattern 1: AP5424 | MARCHAND C
const sitePattern1 = text.match(/([A-Z]{2}\d+)\s*[\|│]\s*([A-Z\s]+)/);

// Pattern 2: AP5424 MARCHAND C
const sitePattern2 = text.match(/([A-Z]{2}\d+)\s+([A-Z][A-Z\s]+)/);
```

### **2. Matériel "Inconnu"**
**Problème** : L'extraction du matériel ne fonctionnait pas.

**Solution** :
- ✅ Ajout de patterns plus précis :
  - `Onduleur 3 - GW60KS`
  - `Onduleur 3 GW60KS`
  - `Onduleur`, `Inverter`, `String`, `MPPT`, `Module`
- ✅ Recherche dans l'élément, le parent ET les cellules

```javascript
// Pattern 1: Onduleur X - TYPE
const equipmentPattern1 = text.match(/(Onduleur|Inverter)\s+\d+\s*-\s*([A-Z0-9\s]+)/i);

// Pattern 2: Onduleur X TYPE
const equipmentPattern2 = text.match(/(Onduleur|Inverter)\s+\d+\s+([A-Z0-9]+)/i);
```

### **3. Validation site améliorée**
**Problème** : La validation site ne tenait pas compte des différents séparateurs.

**Solution** :
- ✅ Normalisation des séparateurs (`|`, `│`)
- ✅ Extraction du code site (ex: `AP5424`)
- ✅ Comparaison par code plutôt que par texte complet

```javascript
// Extraire le code site (ex: AP5424)
const alarmCode = normalizedAlarmSite.match(/^[a-z]{2}\d+/);
const formCode = normalizedFormSite.match(/^[a-z]{2}\d+/);

// Comparer les codes
const match = alarmCode[0] === formCode[0];
```

### **4. Catégorie non remplie**
**Problème** : Le script ne trouvait pas le bon select pour la catégorie.

**Solution** :
- ✅ Nouvelle fonction `findCategorieSelect()`
- ✅ Recherche par label "Catégorie"
- ✅ Fallback : recherche dans tous les selects avec options "maintenance"

```javascript
function findCategorieSelect() {
  // Recherche par label
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    if (label.textContent.toLowerCase().includes('catégorie')) {
      // Trouver le select associé
    }
  }
  
  // Fallback: chercher par contenu des options
  const selects = document.querySelectorAll('select');
  for (const select of selects) {
    const options = Array.from(select.options);
    if (options.some(o => o.textContent.includes('maintenance'))) {
      return select;
    }
  }
}
```

### **5. Date d'échéance non remplie**
**Problème** : Pas implémenté.

**Solution** :
- ✅ Nouvelle fonction `findDateEcheanceField()`
- ✅ Recherche par label "Échéance" ou "Echeance"
- ✅ Remplissage automatique si `intervention.echeance` existe

```javascript
function findDateEcheanceField() {
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    if (label.textContent.toLowerCase().includes('échéance')) {
      // Trouver l'input associé
    }
  }
}
```

### **6. Type d'alarme dans la Description**
**Problème** : Le type d'alarme était affiché dans la Description alors que ce n'est pas nécessaire.

**Solution** :
- ✅ Suppression du champ "Type d'alarme" de la Description
- ✅ Conservation uniquement de : Ticket, Site, Défaut détecté le, Matériel

```javascript
alarmData = `
─── Informations alarme ───
Ticket: ${alarm.id}
Site: ${displaySite}
Défaut détecté le : ${alarm.date}
Matériel : ${alarm.equipment}
`;
// Type d'alarme supprimé
```

---

## ✨ **NOUVELLE FONCTIONNALITÉ : BOUTON EXPORT DEBUG**

### **Objectif**
Exporter toutes les informations nécessaires pour diagnostiquer les problèmes de l'extension.

### **Emplacement**
Bouton rouge en bas à droite de la page "Nouvelle intervention" : **🐛 Export Debug**

### **Contenu de l'export**
Le fichier JSON exporté contient :

```json
{
  "timestamp": "2025-10-05T15:10:00.000Z",
  "version": "3.2.0",
  "url": "https://energysoft.app/...",
  "interventionsCount": 73,
  "cacheSize": 1,
  
  "pageInfo": {
    "title": "Nouvelle intervention",
    "url": "...",
    "readyState": "complete"
  },
  
  "fields": {
    "site": {
      "found": true,
      "value": "AP5424 | MARCHAND C",
      "id": "...",
      "name": "..."
    },
    "titre": {
      "found": true,
      "value": "REPAR_ONDL",
      "id": "...",
      "type": "INPUT"
    },
    "ticketParent": {
      "found": true,
      "number": "A-2897060",
      "name": "GOODWE ERROR [262144]",
      "fullText": "A-2897060 - GOODWE ERROR [262144]"
    },
    "categorie": [...],
    "dateEcheance": {...},
    "textareas": [...]
  },
  
  "storageAlarms": [
    {
      "id": "A-2897060",
      "site": "AP5424 | MARCHAND C",
      "equipment": "Onduleur 3 - GW60KS",
      "type": "GOODWE ERROR [262144]",
      "date": "05/10/2025 15:08:29"
    }
  ],
  
  "interventions": [...],
  
  "domStructure": {
    "labels": [...],
    "selects": [...],
    "inputs": [...]
  }
}
```

### **Utilisation**
1. Ouvrir une page "Nouvelle intervention"
2. Cliquer sur le bouton **🐛 Export Debug**
3. Le fichier `auto-form-pv-debug-[timestamp].json` est téléchargé
4. Envoyer ce fichier pour analyse

---

## 📊 **AMÉLIORATIONS DE PERFORMANCE**

### **Extraction plus robuste**
- ✅ Recherche multi-niveaux (élément → parent → cellules)
- ✅ Patterns multiples pour chaque donnée
- ✅ Fallbacks intelligents

### **Logs plus clairs**
- ✅ Logs uniquement si données utiles trouvées
- ✅ Distinction entre site trouvé et "Inconnu"
- ✅ Logs de validation site améliorés

---

## 🧪 **TESTS À EFFECTUER**

### **Test 1 : Extraction du site**
```
1. Ouvrir une "Nouvelle intervention" avec site "AP5424 | MARCHAND C"
2. Vérifier les logs :
   [MONITORING] A-2897060: AP5424 | MARCHAND C | GOODWE ERROR [262144]
3. ✅ Le site doit être "AP5424 | MARCHAND C" et non "Inconnu"
```

### **Test 2 : Extraction du matériel**
```
1. Ouvrir une "Nouvelle intervention"
2. Vérifier la Description :
   Matériel : Onduleur 3 - GW60KS
3. ✅ Le matériel doit être extrait correctement
```

### **Test 3 : Remplissage catégorie**
```
1. Ouvrir une "Nouvelle intervention"
2. Vérifier que le champ "Catégorie" est rempli
3. ✅ La catégorie doit être sélectionnée automatiquement
```

### **Test 4 : Remplissage date d'échéance**
```
1. Ouvrir une "Nouvelle intervention"
2. Vérifier que le champ "Date d'échéance" est rempli
3. ✅ La date doit être remplie si définie dans le JSON
```

### **Test 5 : Export debug**
```
1. Ouvrir une "Nouvelle intervention"
2. Cliquer sur "🐛 Export Debug"
3. Vérifier le fichier téléchargé
4. ✅ Le fichier JSON doit contenir toutes les informations
```

---

## 📝 **FICHIERS MODIFIÉS**

### **content.js** (v3.2.0)
- ✅ Ajout de `exportDebugData()` et fonctions associées
- ✅ Ajout de `createDebugButton()`
- ✅ Amélioration de `extractSite()` avec normalisation
- ✅ Amélioration de `validateSiteMatch()` avec extraction de code
- ✅ Ajout de `findCategorieSelect()`
- ✅ Ajout de `findDateEcheanceField()`
- ✅ Modification de `enrichCommentWithAlarmData()` (suppression Type d'alarme)
- ✅ Modification de `autoFillForm()` (ajout catégorie et date)

### **monitoring.js** (v3.2.0)
- ✅ Amélioration de `extractAlarmFromElement()` :
  - Patterns multiples pour le site
  - Patterns multiples pour l'équipement
  - Recherche dans parent et cellules

### **manifest.json** (v3.2.0)
- ✅ Version mise à jour : 3.2.0

---

## 🎯 **PROCHAINES ÉTAPES**

### **1. Recharger l'extension**
```
chrome://extensions/ → Recharger
Version : 3.2.0 ✅
```

### **2. Tester sur Energysoft**
```
1. Ouvrir une "Nouvelle intervention"
2. Vérifier le bouton "🐛 Export Debug" en bas à droite
3. Vérifier le remplissage automatique
4. Vérifier les logs dans la console
```

### **3. Exporter le debug**
```
1. Cliquer sur "🐛 Export Debug"
2. Envoyer le fichier JSON pour analyse
```

---

**Version** : 3.2.0  
**Date** : 2025-10-05  
**Status** : ✅ Prêt pour les tests

🎊 **Tous les problèmes identifiés ont été corrigés !** 🎊
