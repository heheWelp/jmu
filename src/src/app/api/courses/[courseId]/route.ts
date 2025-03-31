import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    // Delete all related data in the correct order to maintain referential integrity
    
    // 1. Delete course content structure
    await supabaseAdmin
      .from(&apos;course_content_structure&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 2. Delete course media
    await supabaseAdmin
      .from(&apos;course_media&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 3. Delete course feedback settings
    await supabaseAdmin
      .from(&apos;course_feedback_settings&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 4. Delete course pricing
    await supabaseAdmin
      .from(&apos;course_pricing&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 5. Delete course objectives
    await supabaseAdmin
      .from(&apos;course_objectives&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 6. Delete course details
    await supabaseAdmin
      .from(&apos;course_details&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 7. Delete discussion posts
    await supabaseAdmin
      .from(&apos;discussion_posts&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 8. Delete student quiz attempts for all quizzes in the course
    const { data: quizzes } = await supabaseAdmin
      .from(&apos;quiz&apos;)
      .select(&apos;id&apos;)
      .eq(&apos;course_id&apos;, courseId)

    if (quizzes) {
      const quizIds = quizzes.map(q => q.id)
      await supabaseAdmin
        .from(&apos;student_quiz_attempt&apos;)
        .delete()
        .in(&apos;quiz_id&apos;, quizIds)
    }

    // 9. Delete quiz answers and questions
    const { data: quizQuestions } = await supabaseAdmin
      .from(&apos;quiz_question&apos;)
      .select(&apos;id&apos;)
      .eq(&apos;quiz_id&apos;, &apos;in&apos;, quizzes?.map(q => q.id) || [])

    if (quizQuestions) {
      await supabaseAdmin
        .from(&apos;quiz_answer&apos;)
        .delete()
        .in(&apos;question_id&apos;, quizQuestions.map(q => q.id))

      await supabaseAdmin
        .from(&apos;quiz_question&apos;)
        .delete()
        .in(&apos;id&apos;, quizQuestions.map(q => q.id))
    }

    // 10. Delete quizzes
    await supabaseAdmin
      .from(&apos;quiz&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 11. Delete student lesson progress
    const { data: lessons } = await supabaseAdmin
      .from(&apos;lesson&apos;)
      .select(&apos;id&apos;)
      .eq(&apos;module_id&apos;, &apos;in&apos;, (await supabaseAdmin
        .from(&apos;module&apos;)
        .select(&apos;id&apos;)
        .eq(&apos;course_id&apos;, courseId)).data?.map(m => m.id) || [])

    if (lessons) {
      await supabaseAdmin
        .from(&apos;student_lesson&apos;)
        .delete()
        .in(&apos;lesson_id&apos;, lessons.map(l => l.id))
    }

    // 12. Delete lesson content
    if (lessons) {
      await supabaseAdmin
        .from(&apos;lesson_content&apos;)
        .delete()
        .in(&apos;lesson_id&apos;, lessons.map(l => l.id))
    }

    // 13. Delete lessons
    await supabaseAdmin
      .from(&apos;lesson&apos;)
      .delete()
      .eq(&apos;module_id&apos;, &apos;in&apos;, (await supabaseAdmin
        .from(&apos;module&apos;)
        .select(&apos;id&apos;)
        .eq(&apos;course_id&apos;, courseId)).data?.map(m => m.id) || [])

    // 14. Delete modules
    await supabaseAdmin
      .from(&apos;module&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 15. Delete enrollments
    await supabaseAdmin
      .from(&apos;enrolment&apos;)
      .delete()
      .eq(&apos;course_id&apos;, courseId)

    // 16. Finally delete the course itself
    const { error } = await supabaseAdmin
      .from(&apos;course&apos;)
      .delete()
      .eq(&apos;id&apos;, courseId)

    if (error) {
      console.error(&apos;Error deleting course:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete course&apos; },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Unexpected error in DELETE course:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 