import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Lightbulb, 
  RotateCcw, 
  Loader2, 
  HelpCircle,
  Compass,
  ChevronDown
} from 'lucide-react';
import { requestAiTutorChat, ChatMessage } from '../utils/geminiAi';
import { sfx } from '../utils/audio';
import { UserAccount, Stage } from '../types';

interface AiTutorChatWidgetProps {
  currentStage?: Stage | null;
  currentUser?: UserAccount | null;
}

const DEFAULT_SUGGESTIONS = [
  '⚡ Mengapa Mitokondria disebut pembangkit listrik?',
  '📦 Bagaimana Badan Golgi menyortir & mengemas protein?',
  '🏛️ Kenapa Nukleus dianalogikan sebagai Balai Desa?',
  '🛡️ Apa arti membran sel yang selektif permeabel?',
  '♻️ Apa peran Lisosom dalam mendaur ulang zat usang?',
  '💡 Berikan petunjuk untuk menyelesaikan petualangan ini!'
];

export const AiTutorChatWidget: React.FC<AiTutorChatWidgetProps> = ({
  currentStage,
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasPromptedBubble, setHasPromptedBubble] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: 'model',
        content: `🌱 **Salam hangat dari Balai Desa Sel!**\n\nSaya **Kepala Desa Sel (Prof. Bio)**, mentor virtualmu di BioVillage. Jika ada materi organel sel yang membuatmu penasaran, analogi desa yang ingin kamu tanyakan, atau butuh arahan belajar, jangan ragu untuk berdiskusi denganku di sini ya!`
      }
    ];
  });
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const newMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setIsLoading(true);
    sfx.playClick();

    try {
      const response = await requestAiTutorChat({
        messages: updatedMessages,
        currentLevel: currentStage ? `${currentStage.label} (${currentStage.title})` : 'Peta Utama BioVillage',
        activeOrganelle: currentStage?.title || undefined,
        studentName: currentUser?.fullName || currentUser?.nama || currentUser?.username || 'Penjelajah Sel'
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: response.reply,
          timestamp: Date.now()
        }
      ]);
      sfx.playCorrect();
    } catch (err) {
      console.warn('Gagal memproses chat AI Tutor:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Maaf, terjadi sedikit gangguan koneksi. Tapi ingat, seperti halnya ribosom yang tak pernah berhenti merakit asam amino, kita pun tak boleh patah semangat! Silakan tanyakan lagi ya.',
          timestamp: Date.now()
        }
      ]);
      sfx.playWrong();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    sfx.playClick();
    setMessages([
      {
        role: 'model',
        content: `🌱 Obrolan telah diperbarui! Saya **Kepala Desa Sel** siap membantumu kembali. Ada yang ingin ditanyakan seputar organel sel atau BioVillage?`
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper formatting simple markdown (bold, italic, list, quotes)
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bullets
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const raw = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-200">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{renderInlineText(raw)}</span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-200">
                <span className="text-amber-400 font-bold">{line.match(/^\d+\./)?.[0]}</span>
                <span>{renderInlineText(line.replace(/^\d+\.\s*/, ''))}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-200">
              {renderInlineText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineText = (text: string) => {
    // Basic bold parse **bold**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-teal-200">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button & Speech Bubble */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 select-none print:hidden pointer-events-auto">
        {/* Subtle Greeting Bubble (shows initially until clicked) */}
        {!isOpen && hasPromptedBubble && (
          <div 
            onClick={() => {
              setIsOpen(true);
              setHasPromptedBubble(false);
              sfx.playClick();
            }}
            className="group relative max-w-64 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/50 p-2.5 rounded-2xl shadow-2xl text-xs text-slate-100 cursor-pointer hover:border-emerald-400 transition-all animate-bounce duration-1000 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Kepala Desa Sel:</strong> Bingung konsep sel? Tanya saya di sini!
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setHasPromptedBubble(false);
              }}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* The Main Round Toggle Button */}
        <button
          id="btn-ai-tutor-widget"
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setHasPromptedBubble(false);
            sfx.playClick();
          }}
          className={`relative group flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 ${
            isOpen 
              ? 'w-12 h-12 bg-slate-800 border-2 border-slate-600 text-slate-300 hover:bg-slate-700' 
              : 'w-14 h-14 bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 border-2 border-emerald-300/80 text-white shadow-emerald-500/40 hover:scale-105 ring-4 ring-emerald-500/20'
          }`}
          aria-label="Tanya AI Tutor Kepala Desa Sel"
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-7 h-7 drop-shadow-md group-hover:rotate-12 transition-transform" />
              {/* Online Indicator Badge */}
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              </span>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 uppercase shadow">
                AI
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 md:w-[420px] max-h-[82vh] h-[580px] bg-slate-950/95 backdrop-blur-xl border-2 border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400/50 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Bot className="w-6 h-6" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-100">
                    Kepala Desa Sel
                  </h3>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-emerald-500/40">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Mentor Virtual BioVillage • Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Hapus riwayat obrolan"
                className="p-1.5 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Tutup dialog"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {currentStage && (
            <div className="px-3.5 py-1.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300/90 shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">
                  Fokus Belajar: <strong>{currentStage.label}</strong>
                </span>
              </div>
              <span className="text-[9px] text-slate-400 shrink-0">
                Terkoneksi
              </span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-slate-100">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {msg.role === 'model' ? (
                    renderFormattedText(msg.content)
                  ) : (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start animate-in fade-in">
                <div className="w-7 h-7 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="animate-pulse">Kepala Desa Sel sedang menyusun penjelasan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-800/80 bg-slate-950/80 shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Contoh Pertanyaan Cepat:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {DEFAULT_SUGGESTIONS.map((sugg, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(sugg)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-emerald-500/20 shrink-0">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                disabled={isLoading}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan konsep sel, kuis, atau minta tips..."
                className="w-full pr-11 pl-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all disabled:opacity-50 font-sans"
              />
              <button
                type="button"
                disabled={!inputVal.trim() || isLoading}
                onClick={() => handleSendMessage()}
                className={`absolute right-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                  inputVal.trim() && !isLoading
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="mt-1.5 px-1 flex items-center justify-between text-[9px] text-slate-500">
              <span>BioVillage AI Tutor • Tekan Enter untuk mengirim</span>
              <span className="text-emerald-400/80">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
