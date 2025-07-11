import React, { useState, useRef, useEffect } from "react";
import "../resources/CustomerServiceBtn.css";
import { MdSend } from "react-icons/md";
import { FiX } from "react-icons/fi";

const CustomerServiceBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const messagesEndRef = useRef(null);

  // Whenever messages change, scroll to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const sendMessage = async () => {
  if (!input.trim()) return;

  const now = new Date();
  const userMessage = {
    sender: "user",
    text: input,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const res = await fetch("/webhooks/rest/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", message: input }),
    });

    const data = await res.json();
    console.log("Rasa raw response:", data);

    // ✅ Safe check and fallback
    const responses = Array.isArray(data) ? data : [];

    if (responses.length === 0 || !responses.some(item => item.text?.trim())) {
      // No valid bot message received
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I didn’t quite understand that. Can you try rephrasing?",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      return;
    }

    const botMessages = responses.map((item) => {
      return {
        sender: "bot",
        text: item.text || "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    setMessages((prev) => [...prev, ...botMessages]);
  } catch (err) {
    console.error("Fetch error:", err);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Sorry, I couldn’t reach the support service right now.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={toggleChat}
        aria-label="Customer Support"
      >
        <img
          src="\images\homePage\headphones.png" // 👈 Put your image in the public folder and reference it here
          alt="Customer Service"
          style={{ width: "32px", height: "32px" }}
        />
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="agent-info">
              <div className="agent-info-img">
                <img
                  src="\images\homePage\message-icon.png"
                  className="chat-header-icon"
                />
              </div>
              <div className="agent-info-name">
                <strong>Chatbot</strong>
                <small>Support Agent</small>
              </div>
            </div>
            <FiX className="close-chat-btn" onClick={toggleChat} size={24} />
          </div>

         <div className="chat-messages">
  {messages.map((msg, idx) => (
    <div key={idx} className={`message-group ${msg.sender}`}>
      <div className="chat-time">{(msg.sender=='user')? 'Visitor':'Chatbot'} {msg.time}</div>
      <div className={`chat-msg ${msg.sender}`}>
        {msg.text}
      </div>
    </div>
  ))}
  <div ref={messagesEndRef} />
</div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write a message"
            />
            <button onClick={sendMessage}>
              <MdSend size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerServiceBtn;
