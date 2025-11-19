# WipBot - CV Automation System

Système d'automatisation de CV qui récupère les CVs envoyés par email et les transmet à une API.

## 📋 Description

Ce bot Node.js surveille automatiquement une boîte email IONOS (recrutement@wipwork.com) pour récupérer les CVs reçus en pièces jointes et les envoyer à une API pour traitement.

## ✨ Fonctionnalités

- ✅ Connexion sécurisée au serveur IMAP IONOS (SSL/TLS)
- ✅ Surveillance automatique des nouveaux emails
- ✅ Extraction des pièces jointes (PDF, DOC, DOCX, TXT, RTF, ODT)
- ✅ Envoi automatique des CVs à votre API
- ✅ Gestion des métadonnées (expéditeur, sujet, date)
- ✅ Marquage des emails traités comme lus
- ✅ Logs détaillés du traitement
- ✅ Configuration via variables d'environnement

## 🚀 Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/antema102/wipBot.git
cd wipBot
```

2. Installer les dépendances:
```bash
npm install
```

3. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

4. Éditer le fichier `.env` avec vos informations:
```env
# Configuration IMAP (IONOS)
IMAP_HOST=imap.ionos.fr
IMAP_PORT=993
IMAP_USER=recrutement@wipwork.com
IMAP_PASSWORD=votre_mot_de_passe
IMAP_TLS=true

# Paramètres email
MAILBOX=INBOX
CHECK_INTERVAL=60000

# Configuration API
API_URL=https://votre-api.com/upload
API_KEY=votre_clé_api

# Paramètres application
MARK_AS_READ=true
DELETE_AFTER_PROCESSING=false
```

## 📦 Configuration IONOS

### Serveur IMAP
- **Serveur**: imap.ionos.fr
- **Port**: 993
- **Type de connexion**: SSL/TLS

### Serveur SMTP (référence)
- **Serveur**: smtp.ionos.fr
- **Port**: 465
- **Type de connexion**: SSL/TLS

## 🎯 Utilisation

### Méthode Standard (Node.js)

Tester la configuration:
```bash
npm run test-config
```

Démarrer le bot:
```bash
npm start
```

### Méthode Docker

Construire et démarrer avec Docker Compose:
```bash
docker-compose up -d
```

Voir les logs:
```bash
docker-compose logs -f wipbot
```

Arrêter le bot:
```bash
docker-compose down
```

### Fonctionnement

Le bot va:
1. Se connecter au serveur IMAP
2. Vérifier les nouveaux emails toutes les 60 secondes (configurable)
3. Extraire les pièces jointes de type CV
4. Envoyer chaque CV à votre API
5. Marquer les emails comme lus

## 📁 Structure du projet

```
wipBot/
├── src/
│   ├── config.js         # Configuration de l'application
│   ├── emailFetcher.js   # Récupération des emails IMAP
│   ├── apiClient.js      # Client pour l'API
│   └── cvProcessor.js    # Logique de traitement des CVs
├── index.js              # Point d'entrée
├── package.json          # Dépendances Node.js
├── .env.example          # Exemple de configuration
├── .gitignore           # Fichiers à ignorer
└── README.md            # Documentation
```

## 🔧 Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `IMAP_HOST` | Serveur IMAP | imap.ionos.fr |
| `IMAP_PORT` | Port IMAP | 993 |
| `IMAP_USER` | Email à surveiller | recrutement@wipwork.com |
| `IMAP_PASSWORD` | Mot de passe email | - |
| `IMAP_TLS` | Utiliser SSL/TLS | true |
| `MAILBOX` | Boîte mail à surveiller | INBOX |
| `CHECK_INTERVAL` | Intervalle de vérification (ms) | 60000 |
| `API_URL` | URL de votre API | - |
| `API_KEY` | Clé d'authentification API | - |
| `MARK_AS_READ` | Marquer les emails comme lus | true |
| `DELETE_AFTER_PROCESSING` | Supprimer après traitement | false |

## 🔌 Format de l'API

Le bot envoie les données à votre API via POST avec FormData:

**Données du fichier:**
- `file`: Le fichier CV (Buffer)

**Métadonnées:**
- `emailFrom`: Expéditeur de l'email
- `emailSubject`: Sujet de l'email
- `emailDate`: Date de l'email (ISO 8601)
- `attachmentFilename`: Nom du fichier
- `attachmentSize`: Taille du fichier (bytes)
- `attachmentType`: Type MIME du fichier

**Headers:**
- `Authorization`: Bearer {API_KEY} (si configuré)
- `Content-Type`: multipart/form-data

## 📝 Types de fichiers supportés

Le bot accepte les formats de CV suivants:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Texte (.txt)
- Rich Text Format (.rtf)
- OpenDocument Text (.odt)

## 🛠️ Développement

Pour contribuer au projet:

1. Fork le dépôt
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit les changements (`git commit -am 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Créer une Pull Request

## 📊 Logs

Le bot affiche des logs détaillés:
- ✓ Connexion réussie au serveur IMAP
- Nombre d'emails non lus trouvés
- Nombre d'emails avec pièces jointes
- Détails de chaque email traité
- Résultat de l'envoi à l'API

## ⚠️ Sécurité

- Ne jamais commiter le fichier `.env`
- Garder le fichier `.env.example` à jour (sans données sensibles)
- Utiliser des mots de passe forts
- Configurer HTTPS pour votre API
- Utiliser une clé API pour authentifier les requêtes

## 🐛 Dépannage

**Le bot ne se connecte pas au serveur IMAP:**
- Vérifier les identifiants dans `.env`
- Vérifier que le port 993 n'est pas bloqué
- Vérifier les paramètres de sécurité du compte email

**Les pièces jointes ne sont pas envoyées:**
- Vérifier l'URL de l'API
- Vérifier que l'API accepte les requêtes multipart/form-data
- Consulter les logs pour les erreurs détaillées

**Le bot consomme trop de ressources:**
- Augmenter `CHECK_INTERVAL` pour vérifier moins souvent
- Activer `DELETE_AFTER_PROCESSING` pour nettoyer les emails traités

## 📄 Licence

ISC

## 👥 Auteur

WipWork Team
