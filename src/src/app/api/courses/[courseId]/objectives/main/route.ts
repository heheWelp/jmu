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
    const { learning_objective } = await req.json()

    // Update the main objective
    const { error } = await supabaseAdmin
      .from(&apos;course&apos;)
      .update({ learning_objective })
      .eq(&apos;id&apos;, courseId)

    if (error) {
      console.error(&apos;Error updating main objective:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update main objective&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in PUT main objective:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 