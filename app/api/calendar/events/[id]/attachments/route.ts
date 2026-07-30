import { NextResponse } from 'next/server';
import { auth } from '@/lib/google/auth';
import { getEvent, updateEvent } from '@/lib/google/calendar';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    
    const event = await getEvent(session.accessToken, calendarId, id);
    return NextResponse.json(event.attachments || []);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const body = await request.json();
    const { calendarId = 'primary', fileUrl, title, mimeType } = body;
    
    const event = await getEvent(session.accessToken, calendarId, id);
    const attachments = event.attachments || [];
    
    const newAttachment = {
      fileUrl,
      title,
      mimeType,
      iconLink: '' // Optional
    };
    
    const updatedAttachments = [...attachments, newAttachment];
    
    const updatedEvent = await updateEvent(session.accessToken, calendarId, id, {
      ...event,
      attachments: updatedAttachments
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error adding attachment:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const body = await request.json();
    const { calendarId = 'primary', fileUrl } = body;
    
    const event = await getEvent(session.accessToken, calendarId, id);
    const attachments = event.attachments || [];
    
    const updatedAttachments = attachments.filter((a: any) => a.fileUrl !== fileUrl);
    
    const updatedEvent = await updateEvent(session.accessToken, calendarId, id, {
      ...event,
      attachments: updatedAttachments
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error removing attachment:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
