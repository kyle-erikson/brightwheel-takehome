import Redis from 'ioredis';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;
  parent: string;
  child: string;
  topic: string;
  transcript: Message[];
  confidence: 'green' | 'yellow' | 'red';
  confidenceScore: number;
  needsHumanReview: boolean;
  reviewReason?: string;
  status: string;
  timestamp: string;
  lastUpdated: string;
}

const INQUIRIES_KEY = 'inquiries';

// Create Redis client from environment variable
const getRedis = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  return new Redis(url);
};

// Lazy singleton
let redis: Redis | null = null;
const getClient = () => {
  if (!redis) {
    redis = getRedis();
  }
  return redis;
};

export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const client = getClient();
    const data = await client.get(INQUIRIES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error fetching inquiries from Redis:', error);
    return [];
  }
}

export async function getInquiryById(id: string): Promise<Inquiry | null> {
  const inquiries = await getInquiries();
  return inquiries.find(i => i.id === id) || null;
}

export async function saveInquiry(inquiry: Inquiry): Promise<void> {
  try {
    const client = getClient();
    const inquiries = await getInquiries();
    
    // Check if inquiry with this ID already exists
    const existingIndex = inquiries.findIndex(i => i.id === inquiry.id);
    
    if (existingIndex >= 0) {
      // Update existing inquiry
      inquiries[existingIndex] = inquiry;
    } else {
      // Add new inquiry to the beginning
      inquiries.unshift(inquiry);
    }
    
    // Keep last 50 inquiries
    const trimmed = inquiries.slice(0, 50);
    
    await client.set(INQUIRIES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving inquiry to Redis:', error);
  }
}
