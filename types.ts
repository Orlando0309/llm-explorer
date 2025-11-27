export enum ModelSize {
  Nano = 'Nano (1B)',
  Small = 'Small (4B)',
  Medium = 'Medium (8B)',
  Large = 'Large (70B+)'
}

export enum ModelCapability {
  Standard = 'Standard Chat',
  Reasoning = 'Reasoning (Chain of Thought)',
  Vision = 'Vision (Multimodal)'
}

export enum AppMode {
  Inference = 'Playground (Inference)',
  Training = 'Training Lab (Fine-Tuning)'
}

export enum TrainingMethod {
  Full = 'Full Fine-Tuning',
  LoRA = 'LoRA (Low-Rank Adaptation)',
  QLoRA = 'QLoRA (Quantized LoRA)'
}

export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  visualData?: any;
}

export interface TokenData {
  text: string;
  id: number;
  color: string;
  probability?: number;
}

export interface SimulationState {
  mode: AppMode;
  isProcessing: boolean;
  currentStepIndex: number;
  input: string;
  image: string | null;
  output: string;
  tokens: TokenData[];
  modelSize: ModelSize;
  capability: ModelCapability;
  probabilities: { name: string; value: number }[];
  thinkingProcess?: string;
}

export interface TrainingDataPoint {
  step: number;
  loss: number;
  accuracy: number;
}