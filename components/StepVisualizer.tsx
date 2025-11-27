import React, { useState, useEffect } from 'react';
import { ArrowRight, Box, Cpu, MessageSquare, BookOpen, BrainCircuit, Grid, Scan, Layers, Network } from 'lucide-react';
import ConceptExplainer from './ConceptExplainer';
import { ModelCapability } from '../types';

interface StepVisualizerProps {
  currentStep: number;
  input: string;
  tokens: { text: string; color: string }[];
  capability: ModelCapability;
  image?: string | null;
}

const StepVisualizer: React.FC<StepVisualizerProps> = ({ currentStep, input, tokens, capability, image }) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [thinkingLines, setThinkingLines] = useState<string[]>([]);
  const [focusedTokenIndex, setFocusedTokenIndex] = useState<number>(0);

  // Simulate thinking process when in reasoning step
  useEffect(() => {
    const isReasoningStep = capability === ModelCapability.Reasoning && currentStep === 4;
    if (isReasoningStep) {
        setThinkingLines([]);
        const thoughts = [
            "Analyzing intent...",
            "Breaking down the problem...",
            "Checking knowledge base...",
            "Formulating logic...",
            "Verifying facts...",
            "Synthesizing answer..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < thoughts.length) {
                setThinkingLines(prev => [...prev, thoughts[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }
  }, [currentStep, capability]);

  // Auto-cycle focus for Attention step
  useEffect(() => {
    if (currentStep === 3 && tokens.length > 0) {
        const interval = setInterval(() => {
            setFocusedTokenIndex(prev => (prev + 1) % Math.min(tokens.length, 5));
        }, 800);
        return () => clearInterval(interval);
    }
  }, [currentStep, tokens.length]);

  // Construct steps dynamically based on capability
  const getSteps = () => {
    const steps = [];

    // --- STEP 0: INPUT ---
    steps.push({
        id: 0,
        title: capability === ModelCapability.Vision ? "Multimodal Input" : "Input",
        icon: capability === ModelCapability.Vision ? <Scan size={18} /> : <MessageSquare size={18} />,
        color: "emerald",
        desc: capability === ModelCapability.Vision ? "Image + Text" : "Your raw text",
        explanation: capability === ModelCapability.Vision 
            ? "The model receives both your text question and the raw pixels of the image." 
            : "This is what you type. Computers don't understand English letters directly, so this is just the starting point.",
        analogy: "Like showing a picture to a friend while asking 'What is this?'"
    });

    // --- STEP 1: PROCESSING (Tokenization OR Patching) ---
    if (capability === ModelCapability.Vision) {
        steps.push({
            id: 1,
            title: "Patching",
            icon: <Grid size={18} />,
            color: "blue",
            desc: "Slicing Image",
            explanation: "Neural Networks can't swallow a whole 1080p image at once. We slice the image into small squares called 'Patches' (e.g., 16x16 pixels). Each patch is treated like a 'visual word'.",
            analogy: "Like cutting a large pizza into small square bites so you can eat it one by one."
        });
    } else {
        steps.push({
            id: 1,
            title: "Tokenization",
            icon: <Box size={18} />,
            color: "blue",
            desc: "Breaking Text",
            explanation: "The model chops your text into small chunks called Tokens. A token can be a word, part of a word, or even a space.",
            analogy: "Like breaking a LEGO castle back into individual bricks to understand how it was built."
        });
    }

    // --- STEP 2: EMBEDDINGS (Vectors) ---
    steps.push({
        id: 2,
        title: capability === ModelCapability.Vision ? "Projection" : "Embeddings",
        icon: <Layers size={18} />,
        color: "purple",
        desc: "To Numbers",
        explanation: capability === ModelCapability.Vision 
            ? "Each image patch is flattened and converted into a long list of numbers (vector). Now the image is just a sequence of math, exactly like text tokens!"
            : "Each token is converted into a long list of numbers (a vector). These numbers represent the 'meaning'. Similar words end up with similar numbers.",
        analogy: capability === ModelCapability.Vision
            ? "Like translating the colors of each puzzle piece into a barcode."
            : "Like giving every word a GPS coordinate on a giant map of meaning."
    });

    // --- STEP 3: ATTENTION (New) ---
    steps.push({
        id: 3,
        title: "Attention",
        icon: <Network size={18} />,
        color: "orange",
        desc: "Context",
        explanation: "This is the secret sauce of Transformers! Each word 'looks at' every other word to understand context. For example, in 'River Bank', 'Bank' focuses on 'River' to know it's not about money.",
        analogy: "Like reading a sentence and constantly looking back at previous words to make sure you understand who 'he' or 'it' refers to."
    });

    // --- STEP 4: REASONING (Optional) ---
    if (capability === ModelCapability.Reasoning) {
        steps.push({
            id: 4,
            title: "Reasoning",
            icon: <BrainCircuit size={18} />,
            color: "amber",
            desc: "Thinking...",
            explanation: "Before answering, the model engages in a 'Chain of Thought'. It breaks the problem down, checks its own logic, and plans the answer step-by-step.",
            analogy: "Like showing your work in a math problem instead of just writing the answer."
        });
    }

    // --- STEP 4/5: PREDICTION ---
    const predId = capability === ModelCapability.Reasoning ? 5 : 5;
    steps.push({
        id: predId,
        title: "Prediction",
        icon: <Cpu size={18} />,
        color: "pink",
        desc: "Final Output",
        explanation: "The neural network processes the embedding numbers (from text or image) and calculates the probability of every possible next word.",
        analogy: "Like a super-advanced game of 'Fill in the Blank'."
    });

    return steps;
  };

  const steps = getSteps();

  // Helper to render connection lines for Attention step
  const renderAttentionLines = (count: number) => {
      if (count < 2) return null;
      const lines = [];
      const width = 100; // Assume 100% width container
      const step = width / count;
      
      const targetX = focusedTokenIndex * step + (step/2);

      for (let i = 0; i < count; i++) {
          if (i === focusedTokenIndex) continue;
          
          const sourceX = i * step + (step/2);
          const dist = Math.abs(targetX - sourceX);
          const height = Math.min(20 + dist * 0.5, 50); // Arc height based on distance
          
          // Strength simulates attention score (closer = stronger for demo)
          const strength = Math.max(0.1, 1 - (Math.abs(focusedTokenIndex - i) * 0.2)); 
          
          lines.push(
            <path
                key={i}
                d={`M ${sourceX} 40 Q ${(sourceX + targetX) / 2} ${40 - height} ${targetX} 40`}
                fill="none"
                stroke="orange"
                strokeWidth={strength * 3}
                strokeOpacity={strength * 0.8}
                className="animate-pulse"
            />
          );
      }
      return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 60" preserveAspectRatio="none">
              {lines}
          </svg>
      );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Visual Pipeline */}
      <div className={`grid grid-cols-1 gap-4 ${steps.length >= 5 ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        {steps.map((step) => {
            const isActive = currentStep >= step.id;
            const isProcessing = currentStep === step.id;
            
            let borderColor = 'border-slate-700';
            let bgColor = 'bg-slate-900';
            let textColor = 'text-slate-500';

            if (isActive) {
                if (step.color === 'emerald') { borderColor = 'border-emerald-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-emerald-400'; }
                if (step.color === 'blue') { borderColor = 'border-blue-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-blue-400'; }
                if (step.color === 'purple') { borderColor = 'border-purple-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-purple-400'; }
                if (step.color === 'orange') { borderColor = 'border-orange-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-orange-400'; }
                if (step.color === 'amber') { borderColor = 'border-amber-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-amber-400'; }
                if (step.color === 'pink') { borderColor = 'border-pink-500'; bgColor = 'bg-slate-800/50'; textColor = 'text-pink-400'; }
            }

            return (
                <div 
                    key={step.id}
                    onClick={() => setSelectedStep(step.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer relative group ${borderColor} ${bgColor} hover:bg-slate-800 transform hover:-translate-y-1`}
                >
                    <div className={`flex items-center gap-2 mb-2 ${textColor}`}>
                        {step.icon}
                        <span className="font-bold text-xs uppercase tracking-wide">{step.title}</span>
                    </div>
                    
                    <div className="h-28 flex items-center justify-center overflow-hidden relative">
                        {/* 0. Input */}
                        {step.id === 0 && (
                            <div className="flex flex-col items-center justify-center gap-1 w-full px-2">
                                {capability === ModelCapability.Vision && image && (
                                    <div className="w-8 h-8 rounded overflow-hidden border border-slate-600 mb-1">
                                        <img src={image} className="w-full h-full object-cover" alt="input" />
                                    </div>
                                )}
                                <p className="text-slate-300 text-center text-xs truncate w-full italic">"{input || "..."}"</p>
                            </div>
                        )}
                        
                        {/* 1. Tokenization / Patching */}
                        {step.title === "Tokenization" && (
                            <div className="flex flex-wrap gap-1 justify-center content-center max-h-full overflow-hidden">
                                {isActive && tokens.length > 0 ? tokens.slice(0,5).map((t, i) => (
                                    <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-blue-600/30 border border-blue-500/50 text-blue-200">{t.text}</span>
                                )) : <span className="text-slate-600 text-xs">...</span>}
                            </div>
                        )}

                        {step.title === "Patching" && (
                            isActive ? (
                                <div className="grid grid-cols-3 gap-0.5 w-16 h-16 border border-blue-500/30 p-0.5">
                                    {image ? (
                                        [...Array(9)].map((_, i) => (
                                            <div key={i} className="w-full h-full overflow-hidden relative">
                                                <img 
                                                    src={image} 
                                                    className="absolute w-[300%] h-[300%] max-w-none object-cover opacity-80" 
                                                    style={{ 
                                                        top: `${-Math.floor(i / 3) * 100}%`, 
                                                        left: `${-(i % 3) * 100}%` 
                                                    }}
                                                    alt=""
                                                />
                                                <div className="absolute inset-0 border border-blue-400/50"></div>
                                            </div>
                                        ))
                                    ) : (
                                        [...Array(9)].map((_, i) => <div key={i} className="bg-blue-500/20 border border-blue-500/50"></div>)
                                    )}
                                </div>
                            ) : <span className="text-slate-600 text-xs">...</span>
                        )}
                        
                        {/* 2. Embeddings */}
                        {(step.title === "Embeddings" || step.title === "Projection") && (
                             isActive ? (
                                <div className="flex gap-1 animate-pulse items-end h-16">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-1.5 rounded bg-gradient-to-t from-purple-900 to-purple-400" style={{ height: `${Math.random() * 80 + 20}%`}} />
                                    ))}
                                </div>
                             ) : <span className="text-slate-600 text-xs">...</span>
                        )}

                        {/* 3. Attention (New) */}
                        {step.title === "Attention" && (
                            isActive ? (
                                <div className="relative w-full h-full flex flex-col justify-end pb-2">
                                    {/* Connection Lines Layer */}
                                    <div className="absolute inset-0 z-0 opacity-80">
                                         {renderAttentionLines(Math.min(tokens.length, 5))}
                                    </div>
                                    
                                    {/* Tokens Layer */}
                                    <div className="flex justify-between items-end px-1 relative z-10 w-full">
                                        {tokens.slice(0, 5).map((t, i) => (
                                            <div 
                                                key={i} 
                                                className={`text-[9px] px-1 rounded transition-colors duration-300 ${
                                                    i === focusedTokenIndex 
                                                    ? 'bg-orange-500 text-white font-bold scale-110' 
                                                    : 'bg-slate-800 text-slate-400'
                                                }`}
                                            >
                                                {t.text}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-1 w-full text-center text-[9px] text-orange-400/80 font-mono">
                                        Attending...
                                    </div>
                                </div>
                            ) : <span className="text-slate-600 text-xs">...</span>
                        )}

                        {/* 4. Reasoning (Conditional) */}
                        {step.title === "Reasoning" && (
                            isActive ? (
                                <div className="w-full h-full flex flex-col justify-start text-[10px] text-amber-300/80 font-mono p-1 overflow-hidden space-y-1">
                                    {thinkingLines.map((line, i) => (
                                        <div key={i} className="animate-fadeIn flex items-center gap-1">
                                            <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                            {line}
                                        </div>
                                    ))}
                                    {isProcessing && <span className="animate-pulse">Thinking...</span>}
                                </div>
                            ) : <span className="text-slate-600 text-xs">...</span>
                        )}

                        {/* Prediction */}
                        {step.title === "Prediction" && (
                             isActive ? (
                                 (currentStep > step.id) ? 
                                 <ArrowRight className="text-pink-500" /> : 
                                 <span className="text-pink-400 text-xs animate-bounce font-bold">Predicting...</span>
                             ) : <span className="text-slate-600 text-xs">...</span>
                        )}
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <BookOpen size={14} className="text-slate-400" />
                    </div>
                </div>
            );
        })}
      </div>

      {/* Educational Detail View */}
      {selectedStep !== null && (
          <ConceptExplainer
             title={steps.find(s => s.id === selectedStep)?.title || ""}
             description={steps.find(s => s.id === selectedStep)?.explanation || ""}
             analogy={steps.find(s => s.id === selectedStep)?.analogy || ""}
             icon={steps.find(s => s.id === selectedStep)?.icon}
             onClose={() => setSelectedStep(null)}
          />
      )}
    </div>
  );
};

export default StepVisualizer;