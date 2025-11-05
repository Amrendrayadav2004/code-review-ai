"use client"



import React, { useState, useRef, useEffect } from 'react';
import { Code2, Send, Sparkles, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

export default function CodeReviewChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Code Review Assistant. Paste your code below, and I\'ll analyze it for bugs, security issues, performance improvements, and best practices. 🚀'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
    setApiKey(AUTO_API_KEY);
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const AUTO_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const analyzeCode = async (code: string) => {
    if (!apiKey) {

      return 'Please enter your Gemini API key first.';
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert code reviewer. Analyze the following code and provide a comprehensive review covering:

1. **Code Quality**: Readability, maintainability, and organization
2. **Bugs & Errors**: Potential bugs, logic errors, or edge cases
3. **Security**: Security vulnerabilities or concerns
4. **Performance**: Performance issues and optimization opportunities
5. **Best Practices**: Adherence to language-specific best practices
6. **Suggestions**: Specific, actionable improvements with code examples where helpful

Format your response in a clear, structured way. Be constructive and educational.

Code to review:
\`\`\`
${code}
\`\`\``
            }]
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to analyze code');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error analyzing code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return `⚠️ Error: ${errorMessage}\n\nPlease check your API key and try again.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const review = await analyzeCode(input);
    
    const assistantMessage = { role: 'assistant', content: review };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiInput(false);
    }
  };

  if (showApiInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CodeReview AI</h1>
              <p className="text-gray-400 text-sm">WT Project (Deepak sir)</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">
              Here is the Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <p className="text-gray-400 text-xs mt-2">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <button
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            Start Reviewing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CodeReview AI</h1>
              <p className="text-xs text-gray-400">WT Project (Deepak sir)</p>
            </div>
          </div>
          <button
            onClick={() => setShowApiInput(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Change API Key
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-3xl rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 backdrop-blur-lg border border-purple-500/20 text-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed overflow-x-auto">
                    {message.content}
                  </pre>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(message.content, index)}
                      className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-slate-800/50 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-4">
                <p className="text-gray-400">Analyzing your code...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-purple-500/20 bg-slate-900/80 backdrop-blur-lg px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-purple-500/30 focus-within:border-purple-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your code here for review..."
              className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[100px] max-h-[300px] font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  const formElement = e.currentTarget.closest('form');
                  formElement?.requestSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-4">
              <p className="text-xs text-gray-500">
                Press Cmd/Ctrl + Enter to send
              </p>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Review Code
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}