import React, { useState, useEffect, useRef } from 'react';
import { TrainingMethod } from '../types';
import { Calculator, ArrowRight, Zap, Target, RefreshCw, ChevronRight } from 'lucide-react';

interface SingleNeuronVizProps {
  method: TrainingMethod;
  isTraining: boolean;
}

const SingleNeuronViz: React.FC<SingleNeuronVizProps> = ({ method, isTraining }) => {
  const [phase, setPhase] = useState<'IDLE' | 'FORWARD' | 'BACKWARD' | 'UPDATE'>('IDLE');
  const [weights, setWeights] = useState([0.3, -0.2]); // Starting weights
  const [output, setOutput] = useState(0);
  const [gradient, setGradient] = useState([0, 0]); // Gradients for weights
  const [epoch, setEpoch] = useState(0);

  // Constants
  const inputs = [0.8, 0.5];
  const target = 0.9; // What the neuron *wants* to output
  const bias = 0.1;
  const learningRate = 0.05;

  // Refs for animation loop
  const timeoutRef = useRef<number | null>(null);

  const runTrainingCycle = () => {
    // 1. FORWARD PASS (0ms - 1000ms)
    setPhase('FORWARD');
    
    timeoutRef.current = window.setTimeout(() => {
        
        // 2. BACKWARD PASS (1000ms - 2000ms)
        setPhase('BACKWARD');
        
        // Calculate Error & Gradient
        setWeights(currentW => {
             const currentSum = (inputs[0] * currentW[0]) + (inputs[1] * currentW[1]) + bias;
             const pred = Math.max(0, currentSum); // ReLU
             const error = pred - target;
             
             // Visual Gradient (simplified magnitude for display)
             const g0 = error * inputs[0];
             const g1 = error * inputs[1];
             setGradient([g0, g1]);
             setOutput(pred); // Update displayed output
             
             return currentW; // Don't change weights yet
        });

        timeoutRef.current = window.setTimeout(() => {
            
            // 3. UPDATE STEP (2000ms - 2500ms)
            setPhase('UPDATE');
            
            setWeights(currentW => {
                const currentSum = (inputs[0] * currentW[0]) + (inputs[1] * currentW[1]) + bias;
                const pred = Math.max(0, currentSum);
                const error = pred - target;

                // Apply Gradient Descent
                // w_new = w_old - (lr * gradient)
                const newW0 = currentW[0] - (learningRate * error * inputs[0]);
                const newW1 = currentW[1] - (learningRate * error * inputs[1]);
                
                return [newW0, newW1];
            });

            setEpoch(e => e + 1);

            timeoutRef.current = window.setTimeout(() => {
                // Loop
                runTrainingCycle();
            }, 800); // Pause to see updated weights

        }, 1500); // Duration of backward pass

    }, 1500); // Duration of forward pass
  };

  // Reset when training stops/starts
  useEffect(() => {
    if (!isTraining) {
      setPhase('IDLE');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setWeights([0.3, -0.2]);
      setOutput(0);
      setEpoch(0);
      setGradient([0, 0]);
    } else {
      runTrainingCycle();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTraining]);

  const isLoRA = method !== TrainingMethod.Full;
  // For LoRA visualization: effective weight = frozen + adapter
  // We'll simulate that the "delta" is what's changing.
  const baseWeights = [0.3, -0.2];

  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-xl relative overflow-hidden transition-all duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-500/20 p-1.5 rounded text-indigo-400">
                <Calculator size={16} />
             </div>
             <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Single Neuron Training Loop</h3>
                <p className="text-[10px] text-slate-500">
                    {phase === 'IDLE' && "Ready to train"}
                    {phase === 'FORWARD' && "Phase 1: Forward Pass (Prediction)"}
                    {phase === 'BACKWARD' && "Phase 2: Backward Pass (Calculating Error)"}
                    {phase === 'UPDATE' && "Phase 3: Gradient Descent (Learning)"}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="text-[10px] text-slate-400 font-mono">Epoch: {epoch}</div>
             {isTraining && (
                 <RefreshCw size={12} className={`text-emerald-400 ${phase === 'UPDATE' ? 'animate-spin' : ''}`} />
             )}
          </div>
      </div>

      {/* Main SVG Visualization */}
      <div className="relative h-[240px] w-full select-none bg-slate-950/50 rounded-lg border border-slate-800/50">
         <svg width="100%" height="100%" viewBox="0 0 600 240" className="overflow-visible">
            <defs>
               <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" fill="#64748b">
                  <path d="M0,0 L0,6 L6,3 z" />
               </marker>
               <filter id="glowGreen">
                   <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                   <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
               </filter>
               <filter id="glowRed">
                   <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                   <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
               </filter>
            </defs>

            {/* --- LAYOUT GUIDES --- */}
            {/* x1=100 (Inputs), x2=300 (Neuron), x3=500 (Output) */}

            {/* --- 1. INPUTS --- */}
            <g transform="translate(60, 80)">
                <text x="0" y="-40" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">INPUTS</text>
                
                {inputs.map((val, i) => (
                    <g key={i} transform={`translate(0, ${i * 80})`}>
                        <rect x="-25" y="-15" width="50" height="30" rx="4" fill="#1e293b" stroke={phase === 'FORWARD' ? "#34d399" : "#475569"} strokeWidth="2" />
                        <text x="0" y="5" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">{val}</text>
                        {/* Input Label */}
                        <text x="-40" y="5" textAnchor="end" fill="#64748b" fontSize="10" fontStyle="italic">x{i+1}</text>
                    </g>
                ))}
            </g>

            {/* --- 2. CONNECTIONS (WEIGHTS) --- */}
            {inputs.map((_, i) => (
                <g key={`conn-${i}`}>
                    {/* The Line */}
                    <line 
                        x1="100" y1={80 + (i * 80)} 
                        x2="300" y2={120} 
                        stroke="#475569" 
                        strokeWidth="2" 
                        markerEnd="url(#arrowHead)" 
                    />

                    {/* Forward Data Particle */}
                    {phase === 'FORWARD' && (
                        <circle r="4" fill="#34d399" filter="url(#glowGreen)">
                            <animateMotion 
                                dur="1.2s" 
                                repeatCount="1" 
                                path={`M 100 ${80 + (i*80)} L 300 120`} 
                                fill="freeze"
                            />
                        </circle>
                    )}

                    {/* Backward Gradient Particle */}
                    {(phase === 'BACKWARD' || phase === 'UPDATE') && (
                        <circle r="4" fill="#f43f5e" filter="url(#glowRed)">
                            <animateMotion 
                                dur="1.2s" 
                                repeatCount="1" 
                                path={`M 300 120 L 100 ${80 + (i*80)}`} 
                                fill="freeze"
                                keyPoints="0;1"
                                keyTimes="0;1"
                            />
                        </circle>
                    )}

                    {/* Weight Box */}
                    <g transform={`translate(${180 + (i*20)}, ${70 + (i * 60)})`}>
                        <rect 
                            x="-35" y="-16" width="70" height="32" rx="4" 
                            fill="#0f172a" 
                            stroke={phase === 'UPDATE' ? (gradient[i] > 0 ? "#f43f5e" : "#34d399") : "#64748b"} 
                            strokeWidth={phase === 'UPDATE' ? 2 : 1}
                            className={phase === 'UPDATE' ? "animate-pulse" : ""}
                        />
                        <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold">
                            {weights[i].toFixed(3)}
                        </text>
                        
                        {/* Gradient Indicator during Backward Phase */}
                        {phase === 'BACKWARD' && (
                            <text x="0" y="-22" textAnchor="middle" fontSize="10" fill="#f43f5e" fontWeight="bold" className="animate-bounce">
                                grad: {(gradient[i] * -1).toFixed(2)}
                            </text>
                        )}
                        
                        {/* Update Delta during Update Phase */}
                        {phase === 'UPDATE' && (
                            <text x="0" y="28" textAnchor="middle" fontSize="10" fill="#34d399" fontWeight="bold">
                                {weights[i] > (isLoRA ? baseWeights[i] : 0) ? "↑" : "↓"} updated
                            </text>
                        )}
                    </g>
                </g>
            ))}

            {/* --- 3. NEURON (Processing) --- */}
            <g transform="translate(300, 120)">
                <circle 
                    r="40" 
                    fill="#1e293b" 
                    stroke={phase === 'FORWARD' ? "#34d399" : (phase === 'BACKWARD' ? "#f43f5e" : "#818cf8")} 
                    strokeWidth="3" 
                    className="transition-colors duration-300"
                />
                <text x="0" y="-10" textAnchor="middle" fontSize="20" fill="#818cf8" fontWeight="bold">∑</text>
                <text x="0" y="10" textAnchor="middle" fontSize="10" fill="#cbd5e1">ReLU</text>
                {bias !== 0 && <text x="0" y="24" textAnchor="middle" fontSize="8" fill="#64748b">+ b ({bias})</text>}
            </g>

            {/* --- 4. OUTPUT & ERROR --- */}
            <g transform="translate(480, 120)">
                <line x1="-140" y1="0" x2="-40" y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowHead)" />
                
                {/* Prediction Bubble */}
                <circle r="30" fill="#1e293b" stroke={Math.abs(output - target) < 0.05 ? "#34d399" : "#a78bfa"} strokeWidth="3" />
                <text x="0" y="-40" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">PREDICTION</text>
                <text x="0" y="5" textAnchor="middle" fontSize="16" fill="#fff" fontWeight="bold">{output.toFixed(2)}</text>

                {/* Target (The Goal) */}
                <g transform="translate(80, 0)">
                     <Target size={24} className="text-emerald-500 mx-auto -translate-x-3 -translate-y-3" />
                     <text x="0" y="-40" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">TARGET</text>
                     <text x="0" y="5" textAnchor="middle" fontSize="16" fill="#34d399" fontWeight="bold">{target}</text>
                     
                     {/* Difference (Error) Line */}
                     {phase !== 'IDLE' && (
                         <path d="M -25 0 L -50 0" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
                     )}
                </g>
            </g>

            {/* --- ERROR VISUALIZATION --- */}
            {phase === 'BACKWARD' && (
                <g transform="translate(480, 60)">
                    <rect x="-60" y="-15" width="120" height="30" rx="4" fill="#450a0a" stroke="#f43f5e" />
                    <text x="0" y="5" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="bold">
                        Error: {(output - target).toFixed(2)}
                    </text>
                    <line x1="0" y1="15" x2="0" y2="30" stroke="#f43f5e" strokeWidth="1" />
                </g>
            )}

         </svg>
      </div>

      {/* Logic Explained */}
      <div className="mt-3 flex justify-between items-center text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex gap-4">
              <div className={`flex items-center gap-2 ${phase === 'FORWARD' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <span className="w-4 h-4 rounded-full bg-emerald-900 border border-emerald-500 flex items-center justify-center text-[8px]">1</span>
                  Forward
              </div>
              <ChevronRight size={12} className="text-slate-600" />
              <div className={`flex items-center gap-2 ${phase === 'BACKWARD' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                  <span className="w-4 h-4 rounded-full bg-rose-900 border border-rose-500 flex items-center justify-center text-[8px]">2</span>
                  Backward (Diff)
              </div>
              <ChevronRight size={12} className="text-slate-600" />
               <div className={`flex items-center gap-2 ${phase === 'UPDATE' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                  <span className="w-4 h-4 rounded-full bg-blue-900 border border-blue-500 flex items-center justify-center text-[8px]">3</span>
                  Update Weights
              </div>
          </div>
          {isLoRA && (
              <div className="text-[10px] text-amber-400 font-mono bg-amber-900/20 px-2 py-1 rounded border border-amber-500/30">
                  LoRA Mode: Only Adapter parts change
              </div>
          )}
      </div>

    </div>
  );
};

export default SingleNeuronViz;