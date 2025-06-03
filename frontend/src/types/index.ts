export interface Model {
  id: string;
  name: string;
}

export interface ModelResponse {
  closedSource: Model[];
  openSource: Model[];
}

export interface SummaryResponse {
  summary1: string;
  summary2: string;
  model1: {
    name: string;
    type: 'closed' | 'open';
  };
  model2: {
    name: string;
    type: 'closed' | 'open';
  };
}

export interface Rating {
  modelName: string;
  modelType: 'closed' | 'open';
  clarity: number;
  accuracy: number;
  conciseness: number;
  preferred: boolean;
}

export interface RatingStats {
  modelName: string;
  modelType: 'closed' | 'open';
  avgClarity: number;
  avgAccuracy: number;
  avgConciseness: number;
  totalRatings: number;
  preferredCount: number;
  preferredPercentage: number;
} 