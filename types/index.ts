export type UserRole = "student" | "admin";

export type EducationLevel =
  | "B.Tech / B.E."
  | "BBA / B.Com / B.Sc"
  | "MBA / PGDM"
  | "M.Tech / M.Sc"
  | "Other Graduate"
  | "Job Seeker / Fresher";

export type CareerGoal =
  | "Campus placements"
  | "Internship preparation"
  | "MBA preparation"
  | "General communication improvement";

export type ConfidenceLevel = "Beginner" | "Intermediate" | "Confident";

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  college?: string;
  graduationYear?: number;
  educationLevel?: EducationLevel;
  careerGoal?: CareerGoal;
  confidenceLevel?: ConfidenceLevel;
  role: UserRole;
  profileImage?: string;
  onboardingCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TopicCategory =
  | "Artificial Intelligence"
  | "Technology"
  | "Business"
  | "Economy"
  | "Education"
  | "Environment"
  | "Politics and Governance"
  | "Social Issues"
  | "International Relations"
  | "Abstract Topics"
  | "Ethical Issues"
  | "Current Affairs";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type DiscussionType =
  | "General discussion"
  | "Placement-level GD"
  | "Debate"
  | "Case study"
  | "Abstract discussion";

export interface IGDTopic {
  _id: string;
  title: string;
  category: TopicCategory;
  difficulty: DifficultyLevel;
  description: string;
  background: string;
  discussionPoints: string[];
  argumentsFor: string[];
  argumentsAgainst: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface IAIParticipant {
  id: string;
  name: string;
  avatar: string;
  archetype: string;
  personality: string;
  speakingStyle: string;
  opinion: string;
  strategy: string;
  color: string;
}

export interface IGDSession {
  _id: string;
  userId: string;
  topicId?: string;
  customTopic?: string;
  topicTitle: string;
  topicCategory?: string;
  difficulty: DifficultyLevel;
  duration: number; // in minutes (5, 10, 15)
  participantCount: number; // 2, 3, 4, 5
  sessionType: DiscussionType;
  aiParticipants: IAIParticipant[];
  status: "in-progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  overallScore?: number;
  evaluationId?: string;
  createdAt: Date;
}

export interface IGDMessage {
  _id: string | any;
  sessionId: string | any;
  speakerId: string;
  speakerName: string;
  speakerType: "user" | "ai" | "moderator";
  speakerAvatar?: string;
  message: string;
  sequenceNumber: number;
  timestamp: Date;
}

export interface IScoreEvidence {
  quote: string;
  critique: string;
  category: string;
}

export interface IAlternativeArgument {
  userPoint: string;
  whyWeak: string;
  betterFraming: string;
}

export interface IGDEvaluation {
  _id: string;
  userId: string;
  sessionId: string;
  communicationScore: number;
  contentScore: number;
  confidenceScore: number;
  listeningScore: number;
  leadershipScore: number;
  participationScore: number;
  fluencyScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  transcriptEvidence: IScoreEvidence[];
  missedOpportunities: string[];
  whatCouldHaveSaidInstead: IAlternativeArgument[];
  improvementGoals: string[];
  recommendations: string[];
  recommendedTopics: string[];
  createdAt: Date;
}

export interface IRecording {
  _id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  topic: string;
  processingStatus: "uploaded" | "transcribing" | "completed" | "failed";
  transcript?: string;
  speakerSegments?: Array<{
    speaker: string;
    text: string;
    startTime?: number;
    endTime?: number;
  }>;
  identifiedUserSpeaker?: string;
  evaluationId?: string;
  createdAt: Date;
}

export interface IUserProgress {
  _id: string;
  userId: string;
  sessionsCompleted: number;
  averageScore: number;
  highestScore: number;
  totalPracticeTime: number; // in minutes
  scoreHistory: Array<{
    sessionId: string;
    date: Date;
    score: number;
    topic: string;
  }>;
  categoryAverages: {
    communication: number;
    content: number;
    confidence: number;
    listening: number;
    leadership: number;
    participation: number;
    fluency: number;
  };
  updatedAt: Date;
}

export interface IAIUsage {
  _id: string;
  userId: string;
  serviceType: "discussion" | "evaluation" | "coach" | "topic_generation" | "recording";
  model: string;
  tokenUsage?: number;
  requestCount: number;
  createdAt: Date;
}
