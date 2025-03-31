import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch a specific module
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const { moduleId } = params

    // Fetch the module
    const { data, error } = await supabaseAdmin
      .from(&apos;module&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;id&apos;, moduleId)
      .single()

    if (error) {
      console.error(&apos;Error fetching module:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch module&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, module: data })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in GET module:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// PATCH: Update a module
export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const { moduleId } = params
    const updates = await req.json()

    // Update the module
    const { error } = await supabaseAdmin
      .from(&apos;module&apos;)
      .update(updates)
      .eq(&apos;id&apos;, moduleId)

    if (error) {
      console.error(&apos;Error updating module:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update module&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in PATCH module:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// DELETE: Remove a module
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string, moduleId: string } }
) {
  try {
    const { moduleId } = params

    // Delete the module
    const { error } = await supabaseAdmin
      .from(&apos;module&apos;)
      .delete()
      .eq(&apos;id&apos;, moduleId)

    if (error) {
      console.error(&apos;Error deleting module:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete module&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in DELETE module:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 