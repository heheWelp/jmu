import { NextResponse } from &apos;next/server&apos;
import { createRouteHandlerClient } from &apos;@supabase/auth-helpers-nextjs&apos;
import { cookies } from &apos;next/headers&apos;

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: media, error } = await supabase
      .from(&apos;media&apos;)
      .select(&apos;*&apos;)
      .eq(&apos;lesson_id&apos;, params.lessonId)
      .order(&apos;created_at&apos;, { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error(&apos;Error fetching lesson media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to fetch lesson media&apos; },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { data: media, error } = await supabase
      .from(&apos;media&apos;)
      .insert({
        lesson_id: params.lessonId,
        course_id: params.courseId,
        title: body.title,
        file_type: body.file_type,
        file_url: body.file_url
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, media })
  } catch (error) {
    console.error(&apos;Error adding lesson media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to add lesson media&apos; },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const url = new URL(request.url)
    const mediaId = url.searchParams.get(&apos;mediaId&apos;)

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: &apos;Media ID is required&apos; },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from(&apos;media&apos;)
      .delete()
      .eq(&apos;id&apos;, mediaId)
      .eq(&apos;lesson_id&apos;, params.lessonId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Error deleting lesson media:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Failed to delete lesson media&apos; },
      { status: 500 }
    )
  }
} 