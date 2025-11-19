# Exemples

Ce dossier contient des exemples d'utilisation de WipBot.

## API Server Example

Un exemple de serveur API pour tester le bot localement.

### Installation

```bash
# Installer express et multer
npm install express multer
```

### Utilisation

1. Démarrer le serveur exemple:
```bash
node examples/api-server-example.js
```

2. Dans un autre terminal, configurer votre `.env`:
```env
API_URL=http://localhost:3000/upload
```

3. Démarrer WipBot:
```bash
npm start
```

### Endpoints disponibles

- `POST /upload` - Reçoit les CVs
- `GET /cvs` - Liste tous les CVs reçus
- `GET /health` - Vérification de santé du serveur

Les CVs sont sauvegardés dans le dossier `uploads/`.

## Intégration avec votre API

Pour intégrer WipBot avec votre propre API, assurez-vous que votre endpoint:

1. Accepte les requêtes POST multipart/form-data
2. Accepte un champ `file` contenant le fichier CV
3. (Optionnel) Accepte les métadonnées dans les champs:
   - `emailFrom` - Expéditeur de l'email
   - `emailSubject` - Sujet de l'email
   - `emailDate` - Date de l'email
   - `attachmentFilename` - Nom du fichier
   - `attachmentSize` - Taille du fichier
   - `attachmentType` - Type MIME

Exemple de réponse attendue:
```json
{
  "success": true,
  "message": "CV received successfully"
}
```

En cas d'erreur:
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```
