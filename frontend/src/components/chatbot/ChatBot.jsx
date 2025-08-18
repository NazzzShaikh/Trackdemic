"use client"

import { useState, useEffect, useRef } from "react"
import { chatbotAPI } from "../../services/api"

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      loadChatHistory()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatHistory = async () => {
    try {
      const response = await chatbotAPI.getChatHistory()
      if (response.data.sessions && response.data.sessions.length > 0) {
        const latestSession = response.data.sessions[0]
        setSessionId(latestSession.session_id)
        setMessages(latestSession.messages || [])
      } else {
        // Start with welcome message
        setMessages([
          {
            id: "welcome",
            message_type: "bot",
            content:
              "Hello! I'm your AI study assistant. I'm here to help you with your courses, answer questions, and provide study guidance. What would you like to know?",
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
      setMessages([
        {
          id: "welcome",
          message_type: "bot",
          content: "Hello! I'm your AI study assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      message_type: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const response = await chatbotAPI.sendMessage({
        message: userMessage,
        session_id: sessionId,
      })

      // Update session ID if new
      if (response.data.session_id && response.data.session_id !== sessionId) {
        setSessionId(response.data.session_id)
      }

      // Replace temp message with actual message and add bot response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempUserMessage.id),
        response.data.user_message,
        response.data.bot_response,
      ])
    } catch (error) {
      console.error("Failed to send message:", error)
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          message_type: "bot",
          content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat?")) {
      setMessages([
        {
          id: "welcome",
          message_type: "bot",
          content: "Chat cleared! How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ])
      setSessionId("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1050, width: "400px", height: "600px" }}>
      <div className="card h-100 shadow-lg">
        {/* Header */}
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="me-2" style={{ fontSize: "1.2rem" }}>
              🤖
            </div>
            <div>
              <h6 className="mb-0">AI Study Assistant</h6>
              <small className="opacity-75">Online</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-light" onClick={clearChat} title="Clear Chat">
              🗑️
            </button>
            <button className="btn btn-sm btn-outline-light" onClick={onClose} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="card-body p-0 d-flex flex-column" style={{ height: "calc(100% - 120px)" }}>
          <div className="flex-grow-1 overflow-auto p-3">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`mb-3 d-flex ${message.message_type === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className={`p-2 rounded max-w-75 ${
                    message.message_type === "user" ? "bg-primary text-white" : "bg-light text-dark border"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <div className="small">{message.content}</div>
                  <div
                    className={`text-end mt-1 ${message.message_type === "user" ? "text-white-50" : "text-muted"}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 d-flex justify-content-start">
                <div className="bg-light text-dark border p-2 rounded">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small>AI is typing...</small>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="card-footer p-2">
          <form onSubmit={sendMessage}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ask me anything about your studies..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={!inputMessage.trim() || isLoading}>
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
