export interface TrainingProgram {
  id: string;
  name: string;
  type: 'mental' | 'physical' | 'combined';
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration?: string;
  repetitions?: number;
  sets?: number;
}

export interface TrainingProgress {
  userId: string;
  programId: string;
  completion: number;
  exercisesCompleted: string[];
  lastUpdated: Date;
}

