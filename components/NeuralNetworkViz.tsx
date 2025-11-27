import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Network, Activity, Zap } from 'lucide-react';

interface NeuralNetworkVizProps {
  isActive: boolean;
  layerCount: number; // Represents model size
}

const NeuralNetworkViz: React.FC<NeuralNetworkVizProps> = ({ isActive, layerCount }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  // Calculate Topology
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 400; // Increased height for better visualization
    
    // Layers: Input -> Hidden ... -> Output
    const layers = 2 + Math.min(layerCount, 6); 
    // Logic to shape the network: hourglass or cylinder depending on size
    const nodesPerLayer = [
        4, // Input
        ...Array(layers - 2).fill(Math.min(layerCount * 2 + 2, 8)), // Hidden
        4 // Output
    ];
    
    const newNodes: any[] = [];
    const newLinks: any[] = [];

    let nodeId = 0;
    const layerXStep = width / (layers + 1);
    
    nodesPerLayer.forEach((count, layerIndex) => {
      const layerX = (layerIndex + 1) * layerXStep;
      const layerYStep = height / (count + 1);
      
      for (let i = 0; i < count; i++) {
        const id = nodeId++;
        newNodes.push({
          id,
          layer: layerIndex,
          x: layerX,
          y: (i + 1) * layerYStep,
          r: 6 + (layerIndex === 0 || layerIndex === layers - 1 ? 4 : 0),
          value: Math.random().toFixed(2) // Simulate neuron activation value
        });
      }
    });

    // Create dense connections with random "weights"
    for (let i = 0; i < newNodes.length; i++) {
      const source = newNodes[i];
      const nextLayerNodes = newNodes.filter(n => n.layer === source.layer + 1);
      
      nextLayerNodes.forEach(target => {
        // Randomly drop connections for visual clarity, unless it's a small model
        if (Math.random() > 0.3 || layerCount < 2) {
            // Weight determines line thickness
            const weight = Math.random(); 
            newLinks.push({ source, target, weight });
        }
      });
    }

    setNodes(newNodes);
    setLinks(newLinks);

  }, [layerCount]);

  // Render and Animate with D3
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Draw Weights (Links)
    // Thickness = Weight magnitude
    const linkSelection = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y)
      .attr("stroke", "#334155")
      .attr("stroke-width", (d: any) => Math.max(0.5, d.weight * 3)) // Visualizing weight
      .attr("stroke-opacity", (d: any) => 0.3 + d.weight * 0.4)
      .attr("class", "link");

    // Draw Neurons (Nodes)
    const nodeSelection = g.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y)
      .attr("r", (d: any) => d.r)
      .attr("fill", (d: any) => {
          if (d.layer === 0) return "#34d399"; // Input (Green)
          const lastLayerIndex = nodes[nodes.length - 1]?.layer;
          if (d.layer === lastLayerIndex) return "#f472b6"; // Output (Pink)
          return "#818cf8"; // Hidden (Indigo)
      })
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2);

    // Add value labels on hover (The "Math" part)
    nodeSelection.append("title")
        .text((d: any) => `Val: ${d.value}\nLayer: ${d.layer}`);

    if (!isActive) return;

    // Pulse Animation (The "Activation")
    const pulse = () => {
      // Animate Nodes activating
      nodeSelection
        .transition()
        .delay((d: any) => d.layer * 200) // Propagate through layers
        .duration(300)
        .attr("r", (d: any) => (d?.r || 6) * 1.5)
        .attr("fill", "#fbbf24") // Active Color (Amber/Electricity)
        .transition()
        .duration(300)
        .attr("r", (d: any) => d?.r || 6)
        .attr("fill", (d: any) => {
            if (d.layer === 0) return "#34d399";
            const lastLayerIndex = nodes[nodes.length - 1]?.layer;
            if (d.layer === lastLayerIndex) return "#f472b6";
            return "#818cf8";
        });

      // Animate Signals flowing through weights
      // Only animate connections with high weights (strong connections) more visibly
      linkSelection
           .filter((d: any) => d.weight > 0.3)
           .transition()
           .delay((d: any) => d.source.layer * 200)
           .duration(300)
           .attr("stroke", "#fbbf24") // Signal Color
           .attr("stroke-width", (d: any) => Math.max(1, d.weight * 5))
           .attr("stroke-opacity", 1)
           .transition()
           .duration(500)
           .attr("stroke", "#334155")
           .attr("stroke-width", (d: any) => Math.max(0.5, d.weight * 3))
           .attr("stroke-opacity", (d: any) => 0.3 + d.weight * 0.4);
    };

    const interval = setInterval(pulse, 1500); // Pulse every 1.5s
    pulse();

    return () => {
      clearInterval(interval);
      svg.selectAll("*").interrupt();
    };
  }, [isActive, nodes, links]);

  return (
    <div className="relative w-full h-[400px] bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend / Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
              <span className="text-xs text-slate-300 font-mono">Neuron (Holds Number)</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-8 h-1 bg-slate-500 rounded-full"></div>
              <span className="text-xs text-slate-300 font-mono">Weight (Connection Strength)</span>
          </div>
      </div>

      <div className="absolute bottom-4 right-4">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold transition-all z-10"
          >
             <Zap size={16} />
             {showExplanation ? "Hide Math" : "How it Works"}
          </button>
      </div>

      {showExplanation && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-8 z-20 animate-fadeIn">
            <div className="max-w-md space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-indigo-400" />
                    Inside the "Black Box"
                </h3>
                
                <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-bold text-indigo-300 mb-1">1. The Weights (Lines)</h4>
                        <p className="text-slate-300 text-sm">
                            Think of weights like <strong>volume knobs</strong>. Thick lines are loud volume, thin lines are quiet. 
                            The model learns which knobs to turn up during training!
                        </p>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="font-bold text-amber-300 mb-1">2. The Activation Function ƒ(x)</h4>
                        <p className="text-slate-300 text-sm">
                            Every neuron has a strict gatekeeper named <strong>ReLU</strong> (or similar). 
                            It looks at the incoming signal and says: 
                            <em className="block mt-2 text-slate-400">"If the number is negative, make it zero. If it's positive, pass it through!"</em>
                            This simple rule allows the network to learn complex shapes and ideas.
                        </p>
                    </div>

                    <div className="text-center pt-2">
                        <button 
                            onClick={() => setShowExplanation(false)}
                            className="text-slate-400 hover:text-white underline text-sm"
                        >
                            Return to visualization
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkViz;