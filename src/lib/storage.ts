import fs from 'fs';
import path from 'path';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Inquiry {
  id: string;              // Session ID
  parent: string;
  child: string;
  topic: string;           // AI-generated summary (2-5 words)
  transcript: Message[];   // Full conversation history
  confidence: 'green' | 'yellow' | 'red';
  confidenceScore: number;
  needsHumanReview: boolean;
  reviewReason?: string;
  status: string;
  timestamp: string;       // Created at
  lastUpdated: string;     // Last message time
}

const DATA_DIR = path.join(process.cwd(), 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

export function getInquiries(): Inquiry[] {
  try {
    if (!fs.existsSync(INQUIRIES_FILE)) {
      return [];
    }
    const fileContent = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading inquiries:', error);
    return [];
  }
}

export function getInquiryById(id: string): Inquiry | null {
  const inquiries = getInquiries();
  return inquiries.find(i => i.id === id) || null;
}

export function saveInquiry(inquiry: Inquiry) {
  try {
    const inquiries = getInquiries();
    
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
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(trimmed, null, 2));
  } catch (error) {
    console.error('Error saving inquiry:', error);
  }
}
