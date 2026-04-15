import React, { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Responders } from './pages/Responders';
import { Emergencies } from './pages/Emergencies';
import { Responses } from './pages/Responses';
import { Credentials } from './pages/Credentials';
import { AuditLog } from './pages/AuditLog';
import { ConsentRecords } from './pages/ConsentRecords';
import { NotificationLog } from './pages/NotificationLog';

interface AuthCtx { user: User | null; loading: boolean }
export const AuthContext = createContext<AuthCtx>({ user: null, loading: true });
export const useAdmin = () => useContext(AuthContext);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdmin();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}><span className="loading-spinner" /></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="responders/*" element={<Responders />} />
                <Route path="emergencies/*" element={<Emergencies />} />
                <Route path="responses/*" element={<Responses />} />
                <Route path="credentials/*" element={<Credentials />} />
                <Route path="audit/*" element={<AuditLog />} />
                <Route path="consent/*" element={<ConsentRecords />} />
                <Route path="notifications/*" element={<NotificationLog />} />
              </Routes>
            </Layout>
          </RequireAuth>
        } />
      </Routes>
    </AuthContext.Provider>
  );
}
