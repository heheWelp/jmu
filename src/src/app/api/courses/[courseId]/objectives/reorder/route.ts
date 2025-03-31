import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PUT: Reorder objectives
export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { updates } = await req.json()

    // Process each update
    for (const update of updates) {
      const { id, objective_order } = update
      
      const { error } = await supabaseAdmin
        .from(&apos;course_objectives&apos;)
        .update({ objective_order })
        .eq(&apos;id&apos;, id)

      if (error) {
        console.error(&apos;Error updating objective order:&apos;, error)
        return NextResponse.json(
          { success: false, error: &apos;Failed to reorder objectives&apos; },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in PUT reorder objectives:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 