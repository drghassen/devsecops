# 🌱 EcoTrack IoT - Nuit de l'Info 2025

**Plateforme de monitoring IoT pour le suivi environnemental en temps réel**

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/nuit_info/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/nuit_info/actions)
[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2.7](https://img.shields.io/badge/django-5.2.7-green.svg)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)

## 🎯 À Propos

EcoTrack IoT est une application Django avec support WebSocket temps réel développée pour la **Nuit de l'Info 2024**. Elle permet de monitorer des données IoT environnementales (hardware, énergie, réseau) et propose un quiz éducatif sur les enjeux écologiques du numérique.

### Objectifs du Projet

- 📊 Monitoring temps réel de capteurs IoT
- 🔋 Analyse de l'impact environnemental du matériel informatique
- 🎓 Sensibilisation via un quiz interactif
- 🔒 Implémentation DevSecOps complète (CI/CD, tests, sécurité)

## ✨ Fonctionnalités

### Core Features
- ✅ Dashboard temps réel avec WebSockets (Channels)
- ✅ Collecte et analyse de données IoT multi-capteurs
- ✅ Système de quiz interactif avec base de données
- ✅ Recommandations personnalisées basées sur les données
- ✅ API REST complète
- ✅ Authentication système

### DevSecOps
- ✅ CI/CD avec GitHub Actions
- ✅ Tests automatisés (pytest, coverage)
- ✅ Linting (flake8, black)
- ✅ Scan de sécurité (Trivy, Bandit)
- ✅ Containerisation Docker
- ✅ Configuration par variables d'environnement

## 🏗️ Architecture

```
nuit_info/
├── .github/workflows/     # CI/CD pipelines
├── iot/                   # Application principale
│   ├── management/        # Django management commands
│   │   └── commands/
│   │       └── seed_quiz.py
│   ├── static/           # Assets (CSS, JS)
│   ├── templates/        # Templates Django
│   ├── tests/            # Tests unitaires
│   │   └── fixtures/     # Données de test
│   ├── views/            # Vues modulaires
│   ├── models.py         # Modèles de données
│   ├── consumers.py      # WebSocket consumers
│   └── urls.py           # Routes API
├── nuit_info/            # Configuration Django
│   ├── settings.py       # Settings (env variables)
│   ├── asgi.py           # Configuration ASGI
│   └── urls.py           # URLs racine
├── requirements/         # Dépendances Python
│   ├── base.txt          # Production
│   ├── dev.txt           # Développement
│   └── prod.txt          # Production optimisée
├── scripts/              # Scripts utilitaires
├── logs/                 # Logs application
├── Dockerfile            # Image Docker développement
├── docker-compose.yml    # Orchestration containers
└── .env.example          # Exemple de configuration
```

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Django 5.2.7 |
| **WebSocket** | Django Channels 4.1 |
| **ASGI Server** | Daphne 4.1 |
| **Base de Données** | SQLite3 (dev), PostgreSQL (prod ready) |
| **Frontend** | Vanilla JS, CSS |
| **Testing** | pytest, coverage |
| **Linting** | flake8, black |
| **Security** | Trivy, Bandit |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

## 🚀 Installation

### Prérequis

- Python 3.13+
- Docker & Docker Compose (optionnel)
- Git

### Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/YOUR_USERNAME/nuit_info.git
cd nuit_info
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
# Windows
venv\\Scripts\\activate
# Linux/Mac
source venv/bin/activate
```

3. **Installer les dépendances**
```bash
# Développement
pip install -r requirements/dev.txt

# Production
pip install -r requirements/prod.txt
```

4. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Générer une SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Éditer .env et remplacer SECRET_KEY
```

5. **Effectuer les migrations**
```bash
python manage.py migrate
```

6. **Charger les données initiales**
```bash
python manage.py seed_quiz
```

7. **Créer un superuser**
```bash
python manage.py createsuperuser
```

8. **Lancer le serveur**
```bash
python manage.py runserver
```

Accéder à http://localhost:8000

### Installation avec Docker

```bash
# Build et lancement
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêt
docker-compose down
```

## ⚙️ Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine du projet:

```bash
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=db.sqlite3

# Security
SESSION_COOKIE_AGE=1800
CSRF_COOKIE_SECURE=False
SESSION_COOKIE_SECURE=False

# Logging
LOG_LEVEL=INFO
```

### Configuration Production

Pour la production, modifier:
- `DEBUG=False`
- Utiliser une vraie SECRET_KEY générée
- Configurer `ALLOWED_HOSTS` avec vos domaines
- Activer HTTPS (`CSRF_COOKIE_SECURE=True`, `SESSION_COOKIE_SECURE=True`)
- Passer à PostgreSQL

## 🎮 Utilisation

### Dashboard IoT

Accéder au tableau de bord: http://localhost:8000/api/dashboard/

Features:
- Visualisation temps réel des données capteurs
- Graphiques interactifs (hardware, énergie, réseau)
- Scores environnementaux
- Recommandations personnalisées

### Quiz Éducatif

Accéder au quiz: http://localhost:8000/api/quiz/

Features:
- Questions dynamiques depuis la base de données
- Feedback interactif
- Résultats et statistiques
- Fun facts écologiques

### API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/dashboard/` | GET | Dashboard principal |
| `/api/quiz/` | GET | Page du quiz |
| `/api/quiz/questions/` | GET | Questions du quiz |
| `/api/quiz/submit/` | POST | Soumettre les résultats |
| `/api/iot/data/` | GET/POST | Données IoT |
| `/admin/` | GET | Interface admin Django |

### WebSocket

Connexion WebSocket pour données temps réel:
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/iot/');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Données IoT:', data);
};
```

## 🧪 Tests

### Lancer les Tests

```bash
# Tous les tests
pytest iot/tests/ -v

# Tests avec coverage
coverage run -m pytest iot/tests/
coverage report
coverage html  # Rapport HTML dans htmlcov/

# Tests spécifiques
pytest iot/tests/test_hard_scenarios.py -v
```

### Linting & Formatting

```bash
# Black formatter
black .
black --check .  # Vérifier sans modifier

# Flake8 linter
flake8 .

# Bandit security scan
bandit -r . -f json -o bandit-report.json
```

## 🐳 Déploiement

### Docker Production

1. **Build l'image production**
```bash
docker build -f Dockerfile.prod -t ecotrack-iot:prod .
```

2. **Lancer avec Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD

Le projet utilise GitHub Actions pour:
- ✅ Linting automatique (flake8, black)
- ✅ Tests automatisés (pytest + coverage)
- ✅ Scan de sécurité (Trivy, Bandit)
- ✅ Build Docker

Voir `.github/workflows/ci.yml` pour la configuration complète.

## 🤝 Contribution

### Workflow de Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code

- Suivre PEP 8 (vérifier avec flake8)
- Formatter avec Black (line-length=127)
- Écrire des tests pour les nouvelles features
- Documenter les fonctions/classes
- Utiliser des commits descriptifs

### Avant de Commit

```bash
# Formatter le code
black .

# Vérifier le linting
flake8 .

# Lancer les tests
pytest iot/tests/ -v
```

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

Projet développé pour la **Nuit de l'Info 2024**

## 🙏 Remerciements

- Nuit de l'Info organizers
- Django & Channels communities
- Open source contributors

---

**Made with ❤️ for the environment during Nuit de l'Info 2024**
