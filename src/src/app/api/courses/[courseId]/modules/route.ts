import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch all modules for a course
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    // Fetch modules
    const { data, error } = await supabaseAdmin
      .from(&apos;module&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .order(&apos;number&apos;, { ascending: true })

    if (error) {
      console.error(&apos;Error fetching modules:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch modules&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, modules: data })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in GET modules:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

// POST: Create a new module
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const { name, number } = await req.json()

    // Start a transaction
    const { data: moduleData, error: moduleError } = await supabaseAdmin
      .from(&apos;module&apos;)
      .insert({
        course_id: courseId,
        name,
      })
      .select()

    if (moduleError) {
      console.error(&apos;Error creating module:&apos;, moduleError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to create module&apos; },
        { status: 500 }
      )
    }

    // Get the highest display_order for the course or default to 0
    const { data: maxOrderData } = await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .select(&apos;display_order&apos;)
      .eq(&apos;course_id&apos;, courseId)
      .is(&apos;parent_id&apos;, null)
      .order(&apos;display_order&apos;, { ascending: false })
      .limit(1)

    const newDisplayOrder = (maxOrderData?.[0]?.display_order || 0) + 1

    // Create the structure entry
    const { error: structureError } = await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .insert({
        course_id: courseId,
        content_type: &apos;module&apos;,
        content_id: moduleData[0].id,
        parent_id: null,
        display_order: newDisplayOrder
      })

    if (structureError) {
      console.error(&apos;Error creating module structure:&apos;, structureError)
      // Rollback module creation
      await supabaseAdmin
        .from(&apos;module&apos;)
        .delete()
        .eq(&apos;id&apos;, moduleData[0].id)
      
      return NextResponse.json(
        { success: false, error: &apos;Failed to create module structure&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      module: moduleData?.[0] || null
    })
  } catch (error: unknown) {
    console.error(&apos;Unexpected error in POST module:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 