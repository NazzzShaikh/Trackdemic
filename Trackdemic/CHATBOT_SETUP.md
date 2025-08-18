# Chatbot Setup Guide

Your chatbot is now fully integrated into the Trackdemic platform! Here's what has been set up:

## ✅ What's Already Done

1. **Backend Implementation**
   - Django chatbot app with models, views, and serializers
   - OpenAI integration for AI responses
   - Chat session management
   - Message history storage
   - RESTful API endpoints

2. **Frontend Implementation**
   - React chatbot component with modern UI
   - Floating chat toggle button
   - Real-time messaging interface
   - Chat history management
   - Integrated into main application

3. **Database**
   - Migrations created and applied
   - ChatSession and ChatMessage models ready

## 🚀 How to Complete Setup

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key

### 2. Configure Environment
1. Copy `backend/.env.example` to `backend/.env`
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   ```

### 3. Start the Application
```bash
# Backend (Django)
cd backend
python manage.py runserver

# Frontend (React)
cd frontend
npm start
```

## 🎯 Features

- **AI-Powered Responses**: Uses OpenAI GPT-3.5-turbo for intelligent responses
- **Context Awareness**: Maintains conversation history for better responses
- **User Authentication**: Only authenticated users can access the chatbot
- **Session Management**: Separate chat sessions for organized conversations
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time UI**: Smooth messaging experience with loading indicators

## 🔧 Customization

### Modify AI Behavior
Edit the system prompt in `backend/apps/chatbot/views.py`:
```python
conversation_context.append({
    "role": "system",
    "content": "Your custom AI assistant instructions here..."
})
```

### Styling
Customize the chatbot appearance in:
- `frontend/src/components/chatbot/ChatBot.jsx`
- `frontend/src/components/chatbot/ChatBotToggle.jsx`

## 📱 Usage

1. Users will see a floating chat button (🤖) in the bottom-right corner
2. Click to open the chat interface
3. Type messages and get AI-powered responses
4. Chat history is automatically saved per user session

## 🛠️ API Endpoints

- `POST /api/chatbot/chat/` - Send message to chatbot
- `GET /api/chatbot/history/` - Get chat history
- `DELETE /api/chatbot/sessions/{id}/clear/` - Clear chat session

Your chatbot is ready to use! 🎉