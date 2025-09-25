import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function CreateAccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}