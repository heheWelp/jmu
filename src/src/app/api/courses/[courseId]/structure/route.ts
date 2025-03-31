import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Fetch all content structure items for the course
    const { data: structureData, error: structureError } = await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;course_id&apos;, params.courseId)
      .order(&apos;display_order&apos;, { ascending: true })

    if (structureError) {
      console.error(&apos;Error fetching course structure:&apos;, structureError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch course structure&apos; },
        { status: 500 }
      )
    }

    // Fetch all related content
    const moduleIds = structureData
      .filter(item => item.content_type === &apos;module&apos;)
      .map(item => item.content_id)
    const lessonIds = structureData
      .filter(item => item.content_type === &apos;lesson&apos;)
      .map(item => item.content_id)
    const mediaIds = structureData
      .filter(item => item.content_type === &apos;media&apos;)
      .map(item => item.content_id)
    const quizIds = structureData
      .filter(item => item.content_type === &apos;quiz&apos;)
      .map(item => item.content_id)

    // Fetch modules
    const { data: modules } = await supabaseAdmin
      .from(&apos;module&apos;)
      .select(&apos;*&apos;)
      .in(&apos;id&apos;, moduleIds)

    // Fetch lessons
    const { data: lessons } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .select(&apos;*&apos;)
      .in(&apos;id&apos;, lessonIds)

    // Fetch lesson content
    const { data: lessonContent } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .select(&apos;*&apos;)
      .in(&apos;lesson_id&apos;, lessonIds)
      .order(&apos;created_at&apos;, { ascending: true })

    // Create a map of lesson content
    const lessonContentMap = new Map()
    lessonContent?.forEach(content => {
      if (!lessonContentMap.has(content.lesson_id)) {
        lessonContentMap.set(content.lesson_id, [])
      }
      lessonContentMap.get(content.lesson_id).push(content)
    })

    // Fetch media
    const { data: media } = await supabaseAdmin
      .from(&apos;media&apos;)
      .select(&apos;*&apos;)
      .in(&apos;id&apos;, mediaIds)

    // Fetch quizzes
    const { data: quizzes } = await supabaseAdmin
      .from(&apos;quiz&apos;)
      .select(&apos;*, quiz_settings(*)&apos;)
      .in(&apos;id&apos;, quizIds)

    // Build the hierarchical structure
    const contentMap = new Map()
    modules?.forEach(module => {
      contentMap.set(module.id, { ...module, content_type: &apos;module&apos;, children: [] })
    })
    lessons?.forEach(lesson => {
      contentMap.set(lesson.id, { 
        ...lesson, 
        content_type: &apos;lesson&apos;, 
        children: [],
        content: lessonContentMap.get(lesson.id) || [] // Add lesson content here
      })
    })
    media?.forEach(item => {
      contentMap.set(item.id, { ...item, content_type: &apos;media&apos; })
    })
    quizzes?.forEach(quiz => {
      contentMap.set(quiz.id, { ...quiz, content_type: &apos;quiz&apos; })
    })

    // Build the tree structure
    const processedItems = new Set() // Keep track of processed items
    const processedContent = new Set() // Keep track of content IDs

    // First pass: Process all items and build parent-child relationships
    structureData.forEach(item => {
      if (processedItems.has(item.id)) return // Skip if this structure item was already processed
      
      const content = contentMap.get(item.content_id)
      if (!content || processedContent.has(item.content_id)) return // Skip if content not found or already processed
      
      if (item.parent_id) {
        const parent = contentMap.get(item.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push({
            ...content,
            display_order: item.display_order
          })
        }
      }
      
      processedItems.add(item.id)
      processedContent.add(item.content_id)
    })

    // Get top-level modules
    const courseStructure = structureData
      .filter(item => !item.parent_id && item.content_type === &apos;module&apos;)
      .map(item => {
        const module = contentMap.get(item.content_id)
        if (!module) return null
        return {
          ...module,
          display_order: item.display_order,
          children: module.children?.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order) || []
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.display_order - b.display_order)

    return NextResponse.json({ success: true, structure: courseStructure })
  } catch (error) {
    console.error(&apos;Unexpected error in GET course structure:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { structure } = await req.json()

    // Start a transaction
    const { error } = await supabaseAdmin.rpc(&apos;update_course_structure&apos;, {
      p_course_id: params.courseId,
      p_structure: structure
    })

    if (error) {
      console.error(&apos;Error updating course structure:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to update course structure&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Unexpected error in PUT course structure:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 