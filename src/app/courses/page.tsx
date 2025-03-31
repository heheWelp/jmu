import { createClient } from '@/lib/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import DeleteCourseButton from '@/components/courses/DeleteCourseButton'

// Create Supabase admin client to bypass RLS
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define course type based on the database schema
interface Course {
  id: string
  name: string
  description: string
  course_code: string
  status: &apos;draft&apos; | &apos;published&apos;
  thumbnail_url: string | null
  created_at: string
  education_level: {
    level_name: string
  } | null
  user_type: {
    role_name: string
  } | null
  duration_hours: number | null
}

// Function to fetch courses
async function getCourses() {
  const { data: courses, error } = await supabaseAdmin
    .from(&apos;course&apos;)
    .select(`
      *,
      education_level:education_level (
        level_name
      ),
      user_type:user_type (
        role_name
      )
    `)
    .order(&apos;created_at&apos;, { ascending: false })

  if (error) {
    console.error(&apos;Error fetching courses:&apos;, error)
    return []
  }

  return courses as Course[]
}

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  return (
    <div className=&quot;max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8&quot;>
      <div className=&quot;flex justify-between items-center mb-6&quot;>
        <h1 className=&quot;text-3xl font-bold&quot;>Courses</h1>
        <Link href=&quot;/admin/courses/create&quot;>
          <Button>
            <PlusIcon className=&quot;h-5 w-5 mr-2&quot; />
            Create Course
          </Button>
        </Link>
      </div>

      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6&quot;>
        {courses.length === 0 ? (
          <div className=&quot;col-span-full text-center py-12&quot;>
            <p className=&quot;text-gray-500&quot;>No courses found. Create your first course to get started.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className=&quot;border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow&quot;>
              <div className=&quot;aspect-w-16 aspect-h-9 bg-gray-100&quot;>
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.name}
                    width={400}
                    height={225}
                    className=&quot;object-cover&quot;
                  />
                ) : (
                  <div className=&quot;flex items-center justify-center h-full bg-gray-100&quot;>
                    <span className=&quot;text-gray-400&quot;>No thumbnail</span>
                  </div>
                )}
              </div>

              <div className=&quot;p-4&quot;>
                <div className=&quot;flex items-center justify-between mb-2&quot;>
                  <h2 className=&quot;text-lg font-semibold&quot;>{course.name}</h2>
                  <Badge variant={course.status === &apos;published&apos; ? &apos;default&apos; : &apos;secondary&apos;}>
                    {course.status}
                  </Badge>
                </div>

                <p className=&quot;text-sm text-gray-500 mb-2&quot;>Code: {course.course_code}</p>

                {course.education_level && (
                  <p className=&quot;text-sm text-gray-500 mb-2&quot;>
                    Level: {course.education_level.level_name}
                  </p>
                )}

                {course.user_type && (
                  <p className=&quot;text-sm text-gray-500 mb-4&quot;>
                    Target: {course.user_type.role_name}
                  </p>
                )}

                <div className=&quot;flex items-center justify-between mt-4&quot;>
                  <div className=&quot;space-x-2&quot;>
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Button size=&quot;sm&quot; variant=&quot;outline&quot; className=&quot;h-8&quot;>
                        <PencilIcon className=&quot;h-3.5 w-3.5 mr-1&quot; />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button size=&quot;sm&quot; variant=&quot;outline&quot; className=&quot;h-8&quot;>
                        <EyeIcon className=&quot;h-3.5 w-3.5 mr-1&quot; />
                        View
                      </Button>
                    </Link>
                  </div>
                  
                  <DeleteCourseButton courseId={course.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 