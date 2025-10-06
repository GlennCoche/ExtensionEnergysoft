# 🧪 Guide de Test - v3.1.0

## 📋 **PRÉPARATION**

### **1. Recharger l'extension**
```
1. Ouvrir Chrome
2. Aller sur chrome://extensions/
3. Trouver "Auto Form PV Ultimate"
4. Cliquer sur "🔄 Recharger"
5. Vérifier la version : 3.1.0
```

### **2. Activer le mode debug**
```
1. Ouvrir le fichier content.js
2. Ligne 9 : const DEBUG_MODE = true;
3. Sauvegarder
4. Recharger l'extension
```

### **3. Ouvrir la console**
```
1. Aller sur Energysoft
2. Appuyer sur F12
3. Onglet "Console"
4. Filtrer par "[AUTO-FORM-PV]"
```

---

## ✅ **TEST 1 : CACHE DES INTERVENTIONS**

### **Objectif :**
Vérifier que les recherches sont mises en cache et instantanées.

### **Procédure :**
```
1. Ouvrir une "Nouvelle intervention" avec alarme "GOODWE ERROR [262144]"
2. Observer les logs :
   [AUTO-FORM-PV] Recherche intervention pour: GOODWE ERROR [262144]
   [AUTO-FORM-PV] ✅ Correspondance exacte: REPAR_ONDL
   [AUTO-FORM-PV] Mise en cache: GOODWE ERROR [262144] -> REPAR_ONDL

3. Recharger la page (F5)
4. Observer les logs :
   [AUTO-FORM-PV] ✅ Cache hit pour: GOODWE ERROR [262144]

5. ✅ TEST RÉUSSI si :
   - Le 2ème chargement affiche "Cache hit"
   - Le 2ème chargement est instantané (<1ms)
```

### **Résultat attendu :**
```
1ère recherche : ~5-10ms
2ème recherche : <1ms (cache)
Gain : 90%+
```

---

## ⏱️ **TEST 2 : DEBOUNCING DOM**

### **Objectif :**
Vérifier que les changements DOM multiples ne déclenchent qu'un seul traitement.

### **Procédure :**
```
1. Ouvrir une "Nouvelle intervention"
2. Modifier rapidement le champ "Site" 3 fois de suite
   (ex: taper "AP", puis "AP5", puis "AP5424")
3. Observer les logs :
   [AUTO-FORM-PV] Timer debounce annulé
   [AUTO-FORM-PV] Timer debounce annulé
   [AUTO-FORM-PV] Timer debounce déclenché
   [AUTO-FORM-PV] === DÉMARRAGE DU TRAITEMENT ===

4. ✅ TEST RÉUSSI si :
   - Plusieurs "Timer debounce annulé"
   - Un seul "Timer debounce déclenché"
   - Un seul "DÉMARRAGE DU TRAITEMENT"
```

### **Résultat attendu :**
```
Sans debouncing : 3 traitements
Avec debouncing : 1 traitement
Gain : 66%+
```

---

## ✅ **TEST 3 : VALIDATION SITE (CAS 1 - SITES IDENTIQUES)**

### **Objectif :**
Vérifier que la validation site fonctionne pour des sites identiques.

### **Procédure :**
```
1. Ouvrir une "Nouvelle intervention"
2. Site du formulaire : "AP5424 | MARCHAND C"
3. Alarme : "A-2896967 - GOODWE ERROR [262144]"
4. Observer les logs :
   [AUTO-FORM-PV] Site extrait: AP5424 | MARCHAND C
   [AUTO-FORM-PV] ✅ Alarme extraite: A-2896967 - GOODWE ERROR [262144]
   [AUTO-FORM-PV] ✅ Validation site OK: "AP5424 | MARCHAND C" ↔ "AP5424 | MARCHAND C"

5. Vérifier le commentaire :
   Site: AP5424 | MARCHAND C (pas d'alerte)

6. ✅ TEST RÉUSSI si :
   - Log "✅ Validation site OK"
   - Pas d'alerte dans le commentaire
```

---

## ⚠️ **TEST 4 : VALIDATION SITE (CAS 2 - SITES DIFFÉRENTS)**

### **Objectif :**
Vérifier que la validation site détecte les incohérences.

### **Procédure :**
```
1. Créer une alarme avec site "AP5424 | MARCHAND C"
2. Ouvrir une "Nouvelle intervention" avec site "EA948 | SOULET"
3. Observer les logs :
   [AUTO-FORM-PV] ⚠️ Sites différents: Alarme="AP5424 | MARCHAND C" vs Formulaire="EA948 | SOULET"

4. Vérifier le commentaire :
   Site: AP5424 | MARCHAND C (⚠️ différent de EA948 | SOULET)

5. ✅ TEST RÉUSSI si :
   - Log "⚠️ Sites différents"
   - Alerte dans le commentaire
```

---

## 🐛 **TEST 5 : LOGS CONDITIONNELS (MODE DEBUG)**

### **Objectif :**
Vérifier que les logs s'affichent en mode debug.

### **Procédure :**
```
1. Vérifier : const DEBUG_MODE = true;
2. Ouvrir une "Nouvelle intervention"
3. Observer la console :
   [AUTO-FORM-PV] [14:30:15] Extension chargée
   [AUTO-FORM-PV] [14:30:15] ✅ 45 interventions chargées
   [AUTO-FORM-PV] [14:30:20] === DÉMARRAGE DU TRAITEMENT ===
   [AUTO-FORM-PV] [14:30:21] ✅ === TRAITEMENT TERMINÉ ===

4. ✅ TEST RÉUSSI si :
   - Logs détaillés visibles
   - Timestamp présent
   - Émojis de niveau (✅, ⚠️, ❌)
```

---

## 🚫 **TEST 6 : LOGS CONDITIONNELS (MODE PRODUCTION)**

### **Objectif :**
Vérifier que les logs sont désactivés en mode production.

### **Procédure :**
```
1. Modifier : const DEBUG_MODE = false;
2. Sauvegarder et recharger l'extension
3. Ouvrir une "Nouvelle intervention"
4. Observer la console :
   (aucun log [AUTO-FORM-PV])

5. ✅ TEST RÉUSSI si :
   - Aucun log visible
   - Extension fonctionne normalement
   - Formulaire rempli automatiquement
```

---

## 🚀 **TEST 7 : PERFORMANCE GLOBALE**

### **Objectif :**
Mesurer la performance globale de l'extension.

### **Procédure :**
```
1. Activer DEBUG_MODE = true
2. Ouvrir une "Nouvelle intervention" (1ère fois)
3. Noter le temps dans les logs
4. Recharger la page (2ème fois)
5. Noter le temps dans les logs
6. Comparer les temps

7. ✅ TEST RÉUSSI si :
   - 1ère fois : ~5-10ms
   - 2ème fois : <1ms (cache)
   - Gain : 90%+
```

---

## 📊 **TEST 8 : REMPLISSAGE COMPLET**

### **Objectif :**
Vérifier que tous les champs sont remplis correctement.

### **Procédure :**
```
1. Ouvrir une "Nouvelle intervention" avec :
   - Site : "AP5424 | MARCHAND C"
   - Alarme : "A-2896967 - GOODWE ERROR [262144]"

2. Vérifier les champs remplis :
   ✅ Titre : "REPAR_ONDL"
   ✅ Catégorie : "Maintenance Curative"
   ✅ Description 1 : (texte prédéfini)
   ✅ Description 2 : (texte prédéfini)
   ✅ Commentaire : (texte + infos alarme)

3. Vérifier le commentaire contient :
   ─── Informations alarme ───
   Ticket: A-2896967
   Site: AP5424 | MARCHAND C
   Défaut détecté le : 05/10/2025 12:32
   Type d'alarme : GOODWE ERROR [262144]
   Matériel : Onduleur 3 - GW60KS

4. ✅ TEST RÉUSSI si :
   - Tous les champs remplis
   - Commentaire enrichi
   - Site validé
```

---

## 🔄 **TEST 9 : RECHARGEMENT DES DONNÉES**

### **Objectif :**
Vérifier que le cache est vidé lors du rechargement des données.

### **Procédure :**
```
1. Ouvrir une "Nouvelle intervention" (cache créé)
2. Aller dans les Settings
3. Importer un nouveau fichier JSON
4. Observer les logs :
   [AUTO-FORM-PV] ⚠️ Cache vidé
   [AUTO-FORM-PV] ✅ 50 interventions chargées

5. Ouvrir une nouvelle intervention
6. Observer les logs :
   [AUTO-FORM-PV] Recherche intervention pour... (pas de cache hit)

7. ✅ TEST RÉUSSI si :
   - Cache vidé après import
   - Nouvelle recherche effectuée
```

---

## 📝 **TABLEAU RÉCAPITULATIF**

| Test | Fonctionnalité | Status | Temps |
|------|----------------|--------|-------|
| 1 | Cache interventions | ⏳ | - |
| 2 | Debouncing DOM | ⏳ | - |
| 3 | Validation site (OK) | ⏳ | - |
| 4 | Validation site (KO) | ⏳ | - |
| 5 | Logs debug ON | ⏳ | - |
| 6 | Logs debug OFF | ⏳ | - |
| 7 | Performance globale | ⏳ | - |
| 8 | Remplissage complet | ⏳ | - |
| 9 | Rechargement données | ⏳ | - |

**Légende :**
- ⏳ : En attente
- ✅ : Réussi
- ❌ : Échoué

---

## 🐛 **PROBLÈMES POSSIBLES**

### **Problème 1 : Cache ne fonctionne pas**
```
Symptômes :
- Pas de log "Cache hit"
- Recherches toujours lentes

Solutions :
1. Vérifier que DEBUG_MODE = true
2. Vérifier les logs dans la console
3. Recharger l'extension
```

### **Problème 2 : Debouncing ne fonctionne pas**
```
Symptômes :
- Plusieurs "DÉMARRAGE DU TRAITEMENT"
- Pas de log "Timer debounce annulé"

Solutions :
1. Vérifier DEBOUNCE_DELAY = 500
2. Modifier rapidement le champ "Site"
3. Recharger l'extension
```

### **Problème 3 : Validation site ne fonctionne pas**
```
Symptômes :
- Pas de log "Validation site"
- Pas d'alerte dans le commentaire

Solutions :
1. Vérifier que les sites sont différents
2. Vérifier les logs dans la console
3. Vérifier le commentaire final
```

### **Problème 4 : Logs ne s'affichent pas**
```
Symptômes :
- Aucun log dans la console
- Extension semble fonctionner

Solutions :
1. Vérifier DEBUG_MODE = true
2. Recharger l'extension
3. Vider le cache du navigateur
```

---

## ✅ **VALIDATION FINALE**

### **Checklist de validation :**
```
✅ Test 1 : Cache interventions
✅ Test 2 : Debouncing DOM
✅ Test 3 : Validation site (OK)
✅ Test 4 : Validation site (KO)
✅ Test 5 : Logs debug ON
✅ Test 6 : Logs debug OFF
✅ Test 7 : Performance globale
✅ Test 8 : Remplissage complet
✅ Test 9 : Rechargement données

🎉 TOUS LES TESTS RÉUSSIS !
```

---

## 🚀 **MISE EN PRODUCTION**

### **Étapes finales :**
```
1. Désactiver le mode debug :
   const DEBUG_MODE = false;

2. Recharger l'extension

3. Tester une dernière fois :
   - Ouvrir une "Nouvelle intervention"
   - Vérifier le remplissage automatique
   - Vérifier l'absence de logs

4. ✅ Prêt pour la production !
```

---

**Version** : 3.1.0  
**Date** : 2025-10-05  
**Status** : 🧪 Tests en cours

🎯 **Suivez ce guide pour valider toutes les nouvelles fonctionnalités !** 🎯
