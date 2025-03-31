import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const { quizId } = params
    
    // Fetch quiz settings
    const { data, error } = await supabaseAdmin
      .from(&apos;quiz_settings&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;quiz_id&apos;, quizId)
      .single()
    
    if (error && error.code !== &apos;PGRST116&apos;) { // PGRST116 is &quot;No rows returned&quot; error
      console.error(&apos;Error fetching quiz settings:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch quiz settings&apos; },
        { status: 500 }
      )
    }
    
    // Return default settings if none exist
    const settings = data || {
      quiz_id: quizId,
      min_pass_score: 70,
      is_pass_required: false,
      time_limit_minutes: null,
      allow_retakes: true,
      max_attempts: null
    }
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error(&apos;Unexpected error in GET quiz settings:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const { quizId } = params
    const body = await req.json()
    
    const { min_pass_score, is_pass_required, time_limit_minutes, allow_retakes, max_attempts } = body
    
    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabaseAdmin
      .from(&apos;quiz_settings&apos;)
      .select(&apos;id&apos;)
      .eq(&apos;quiz_id&apos;, quizId)
      .single()
    
    const result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabaseAdmin
        .from(&apos;quiz_settings&apos;)
        .update({
          min_pass_score,
          is_pass_required,
          time_limit_minutes,
          allow_retakes,
          max_attempts,
          updated_at: new Date().toISOString()
        })
        .eq(&apos;id&apos;, existingSettings.id)
        .select()
        .single()
    } else {
      // Insert new settings
      result = await supabaseAdmin
        .from(&apos;quiz_settings&apos;)
        .insert({
          quiz_id: quizId,
          min_pass_score,
          is_pass_required,
          time_limit_minutes,
          allow_retakes,
          max_attempts
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error(&apos;Error updating quiz settings:&apos;, result.error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update quiz settings&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, settings: result.data })
  } catch (error) {
    console.error(&apos;Unexpected error in PUT quiz settings:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 