export interface CareerPath {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  benefits: string[];
  progression: CareerProgression[];
}

export interface CareerProgression {
  level: string;
  description: string;
  requirements: string[];
  duration?: string;
}

export interface CareerRecommendation {
  careerPathId: string;
  score: number;
  reasoning: string;
  matchFactors: string[];
}

