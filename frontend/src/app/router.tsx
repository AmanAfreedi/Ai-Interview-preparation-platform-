import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute, PublicRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoginPage } from '@/pages/auth/login-page'
import { SignupPage } from '@/pages/auth/signup-page'
import { ComingSoonPage } from '@/pages/coming-soon-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { ResumePage } from '@/pages/resume/resume-page'
import { RoadmapPage } from '@/pages/roadmap/roadmap-page'
import { SkillGapPage } from '@/pages/skill-gap/skill-gap-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/quiz" element={<ComingSoonPage title="Quiz" />} />
            <Route
              path="/mock-interview"
              element={<ComingSoonPage title="Mock Interview" />}
            />
            <Route
              path="/debate"
              element={<ComingSoonPage title="Debate Arena" />}
            />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
