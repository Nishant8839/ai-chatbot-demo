import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
// FIX 1: Merged the duplicate imports into a single line
import { speakText, stopSpeaking } from "../hooks/useSpeechSynthesis.js";

function ChatWindow({ onClose }) {
  // FIX 1: Moved this state inside the component body
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // const [imageToShow, setImageToShow] = useState(null);
  const [imageToShow, setImageToShow] = useState(null);
  const [imageText, setImageText] = useState(""); // <--- Add this line


  const [messages, setMessages] = useState([
    { role: "model", text: "Hi! I'm your AI assistant. Ask me anything, by typing or by voice." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const currentAudioRef = useRef(null);
  const currentTimeoutRef = useRef(null);

  const stopCustomMedia = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (currentTimeoutRef.current) {
      clearTimeout(currentTimeoutRef.current);
      currentTimeoutRef.current = null;
    }
    setImageToShow(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Builds the Gemini-style history array from our simple messages state.
  // Gemini requires history to start with role "user", so we drop any
  // leading "model" messages (like our initial greeting) before sending.
  const buildHistory = (msgs) => {
    const firstUserIndex = msgs.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) return [];
    return msgs.slice(firstUserIndex).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;


    // Check for either name using a regular expression
    // --- Person 1: Narendra Modi / Uditanshu ---
    if (/narendra modi/i.test(text) || /uditanshu/i.test(text)) {
      stopCustomMedia();
      const audio = new Audio('/narendra modi.mp3');
      currentAudioRef.current = audio;
      audio.play().catch((err) => console.error("Failed to play audio:", err));

      setImageToShow('/narendra modi.webp'); // Set the specific image

      currentTimeoutRef.current = setTimeout(() => {
        stopCustomMedia();
      }, 30000);

      const userMessage = { role: "user", text };
      const fakeModelMessage = { role: "model", text: "Playing audio and showing image!" };
      setMessages((prev) => [...prev, userMessage, fakeModelMessage]);
      setInput("");
      return;
    }
    if (/aman/i.test(text)) {
      stopCustomMedia();
      const audio = new Audio('/aman music.mp3');
      currentAudioRef.current = audio;
      audio.play().catch((err) => console.error("Failed to play audio:", err));

      setImageToShow('/aman.jpg'); // Set the specific image

      currentTimeoutRef.current = setTimeout(() => {
        stopCustomMedia();
      }, 30000);

      const userMessage = { role: "user", text };
      const fakeModelMessage = { role: "model", text: "Here is Aman!" };
      setMessages((prev) => [...prev, userMessage, fakeModelMessage]);
      setInput("");
      return;
    }
    if (/arbaaz/i.test(text)) {
      stopCustomMedia();
      const audio = new Audio('/ronaldo music.mp3');
      currentAudioRef.current = audio;
      audio.play().catch((err) => console.error("Failed to play audio:", err));

      setImageToShow('/ronaldo1.jpeg'); // Set the specific image

      currentTimeoutRef.current = setTimeout(() => {
        stopCustomMedia();
      }, 30000);

      const userMessage = { role: "user", text };
      const fakeModelMessage = { role: "model", text: "Here is Arbaaz!" };
      setMessages((prev) => [...prev, userMessage, fakeModelMessage]);
      setInput("");
      return;
    }
    if (/nikhil/i.test(text)) {
      stopCustomMedia();
      const audio = new Audio('/nikhil2.mp3');
      currentAudioRef.current = audio;
      audio.play().catch((err) => console.error("Failed to play audio:", err));

      setImageToShow('/nikhil.webp'); // Set the specific image

      currentTimeoutRef.current = setTimeout(() => {
        stopCustomMedia();
      }, 30000);

      const userMessage = { role: "user", text };
      const fakeModelMessage = { role: "model", text: "Playing audio and showing image!" };
      setMessages((prev) => [...prev, userMessage, fakeModelMessage]);
      setInput("");
      return;
    }
    // --- Person 2: Amit ---
    // --- Person 2: Amit ---
    if (/amit/i.test(text)) {
      stopCustomMedia();
      // (Audio is disabled for Amit)

      // FIX 1: Use exactly "/Amit.jpeg" with a capital A to match your file
      setImageToShow(['/Amit.jpeg', '/messi1.webp']);

      currentTimeoutRef.current = setTimeout(() => {
        stopCustomMedia();
      }, 30000);

      const userMessage = { role: "user", text };
      const fakeModelMessage = { role: "model", text: "Here is Amit!" };
      setMessages((prev) => [...prev, userMessage, fakeModelMessage]);
      setInput("");
      return;
    }




    const historyBeforeThisMessage = buildHistory(messages);
    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessage(text, historyBeforeThisMessage);
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
      if (voiceReplyEnabled) speakText(reply);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Sorry, I couldn't reach the server. Is it running?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const { startListening, isListening, isSupported } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    }
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleStop = () => {
    stopSpeaking();      // Immediately stops the voice from reading aloud
    setIsLoading(false); // Immediately hides the "Thinking..." bubble
    stopCustomMedia();   // Stops custom audio and hides custom image
  };

  return (
    <div className={`chat-window ${isMinimized ? "minimized" : ""} ${isMaximized ? "maximized" : ""}`}>
      {/* ERROR 1 FIXED: Moved this comment inside the parent div so React can parse it */}

      <div className="chat-header">
        <span>AI Assistant</span>
        <div style={{ display: "flex", gap: "10px" }}>

          {/* Minimize Button */}
          <button
            className="close-btn"
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (isMaximized) setIsMaximized(false); // Un-maximize if minimizing
            }}
          >
            {isMinimized ? "▲" : "▼"}
          </button>

          {/* Maximize Button */}
          <button
            className="close-btn"
            onClick={() => {
              setIsMaximized(!isMaximized);
              if (isMinimized) setIsMinimized(false); // Un-minimize if maximizing
            }}
          >
            {isMaximized ? "🗗" : "🗖"}
          </button>

          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Only show the rest of the chat if it is NOT minimized */}
      {!isMinimized && (
        <>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="chat-bubble model typing">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* --- Show the dynamic image if one is set --- */}
          {imageToShow && (
            <div style={{ textAlign: "center", margin: "10px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              {Array.isArray(imageToShow) ? (
                imageToShow.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Secret Image ${idx + 1}`}
                    style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "10px" }}
                  />
                ))
              ) : (
                <img
                  src={imageToShow}
                  alt="Secret Image"
                  style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "10px" }}
                />
              )}
            </div>
          )}
          {/* ------------------------------------------------ */}



          {/* FIX 2: Removed the duplicated <div className="chat-input-row"> tag here */}
          <div className="chat-input-row">
            <button
              className={`mic-btn ${isListening ? "listening" : ""}`}
              onClick={startListening}
              title={isSupported ? "Speak your message" : "Voice input not supported in this browser"}
              disabled={isLoading}
            >
              🎤
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Type your message..."}
              disabled={isLoading}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={isLoading}>
              Send
            </button>

            {/* --- NEW STOP BUTTON --- */}
            <button
              className="send-btn"
              onClick={handleStop}
              style={{ background: '#ef4444', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}
            >
              Stop
            </button>
            {/* ----------------------- */}
          </div>

          {/* FIX 2: Removed the rogue </div> tag that was placed right here */}

          <label className="voice-toggle">
            <input
              type="checkbox"
              checked={voiceReplyEnabled}
              onChange={(e) => setVoiceReplyEnabled(e.target.checked)}
            />
            Read replies aloud
          </label>

          {/* ERROR 2 FIXED: Added the missing closing tags for the conditional fragment */}
        </>
      )}
    </div>
  );
}

export default ChatWindow;