import React, { useState, useRef } from 'react';
import { ModelSize, ModelCapability, SimulationState, AppMode } from './types';
import { generateLLMResponse } from './services/geminiService';
import NeuralNetworkViz from './components/NeuralNetworkViz';
import ProbabilityChart from './components/ProbabilityChart';
import StepVisualizer from './components/StepVisualizer';
import ConceptExplainer from './components/ConceptExplainer';
import FineTuningLab from './components/FineTuningLab';
import RAGViz from './components/RAGViz';
import { Brain, Sparkles, Image as ImageIcon, Settings, PlayCircle, Cpu, HelpCircle, MessageSquare, Beaker, Terminal, Database } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState>({
    mode: AppMode.Inference,
    isProcessing: false,
    currentStepIndex: -1,
    input: '',
    image: null,
    output: '',
    tokens: [],
    modelSize: ModelSize.Small,
    capability: ModelCapability.Standard,
    probabilities: []
  });

  const [showParamHelp, setShowParamHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, input: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, image: reader.result as string, capability: ModelCapability.Vision }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runSimulation = async () => {
    if (!state.input && !state.image) return;

    // Reset output
    setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        currentStepIndex: 0, 
        output: '', 
        probabilities: [],
        tokens: []
    }));

    // Step 1: Tokenization (or Patching if Vision)
    const rawTokens = state.input.trim().split(/\s+/).map((t, i) => ({ 
        text: t, 
        id: i, 
        color: ['#60a5fa', '#34d399', '#f472b6', '#a78bfa'][i % 4] 
    }));
    
    // Animate Step 1: Input -> Tokenization
    setTimeout(() => {
        setState(prev => ({ ...prev, currentStepIndex: 1, tokens: rawTokens }));
    }, 1000);

    // Animate Step 2: Tokenization -> Embeddings
    setTimeout(() => {
        setState(prev => ({ ...prev, currentStepIndex: 2 }));
    }, 2500);

    // Animate Step 3: Embeddings -> Attention (New Step)
    setTimeout(() => {
        setState(prev => ({ ...prev, currentStepIndex: 3 }));
    }, 4000);

    // Determine next steps based on capability
    setTimeout(async () => {
        const isReasoning = state.capability === ModelCapability.Reasoning;
        const nextStepIndex = 4; // Step 4 is Reasoning (if active) or Prediction

        if (isReasoning) {
            setState(prev => ({ ...prev, currentStepIndex: 4 })); // Start Reasoning Step
        } else {
            // If Standard/Vision, Step 4 is usually Prediction in our new visualizer map
            // We'll map IDs in StepVisualizer to match this flow
            setState(prev => ({ ...prev, currentStepIndex: 5 })); // Skip directly to Prediction ID
        }
        
        // Parallel: Call API
        const response = await generateLLMResponse(state.input, state.image, state.capability);
        
        if (isReasoning) {
            // Wait for "Reasoning/Thinking" animation
            setTimeout(() => {
                // Move to Prediction
                setState(prev => ({ ...prev, currentStepIndex: 5 }));
                
                // Show Result
                setTimeout(() => {
                    setState(prev => ({
                        ...prev,
                        isProcessing: false,
                        output: response.text,
                        probabilities: response.probabilities
                    }));
                }, 1500); 
            }, 5000);
        } else {
             // Standard Prediction Time
             setTimeout(() => {
                 setState(prev => ({
                    ...prev,
                    isProcessing: false,
                    output: response.text,
                    probabilities: response.probabilities
                 }));
             }, 2000);
        }

    }, 6500); // Time for Attention viz to play out
  };

  const getLayerCount = () => {
      switch (state.modelSize) {
          case ModelSize.Nano: return 2;
          case ModelSize.Small: return 3;
          case ModelSize.Medium: return 5;
          case ModelSize.Large: return 8;
          default: return 3;
      }
  };

  const renderContent = () => {
      switch (state.mode) {
          case AppMode.Training:
              return <FineTuningLab />;
          case AppMode.RAG:
              return <RAGViz />;
          case AppMode.Inference:
          default:
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls (4 cols) */}
                <section className="lg:col-span-4 space-y-6">
                    
                    {/* Model Config */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Settings size={20} />
                                <h2 className="font-bold text-lg">Brain Settings</h2>
                            </div>
                            <button onClick={() => setShowParamHelp(!showParamHelp)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <HelpCircle size={18} />
                            </button>
                        </div>

                        {showParamHelp && (
                            <ConceptExplainer 
                                title="Parameters"
                                description="Parameters are the number of adjustable 'knobs' inside the AI's brain. More parameters usually mean the AI knows more and is smarter, but it takes more computer power to run!"
                                analogy="Think of it like the number of books in a library. A library with 70 Billion books (70B) knows way more than a library with 1 Billion books (1B)."
                                onClose={() => setShowParamHelp(false)}
                                className="mb-4 text-xs"
                            />
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Model Size (Parameters)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(ModelSize).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setState(prev => ({...prev, modelSize: size}))}
                                            className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                                                state.modelSize === size 
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 transform scale-105' 
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
                                            }`}
                                        >
                                            {size.split(' ')[0]} <span className="opacity-60 font-normal">{size.split(' ')[1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Capabilities</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setState(prev => ({...prev, capability: ModelCapability.Standard}))}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                            state.capability === ModelCapability.Standard
                                            ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-200'
                                            : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${state.capability === ModelCapability.Standard ? 'bg-indigo-500/20' : 'bg-slate-700'}`}>
                                            <Cpu size={18} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold block">Standard Chat</span>
                                            <span className="text-[10px] opacity-70">Fast & General Purpose</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setState(prev => ({...prev, capability: ModelCapability.Reasoning}))}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                            state.capability === ModelCapability.Reasoning
                                            ? 'bg-amber-900/30 border-amber-500/50 text-amber-200'
                                            : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${state.capability === ModelCapability.Reasoning ? 'bg-amber-500/20' : 'bg-slate-700'}`}>
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold block">Reasoning (Chain of Thought)</span>
                                            <span className="text-[10px] opacity-70">Thinks step-by-step before answering</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setState(prev => ({...prev, capability: ModelCapability.Vision}))}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                            state.capability === ModelCapability.Vision
                                            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-200'
                                            : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${state.capability === ModelCapability.Vision ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold block">Vision (Multimodal)</span>
                                            <span className="text-[10px] opacity-70">Can see and analyze images</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Input Card */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500"></div>
                        
                        <h2 className="font-bold text-lg mb-4 text-slate-200">Test the Model</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder={state.capability === ModelCapability.Vision ? "Describe this image..." : "Ask a question..."}
                                    value={state.input}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 transition-all text-sm"
                                />
                            </div>

                            {state.capability === ModelCapability.Vision && (
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-900/10 transition-colors cursor-pointer relative overflow-hidden"
                                    >
                                        {state.image ? (
                                            <>
                                                <img src={state.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                                <div className="relative z-10 bg-black/50 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm">Change Image</div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={24} className="text-slate-500 mb-2" />
                                                <span className="text-xs text-slate-500 font-medium">Click to upload image</span>
                                            </>
                                        )}
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                            )}

                            <button
                                onClick={runSimulation}
                                disabled={state.isProcessing || (!state.input && !state.image)}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                    state.isProcessing 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/20'
                                }`}
                            >
                                {state.isProcessing ? (
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{state.capability === ModelCapability.Reasoning && state.currentStepIndex >= 4 && state.currentStepIndex < 5 ? "Thinking..." : "Processing..."}</span>
                                    </div>
                                ) : (
                                    <>
                                        <PlayCircle size={24} />
                                        <span>Run Simulation</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right Column: Visualization (8 cols) */}
                <section className="lg:col-span-8 space-y-8">
                    
                    {/* 1. Step Pipeline Visualizer */}
                    <div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 pl-1">Process Pipeline (Click steps to learn)</h3>
                        <StepVisualizer 
                            currentStep={state.currentStepIndex} 
                            input={state.input}
                            tokens={state.tokens}
                            capability={state.capability}
                            image={state.image}
                        />
                    </div>

                    {/* 2. Neural Network Visualization */}
                    <div className="bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/90 backdrop-blur-sm z-10 flex items-center px-6 border-b border-slate-800 justify-between">
                            <div className="flex items-center gap-2 text-slate-200">
                                <Cpu size={16} className="text-indigo-400" />
                                <span className="font-bold text-sm">Neural Network Live View</span>
                            </div>
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                                {state.modelSize.split(' ')[0]} Architecture
                            </span>
                        </div>
                        
                        <div className="pt-10">
                            <NeuralNetworkViz 
                                isActive={
                                    // Active during Attention (3), Reasoning (4), or Prediction (5)
                                    state.currentStepIndex >= 3 && state.currentStepIndex <= 5
                                } 
                                layerCount={getLayerCount()} 
                            />
                        </div>
                    </div>

                    {/* 3. Outputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Text Output */}
                        <div className={`rounded-2xl p-6 border transition-all duration-700 min-h-[200px] flex flex-col ${
                            state.output ? 'bg-slate-900 border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/50 border-transparent opacity-60'
                        }`}>
                            <h3 className="text-emerald-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                                <MessageSquare size={14} />
                                Final Response
                            </h3>
                            <div className="prose prose-invert prose-sm max-w-none flex-1">
                                {state.output ? (
                                    <p className="leading-relaxed text-slate-200 animate-fadeIn">
                                        {state.output}
                                    </p>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                                        {state.currentStepIndex >= 4 ? "Generating..." : "Waiting for model output..."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Probabilities */}
                        <div className={`rounded-2xl p-6 border transition-all duration-700 ${
                            state.probabilities.length > 0 ? 'bg-slate-900 border-blue-500/30 shadow-lg shadow-blue-500/10' : 'bg-slate-900/50 border-transparent opacity-60'
                        }`}>
                            <ProbabilityChart data={state.probabilities} />
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-500 leading-normal">
                                    <strong className="text-slate-400">Why these bars?</strong> LLMs don't "know" the answer. They calculate which word is statistically most likely to come next!
                                </p>
                            </div>
                        </div>

                    </div>

                </section>
            </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Brain size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300">
                        LLM Explorer
                    </h1>
                </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700 overflow-x-auto">
                <button 
                  onClick={() => setState(prev => ({...prev, mode: AppMode.Inference}))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${state.mode === AppMode.Inference ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                   <Terminal size={14} />
                   Playground
                </button>
                <button 
                  onClick={() => setState(prev => ({...prev, mode: AppMode.Training}))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${state.mode === AppMode.Training ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                   <Beaker size={14} />
                   Fine-Tuning Lab
                </button>
                 <button 
                  onClick={() => setState(prev => ({...prev, mode: AppMode.RAG}))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${state.mode === AppMode.RAG ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                   <Database size={14} />
                   Advanced RAG
                </button>
            </div>

            <div className="hidden md:block text-slate-500 text-xs font-mono">
                Powered by Gemini 2.5
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;