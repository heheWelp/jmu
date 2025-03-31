import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Course Feedback Settings'
}

export default function FeedbackSettingsRedirect({ 
  params 
}: {
  params: { id: string }
}) {
  // Redirect to main edit page and const the client-side component handle the tab
  redirect(`/admin/courses/${params.id}/edit`)
} 