
export interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  author: string;
}

export interface Comment {
  id: string;
  questionId: string;
  content: string;
  createdAt: Date;
  author: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}
