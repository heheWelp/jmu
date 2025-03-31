import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; id: string } }
) {
  try {
    const { courseId, id } = params
    
    // Delete the media item
    const { error } = await supabaseAdmin
      .from(&apos;course_media&apos;)
      .delete()
      .eq(&apos;id&apos;, id)
      .eq(&apos;course_id&apos;, courseId)
    
    if (error) {
      console.error(&apos;Error deleting course media:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete course media&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Unexpected error in DELETE media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 