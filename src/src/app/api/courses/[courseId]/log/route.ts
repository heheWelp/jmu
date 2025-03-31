import { NextRequest, NextResponse } from &apos;next/server&apos;

// This endpoint exists solely to generate terminal logging for tabs that otherwise don&apos;t show activity
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  // Log to the terminal
  console.log(`Course tab accessed for courseId: ${params.courseId}`)
  
  // Return a simple response
  return NextResponse.json({ success: true, message: &apos;Log entry created&apos; })
} 