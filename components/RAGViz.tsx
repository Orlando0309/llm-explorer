
import React, { useState, useEffect } from 'react';
import { Database, Search, Brain, User, Filter, CheckCircle, Split, ShieldCheck, Play, RotateCcw, FileText, Sparkles, Layers, Zap } from 'lucide-react';

type Step = 'IDLE' | 'INPUT' | 'DECOMPOSE' | 'RETRIEVE' | 'RERANK' | 'GENERATE' | 'EVALUATE' | 'DONE';

const RAGViz: React.FC = () => {
  const [step, setStep] = useState<Step>('IDLE');
  
  // Animation loop with slightly adjusted timings for "cinematic" feel
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const delays = {
      INPUT: 1500,
      DECOMPOSE: 2200,
      RETRIEVE: 2200,
      RERANK: 2200,
      GENERATE: 3000,
      EVALUATE: 2200,
      DONE: 0,
      IDLE: 0
    };

    if (step !== 'IDLE' && step !== 'DONE') {
      timer = setTimeout(() => {
        const flow: Step[] = ['INPUT', 'DECOMPOSE', 'RETRIEVE', 'RERANK', 'GENERATE', 'EVALUATE', 'DONE'];
        const next = flow[flow.indexOf(step) + 1];
        setStep(next);
      }, delays[step]);
    }

    return () => clearTimeout(timer);
  }, [step]);

  const startSim = () => setStep('INPUT');
  const resetSim = () => setStep('IDLE');

  // --- COMPONENT: DATA PACKET (Floating glowing orb/card) ---
  const DataPacket = ({ 
    active, 
    label, 
    icon,
    color = "indigo"
  }: { active: boolean, label: string, icon?: React.ReactNode, color?: string }) => {
    
    // Dynamic color classes
    const colorClasses = 
      color === "cyan" ? "border-cyan-400 text-cyan-100 shadow-cyan-500/50 bg-cyan-900" :
      color === "emerald" ? "border-emerald-400 text-emerald-100 shadow-emerald-500/50 bg-emerald-900" :
      color === "amber" ? "border-amber-400 text-amber-100 shadow-amber-500/50 bg-amber-900" :
      color === "rose" ? "border-rose-400 text-rose-100 shadow-rose-500/50 bg-rose-900" :
      "border-indigo-400 text-indigo-100 shadow-indigo-500/50 bg-indigo-900";

    return (
      <div 
        className={`absolute left-1/2 -translate-x-1/2 transition-all duration-[1500ms] ease-in-out z-30 pointer-events-none
        ${active ? 'opacity-100 top-[85%] scale-100' : 'opacity-0 top-[10%] scale-50'}`}
      >
         <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.3)] ${colorClasses}`}>
             <span className="animate-pulse">{icon}</span>
             <span className="text-xs font-bold whitespace-nowrap tracking-wide">{label}</span>
         </div>
      </div>
    );
  };

  // --- COMPONENT: CONNECTION PIPE ---
  const Connection = ({ 
    active, 
    label,
    packetIcon,
    packetColor
  }: { active: boolean, label: string, packetIcon?: React.ReactNode, packetColor?: string }) => {
    return (
      <div className="h-24 w-full relative flex justify-center items-center">
        {/* The Outer Pipe (Track) */}
        <div className="h-full w-1.5 bg-slate-800/50 rounded-full overflow-hidden relative backdrop-blur-sm border border-slate-700/30">
             {/* The Fluid Energy Fill */}
             <div 
                className={`absolute top-0 left-0 w-full bg-gradient-to-b from-indigo-500 via-purple-400 to-indigo-500 transition-all duration-[1500ms] ease-in-out ${active ? 'h-full opacity-100' : 'h-0 opacity-0'}`}
                style={{ backgroundSize: '200% 200%' }}
             >
                {/* Internal Shimmer effect */}
                {active && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
             </div>
        </div>

        {/* Static Label describing the pipe */}
        <div className={`absolute left-[55%] transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest bg-slate-950/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-md">
                {label}
            </div>
        </div>

        {/* Animated Data Packet */}
        <DataPacket active={active} label={label} icon={packetIcon} color={packetColor} />
      </div>
    );
  };

  // --- COMPONENT: GLASSMORPHIC NODE ---
  const Node = ({ 
    id, 
    icon, 
    label, 
    subLabel, 
    isActive, 
    isDone,
    color = "indigo"
  }: { 
    id: Step, 
    icon: React.ReactNode, 
    label: string, 
    subLabel?: string, 
    isActive: boolean, 
    isDone: boolean,
    color?: string
  }) => {
    
    // Sophisticated styling based on state
    let containerClass = "border-slate-800 bg-slate-900/40 text-slate-500";
    let iconBgClass = "bg-slate-800 text-slate-600";
    
    if (isActive) {
        if (color === 'cyan') { containerClass = "border-cyan-500/50 bg-cyan-950/40 shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] text-cyan-100"; iconBgClass = "bg-cyan-500/20 text-cyan-300"; }
        else if (color === 'emerald') { containerClass = "border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] text-emerald-100"; iconBgClass = "bg-emerald-500/20 text-emerald-300"; }
        else if (color === 'amber') { containerClass = "border-amber-500/50 bg-amber-950/40 shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] text-amber-100"; iconBgClass = "bg-amber-500/20 text-amber-300"; }
        else if (color === 'rose') { containerClass = "border-rose-500/50 bg-rose-950/40 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] text-rose-100"; iconBgClass = "bg-rose-500/20 text-rose-300"; }
        else { containerClass = "border-indigo-500/50 bg-indigo-950/40 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] text-indigo-100"; iconBgClass = "bg-indigo-500/20 text-indigo-300"; }
    } else if (isDone) {
        containerClass = "border-slate-700/50 bg-slate-900/20 text-slate-400 opacity-70";
        iconBgClass = "bg-slate-800 text-slate-400";
    }

    return (
      <div className={`relative z-10 w-full max-w-lg mx-auto transition-all duration-700 ease-out ${isActive ? 'scale-105' : 'scale-100'}`}>
        <div className={`flex items-center gap-5 p-4 rounded-2xl border backdrop-blur-md ${containerClass}`}>
          {/* Icon Circle */}
          <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-colors duration-500 ${iconBgClass}`}>
            {icon}
          </div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-center mb-0.5">
                 <h3 className="font-bold text-sm uppercase tracking-wider truncate">{label}</h3>
                 {isActive && <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${color}-400`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${color}-500`}></span>
                 </span>}
             </div>
             <p className={`text-xs font-medium leading-relaxed transition-opacity duration-500 ${isActive ? 'opacity-90' : 'opacity-50'}`}>
                 {subLabel}
             </p>
          </div>
        </div>
        
        {/* Active Glow Overlay */}
        {isActive && (
            <div className={`absolute -inset-0.5 rounded-2xl blur opacity-20 bg-${color}-500 animate-pulse -z-10`}></div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-800/50 shrink-0 relative z-20">
          <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/30">
                    <Split className="text-white" size={18}/>
                  </div>
                  Advanced RAG Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-1 pl-1">Retrieval Augmented Generation Data Flow</p>
          </div>
          <div className="flex gap-3">
              {step === 'IDLE' || step === 'DONE' ? (
                   <button 
                    onClick={startSim} 
                    className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] overflow-hidden"
                   >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                      <Play size={18} fill="currentColor" /> 
                      Run Request
                   </button>
              ) : (
                   <button onClick={resetSim} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-slate-700">
                      <RotateCcw size={16} /> Reset
                   </button>
              )}
          </div>
      </div>

      {/* PIPELINE VISUALIZATION */}
      <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800/50 relative overflow-y-auto custom-scrollbar p-8 flex flex-col items-center z-10">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ 
                   backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                   backgroundSize: '40px 40px' 
               }}>
          </div>

          <div className="w-full max-w-2xl relative z-10 pb-20">
              
              {/* STEP 1: USER */}
              <Node 
                id="INPUT" 
                icon={<User size={24}/>} 
                label="User Input" 
                subLabel='"How to fix error 500 on the API?"'
                isActive={step === 'INPUT'} 
                isDone={step !== 'IDLE' && step !== 'INPUT'}
              />

              <Connection 
                active={step === 'INPUT'} 
                label="Raw Query" 
                packetIcon={<FileText size={12} />}
              />
              
              {/* STEP 2: TRANSFORMER */}
              <Node 
                id="DECOMPOSE" 
                icon={<Split size={24}/>} 
                label="Query Transformer" 
                subLabel="Decomposing intent into sub-queries..."
                isActive={step === 'DECOMPOSE'} 
                isDone={['RETRIEVE', 'RERANK', 'GENERATE', 'EVALUATE', 'DONE'].includes(step)}
                color="cyan"
              />

              <Connection 
                active={step === 'DECOMPOSE'} 
                label="3 Sub-Queries" 
                packetIcon={<Layers size={12} />}
                packetColor="cyan"
              />

              {/* STEP 3: VECTOR DB */}
              <Node 
                id="RETRIEVE" 
                icon={<Database size={24}/>} 
                label="Vector Database" 
                subLabel="Semantic search across 1M+ embeddings"
                isActive={step === 'RETRIEVE'} 
                isDone={['RERANK', 'GENERATE', 'EVALUATE', 'DONE'].includes(step)}
                color="emerald"
              />

              <Connection 
                active={step === 'RETRIEVE'} 
                label="20 Raw Documents" 
                packetIcon={<FileText size={12} />}
                packetColor="emerald"
              />

              {/* STEP 4: RERANKER */}
              <Node 
                id="RERANK" 
                icon={<Filter size={24}/>} 
                label="Cross-Encoder Reranker" 
                subLabel="Scoring relevance & filtering noise"
                isActive={step === 'RERANK'} 
                isDone={['GENERATE', 'EVALUATE', 'DONE'].includes(step)}
                color="amber"
              />

              <Connection 
                active={step === 'RERANK'} 
                label="Top 3 Context Chunks" 
                packetIcon={<CheckCircle size={12} />}
                packetColor="amber"
              />

              {/* STEP 5: GENERATOR */}
              <Node 
                id="GENERATE" 
                icon={<Brain size={24}/>} 
                label="LLM Generator" 
                subLabel="Synthesizing answer from retrieved context"
                isActive={step === 'GENERATE'} 
                isDone={['EVALUATE', 'DONE'].includes(step)}
                color="indigo"
              />

              <Connection 
                active={step === 'GENERATE'} 
                label="Draft Response" 
                packetIcon={<Sparkles size={12} />}
                packetColor="indigo"
              />

              {/* STEP 6: EVALUATOR */}
              <Node 
                id="EVALUATE" 
                icon={<ShieldCheck size={24}/>} 
                label="Hallucination Guard" 
                subLabel="Verifying citations & faithfulness"
                isActive={step === 'EVALUATE'} 
                isDone={step === 'DONE'}
                color="rose"
              />

              {step === 'DONE' && (
                  <div className="mt-12 text-center animate-fadeIn">
                      <div className="inline-flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-full border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] transform hover:scale-105 transition-transform cursor-default">
                          <CheckCircle size={20} className="animate-bounce" />
                          <span className="font-bold text-base tracking-wide">Verified Answer Delivered</span>
                      </div>
                  </div>
              )}

          </div>

          {/* SIDE PANEL: LIVE EXPLANATION (Floating Glass Card) */}
          <div className="hidden xl:block absolute top-10 right-10 w-72 perspective-1000">
               <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-2xl sticky top-6 transform rotate-y-2 hover:rotate-0 transition-transform duration-500">
                   <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                       <Zap size={16} className="text-yellow-400" />
                       <h3 className="font-bold text-slate-200 text-xs uppercase tracking-widest">System Status</h3>
                   </div>
                   
                   <div className="space-y-6 relative">
                       {/* Connecting Line for Timeline */}
                       <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-800"></div>

                       <div className={`relative pl-6 transition-all duration-500 ${step === 'INPUT' ? 'opacity-100 translate-x-0' : 'opacity-40'}`}>
                           <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-indigo-500"></div>
                           <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase">Query Ingest</div>
                           <p className="text-slate-300 text-xs leading-relaxed">"Why is the API throwing 500?"</p>
                       </div>
                       
                       <div className={`relative pl-6 transition-all duration-500 ${step === 'DECOMPOSE' ? 'opacity-100 translate-x-0' : 'opacity-40'}`}>
                           <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-cyan-500"></div>
                           <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase">Sub-Query Generation</div>
                           <p className="text-slate-300 text-xs leading-relaxed">Splitting into: "API 500 causes", "Server logs", "Retry logic"</p>
                       </div>
                       
                       <div className={`relative pl-6 transition-all duration-500 ${step === 'RETRIEVE' ? 'opacity-100 translate-x-0' : 'opacity-40'}`}>
                           <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-emerald-500"></div>
                           <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase">Vector Search</div>
                           <p className="text-slate-300 text-xs leading-relaxed">Found 20 chunks. Similarity: 0.89</p>
                       </div>
                       
                       <div className={`relative pl-6 transition-all duration-500 ${step === 'RERANK' ? 'opacity-100 translate-x-0' : 'opacity-40'}`}>
                           <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-amber-500"></div>
                           <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase">Re-Ranking</div>
                           <p className="text-slate-300 text-xs leading-relaxed">Filtered down to 3 high-confidence docs.</p>
                       </div>
                       
                       <div className={`relative pl-6 transition-all duration-500 ${step === 'GENERATE' ? 'opacity-100 translate-x-0' : 'opacity-40'}`}>
                           <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-indigo-500"></div>
                           <div className="text-[10px] text-indigo-400 font-bold mb-1 uppercase">Synthesis</div>
                           <p className="text-slate-300 text-xs leading-relaxed">Generating response with citations [1], [3].</p>
                       </div>
                   </div>
               </div>
          </div>

      </div>
    </div>
  );
};

export default RAGViz;
