# 🚀 Guide de Démarrage - Auto Form PV Ultimate v3.0.1

## 📦 **INSTALLATION**

### **1. Charger l'extension dans Chrome**
```
1. Ouvrir Chrome
2. Aller sur chrome://extensions/
3. Activer le "Mode développeur" (en haut à droite)
4. Cliquer sur "Charger l'extension non empaquetée"
5. Sélectionner le dossier "auto-form-pv-ultimate (1)"
6. ✅ L'extension est installée !
```

### **2. Vérifier l'installation**
```
✅ Icône de l'extension visible dans la barre d'outils
✅ Version affichée : 3.0.1
✅ Pas d'erreurs dans la console
```

---

## ⚙️ **CONFIGURATION**

### **1. Importer le fichier de configuration**
```
1. Cliquer sur l'icône de l'extension
2. Cliquer sur "⚙️ Ouvrir les Settings"
3. Cliquer sur "📥 Importer un fichier JSON"
4. Sélectionner "config_interventions_export.json"
5. ✅ Interventions importées !
```

### **2. Vérifier les données**
```
✅ Nombre d'interventions affichées
✅ Tableau des interventions visible
✅ Statistiques à jour
```

---

## 🎯 **UTILISATION**

### **Scénario 1 : Nouvelle intervention avec alarme**

#### **Étape 1 : Ouvrir Energysoft**
```
1. Aller sur https://energysoft.app
2. Se connecter
3. Naviguer vers la page de monitoring
```

#### **Étape 2 : Créer une nouvelle intervention**
```
1. Sélectionner une alarme (ex: A-2896967 - GOODWE ERROR [262144])
2. Cliquer sur "Nouvelle intervention"
3. ✅ La page "Nouvelle intervention" s'ouvre
```

#### **Étape 3 : Attendre le remplissage automatique**
```
1. Le champ "Site" se remplit automatiquement (ex: AP5424 | MARCHAND C)
2. ⏳ L'extension détecte le site et l'alarme
3. ✅ Le formulaire se remplit automatiquement :
   - Titre : REPAR_ONDL
   - Catégorie : Maintenance Curative
   - Description 1 : (texte automatique)
   - Description 2 : (texte automatique)
   - Commentaire : (texte + infos alarme)
```

#### **Étape 4 : Vérifier et valider**
```
1. Vérifier que toutes les informations sont correctes
2. Modifier si nécessaire
3. Valider l'intervention
4. ✅ Terminé !
```

---

## 🔍 **DIAGNOSTIC**

### **Vérifier les logs dans la console**
```
1. Appuyer sur F12 (ouvrir la console développeur)
2. Aller dans l'onglet "Console"
3. Filtrer par "[AUTO-FORM-PV]"
4. Observer les logs :
   ✅ Extension chargée
   ✅ X interventions chargées
   ✅ Démarrage du traitement...
   ✅ Site: AP5424 | MARCHAND C
   ✅ Alarme: A-2896967 - GOODWE ERROR [262144]
   ✅ Correspondance exacte: REPAR_ONDL
   ✅ Remplissage automatique: REPAR_ONDL
   ✅ Traitement terminé
```

### **Problèmes courants**

#### **❌ Le formulaire ne se remplit pas**
```
Causes possibles :
1. Champ "Site" vide → Attendre qu'il se remplisse
2. Alarme non reconnue → Vérifier le fichier JSON
3. Page non détectée → Vérifier les logs

Solution :
- Recharger la page
- Cliquer sur "🔄 Recharger les pages Energysoft" dans le popup
```

#### **❌ Correspondance alarme incorrecte**
```
Causes possibles :
1. Nom d'alarme différent dans le JSON
2. Format d'alarme non standard

Solution :
- Vérifier le fichier config_interventions_export.json
- Adapter le nom de l'alarme dans le JSON
```

#### **❌ Extension ne démarre pas**
```
Causes possibles :
1. Extension non chargée
2. Erreur dans le code

Solution :
- Recharger l'extension dans chrome://extensions/
- Vérifier les erreurs dans la console
```

---

## 🔄 **RECHARGEMENT DES DONNÉES**

### **Méthode 1 : Via le popup**
```
1. Cliquer sur l'icône de l'extension
2. Cliquer sur "🔄 Recharger les pages Energysoft"
3. ✅ Les données sont rechargées
4. ✅ Toutes les pages Energysoft sont rechargées
```

### **Méthode 2 : Via les settings**
```
1. Cliquer sur "⚙️ Ouvrir les Settings"
2. Importer un nouveau fichier JSON
3. ✅ Les données sont mises à jour automatiquement
```

---

## 📊 **STATISTIQUES**

### **Voir les statistiques dans le popup**
```
1. Cliquer sur l'icône de l'extension
2. Voir les statistiques :
   - Interventions : X
   - Alarmes : Y
```

### **Voir les statistiques dans les settings**
```
1. Cliquer sur "⚙️ Ouvrir les Settings"
2. Voir les statistiques :
   - Interventions : X
   - Codes uniques : Y
3. Voir le tableau complet des interventions
```

---

## 📤 **EXPORT DE LA CONFIGURATION**

### **Exporter la configuration actuelle**
```
1. Cliquer sur "⚙️ Ouvrir les Settings"
2. Cliquer sur "📤 Exporter la configuration"
3. ✅ Fichier JSON téléchargé
4. Nom du fichier : config_interventions_[timestamp].json
```

---

## 🛠️ **MAINTENANCE**

### **Mettre à jour l'extension**
```
1. Télécharger la nouvelle version
2. Aller sur chrome://extensions/
3. Cliquer sur "🔄 Recharger" sur l'extension
4. ✅ Extension mise à jour
```

### **Réinitialiser l'extension**
```
1. Aller sur chrome://extensions/
2. Cliquer sur "Supprimer" sur l'extension
3. Réinstaller l'extension
4. Importer le fichier JSON de configuration
5. ✅ Extension réinitialisée
```

---

## 📞 **SUPPORT**

### **En cas de problème**
```
1. Vérifier les logs dans la console (F12)
2. Vérifier que le fichier JSON est correct
3. Recharger l'extension
4. Recharger la page Energysoft
```

### **Logs utiles**
```
[AUTO-FORM-PV] : Logs de l'extension principale
[MONITORING] : Logs de la surveillance des alarmes
[BACKGROUND] : Logs du service worker
[SETTINGS] : Logs de la page de configuration
```

---

## ✅ **CHECKLIST DE VÉRIFICATION**

### **Installation**
- [ ] Extension installée dans Chrome
- [ ] Version 3.0.1 affichée
- [ ] Pas d'erreurs dans chrome://extensions/

### **Configuration**
- [ ] Fichier JSON importé
- [ ] Interventions affichées dans les settings
- [ ] Statistiques correctes

### **Fonctionnement**
- [ ] Page "Nouvelle intervention" détectée
- [ ] Champ "Site" rempli
- [ ] Alarme extraite correctement
- [ ] Formulaire rempli automatiquement
- [ ] Commentaire enrichi avec infos alarme

### **Performance**
- [ ] Pas d'exécution sur les autres pages
- [ ] Remplissage instantané
- [ ] Pas d'erreurs dans la console

---

**Version : 3.0.1**  
**Date : 2025-10-05**  
**Status : ✅ Prêt à l'emploi**

🎊 **L'extension est maintenant prête à être utilisée !** 🎊
