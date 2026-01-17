import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveInquiry, getInquiryById, Inquiry, Message } from '@/lib/storage';

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

  const jsonInstruction = `
## RESPONSE FORMAT (CRITICAL - ALWAYS FOLLOW):
You MUST respond ONLY with valid JSON in this exact format:
{
  "answer": "<your warm, helpful response to the parent - include emojis and formatting>",
  "confidenceScore": <number from 0.0 to 1.0>,
  "reasoning": "<one sentence explaining your confidence>",
  "needsHumanReview": <true or false>,
  "reviewReason": "<if needsHumanReview is true, explain why - otherwise null>",
  "topicSummary": "<2-5 word summary of what this conversation is about>"
}

## CONFIDENCE SCORING GUIDE:
- 1.0: Answer is DIRECTLY stated in the knowledge base above
- 0.7-0.9: Answer can be clearly inferred from the knowledge base
- 0.4-0.6: Answer is a reasonable guess but not in knowledge base
- 0.1-0.3: Answer is mostly a guess, you're uncertain
- 0.0: You cannot answer this question at all

## WHEN TO SET needsHumanReview = true:
- Parent explicitly asks to speak with a human/person/staff
- Parent seems frustrated, upset, or dissatisfied
- Question involves billing disputes, complaints, or policy exceptions
- Question is sensitive (custody, medical decisions, legal matters)
- You genuinely cannot answer and the parent needs help
- Parent has asked the same thing multiple times

## TOPIC SUMMARY EXAMPLES:
- "Sick Policy Question"
- "Tour Scheduling"
- "Infant Tuition Inquiry"
- "Frustrated Parent - Escalation"
- "Lunch Charge Request"

IMPORTANT: Your "answer" field should be the complete, warm response you'd give a parent. Include emojis and be personable!
`;

  const basePrompt = `You are the "Little Sprouts Front Desk Assistant." Your tone is warm, empathetic, and professional—like a seasoned preschool director who truly loves kids.

## KNOWLEDGE BASE (Use this for accurate information):
${knowledge}

## CORE BEHAVIOR:
1. Be conversational and warm. Use emojis sparingly but naturally.
2. Keep responses concise (2-3 short paragraphs max).
3. Always offer helpful follow-up suggestions.
4. If you don't know something, say "I want to make sure I give you the right answer. I've flagged this for our Director, Sarah."
5. If someone wants to talk to a person, acknowledge their request warmly and let them know Director Sarah will reach out.

${jsonInstruction}`;

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

// Map confidence score to color
function scoreToConfidence(score: number, needsHumanReview: boolean): 'green' | 'yellow' | 'red' {
  if (needsHumanReview) return 'red';
  if (score >= 0.7) return 'green';
  if (score >= 0.4) return 'yellow';
  return 'red';
}

// Parse LLM JSON response with fallback
function parseAIResponse(rawResponse: string): {
  answer: string;
  confidenceScore: number;
  reasoning: string;
  needsHumanReview: boolean;
  reviewReason: string | null;
  topicSummary: string;
} {
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    let jsonStr = rawResponse.trim();
    
    // Remove markdown code block if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();
    
    const parsed = JSON.parse(jsonStr);
    return {
      answer: parsed.answer || rawResponse,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.5,
      reasoning: parsed.reasoning || 'No reasoning provided',
      needsHumanReview: parsed.needsHumanReview === true,
      reviewReason: parsed.reviewReason || null,
      topicSummary: parsed.topicSummary || 'General Inquiry'
    };
  } catch {
    // Fallback: return raw response with medium confidence
    console.warn('Failed to parse AI JSON response, using fallback');
    return {
      answer: rawResponse,
      confidenceScore: 0.5,
      reasoning: 'Response parsing failed - defaulting to medium confidence',
      needsHumanReview: false,
      reviewReason: null,
      topicSummary: 'General Inquiry'
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages, userType, childData } = await req.json();

    const systemPrompt = buildSystemPrompt(userType, childData);

    // Build messages array for OpenRouter (OpenAI-compatible format)
    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Make API call to OpenRouter (NON-STREAMING for JSON parsing)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://little-sprouts-demo.vercel.app',
        'X-Title': 'Little Sprouts Front Desk AI',
      },
      body: JSON.stringify({
        model: 'mistralai/devstral-2512:free',
        messages: openRouterMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON response
    const { answer, confidenceScore, reasoning, needsHumanReview, reviewReason, topicSummary } = parseAIResponse(rawContent);
    
    // Determine final confidence
    const finalConfidence = scoreToConfidence(confidenceScore, needsHumanReview);
    const finalStatus = needsHumanReview 
      ? '🚨 Needs Review' 
      : finalConfidence === 'red' 
        ? 'Needs Attention' 
        : finalConfidence === 'yellow' 
          ? 'Pending Review' 
          : 'Resolved';

    // Build transcript from messages
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const transcript: Message[] = messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
      role: m.role,
      content: m.content,
      timestamp: now
    }));
    
    // Add the assistant's response to transcript
    transcript.push({
      role: 'assistant',
      content: answer,
      timestamp: now
    });

    // Check if inquiry exists, update or create
    const existingInquiry = await getInquiryById(sessionId);
    
    const inquiry: Inquiry = {
      id: sessionId,
      parent: childData?.parentName || (userType === 'ADMIN' ? 'Staff' : 'Guest Parent'),
      child: childData?.childName || '-',
      topic: topicSummary,
      transcript: existingInquiry ? [...existingInquiry.transcript, ...transcript.slice(existingInquiry.transcript.length)] : transcript,
      confidence: finalConfidence,
      confidenceScore: confidenceScore,
      needsHumanReview: needsHumanReview,
      reviewReason: reviewReason || undefined,
      status: finalStatus,
      timestamp: existingInquiry?.timestamp || now,
      lastUpdated: now
    };

    await saveInquiry(inquiry);

    // Return just the answer text to the client
    return new Response(answer, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
