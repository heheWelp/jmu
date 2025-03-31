import { notFound } from &apos;next/navigation&apos;
import DynamicCourseEditor from &apos;@/components/courses/DynamicCourseEditor&apos;
import { getCourseData } from &apos;@/lib/actions/course&apos;
import { Metadata } from &apos;next&apos;

export const metadata: Metadata = {
  title: &apos;Edit Course&apos;
}

export default async function EditCoursePage({ 
  params 
}: {
  params: { id: string }
}) {
  // Get the course data using the ID from params
  const result = await getCourseData(params.id)
  
  // Handle errors
  if (&apos;error&apos; in result) {
    console.error(&apos;Error fetching course data:&apos;, result.error)
    notFound()
  }
  
  const { course, educationLevels, userRoles, objectives, modules, lessons } = result
  
  // Return the dynamic course editor with all required data
  return (
    <DynamicCourseEditor
      courseId={params.id}
      courseName={course.name}
      initialTab=&quot;basic-info&quot;
      courseData={course}
      educationLevels={educationLevels}
      userRoles={userRoles}
      objectives={objectives}
      modules={modules}
      lessons={lessons}
    />
  )
} 