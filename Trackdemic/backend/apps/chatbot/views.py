import os
import uuid
import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer, ChatSessionSerializer

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyDcLmwL8XuWfgiEG6mgTjnJHkRvRE0njAs'))
model = genai.GenerativeModel('gemini-1.5-flash')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_bot(request):
    """Send message to AI chatbot and get response"""
    user_message = request.data.get('message', '').strip()
    session_id = request.data.get('session_id', '')
    
    if not user_message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get or create chat session
        if session_id:
            try:
                chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                chat_session = ChatSession.objects.create(
                    user=request.user,
                    session_id=str(uuid.uuid4())
                )
        else:
            chat_session = ChatSession.objects.create(
                user=request.user,
                session_id=str(uuid.uuid4())
            )
        
        # Save user message
        user_msg = ChatMessage.objects.create(
            session=chat_session,
            message_type='user',
            content=user_message
        )
        
        # Get conversation context
        recent_messages = ChatMessage.objects.filter(
            session=chat_session
        ).order_by('-timestamp')[:10]
        
        # Build conversation context for AI
        conversation_context = []
        conversation_context.append({
            "role": "system",
            "content": """You are an AI teaching assistant for Trackdemic, an e-learning platform. 
            Your role is to help students with their doubts and questions related to their courses and studies.
            Be helpful, encouraging, and provide clear explanations. If you don't know something specific 
            about a course, ask the student for more context or suggest they contact their instructor."""
        })
        
        # Add recent conversation history
        for msg in reversed(recent_messages):
            if msg.message_type == 'user':
                conversation_context.append({"role": "user", "content": msg.content})
            elif msg.message_type == 'bot':
                conversation_context.append({"role": "assistant", "content": msg.content})
        
        # Get AI response using Gemini
        try:
            # Create a simple prompt for the AI
            prompt = f"You are a helpful AI study assistant. Answer this question: {user_message}"
            response = model.generate_content(prompt)
            bot_response = response.text.strip() if response.text else "I couldn't generate a response. Please try again."
            
        except Exception as gemini_error:
            # Fallback response if Gemini fails
            print(f"Gemini API error: {gemini_error}")
            bot_response = """I'm here to help you with your studies! However, I'm experiencing some technical difficulties right now. 
            Please try asking your question again, or you can contact your instructor for immediate assistance. 
            Common topics I can help with include:
            - Course concepts and explanations
            - Study strategies and tips
            - Assignment guidance
            - Quiz preparation
            What would you like to know about?"""
        
        # Save bot response
        bot_msg = ChatMessage.objects.create(
            session=chat_session,
            message_type='bot',
            content=bot_response
        )
        
        return Response({
            'session_id': chat_session.session_id,
            'user_message': ChatMessageSerializer(user_msg).data,
            'bot_response': ChatMessageSerializer(bot_msg).data
        })
        
    except Exception as e:
        print(f"Chat error: {e}")
        return Response({'error': 'Failed to process chat message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history(request):
    """Get user's chat history"""
    session_id = request.GET.get('session_id', '')
    
    try:
        if session_id:
            # Get specific session
            chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)
            serializer = ChatSessionSerializer(chat_session)
            return Response(serializer.data)
        else:
            # Get all user sessions
            sessions = ChatSession.objects.filter(user=request.user)[:10]
            serializer = ChatSessionSerializer(sessions, many=True)
            return Response({'sessions': serializer.data})
            
    except ChatSession.DoesNotExist:
        return Response({'error': 'Chat session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Chat history error: {e}")
        return Response({'error': 'Failed to fetch chat history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_chat_session(request, session_id):
    """Clear a specific chat session"""
    try:
        chat_session = ChatSession.objects.get(session_id=session_id, user=request.user)
        chat_session.delete()
        return Response({'message': 'Chat session cleared successfully'})
    except ChatSession.DoesNotExist:
        return Response({'error': 'Chat session not found'}, status=status.HTTP_404_NOT_FOUND)
