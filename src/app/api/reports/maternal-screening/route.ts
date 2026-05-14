import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseObject, serverError } from '@/lib/api/validate';
import { maternalScreeningFieldsSchema } from '@/lib/api/schemas';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = parseObject(
      {
        maternalBasicId: formData.get('maternalBasicId'),
        testType: formData.get('testType'),
        testDate: formData.get('testDate'),
        titres: formData.get('titres'),
        result: formData.get('result'),
      },
      maternalScreeningFieldsSchema,
    );
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const screeningFile = formData.get('screeningFile');
    const file = screeningFile instanceof File && screeningFile.size > 0 ? screeningFile : null;

    if (file) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, message: 'File exceeds 10 MB limit' },
          { status: 400 },
        );
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Unsupported file type' },
          { status: 400 },
        );
      }
    }

    const supabase = await createClient();

    let fileUrl: string | null = null;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}_${safeName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, file);
      if (!uploadError && uploadData) {
        fileUrl = uploadData.path;
      }
    }

    const { data, error } = await supabase
      .from('maternal_screening')
      .insert({
        maternal_basic_id: d.maternalBasicId,
        test_type: d.testType,
        test_date: d.testDate,
        titres: d.titres,
        result: d.result,
        file_name: file ? file.name : null,
        file_url: fileUrl,
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, screeningId: data[0].id });
  } catch {
    return serverError();
  }
}
