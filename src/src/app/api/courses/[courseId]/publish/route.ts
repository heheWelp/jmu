import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    
    // Update course status to published
    const { data, error } = await supabaseAdmin
      .from(&apos;course&apos;)
      .update({
        status: &apos;published&apos;,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq(&apos;id&apos;, courseId)
      .select()
      .single()
    
    if (error) {
      console.error(&apos;Error publishing course:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to publish course&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, course: data })
  } catch (error) {
    console.error(&apos;Unexpected error in publish course:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 