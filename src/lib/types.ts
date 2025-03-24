
export interface Question {
  id: string;
  title: string;
  content: string;
  answer: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  votes: number;
  author_id: string;
}

export interface Comment {
  id: string;
  question_id: string;
  content: string;
  created_at: string;
  author_id: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}
