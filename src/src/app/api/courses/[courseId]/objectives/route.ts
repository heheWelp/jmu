import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch all objectives for a course
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    // Fetch objectives
    const { data, error } = await supabaseAdmin
      .from(&apos;course_objectives&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .order(&apos;objective_order&apos;, { ascending: true })

    if (error) {
      console.error(&apos;Error fetching objectives:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch objectives&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, objectives: data })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in GET objectives:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// POST: Create a new objective
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const { objective_text, objective_order } = await req.json()

    // Create new objective
    const { data, error } = await supabaseAdmin
      .from(&apos;course_objectives&apos;)
      .insert({
        course_id: courseId,
        objective_text,
        objective_order,
      })
      .select()

    if (error) {
      console.error(&apos;Error creating objective:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to create objective&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      objective: data?.[0] || null
    })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in POST objective:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 