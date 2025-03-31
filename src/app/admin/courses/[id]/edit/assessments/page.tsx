import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Course Assessments'
}

interface Params {
  id: string;
}

export default function AssessmentsRedirect({ params }: { params: Params }) {
  // Redirect to main edit page and let the client-side component handle the tab
  redirect(`/admin/courses/${params.id}/edit`)
}
