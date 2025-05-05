"use client";

import { useState, useRef, useEffect, useCallback } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewMessagesBadge, setShowNewMessagesBadge] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [lastMessageIndex, setLastMessageIndex] = useState(-1);

  const predefinedQuestions = [
    "What is a MongoDB replica set?",
    "How does indexing work in MongoDB?",
    "What is sharding in MongoDB?",
    "What are MongoDB transactions?"
  ];

  const askQuestion = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://10.0.0.136:8000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: q },
        { sender: 'assistant', text: data.answer || 'No answer returned.' }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: q },
        { sender: 'assistant', text: 'Error fetching response.' }
      ]);
    } finally {
      setLoading(false);
      setQuestion('');
    }
  };

  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    if (!scrollContainer) return;

    const threshold = 100;
    const isNearBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < threshold;

    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowNewMessagesBadge(true);
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    if (!scrollContainer) return;

    const threshold = 100;

    const handleScroll = () => {
      const isNearBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < threshold;
      setShowNewMessagesBadge(!isNearBottom);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial scroll to bottom
    scrollToBottom();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [scrollToBottom]);

  useEffect(() => {
    setLastMessageIndex(messages.length - 1);
  }, [messages.length]);

  return (
    <main className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="flex flex-1 min-h-0 w-full max-w-4xl mx-auto shadow-xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg">
        {/* Chat column */}
        <div className="w-full flex flex-col flex-1 min-h-0 p-6">
          <h1 className="flex items-center text-3xl font-semibold mb-6 border-b pb-4">
            <img
              src="/MongoMentor.png"
              alt="Logo"
              className="w-14 h-14 mr-5 object-contain"
            />
            MongoMentor
          </h1>

          {/* Welcome robot if no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4 mb-6">
              <img
                src="/mongodb-robot.png"
                alt="MongoDB Robot"
                className="w-32 h-auto opacity-85"
              />
              <p className="text-center text-gray-600 text-lg font-medium">
                Start the conversation by asking me a question.
              </p>
            </div>
          )}

          {/* Scrollable chat messages if available */}
          {messages.length > 0 && (
            <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-6 flex flex-col">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[75%] px-5 py-3 rounded-2xl break-words shadow-md transition-opacity duration-500 ${
                    msg.sender === 'user'
                      ? 'bg-[#13AA52] text-white self-end'
                      : 'bg-gray-100 text-gray-800 self-start'
                  } ${i === lastMessageIndex ? 'opacity-0 animate-fadein' : 'opacity-100'}`}
                >
                  {msg.text}
                </div>
              ))}
             <div ref={bottomRef} />
             {showNewMessagesBadge && (
               <button
                 onClick={() => {
                   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                   setShowNewMessagesBadge(false);
                 }}
                 className="fixed bottom-24 right-8 bg-[#13AA52] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#0e8c42] transition-all"
               >
                 New Messages ↓
               </button>
             )}
          </div>
          )}

          {/* Footer */}
          <footer className="space-y-6">
            {/* Predefined questions */}
            <div>
              <h2 className="font-semibold mb-2">Try Asking:</h2>
              <div className="grid grid-cols-2 gap-2">
                {predefinedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => askQuestion(q)}
                    className="text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* User input */}
            <div className="space-y-2 mt-6">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400"
                rows={3}
                placeholder="Ask anything about MongoDB..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askQuestion(question);
                  }
                }}
              />
              <button
              onClick={() => {
                  const currentQuestion = question.trim();
                  if (currentQuestion) {
                    setTimeout(() => askQuestion(currentQuestion), 50);
                  }
                }}
                className="px-6 py-3 bg-[#13AA52] hover:bg-[#0e8c42] text-white font-medium rounded-full shadow-md transition-transform transform hover:scale-105 disabled:opacity-50"
                disabled={!question || loading}
              >
                {loading ? 'Loading...' : 'Ask'}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}