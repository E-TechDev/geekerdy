import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity.server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Missing file.' }, { status: 400 });
    }

    const asset = await writeClient.assets.upload('image', file, { filename: file.name });
    return NextResponse.json({ success: true, url: asset.url });
  } catch (error) {
    console.error('Asset upload error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
