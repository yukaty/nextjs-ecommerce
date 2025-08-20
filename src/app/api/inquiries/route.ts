import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Data type definition for inquiries table
type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

// Get inquiry list
export async function GET() {
  try {
    // Get all inquiry data
    const inquiries = await executeQuery<Inquiry>(
      'SELECT * FROM inquiries ORDER BY created_at DESC;'
    );

    return NextResponse.json(inquiries);
  } catch (err) {
    console.error('Inquiry list fetch error:', err);
    return NextResponse.json({ message: 'Failed to fetch inquiry list.' }, { status: 500 });
  }
}

// Register inquiry
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Check for missing input
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ message: 'Please fill in all fields.' }, { status: 400 });
    }

    // Add inquiry information to inquiries table
    await executeQuery(
      'INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    return NextResponse.json({ message: 'Your inquiry has been received.' });
  } catch (err) {
    console.error('Inquiry registration error:', err);
    return NextResponse.json({ message: 'Failed to send inquiry.' }, { status: 500 });
  }
}

