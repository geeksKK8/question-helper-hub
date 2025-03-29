
export interface Question {
  id: string;
  title: string;
  content: string[];
  answer: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  votes: number;
  author_id: string;
  url?: string;
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

export interface DeepSeekMessage {
  role: string;
  content: string;
  message_id: number;
  accumulated_token_usage?: number;
  inserted_at?: number;
  thinking_content?: string;
  thinking_elapsed_secs?: number;
  files?: any[];
  search_results?: any[];
}

export interface DeepSeekChatSession {
  title: string;
  id: string;
}

export interface DeepSeekBizData {
  chat_session: DeepSeekChatSession;
  chat_messages: DeepSeekMessage[];
}

export interface DeepSeekData {
  data: {
    biz_data: DeepSeekBizData;
  };
  url?: string;
}
