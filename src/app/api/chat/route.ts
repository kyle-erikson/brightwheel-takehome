import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Load knowledge base
function loadKnowledge(): string {
  try {
    const knowledgePath = path.join(process.cwd(), 'data', 'knowledge.md');
    return fs.readFileSync(knowledgePath, 'utf-8');
  } catch {
    return 'Knowledge base not available.';
  }
}

// Build the system prompt based on user context
function buildSystemPrompt(
  userType: 'PROSPECTIVE' | 'LOGGED_IN' | 'ADMIN',
  childData?: {
    childName: string;
    parentName: string;
    teacher: string;
    classroom: string;
    status: string;
    mood: string;
    lastMeal: string;
  } | null
): string {
  const knowledge = loadKnowledge();
  const firstName = childData?.parentName?.split(' ')[0] || 'there';

  const basePrompt = `You are the "Little Sprouts Front Desk Assistant." Your tone is warm, empathetic, and professional—like a seasoned preschool director who truly loves kids.

## KNOWLEDGE BASE (Use this for accurate information):
${knowledge}

## CORE BEHAVIOR:
1. Be conversational and warm. Use emojis sparingly but naturally.
2. Keep responses concise (2-3 short paragraphs max).
3. Always offer helpful follow-up suggestions.
4. If you don't know something, say "I want to make sure I give you the right answer. I've flagged this for our Director, Sarah."
`;

  if (userType === 'LOGGED_IN' && childData) {
    return `${basePrompt}

## PARENT CONTEXT:
- Parent's first name: ${firstName}
- Child's name: ${childData.childName}
- Teacher: ${childData.teacher}
- Classroom: ${childData.classroom}
- Current activity: ${childData.status}
- Mood: ${childData.mood}
- Last meal: ${childData.lastMeal}

## LOGGED-IN PARENT INSTRUCTIONS:
- Address the parent by their first name (${firstName}).
- You can reference ${childData.childName}'s current status when relevant.
- Be warm and personal—you know this family!
- When discussing sick policy, offer to notify ${childData.teacher}.
- When discussing lunch, you can offer to charge their account.
`;
  }

  if (userType === 'ADMIN') {
    return `${basePrompt}

## ADMIN INSTRUCTIONS:
- You are speaking with a staff member or administrator.
- You can discuss operational details and internal processes.
- Be helpful and professional.
`;
  }

  // PROSPECTIVE parent (guest)
  return `${basePrompt}

## PROSPECTIVE PARENT INSTRUCTIONS:
- This is a prospective family exploring Little Sprouts.
- NEVER share specific information about any enrolled children.
- If asked about a specific child (e.g., "How is Leo?"), politely decline: "I'd love to help, but I can only share information about enrolled children with their verified parents. Are you interested in learning about our enrollment process?"
- Focus on: enrollment, tuition, tours, our mission, and general policies.
- Always suggest booking a tour as a natural next step.
- Be warm and welcoming to encourage enrollment.
`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userType, childData } = await req.json();

    const systemPrompt = buildSystemPrompt(userType, childData);

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

