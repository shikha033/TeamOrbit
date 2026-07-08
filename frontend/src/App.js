import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import JoinTeam from '@/pages/JoinTeam';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Teams from '@/pages/Teams';
import TeamDetail from '@/pages/TeamDetail';
import Kanban from '@/pages/Kanban';
import Chat from '@/pages/Chat';
import Analytics from '@/pages/Analytics';
import AIStudio from '@/pages/AIStudio';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/signup" element={<Signup />} />
    <Route path="/auth/forgot" element={<ForgotPassword />} />
    <Route path="/join/:code" element={<JoinTeam />} />
    <Route
      path="/app"
      element={
        <Private>
          <AppLayout />
        </Private>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />
      <Route path="projects/:id/board" element={<Kanban />} />
      <Route path="projects/:id/chat" element={<Chat />} />
      <Route path="projects/:id/ai" element={<AIStudio />} />
      <Route path="teams" element={<Teams />} />
      <Route path="teams/:id" element={<TeamDetail />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
