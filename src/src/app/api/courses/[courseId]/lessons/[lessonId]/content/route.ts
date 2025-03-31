import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const { lessonId } = await Promise.resolve(params)

    // Fetch all lesson content with their associated content from respective tables
    const { data: content, error } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .select(`
        id,
        content_type,
        title,
        display_order,
        content_id,
        text_content (
          id,
          content
        ),
        media (
          id,
          media_type,
          media_url,
          file_type,
          file_size,
          duration
        ),
        lesson_discussions (
          id,
          title,
          description
        )
      `)
      .eq(&apos;lesson_id&apos;, lessonId)
      .order(&apos;display_order&apos;, { ascending: true })

    if (error) throw error

    // Transform the response to include the actual content based on type
    const transformedContent = content?.map(item => {
      const contentData = null
      switch (item.content_type) {
        case &apos;text&apos;:
          contentData = item.text_content
          break
        case &apos;media&apos;:
          contentData = item.media
          break
        case &apos;discussion&apos;:
          contentData = item.lesson_discussions
          break
      }

      return {
        id: item.id,
        content_type: item.content_type,
        title: item.title,
        display_order: item.display_order,
        content: contentData
      }
    })

    return NextResponse.json({ success: true, content: transformedContent })
  } catch (error) {
    console.error(&apos;Error fetching lesson content:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to fetch lesson content&apos; },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const { lessonId } = await Promise.resolve(params)
    const body = await request.json()

    // Insert content based on type first
    const contentId: string | null = null
    
    if (body.content_type === &apos;text&apos;) {
      const { data: textContent, error: textError } = await supabaseAdmin
        .from(&apos;text_content&apos;)
        .insert({ content: body.content })
        .select(&apos;id&apos;)
        .single()

      if (textError) throw textError
      contentId = textContent.id
    } 
    else if (body.content_type === &apos;media&apos;) {
      const { data: mediaContent, error: mediaError } = await supabaseAdmin
        .from(&apos;media&apos;)
        .insert({
          media_type: body.media_type,
          media_url: body.media_url,
          file_type: body.file_type,
          course_id: params.courseId
        })
        .select(&apos;id&apos;)
        .single()

      if (mediaError) throw mediaError
      contentId = mediaContent.id
    } 
    else if (body.content_type === &apos;discussion&apos;) {
      const { data: discussionContent, error: discussionError } = await supabaseAdmin
        .from(&apos;lesson_discussions&apos;)
        .insert({
          title: body.title,
          description: body.description
        })
        .select(&apos;id&apos;)
        .single()

      if (discussionError) throw discussionError
      contentId = discussionContent.id
    }

    if (!contentId) {
      throw new Error(&apos;Failed to create content&apos;)
    }

    // Get the next display order position
    const { data: maxOrderData } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .select(&apos;display_order&apos;)
      .eq(&apos;lesson_id&apos;, lessonId)
      .order(&apos;display_order&apos;, { ascending: false })
      .limit(1)

    const nextPosition = (maxOrderData?.[0]?.display_order || 0) + 1

    // Use the insert_lesson_content_at_position function
    const { data: insertResult, error: insertError } = await supabaseAdmin
      .rpc(&apos;insert_lesson_content_at_position&apos;, {
        p_lesson_id: lessonId,
        p_content_type: body.content_type,
        p_title: body.title,
        p_content_id: contentId,
        p_desired_position: nextPosition
      })

    if (insertError) throw insertError

    // Fetch the newly created content with its relationships
    const { data: newContent, error: fetchError } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .select(`
        id,
        content_type,
        title,
        display_order,
        content_id,
        text_content (
          id,
          content
        ),
        media (
          id,
          media_type,
          media_url,
          file_type,
          file_size,
          duration
        ),
        lesson_discussions (
          id,
          title,
          description
        )
      `)
      .eq(&apos;id&apos;, insertResult)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json({ success: true, content: newContent })
  } catch (error) {
    console.error(&apos;Error adding lesson content:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to add lesson content&apos; },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const { lessonId } = await Promise.resolve(params)
    const url = new URL(request.url)
    const contentId = url.searchParams.get(&apos;contentId&apos;)

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: &apos;Content ID is required&apos; },
        { status: 400 }
      )
    }

    // Get the content type and content_id before deletion
    const { data: contentInfo, error: fetchError } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .select(&apos;content_type, content_id&apos;)
      .eq(&apos;id&apos;, contentId)
      .single()

    if (fetchError) throw fetchError

    // Delete from the specific content table first
    if (contentInfo.content_type === &apos;text&apos;) {
      await supabaseAdmin
        .from(&apos;text_content&apos;)
        .delete()
        .eq(&apos;id&apos;, contentInfo.content_id)
    } 
    else if (contentInfo.content_type === &apos;media&apos;) {
      await supabaseAdmin
        .from(&apos;media&apos;)
        .delete()
        .eq(&apos;id&apos;, contentInfo.content_id)
    } 
    else if (contentInfo.content_type === &apos;discussion&apos;) {
      await supabaseAdmin
        .from(&apos;lesson_discussions&apos;)
        .delete()
        .eq(&apos;id&apos;, contentInfo.content_id)
    }

    // Then delete from lesson_content
    const { error: deleteError } = await supabaseAdmin
      .from(&apos;lesson_content&apos;)
      .delete()
      .eq(&apos;id&apos;, contentId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Error deleting lesson content:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to delete lesson content&apos; },
      { status: 500 }
    )
  }
} 