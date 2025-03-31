import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch all lessons for a module
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const { moduleId } = params

    // Fetch lessons
    const { data, error } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;module_id&apos;, moduleId)
      .order(&apos;number&apos;, { ascending: true })

    if (error) {
      console.error(&apos;Error fetching lessons:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch lessons&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, lessons: data })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in GET lessons:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// POST: Create a new lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const { moduleId, courseId } = params
    const lessonData = await req.json()

    // Create new lesson
    const { data: newLesson, error: lessonError } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .insert({
        module_id: moduleId,
        ...lessonData
      })
      .select()

    if (lessonError) {
      console.error(&apos;Error creating lesson:&apos;, lessonError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to create lesson&apos; },
        { status: 500 }
      )
    }

    // Get the highest display_order for the module or default to 0
    const { data: maxOrderData } = await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .select(&apos;display_order&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .eq(&apos;parent_id&apos;, moduleId)
      .order(&apos;display_order&apos;, { ascending: false })
      .limit(1)

    const newDisplayOrder = (maxOrderData?.[0]?.display_order || 0) + 1

    // Create the structure entry
    const { error: structureError } = await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .insert({
        course_id: courseId,
        content_type: &apos;lesson&apos;,
        content_id: newLesson[0].id,
        parent_id: moduleId,
        display_order: newDisplayOrder
      })

    if (structureError) {
      console.error(&apos;Error creating lesson structure:&apos;, structureError)
      // Rollback lesson creation
      await supabaseAdmin
        .from(&apos;lesson&apos;)
        .delete()
        .eq(&apos;id&apos;, newLesson[0].id)
      
      return NextResponse.json(
        { success: false, error: &apos;Failed to create lesson structure&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      lesson: newLesson?.[0] || null
    })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in POST lesson:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 