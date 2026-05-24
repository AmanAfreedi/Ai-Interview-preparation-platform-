import { AuthForm } from '@/components/auth/auth-form'
import { AuthLayout } from '@/components/layout/auth-layout'

export function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of students preparing smarter with AI."
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  )
}
