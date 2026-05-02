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

export async function POST(req: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  if (!isAllowedType(type)) {
    return NextResponse.json({ success: false, error: 'Invalid content type.' }, { status: 400 });
  }

  try {
    const document = await req.json();

    if ((type === 'music' || type === 'video') && document.latestRelease) {
      await unsetPreviousLatest(type, undefined);
    }

    const doc = await writeClient.create({ _type: type, ...document });
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
