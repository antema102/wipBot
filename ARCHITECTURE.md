# Architecture WipBot

## 📐 Vue d'ensemble

WipBot est un système d'automatisation qui surveille une boîte email IONOS, extrait les CVs reçus en pièces jointes, et les transmet automatiquement à une API.

## 🔄 Flux de données

```
┌─────────────────┐
│   Email avec CV │
│  (recrutement@  │
│  wipwork.com)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IMAP Server    │
│  imap.ionos.fr  │
│  Port: 993      │
│  SSL/TLS        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EmailFetcher   │
│  - Connexion    │
│  - Récupération │
│  - Extraction   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CVProcessor    │
│  - Filtrage     │
│  - Validation   │
│  - Orchestration│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ApiClient     │
│  - Conversion   │
│  - Envoi HTTP   │
│  - Métadonnées  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Votre API     │
│  (configurée)   │
└─────────────────┘
```

## 📦 Modules

### 1. `src/config.js`
**Rôle**: Gestion centralisée de la configuration

**Fonctionnalités**:
- Chargement des variables d'environnement
- Configuration IMAP (serveur, port, credentials)
- Configuration email (mailbox, intervalle)
- Configuration API (URL, clé)

**Dépendances**: `dotenv`

---

### 2. `src/emailFetcher.js`
**Rôle**: Connexion et récupération des emails via IMAP

**Fonctionnalités**:
- Connexion au serveur IMAP avec SSL/TLS
- Recherche des emails non lus
- Extraction des pièces jointes
- Parsing des emails avec mailparser
- Marquage comme lu / suppression

**Dépendances**: `imap`, `mailparser`

**Méthodes principales**:
- `connect()` - Établit la connexion IMAP
- `fetchUnreadEmailsWithAttachments()` - Récupère les emails avec PJ
- `markAsRead(uid)` - Marque un email comme lu
- `deleteEmail(uid)` - Supprime un email
- `disconnect()` - Ferme la connexion

---

### 3. `src/apiClient.js`
**Rôle**: Communication avec l'API externe

**Fonctionnalités**:
- Conversion des attachments en multipart/form-data
- Ajout des métadonnées email
- Authentification Bearer token
- Gestion des erreurs HTTP

**Dépendances**: `axios`, `form-data`

**Méthodes principales**:
- `sendAttachment(attachment, metadata)` - Envoie un CV
- `sendMultipleAttachments(attachments, metadata)` - Envoie plusieurs CVs

**Données envoyées**:
- `file` - Le fichier CV (Buffer)
- `emailFrom` - Expéditeur
- `emailSubject` - Sujet de l'email
- `emailDate` - Date (ISO 8601)
- `attachmentFilename` - Nom du fichier
- `attachmentSize` - Taille en bytes
- `attachmentType` - Type MIME

---

### 4. `src/cvProcessor.js`
**Rôle**: Orchestration du traitement des CVs

**Fonctionnalités**:
- Coordination entre EmailFetcher et ApiClient
- Filtrage des types de fichiers CVs
- Gestion du cycle de traitement
- Planification périodique
- Logging détaillé

**Types de fichiers acceptés**:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Texte (.txt)
- Rich Text Format (.rtf)
- OpenDocument (.odt)

**Méthodes principales**:
- `processEmails()` - Traite tous les nouveaux emails
- `processEmail(email)` - Traite un email spécifique
- `start()` - Démarre le bot avec polling périodique

---

### 5. `src/healthCheck.js`
**Rôle**: Vérification de la connectivité

**Fonctionnalités**:
- Test de connexion IMAP
- Test de l'API
- Rapport de santé du système

**Méthodes principales**:
- `checkImapConnection()` - Teste IMAP
- `checkApiConnection()` - Teste l'API
- `checkAll()` - Exécute tous les tests

---

### 6. `index.js`
**Rôle**: Point d'entrée principal

**Fonctionnalités**:
- Démarrage du CVProcessor
- Gestion des signaux (SIGINT, SIGTERM)
- Gestion des erreurs non capturées
- Graceful shutdown

---

## 🔐 Sécurité

### Connexion IMAP
- **Protocole**: TLS/SSL
- **Port**: 993
- **Credentials**: Variables d'environnement

### API
- **Authentification**: Bearer token (optionnel)
- **Transport**: HTTPS recommandé
- **Données**: Multipart/form-data

### Stockage
- **Secrets**: Fichier `.env` (non commité)
- **Logs**: Console uniquement
- **Fichiers**: Pas de stockage local des CVs

## ⚙️ Configuration

Variables d'environnement dans `.env`:

| Variable | Type | Défaut | Description |
|----------|------|--------|-------------|
| `IMAP_HOST` | String | imap.ionos.fr | Serveur IMAP |
| `IMAP_PORT` | Number | 993 | Port IMAP |
| `IMAP_USER` | String | recrutement@wipwork.com | Email |
| `IMAP_PASSWORD` | String | - | **Requis** Mot de passe |
| `IMAP_TLS` | Boolean | true | Utiliser SSL/TLS |
| `MAILBOX` | String | INBOX | Boîte à surveiller |
| `CHECK_INTERVAL` | Number | 60000 | Intervalle (ms) |
| `MARK_AS_READ` | Boolean | true | Marquer comme lu |
| `DELETE_AFTER_PROCESSING` | Boolean | false | Supprimer après |
| `API_URL` | String | - | URL de l'API |
| `API_KEY` | String | - | Clé API (optionnel) |

## 🔄 Cycle de vie

1. **Démarrage**
   - Chargement de la configuration
   - Initialisation des modules
   - Affichage des paramètres

2. **Traitement initial**
   - Connexion IMAP
   - Récupération des emails non lus
   - Traitement des CVs trouvés
   - Déconnexion IMAP

3. **Polling périodique**
   - Attente de CHECK_INTERVAL
   - Répétition du traitement
   - Gestion des erreurs

4. **Arrêt**
   - Réception signal SIGINT/SIGTERM
   - Fermeture des connexions
   - Sortie propre

## 📊 Gestion des erreurs

### Erreurs IMAP
- Tentative de reconnexion automatique
- Logs détaillés
- Continue le polling

### Erreurs API
- Log de l'erreur
- Continue avec les autres CVs
- N'arrête pas le bot

### Erreurs critiques
- Logs complets
- Sortie du processus
- Code de sortie non-zéro

## 🐳 Docker

### Structure
```
Dockerfile:
- Base: node:18-alpine
- User: Non-root (nodejs:nodejs)
- Workdir: /app
- Cmd: npm start

docker-compose.yml:
- Service: wipbot
- Volumes: logs
- Env: .env file
- Restart: unless-stopped
```

### Avantages
- Isolation complète
- Déploiement simple
- Pas de dépendances système
- Logs persistants

## 📈 Performance

### Consommation mémoire
- ~50-100 MB en idle
- Variable selon taille des attachments

### Réseau
- Connexion IMAP persistante pendant le traitement
- Requêtes HTTP par CV trouvé
- Pas de stockage local

### CPU
- Minimal en idle
- Pics lors du parsing d'emails

## 🧪 Tests

### Outils disponibles
1. `npm run test-config` - Valide la configuration
2. `npm run health-check` - Teste les connexions
3. `examples/api-server-example.js` - Serveur de test

### Scénarios de test
1. **Sans emails**: Le bot attend passivement
2. **Avec emails sans PJ**: Les emails sont ignorés
3. **Avec CVs**: Extraction et envoi à l'API
4. **API down**: Logs d'erreur, continue le traitement

## 🔮 Extensions possibles

- Support d'autres serveurs IMAP
- Interface web de monitoring
- Base de données pour historique
- Webhook pour notifications
- Support multi-mailbox
- Filtrage avancé par expéditeur/sujet
- Conversion de formats de fichiers
- Intégration avec systèmes ATS
