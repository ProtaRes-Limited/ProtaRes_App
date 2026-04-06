import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/auth';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Main Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { MapPage } from '@/pages/MapPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';

// Emergency Pages
import { EmergencyDetailPage } from '@/pages/emergency/EmergencyDetailPage';
import { ReportEmergencyPage } from '@/pages/witness/ReportEmergencyPage';

// Credential Pages
import { CredentialsPage } from '@/pages/credentials/CredentialsPage';
import { GreenBadgePage } from '@/pages/credentials/GreenBadgePage';

// Settings Pages
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { PrivacyPage } from '@/pages/settings/PrivacyPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // For development, allow access without auth
  if (!isAuthenticated && import.meta.env.PROD) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="report" element={<ReportEmergencyPage />} />
            <Route path="emergency/:id" element={<EmergencyDetailPage />} />
            <Route path="profile/credentials" element={<CredentialsPage />} />
            <Route path="profile/green-badge" element={<GreenBadgePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/privacy" element={<PrivacyPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
