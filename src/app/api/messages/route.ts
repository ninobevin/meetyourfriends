import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, location, sender } = await req.json();

    const db = await getDb();

    // Create session if it doesn't exist
    await db.run(
      'INSERT OR IGNORE INTO sessions (id) VALUES (?)',
      sessionId
    );

    // Create message
    await db.run(
      `INSERT INTO messages (session_id, sender_id, sender_name, content)
       VALUES (?, ?, ?, ?)`,
      [sessionId, sender.id, sender.name, message]
    );

    // Update location if provided
    if (location) {
      await db.run(
        `INSERT OR REPLACE INTO locations (
          session_id, participant_id, participant_name, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          sessionId,
          sender.id,
          sender.name,
          location.latitude,
          location.longitude
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get messages and locations
    const [messages, locations] = await Promise.all([
      db.all(
        `SELECT * FROM messages 
         WHERE session_id = ? 
         ORDER BY created_at DESC 
         LIMIT 100`,
        sessionId
      ),
      db.all(
        `SELECT * FROM locations 
         WHERE session_id = ? 
         AND updated_at > datetime('now', '-5 minutes')`,
        sessionId
      )
    ]);

    return NextResponse.json({
      messages,
      locations
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
