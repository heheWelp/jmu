import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(count)
      `)
      .eq('course_id', courseId)
      .order('number', { ascending: true })
    
    if (error) {
      console.error('Error fetching quizzes:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch quizzes' },
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
    console.error('Unexpected error in GET quizzes:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
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
        { success: false, error: 'Quiz name is required' },
        { status: 400 }
      )
    }
    
    // Insert new quiz
    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .insert({
        course_id: courseId,
        name,
        number: number || 1,
        course_order: course_order || 1
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding quiz:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to add quiz' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, quiz: data })
  } catch (error) {
    console.error('Unexpected error in POST quiz:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
} 