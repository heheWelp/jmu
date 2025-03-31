import { createClient } from &apos;@supabase/supabase-js&apos;
import { NextResponse } from &apos;next/server&apos;

export async function POST(request: Request) {
  try {
    const profileData = await request.json()
    
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Insert the profile
    const { data, error } = await supabase
      .from(&apos;profiles&apos;)
      .insert(profileData)
      .select()
    
    if (error) {
      console.error(&apos;Server profile creation error:&apos;, error)
      return NextResponse.json(
        { error: &apos;Failed to create profile&apos; },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error(&apos;Unexpected error in create-profile:&apos;, err)
    return NextResponse.json(
      { error: &apos;An unexpected error occurred&apos; },
      { status: 500 }
    )
  }
} 