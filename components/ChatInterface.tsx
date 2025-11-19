
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, BusinessProfile, ChatMessage } from '../types';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import Button from './ui/Button';
import { Send } from 'lucide-react';
import Spinner from './ui/Spinner';

interface ChatInterfaceProps {
    businessProfile: BusinessProfile | null;
    csvData: string | null;
    analysisResult: AnalysisResult | null;
    history: ChatMessage[];
    setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ businessProfile, csvData, analysisResult, history, setHistory }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (businessProfile && csvData && analysisResult) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const initialPrompt = `
                You are a data analysis assistant. The user has provided the following business profile and data.
                
                Business Profile: ${JSON.stringify(businessProfile)}
                
                Initial Analysis Summary: ${JSON.stringify({
                    title: analysisResult.analysisTitle,
                    insights: analysisResult.keyInsights,
                    recommendations: analysisResult.recommendations
                })}

                The full CSV data is:
                ---
                ${csvData.substring(0, 4000)}...
                ---
                
                Answer the user's questions based on this context. Be concise and helpful.
            `;
            const newChat = ai.chats.create({
                // FIX: Replaced deprecated 'gemini-pro' with 'gemini-2.5-flash'.
                model: 'gemini-2.5-flash',
                history: [{ role: 'user', parts: [{ text: initialPrompt }] }, { role: 'model', parts: [{ text: "Understood. I'm ready to answer questions about the provided data and analysis." }] }],
            });
            setChat(newChat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessProfile, csvData, analysisResult]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: input });
            let text = '';
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse
                text += c.text;
                const modelMessage: ChatMessage = { role: 'model', content: text };
                // This updates the message in-place for a streaming effect
                setHistory(prev => [...prev.slice(0, -1), modelMessage]);
            }
             const finalModelMessage: ChatMessage = { role: 'model', content: text };
             setHistory(prev => [...prev.slice(0,-1), finalModelMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-80 bg-gray-900/50 rounded-lg p-2">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 text-sm">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-2 rounded-lg bg-gray-700 text-gray-200">
                           <Spinner size="sm" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} size="sm" className="px-3 py-2">
                   <Send size={16} />
                </Button>
            </form>
        </div>
    );
};

export default ChatInterface;