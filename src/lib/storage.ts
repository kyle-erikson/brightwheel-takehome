// In-memory storage for serverless environments (Vercel)
// Note: This persists across requests within the same server instance,
// but won't survive cold starts. For a demo, this is sufficient.

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

// Global in-memory store (persists across requests in same instance)
declare global {
  // eslint-disable-next-line no-var
  var inquiriesStore: Inquiry[] | undefined;
}

// Initialize or get existing store
function getStore(): Inquiry[] {
  if (!global.inquiriesStore) {
    global.inquiriesStore = [];
  }
  return global.inquiriesStore;
}

export function getInquiries(): Inquiry[] {
  return getStore();
}

export function getInquiryById(id: string): Inquiry | null {
  const store = getStore();
  return store.find(i => i.id === id) || null;
}

export function saveInquiry(inquiry: Inquiry) {
  const store = getStore();
  
  // Check if inquiry with this ID already exists
  const existingIndex = store.findIndex(i => i.id === inquiry.id);
  
  if (existingIndex >= 0) {
    // Update existing inquiry
    store[existingIndex] = inquiry;
  } else {
    // Add new inquiry to the beginning
    store.unshift(inquiry);
  }
  
  // Keep last 50 inquiries
  if (store.length > 50) {
    store.length = 50;
  }
}
