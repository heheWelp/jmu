import { NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = await params
    const body = await request.json()
    const { fileName, contentType } = body

    // Generate a unique file path
    const timestamp = Date.now()
    const filePath = `courses/${courseId}/media/${timestamp}-${fileName}`

    // Get presigned URL from Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from(&apos;media&apos;)
      .createSignedUploadUrl(filePath)

    if (error) throw error

    // Return the presigned URL and the final file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${filePath}`
    
    return NextResponse.json({
      success: true,
      url: data.signedUrl,
      fields: {},
      fileUrl
    })
  } catch (error) {
    console.error(&apos;Error generating presigned URL:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to generate upload URL&apos; },
      { status: 500 }
    )
  }
} 