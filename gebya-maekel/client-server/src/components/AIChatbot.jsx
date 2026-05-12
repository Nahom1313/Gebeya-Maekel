import { useState, useRef, useEffect } from "react";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to Gebeya Maekel! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text: `You are a helpful customer support assistant for Gebeya Maekel, an Ethiopian e-commerce platform.
                  You help customers with:
                  - Product inquiries
                  - Order status questions
                  - Shipping information
                  - Payment questions (we use Chapa payment gateway)
                  - General shopping assistance
                  Keep responses concise, friendly and helpful.
                  The currency used is ETB (Ethiopian Birr).
                  You can also respond in Amharic if the user writes in Amharic.`,
                },
              ],
            },
            contents: [...messages, userMessage]
              .filter((m) => m.role === "user")
              .map((m) => ({
                role: "user",
                parts: [{ text: m.content }],
              })),
          }),
        }
      );

      const data = await response.json();
      console.log("Full data:", JSON.stringify(data, null, 2));

      if (data.error) {
        const isRateLimit = data.error.status === "RESOURCE_EXHAUSTED";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: isRateLimit
              ? "⏳ I'm getting too many requests. Please wait 30 seconds and try again!"
              : `Error: ${data.error.message}`,
          },
        ]);
        setLoading(false);
        return;
      }

      const assistantMessage = {
        role: "assistant",
        content:
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry I could not get a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Full error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition z-50"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gray-900 dark:bg-gray-950 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <p className="font-semibold text-sm">Gebeya AI Assistant</p>
              <p className="text-xs text-gray-400">Powered by Gemini</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-80">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-yellow-400 text-gray-900 rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-2 rounded-xl font-semibold transition disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;