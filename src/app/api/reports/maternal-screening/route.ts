import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const maternalBasicId = formData.get('maternalBasicId');
    const testType = formData.get('testType');
    const testDate = formData.get('testDate');
    const titres = formData.get('titres');
    const result = formData.get('result');
    const screeningFile = formData.get('screeningFile') as File | null;

    if (!maternalBasicId || !testType || !testDate || !titres || !result) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    let fileUrl = null;
    
    // If a file is uploaded, upload to Supabase storage (assuming 'reports' bucket exists, if error we just ignore and continue to avoid failing if bucket isn't there)
    if (screeningFile && screeningFile.size > 0) {
      const fileName = `${Date.now()}_${screeningFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('reports')
        .upload(fileName, screeningFile);
        
      if (!uploadError && uploadData) {
        fileUrl = uploadData.path;
      } else if (uploadError) {
        console.warn('File upload failed:', uploadError.message);
      }
    }

    const { data, error } = await supabase.from('maternal_screening').insert({
      maternal_basic_id: maternalBasicId,
      test_type: testType,
      test_date: testDate,
      titres: titres,
      result: result,
      file_name: screeningFile ? screeningFile.name : null,
      file_url: fileUrl
    }).select();

    if (error) {
      console.error('Maternal screening error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, screeningId: data[0].id });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
