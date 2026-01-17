
import fs from 'fs';
import path from 'path';

export interface Inquiry {
  id: string;
  parent: string;
  child: string;
  inquiry: string;
  confidence: 'green' | 'yellow' | 'red';
  status: string;
  timestamp: string;
  isEscalated: boolean;
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

export function saveInquiry(inquiry: Inquiry) {
  try {
    const inquiries = getInquiries();
    // Add new inquiry to the beginning
    const updatedInquiries = [inquiry, ...inquiries].slice(0, 50); // Keep last 50
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(updatedInquiries, null, 2));
  } catch (error) {
    console.error('Error saving inquiry:', error);
  }
}
