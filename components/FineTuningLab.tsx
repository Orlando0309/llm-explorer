import React, { useState, useRef } from 'react';
import { TrainingMethod, TrainingDataPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, RotateCw, Settings, Lock, Zap, Activity, Snowflake, Flame, StickyNote, Box, Brain, Microchip, GitMerge } from 'lucide-react';
import ConceptExplainer from './ConceptExplainer';
import AnimatedCounter from './AnimatedCounter';
import SingleNeuronViz from './SingleNeuronViz';

const FineTuningLab: React.FC = () => {
  const [method, setMethod] = useState<TrainingMethod>(TrainingMethod.Full);
  const [epochs, setEpochs] = useState(3);
  const [batchSize, setBatchSize] = useState(32);
  const [isTraining, setIsTraining] = useState(false);
  const [data, setData] = useState<TrainingDataPoint[]>([]);
  const [currentLoss, setCurrentLoss] = useState<number | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
  const intervalRef = useRef<number | null>(null);

  // Constants for "3B Model" Simulation
  const TOTAL_PARAMS_3B = 3_000_000_000;
  const LORA_PARAMS = 8_000_000; // ~0.2%
  
  // Stats calculation
  const totalExamples = 1000;
  const stepsPerEpoch = Math.ceil(totalExamples / batchSize);
  const totalSteps = epochs * stepsPerEpoch;

  const startTraining = () => {
    setIsTraining(true);
    setData([]);
    setTrainingProgress(0);
    let step = 0;
    let simulatedLoss = 2.5; // Starting loss

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      step++;
      const progress = step / totalSteps;
      setTrainingProgress(progress);
      
      // Simulate Loss Curve logic
      const noise = (Math.random() - 0.5) * (method === TrainingMethod.Full ? 0.15 : 0.08);
      const decay = method === TrainingMethod.LoRA ? 0.97 : 0.95; 
      
      simulatedLoss = (simulatedLoss * decay) + Math.abs(noise); 
      if (simulatedLoss < 0.1) simulatedLoss = 0.1 + Math.random() * 0.05;

      const newDataPoint = {
        step,
        loss: parseFloat(simulatedLoss.toFixed(3)),
        accuracy: Math.min(0.99, 1 - (simulatedLoss / 3)) * 100
      };

      setCurrentLoss(newDataPoint.loss);
      
      setData(prev => {
          const safePrev = prev || [];
          const updated = [...safePrev, newDataPoint];
          return updated.slice(-50); // Keep last 50 points for smooth chart
      });

      if (step >= totalSteps) {
        if (intervalRef.current !== null) clearInterval(intervalRef.current);
        setIsTraining(false);
        setTrainingProgress(1);
      }
    }, 200); 
  };

  const reset = () => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    setIsTraining(false);
    setData([]);
    setCurrentLoss(null);
    setTrainingProgress(0);
  };

  const renderNeuralSurgery = () => {
    const isLoRA = method === TrainingMethod.LoRA || method === TrainingMethod.QLoRA;
    const isQLoRA = method === TrainingMethod.QLoRA;
    const isFull = method === TrainingMethod.Full;
    
    // Schematic Positions
    const xInput = 60;
    const xHidden = 200;
    const xOutput = 340;
    
    // Nodes
    const nodes = [80, 140, 200, 260];

    return (
        <svg width="100%" height="100%" viewBox="0 0 400 350" preserveAspectRatio="xMidYMid meet">
            <defs>
                <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
                </pattern>
                
                <pattern id="pixelPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="2" height="2" fill="#334155" />
                    <rect x="2" y="2" width="2" height="2" fill="#334155" />
                </pattern>

                <linearGradient id="adapterFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                </linearGradient>

                 <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#gridPattern)" opacity="0.3" />

            {/* --- LABELS --- */}
            <g transform="translate(0, 20)">
                <text x={xInput} y={0} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1px">DATA IN</text>
                <text x={xHidden} y={0} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1px">THE BRAIN (MODEL)</text>
                <text x={xOutput} y={0} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" letterSpacing="1px">PREDICTION</text>
            </g>

            {/* --- 1. Main Network Pathways (The 3B Params) --- */}
            <g>
                {/* Connections Input -> Hidden */}
                {nodes.map((y1, i) => nodes.map((y2, j) => {
                    if ((i+j) % 2 !== 0) return null; // Sparsity
                    
                    let stroke = "#475569"; // Default Grey
                    let width = 2;
                    let opacity = 0.4;
                    let dashArray = "0";
                    let animate = false;

                    if (isFull) {
                        stroke = isTraining ? "#f43f5e" : "#475569";
                        opacity = isTraining ? 0.8 : 0.4;
                        width = isTraining ? 2.5 : 2;
                        animate = isTraining;
                    } else if (isLoRA) {
                        stroke = "#60a5fa"; // Frozen Blue-Grey
                        opacity = 0.2; 
                        dashArray = "4 2";
                    }

                    return (
                        <line 
                            key={`main-${i}-${j}`} 
                            x1={xInput + 20} y1={y1} x2={xHidden - 20} y2={y2} 
                            stroke={stroke} 
                            strokeWidth={width}
                            strokeOpacity={opacity}
                            strokeDasharray={dashArray} 
                            className={animate ? "animate-pulse" : ""}
                        />
                    );
                }))}
                
                {/* Connections Hidden -> Output */}
                 {nodes.map((y1, i) => nodes.map((y2, j) => {
                    if ((i+j) % 2 === 0) return null;
                    
                    let stroke = "#475569";
                    let width = 2;
                    let opacity = 0.4;
                    let dashArray = "0";
                    let animate = false;

                    if (isFull) {
                         stroke = isTraining ? "#f43f5e" : "#475569";
                         opacity = isTraining ? 0.8 : 0.4;
                         width = isTraining ? 2.5 : 2;
                         animate = isTraining;
                    } else if (isLoRA) {
                        stroke = "#60a5fa";
                        opacity = 0.2;
                        dashArray = "4 2";
                    }

                    return (
                         <line 
                            key={`main-out-${i}-${j}`} 
                            x1={xHidden + 20} y1={y1} x2={xOutput - 20} y2={y2} 
                            stroke={stroke} 
                            strokeWidth={width}
                            strokeOpacity={opacity}
                            strokeDasharray={dashArray}
                            className={animate ? "animate-pulse" : ""}
                        />
                    );
                }))}
            </g>

            {/* --- 2. LoRA Adapter Circuits (The Bypass) --- */}
            {isLoRA && (
                <g filter="url(#glow)">
                    {/* Visual Connector Lines (Bypass) with Flow Animation */}
                    <path 
                        d={`M ${xInput + 20} 100 Q ${xInput + 80} 300, 160 300`} 
                        fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" opacity="0.8"
                    >
                        {isTraining && <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />}
                    </path>
                     <path 
                        d={`M 240 300 Q ${xOutput - 80} 300, ${xOutput - 20} 100`} 
                        fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" opacity="0.8"
                    >
                        {isTraining && <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />}
                    </path>

                    {/* The Adapter Module Box */}
                    <rect x={160} y={280} width={80} height={40} rx={6} fill="url(#adapterFill)" stroke="#fbbf24" strokeWidth={2} />
                    
                    <text x={200} y={305} textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold" style={{ pointerEvents: 'none'}}>LoRA Adapter</text>
                    
                    {/* Particles Flowing in Adapter */}
                    {isTraining && (
                        <>
                           <circle r="4" fill="#fff">
                               <animateMotion dur="1s" repeatCount="indefinite" path={`M ${xInput + 20} 100 Q ${xInput + 80} 300, 160 300`} />
                           </circle>
                           <circle r="4" fill="#fff">
                               <animateMotion dur="1s" repeatCount="indefinite" begin="0.5s" path={`M 240 300 Q ${xOutput - 80} 300, ${xOutput - 20} 100`} />
                           </circle>
                        </>
                    )}
                </g>
            )}

            {/* --- 3. SHAPES (Distinct visual metaphors) --- */}
            
            {/* INPUTS: Data Stacks */}
            {nodes.map((y, i) => (
                <g key={`in-${i}`} transform={`translate(${xInput}, ${y})`}>
                    <rect x="-15" y="-10" width="30" height="20" rx="2" fill="#334155" stroke="#10b981" strokeWidth="1.5" />
                    <line x1="-10" y1="-4" x2="10" y2="-4" stroke="#94a3b8" strokeWidth="1"/>
                    <line x1="-10" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="1"/>
                    {/* Energy Output Pulse */}
                    {isTraining && (
                        <circle r="3" fill="#10b981" cx="15" cy="0">
                            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                    )}
                </g>
            ))}
            
            {/* HIDDEN: The Brain Neurons */}
            {nodes.map((y, i) => (
                <g key={`hid-${i}`} transform={`translate(${xHidden}, ${y})`}>
                    
                    {/* Full Training: Visual Pulse / Heat */}
                    {isFull && isTraining && (
                         <circle r="18" fill="#f43f5e" opacity="0.3">
                            <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                         </circle>
                    )}
                    
                    {/* Neuron Circle */}
                    <circle 
                        r="12" 
                        fill={isQLoRA ? "url(#pixelPattern)" : "#1e293b"} 
                        stroke={isLoRA ? "#60a5fa" : (isFull ? (isTraining ? "#f43f5e" : "#ef4444") : "#64748b")} 
                        strokeWidth={2} 
                    />
                    
                    {/* If LoRA: Lock Icon overlay */}
                    {isLoRA && (
                        <>
                            <circle r="12" fill="#000" opacity="0.3" />
                            <Lock size={12} x={-6} y={-6} className="text-blue-200" />
                        </>
                    )}
                </g>
            ))}

            {/* OUTPUTS: Prediction Targets */}
            {nodes.map((y, i) => (
                <g key={`out-${i}`} transform={`translate(${xOutput}, ${y})`}>
                    <polygon points="0,-12 12,0 0,12 -12,0" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
                    <circle r="4" fill="#8b5cf6" opacity={isTraining ? 1 : 0.5}>
                        {isTraining && <animate attributeName="opacity" values="0.2;1;0.2" dur="0.5s" repeatCount="indefinite" />
                        }
                    </circle>
                </g>
            ))}

        </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      
      {/* LEFT PANEL: CONFIGURATION */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Config Card */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <Settings className="text-indigo-400" size={20} />
              <h2 className="font-bold text-lg text-slate-200">Laboratory Config</h2>
           </div>

           <div className="space-y-6">
              {/* Method Selector */}
              <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Training Strategy</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[TrainingMethod.Full, TrainingMethod.LoRA, TrainingMethod.QLoRA].map((m) => {
                        const isSelected = method === m;
                        return (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                disabled={isTraining}
                                className={`relative text-left px-4 py-3 rounded-lg border transition-all ${
                                    isSelected 
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{m}</span>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                                </div>
                                <div className="text-[10px] mt-1 opacity-70">
                                    {m === TrainingMethod.Full ? "Heavy! Updates all 3 Billion params." : "Lightweight! Updates ~0.2% params."}
                                </div>
                            </button>
                        );
                    })}
                  </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Epochs</label>
                      <select 
                        value={epochs} 
                        onChange={(e) => setEpochs(Number(e.target.value))}
                        disabled={isTraining}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      >
                          {[1, 3, 5, 10].map(n => <option key={n} value={n}>{n} Epochs</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Batch Size</label>
                      <select 
                        value={batchSize} 
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        disabled={isTraining}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      >
                          {[8, 16, 32, 64].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                  </div>
              </div>
              
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-slate-400">
                  Calculated Steps: <span className="text-white font-bold">{totalSteps}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                  {!isTraining ? (
                      <button 
                        onClick={startTraining}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                          <Play size={18} fill="currentColor" />
                          Start Training
                      </button>
                  ) : (
                      <button 
                        onClick={reset}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                      >
                          <RotateCw size={18} />
                          Stop & Reset
                      </button>
                  )}
              </div>
           </div>
        </div>

        {/* Detailed Explanation Card (Dynamic) */}
        {method === TrainingMethod.Full ? (
             <ConceptExplainer
                title="Full Fine-Tuning"
                description="We are performing 'Brain Surgery' on the entire model. Every single one of the 3 Billion parameters is unlocked and adjusted. It's powerful but requires a massive supercomputer."
                analogy="Like trying to rewrite an entire encyclopedia just to add one new chapter."
                icon={<Brain size={24} />}
            />
        ) : (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <StickyNote size={64} />
                </div>
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <GitMerge size={20} />
                    <h3 className="font-bold text-lg">LoRA Adapter Magic</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                    Instead of changing the giant brain, we attach a tiny <strong>"Adapter Backpack"</strong> (Matrix A & B) to it.
                </p>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                         <span>Frozen Weights (W):</span>
                         <span className="flex items-center gap-1 text-blue-300"><Lock size={10}/> Locked</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                         <span>Adapter (ΔW):</span>
                         <span className="flex items-center gap-1 text-amber-300"><Activity size={10}/> Trainable</span>
                    </div>
                    <div className="h-px bg-slate-700 my-1"></div>
                    <div className="text-center text-white font-bold">
                        Final = W + (A × B)
                    </div>
                </div>
            </div>
        )}
        
        {method === TrainingMethod.QLoRA && (
             <ConceptExplainer
                title="Quantization (QLoRA)"
                description="Before adding adapters, we compress the main brain from 16-bit precision to 4-bit. It makes the model 'pixelated' but extremely memory efficient."
                analogy="Like compressing a 4K movie into a GIF so it fits on a floppy disk, but it still plays!"
                icon={<Microchip size={24} />}
                className="mt-4"
            />
        )}

      </div>

      {/* RIGHT PANEL: VISUALIZATION */}
      <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 1. NEURAL SURGERY VIEW */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl relative flex flex-col h-[450px] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-3 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                      <Activity className="text-emerald-400" size={18} />
                      <span className="font-bold text-slate-200 text-sm">Neural Surgery View</span>
                  </div>
                  <div className="flex gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1 text-slate-400">
                          <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                          Frozen
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          Training
                      </div>
                  </div>
              </div>
              
              <div className="flex-1 w-full min-h-0 relative mt-10">
                  <div className="absolute inset-0">
                       {renderNeuralSurgery()}
                  </div>
              </div>

              {/* Visual Decoder / Legend */}
              <div className="bg-slate-950 border-t border-slate-800 p-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-slate-400 z-10">
                  <div className="flex items-center gap-2">
                      <Box className="text-emerald-500" size={14} />
                      <span>Data Batches (Inputs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="relative">
                          <Lock size={12} className="text-blue-400" />
                          <Snowflake size={12} className="text-blue-200 absolute -top-1 -right-1 opacity-70" />
                      </div>
                      <span>Frozen Weights (Memory Saved)</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="relative">
                           <Zap size={14} className="text-amber-500" />
                           <Flame size={10} className="text-red-500 absolute -top-1 -right-1" />
                      </div>
                      <span>Gradient Flow (Heat)</span>
                  </div>
                  <div className="flex items-center gap-2">
                       <GitMerge size={14} className="text-amber-400" />
                       <span>Adapter Bypass</span>
                  </div>
              </div>
          </div>

          {/* 2. STATS & LOSS CHART */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* "What Really Happened" Stats */}
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Inside the 3B Model</h3>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-xs">Total Parameters</span>
                          <span className="text-slate-200 font-mono text-sm">3,000,000,000</span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-xs">Params Updating</span>
                          <span className={`font-mono text-lg font-bold ${method === TrainingMethod.Full ? 'text-rose-400' : 'text-emerald-400'}`}>
                              <AnimatedCounter 
                                value={method === TrainingMethod.Full ? TOTAL_PARAMS_3B : LORA_PARAMS} 
                              />
                          </span>
                      </div>
                      
                      {/* Visual Bar Comparison */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                          {method === TrainingMethod.Full ? (
                              <div className="h-full bg-rose-500 w-full animate-pulse"></div>
                          ) : (
                              <>
                                <div className="h-full bg-slate-600 w-full opacity-30"></div>
                                <div className="h-full bg-emerald-500 w-1 animate-pulse" title="0.2%"></div>
                              </>
                          )}
                      </div>
                      
                      <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                          {method === TrainingMethod.Full 
                            ? "Updating everything requires huge GPU memory!" 
                            : "Only updating the tiny sliver (green) makes it fast & cheap."}
                      </div>
                  </div>
              </div>

              {/* Loss Chart */}
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 min-h-[200px]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Learning Curve (Loss)</h3>
                      {currentLoss !== null && (
                          <span className="text-emerald-400 font-mono text-sm font-bold">
                              {currentLoss.toFixed(4)}
                          </span>
                      )}
                  </div>
                  
                  <div className="h-32 w-full">
                      {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="step" hide />
                                <YAxis domain={[0, 3]} hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="loss" 
                                    stroke="#10b981" 
                                    strokeWidth={2} 
                                    dot={false}
                                    isAnimationActive={false} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                      ) : (
                          <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                              Start training to see metrics...
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* 3. SINGLE NEURON MICROSCOPE */}
          <SingleNeuronViz method={method} isTraining={isTraining} />

      </div>
    </div>
  );
};

export default FineTuningLab;