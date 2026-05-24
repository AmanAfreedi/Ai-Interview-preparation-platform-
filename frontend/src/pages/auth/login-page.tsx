import { AuthForm } from '@/components/auth/auth-form'
import { AuthLayout } from '@/components/layout/auth-layout'

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your interview preparation."
    >
      <AuthForm mode="login" />
    </AuthLayout>
  )
}
