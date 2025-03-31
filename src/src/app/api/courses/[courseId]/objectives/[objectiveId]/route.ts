import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// DELETE: Remove an objective
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string, objectiveId: string } }
) {
  try {
    const { objectiveId } = params

    // Delete the objective
    const { error } = await supabaseAdmin
      .from(&apos;course_objectives&apos;)
      .delete()
      .eq(&apos;id&apos;, objectiveId)

    if (error) {
      console.error(&apos;Error deleting objective:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete objective&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in DELETE objective:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 