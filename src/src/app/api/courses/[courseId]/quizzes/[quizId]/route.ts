import { NextRequest, NextResponse } from &apos;next/server&apos;
import { createClient as createAdminClient } from &apos;@supabase/supabase-js&apos;

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; quizId: string } }
) {
  try {
    const { courseId, quizId } = params
    
    // Start a transaction to delete quiz and associated data
    // In a real implementation, this would use a Supabase function to handle the transaction
    
    // First, delete any related quiz settings
    const { error: settingsError } = await supabaseAdmin
      .from(&apos;quiz_settings&apos;)
      .delete()
      .eq(&apos;quiz_id&apos;, quizId)
    
    if (settingsError) {
      console.error(&apos;Error deleting quiz settings:&apos;, settingsError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete quiz settings&apos; },
        { status: 500 }
      )
    }
    
    // Delete any quiz questions
    const { error: questionsError } = await supabaseAdmin
      .from(&apos;quiz_questions&apos;)
      .delete()
      .eq(&apos;quiz_id&apos;, quizId)
    
    if (questionsError) {
      console.error(&apos;Error deleting quiz questions:&apos;, questionsError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete quiz questions&apos; },
        { status: 500 }
      )
    }
    
    // Finally delete the quiz itself
    const { error: quizError } = await supabaseAdmin
      .from(&apos;quizzes&apos;)
      .delete()
      .eq(&apos;id&apos;, quizId)
      .eq(&apos;course_id&apos;, courseId)
    
    if (quizError) {
      console.error(&apos;Error deleting quiz:&apos;, quizError)
      return NextResponse.json(
        { success: false, error: &apos;Failed to delete quiz&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(&apos;Unexpected error in DELETE quiz:&apos;, error)
    return NextResponse.json(
      { success: false, error: &apos;Server error&apos; },
      { status: 500 }
    )
  }
} 