import { redirect } from &apos;next/navigation&apos;
import { Metadata } from &apos;next&apos;

export const metadata: Metadata = {
  title: &apos;Course Media Content&apos;
}

export default function MediaContentRedirect({ 
  params 
}: {
  params: { id: string }
}) {
  // Redirect to main edit page and const the client-side component handle the tab
  redirect(`/admin/courses/${params.id}/edit`)
} 