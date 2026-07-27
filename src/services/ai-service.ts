export interface ChatResponse {
  session_id: string;
  response: string;
  sources?: Array<{
    material_id: string;
    title: string;
    excerpt: string;
  }>;
  tokens_used?: number;
  created_at?: string;
}

export const sendChatMessage = async (
  message: string, 
  learningMode: 'socratic' | 'explainable',
  sessionId: string | null = null,
  classId: string | null = null
): Promise<ChatResponse> => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      session_id: sessionId,
      class_id: classId,
      message: message,
      learning_mode: learningMode
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to send message to AI Tutor');
  }

  return data.data;
};

export const fetchHint = async (
  questionId: string,
  attemptId: string,
  hintLevel: number = 1
) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/hint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      question_id: questionId,
      attempt_id: attemptId,
      hint_level: hintLevel
    })
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch hint');
  }

  return data.data;
};