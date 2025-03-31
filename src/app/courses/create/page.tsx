import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { CourseForm } from '@/components/courses/CourseForm'

export default async function CreateCoursePage() {
  const supabase = createClient()
  
  // Fetch education levels and user roles for the form
  const { data: educationLevels } = await supabase
    .from(&apos;education_levels&apos;)
    .select(&apos;id, level_name&apos;)
  
  const { data: userRoles } = await supabase
    .from(&apos;user_roles&apos;)
    .select(&apos;id, role_name&apos;)

  // Get current user to set as creator
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // Placeholder action function (not used anymore, as CourseForm now handles the submission)
  async function createCourse(formData: FormData) {
    &apos;use server&apos;
    return { error: &apos;This method is deprecated. Using API route instead.&apos; }
  }
  
  return (
    <div className=&quot;max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8&quot;>
      <div className=&quot;mb-8&quot;>
        <h1 className=&quot;text-3xl font-bold&quot;>Create New Course</h1>
        <p className=&quot;text-gray-500 mt-2&quot;>
          Fill in the basic information to create a new course. You can edit more details later.
        </p>
      </div>
      
      <CourseForm 
        action={createCourse}
        educationLevels={educationLevels || []}
        userRoles={userRoles || []}
        isEdit={false}
      />
    </div>
  )
} 