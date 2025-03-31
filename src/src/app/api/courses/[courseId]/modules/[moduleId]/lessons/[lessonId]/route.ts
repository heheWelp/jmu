import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch a specific lesson
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string, lessonId: string } }
) {
  try {
    const { lessonId } = params

    // Fetch the lesson
    const { data, error } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;id&apos;, lessonId)
      .single()

    if (error) {
      console.error(&apos;Error fetching lesson:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch lesson&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, lesson: data })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in GET lesson:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// PATCH: Update a lesson
export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string, lessonId: string } }
) {
  try {
    const { lessonId } = params
    const updates = await req.json()

    // Update the lesson
    const { error } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .update(updates)
      .eq(&apos;id&apos;, lessonId)

    if (error) {
      console.error(&apos;Error updating lesson:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update lesson&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in PATCH lesson:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// DELETE: Remove a lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string, lessonId: string } }
) {
  try {
    const { lessonId } = params

    // Delete the lesson
    const { error } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .delete()
      .eq(&apos;id&apos;, lessonId)

    if (error) {
      console.error(&apos;Error deleting lesson:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete lesson&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in DELETE lesson:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 