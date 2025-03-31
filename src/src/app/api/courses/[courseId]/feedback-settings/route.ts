import { NextRequest, NextResponse } from &apos;next/server&apos;
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
    const { courseId } = params
    
    // Fetch feedback settings for the course
    const { data, error } = await supabaseAdmin
      .from(&apos;course_feedback_settings&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .single()
    
    if (error && error.code !== &apos;PGRST116&apos;) { // PGRST116 is &quot;No rows returned&quot; error
      console.error(&apos;Error fetching feedback settings:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch feedback settings&apos; },
        { status: 500 }
      )
    }
    
    // Return default settings if none exist
    const settings = data || {
      course_id: courseId,
      feedback_enabled: false,
      feedback_type: null,
      feedback_frequency: null
    }
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error(&apos;Unexpected error in GET feedback settings:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const body = await req.json()
    
    const { feedback_enabled, feedback_type, feedback_frequency } = body
    
    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabaseAdmin
      .from(&apos;course_feedback_settings&apos;)
      .select(&apos;id&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .single()
    
    const result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabaseAdmin
        .from(&apos;course_feedback_settings&apos;)
        .update({
          feedback_enabled,
          feedback_type,
          feedback_frequency,
          updated_at: new Date().toISOString()
        })
        .eq(&apos;id&apos;, existingSettings.id)
        .select()
        .single()
    } else {
      // Insert new settings
      result = await supabaseAdmin
        .from(&apos;course_feedback_settings&apos;)
        .insert({
          course_id: courseId,
          feedback_enabled,
          feedback_type,
          feedback_frequency
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error(&apos;Error updating feedback settings:&apos;, result.error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update feedback settings&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, settings: result.data })
  } catch (error) {
    console.error(&apos;Unexpected error in PUT feedback settings:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 