# Trackdemic E-Learning Platform

A comprehensive e-learning platform with three user panels: Student, Faculty, and Admin.

## Project Structure

\`\`\`
trackdemic/
├── backend/                 # Django REST API
│   ├── trackdemic/         # Main Django project
│   ├── apps/               # Django apps
│   ├── ml_service/         # ML microservice
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
└── README.md              # This file
\`\`\`

## Tech Stack

### Backend
- Django & Django REST Framework
- JWT Authentication
- SQLite Database
- Python ML libraries (scikit-learn, pandas, numpy)
- Flask microservice for ML

### Frontend
- React (JavaScript)
- React Router
- Axios for API calls
- Bootstrap & Tailwind CSS
- Responsive UI

### AI/ML
- OpenAI API / Hugging Face Transformers
- Recommendation algorithms
- Performance tracking and reporting

## Features

### Student Panel
- Authentication (register, login, profile update)
- Course browsing, search, filter, enrollment
- Quiz system (course-based and topic-specific)
- AI chatbot for doubt resolution
- Performance tracking and reports

### Faculty Panel
- Student management (add/remove from courses)
- Student tracking (reports & performance)
- Content management (upload, update, delete courses & quizzes)

### Admin Panel
- User management (CRUD for faculty & students)
- System management (platform oversight)

## Getting Started

### Backend Setup
\`\`\`bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm start
