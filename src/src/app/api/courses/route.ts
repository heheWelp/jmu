import { createClient as createSupabaseClient } from &apos;@supabase/supabase-js&apos;
import { NextResponse } from &apos;next/server&apos;
import { cookies } from &apos;next/headers&apos;
import { createClient } from &apos;@/lib/supabase&apos;

// Create Supabase client with service role key to bypass RLS
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    
    // Get user ID from session
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: &apos;Unauthorized&apos; },
        { status: 401 }
      )
    }
    
    // Extract description and prepare course data
    const { description, ...otherFormData } = formData
    const courseData = {
      name: otherFormData.name,
      course_code: otherFormData.course_code,
      education_level: otherFormData.education_level || null,
      user_type: otherFormData.user_type || null,
      status: &apos;draft&apos;,
      created_by: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Insert the course
    const { data, error } = await supabaseAdmin
      .from(&apos;course&apos;)
      .insert(courseData)
      .select()
    
    if (error) {
      console.error(&apos;Course creation error:&apos;, error.message)
      return NextResponse.json(
        { error: `Failed to create course: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: &apos;Failed to create course - no data returned&apos; },
        { status: 500 }
      )
    }
    
    // Create course details with description
    if (data[0].id) {
      const courseDetailsData = {
        course_id: data[0].id,
        description: description || &apos;&apos;,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error: detailsError } = await supabaseAdmin
        .from(&apos;course_details&apos;)
        .insert(courseDetailsData)
        .select()
      
      if (detailsError) {
        console.error(&apos;Course details creation error:&apos;, detailsError.message)
        return NextResponse.json(
          { error: `Failed to save course description: ${detailsError.message}` },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        data: [{
          ...data[0],
          description: description || &apos;&apos;
        }]
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: unknown) {
    console.error(&apos;Unexpected error:&apos;, err.message)
    return NextResponse.json(
      { error: &apos;An unexpected error occurred&apos; },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const formData = await request.json()
    console.log(&apos;Received course update data:&apos;, JSON.stringify(formData, null, 2))
    
    // Extract description and ID first
    const { description, id, ...otherFormData } = formData;
    
    if (!id) {
      return NextResponse.json(
        { error: &apos;Course ID is required&apos; },
        { status: 400 }
      )
    }
    
    // IMPORTANT: Create a new object with ONLY the fields that exist in the course table
    // Do NOT use spread operators on the formData to avoid unexpected fields
    const courseData = {
      name: otherFormData.name,
      course_code: otherFormData.course_code,
      education_level: otherFormData.education_level,
      user_type: otherFormData.user_type,
      status: otherFormData.status,
      updated_at: new Date().toISOString()
    }
    
    // Remove undefined/null fields to avoid overwriting with null
    Object.keys(courseData).forEach(key => {
      if (courseData[key as keyof typeof courseData] === undefined) {
        delete courseData[key as keyof typeof courseData]
      }
    })
    
    console.log(&apos;Updating course table:&apos;, JSON.stringify(courseData, null, 2))
    
    // Update the course with service role
    const { data, error } = await supabaseAdmin
      .from(&apos;course&apos;)
      .update(courseData)
      .eq(&apos;id&apos;, id)
      .select()
    
    if (error) {
      console.error(&apos;Server course update error:&apos;, error)
      return NextResponse.json(
        { error: `Failed to update course: ${error.message}` },
        { status: 500 }
      )
    }
    
    // Handle description update in course_details only if description was provided
    if (description !== undefined) {
      // First check if course_details entry exists
      const { data: existingDetails } = await supabaseAdmin
        .from(&apos;course_details&apos;)
        .select(&apos;id&apos;)
        .eq(&apos;course_id&apos;, id)
        .single()
      
      if (existingDetails) {
        // Update existing record
        console.log(&apos;Updating existing course_details record with description&apos;)
        const { error: detailsError } = await supabaseAdmin
          .from(&apos;course_details&apos;)
          .update({
            description,
            updated_at: new Date().toISOString()
          })
          .eq(&apos;course_id&apos;, id)
        
        if (detailsError) {
          console.error(&apos;Server course details update error:&apos;, detailsError)
        }
      } else {
        // Create new record
        console.log(&apos;Creating new course_details record with description&apos;)
        const { error: detailsError } = await supabaseAdmin
          .from(&apos;course_details&apos;)
          .insert({
            course_id: id,
            description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (detailsError) {
          console.error(&apos;Server course details creation error:&apos;, detailsError)
        }
      }
    }
    
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error(&apos;Unexpected error in update-course:&apos;, err)
    return NextResponse.json(
      { error: &apos;An unexpected error occurred&apos; },
      { status: 500 }
    )
  }
} 