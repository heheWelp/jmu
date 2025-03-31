import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    
    // Fetch quizzes for the course
    const { data, error } = await supabaseAdmin
      .from(&apos;quizzes&apos;)
      .select(`
        *,
        questions:quiz_questions(count)
      `)
      .eq(&apos;course_id&apos;, courseId)
      .order(&apos;number&apos;, { ascending: true })
    
    if (error) {
      console.error(&apos;Error fetching quizzes:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to fetch quizzes&apos; },
        { status: 500 }
      )
    }
    
    // Format the quizzes with questions count
    const formattedQuizzes = data.map(quiz => ({
      ...quiz,
      questions_count: quiz.questions?.[0]?.count || 0
    }))
    
    return NextResponse.json({ success: true, quizzes: formattedQuizzes })
  } catch (error) {
    console.error(&apos;Unexpected error in GET quizzes:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const body = await req.json()
    
    const { name, number, course_order } = body
    
    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: &apos;Quiz name is required&apos; },
        { status: 400 }
      )
    }
    
    // Insert new quiz
    const { data, error } = await supabaseAdmin
      .from(&apos;quizzes&apos;)
      .insert({
        course_id: courseId,
        name,
        number: number || 1,
        course_order: course_order || 1
      })
      .select()
      .single()
    
    if (error) {
      console.error(&apos;Error adding quiz:&apos;, error)
      return NextResponse.json(
        { success: false, error: &apos;Failed to add quiz&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, quiz: data })
  } catch (error) {
    console.error(&apos;Unexpected error in POST quiz:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 