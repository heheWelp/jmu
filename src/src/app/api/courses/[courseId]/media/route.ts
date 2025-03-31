import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient } from &apos;@/lib/supabase/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Fetch media for the course
    const { data, error } = await supabaseAdmin
      .from(&apos;course_media&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;course_id&apos;, params.courseId)
      .order(&apos;course_order&apos;, { ascending: true })
    
    if (error) {
      console.error(&apos;Error fetching course media:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch course media&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, media: data })
  } catch (error) {
    console.error(&apos;Unexpected error in GET media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await req.json()
    
    const { media_type, media_url, course_order } = body
    
    // Validation
    if (!media_type || !media_url) {
      return NextResponse.json(
        { success: false, error: &apos;Media type and URL are required&apos; },
        { status: 400 }
      )
    }
    
    // Insert new media
    const { data, error } = await supabaseAdmin
      .from(&apos;course_media&apos;)
      .insert({
        course_id: params.courseId,
        media_type,
        media_url,
        course_order,
      })
      .select()
      .single()
    
    if (error) {
      console.error(&apos;Error adding course media:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to add course media&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, media: data })
  } catch (error) {
    console.error(&apos;Unexpected error in POST media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 