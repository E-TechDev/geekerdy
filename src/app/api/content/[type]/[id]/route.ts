import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity.server';

const allowedTypes = ['music', 'video', 'gallery', 'event', 'announcement'] as const;

function isAllowedType(type: string): type is (typeof allowedTypes)[number] {
  return allowedTypes.some((allowed) => allowed === type);
}

async function unsetPreviousLatest(type: 'music' | 'video', preserveId?: string) {
  const existingIds: string[] = await writeClient.fetch(`*[_type == "${type}" && latestRelease == true${preserveId ? ' && _id != $preserveId' : ''}]._id`, { preserveId });
  await Promise.all(existingIds.map((id) => writeClient.patch(id).set({ latestRelease: false }).commit()));
}

export async function PATCH(req: Request, context: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await context.params;
  if (!isAllowedType(type)) {
    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  }

  try {
    const payload = await req.json();
    const document = payload as Record<string, unknown>;

    if ((type === 'music' || type === 'video') && document.latestRelease) {
      await unsetPreviousLatest(type, id);
    }

    const doc = await writeClient.patch(id).set(document).commit();
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await context.params;
  if (!isAllowedType(type)) {
    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  }

  try {
    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
