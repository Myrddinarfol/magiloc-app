# 🐛 Guide de Test du Système de Feedback

## 🔍 Diagnostic Backend

### 1. Vérifier que le backend est en cours d'exécution
```bash
# Terminal 1: Démarre le backend
cd backend
npm start
```

Cherche dans les logs:
- ✅ `🔄 Vérification des migrations...`
- ✅ `📝 Exécution migration: 014_create_feedbacks.sql`
- ✅ `✅ Migrations vérifiées`
- ✅ `🎉 Serveur lancé sur le port 5000`

### 2. Vérifier que la table feedbacks existe
Lance cette commande dans ton navigateur:
```
http://localhost:5000/api/diagnostic/feedbacks
```

Tu devrais voir une réponse JSON:
```json
{
  "status": "OK",
  "exists": true,
  "columns": [...],
  "totalFeedbacks": 0,
  "message": "Table feedbacks est correctement créée"
}
```

**Si tu vois une erreur:**
- `"error": "Table feedbacks n'existe pas"` → Les migrations n'ont pas été exécutées
  - Solution: Relance le backend avec `npm start`

### 3. Vérifier la connexion CORS
```
http://localhost:5000/api/feedbacks
```

Tu devrais voir: `[]` (liste vide de feedbacks)

**Si tu vois une erreur 404 ou CORS error:**
- Vérifie que le backend répond à `localhost:5000`
- Vérifie que les fichiers migrations sont présents dans `/backend/migrations/`

---

## 🧪 Test Frontend

### 1. Démarrer le frontend
```bash
# Terminal 2: Démarre le frontend
cd frontend
npm start
```

Attends que le frontend compile avec succès.

### 2. Aller à la page d'accueil
```
http://localhost:3000
```

Ouvre la console du navigateur (F12 → Console) pour voir les logs.

### 3. Attendre le chargement des feedbacks
Tu devrais voir dans la console:
```
📡 Chargement feedbacks depuis: http://localhost:5000/api/feedbacks
✅ Feedbacks chargés: []
```

**Si tu vois une erreur:**
```
❌ Erreur loadFeedbacks: Error: [description détaillée]
```

Copie le message d'erreur complet et note ce qui suit.

---

## 📝 Test de Soumission

### 1. Clique sur l'icône 💬 (haut-gauche)
- Le panel devrait s'ouvrir
- Tu devrais voir "Aucun feedback pour le moment"

### 2. Clique sur le bouton 🐛 Bug (sous MAGI-LOC)
- Le modal devrait s'ouvrir
- Écris un message (min 10 caractères)
- Clique "Signaler le Bug"

### 3. Vérifie la console pour les logs
Tu devrais voir:
```
📝 Envoi feedback: app=parc-loc, type=bug
✅ Feedback ajouté: { id: 1, app: 'parc-loc', ... }
```

**Si tu vois une erreur JSON.parse:**
```
❌ Erreur addFeedback: SyntaxError: JSON.parse: unexpected character...
```

Cela signifie que le serveur n'envoie pas du JSON valide. Vérifie les logs du backend.

---

## 🔧 Troubleshooting

### Erreur: "Cannot GET /api/feedbacks"
**Solution:** Le backend n'est pas en cours d'exécution
```bash
cd backend && npm start
```

### Erreur: "CORS error"
**Solution:** Vérifie que CORS est configuré correctement dans `/backend/server.js`
- Les origines autorisées devraient inclure `http://localhost:3000`

### Erreur: "Table feedbacks n'existe pas"
**Solution:** Les migrations n'ont pas s'exécuter
```bash
# Redémarre le backend
cd backend
npm start
```

### Erreur: "JSON.parse: unexpected character"
**Solution:** Le serveur envoie du HTML au lieu du JSON
- Vérifie que le backend envoie le header `Content-Type: application/json`
- Regarde les logs du backend pour les erreurs 500

---

## 📋 Checklist de Test Complet

- [ ] Backend démarre sans erreur
- [ ] `/api/diagnostic/feedbacks` retourne OK
- [ ] Frontend compile sans erreur
- [ ] Console affiche "✅ Feedbacks chargés"
- [ ] Le panel 💬 s'ouvre correctement
- [ ] Le modal 🐛 s'ouvre
- [ ] Tu peux soumettre un feedback
- [ ] Le feedback apparaît dans le panel
- [ ] Tu peux valider un feedback (✅)
- [ ] Tu peux changer la priorité (⚡)
- [ ] Tu peux supprimer un feedback (🗑️)

---

## 📊 Logs Utiles à Noter

Si quelque chose ne fonctionne pas, copie ces informations:

**Frontend (Console du navigateur):**
```
1. Le message d'erreur exact
2. URL de l'API utilisée (REACT_APP_API_URL)
3. Status HTTP de la réponse (400, 404, 500, etc)
```

**Backend (Terminal):**
```
1. Messages d'erreur lors du démarrage
2. Logs des migrations
3. Logs HTTP des requêtes feedbacks
```

---

## 🚀 Prochaines Étapes

Une fois que le système fonctionne localement:
1. Commit et push les changements
2. Déployer le backend sur Railway
3. Déployer le frontend sur Vercel
4. Tester en production
