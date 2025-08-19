"use client"

import { useState } from "react"
import ChatBot from "./ChatBot"

const ChatBotToggle = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-3 shadow-lg"
          style={{
            width: "60px",
            height: "60px",
            zIndex: 1040,
            fontSize: "1.5rem",
          }}
          onClick={() => setIsChatOpen(true)}
          title="Open AI Study Assistant"
        >
          🤖
        </button>
      )}

      {/* Chat Bot Component */}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}

export default ChatBotToggle
