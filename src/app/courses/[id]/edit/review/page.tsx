import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Course Review'
}

export default function ReviewRedirect({ 
  params 
}: {
  params: { id: string }
}) {
  // Redirect to main edit page and const the client-side component handle the tab
  redirect(`/admin/courses/${params.id}/edit`)
} 