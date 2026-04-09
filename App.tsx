import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing'; 
import Dashboard from './pages/Dashboard';
import FindWork from './pages/FindWork';
import FindTalent from './pages/FindTalent';
import Teams from './pages/Teams';
import Pricing from './pages/Pricing';
import PlanCheckout from './pages/PlanCheckout';
import AdminDashboard from './pages/AdminDashboard';
import GigDetails from './pages/GigDetails';
import Chats from './pages/Chats';
import MyProjects from './pages/MyProjects';
import DeliverablesUpload from './pages/DeliverablesUpload';
import { UserRole } from './types';
import { api } from './services/api';

const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  currentRole, 
  isLoggedIn 
}: { 
  children?: React.ReactNode, 
  allowedRoles: UserRole[], 
  currentRole: UserRole | null,
  isLoggedIn: boolean 
}) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  if (currentRole && !allowedRoles.includes(currentRole)) {
    if (currentRole === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (currentRole === UserRole.EMPLOYER) return <Navigate to="/company-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (user) {
        setIsLoggedIn(true);
        setCurrentRole(user.role);
    }
    setLoading(false);
  }, []);

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setCurrentRole(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-transparent font-sans text-gray-900">
        <div className="z-[999] relative">
          <Navbar 
            currentRole={currentRole} 
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        </div>
        
        <main className="flex-1 relative">
          <Routes>
            <Route 
              path="/" 
              element={!isLoggedIn ? <Landing onLogin={handleLogin} /> : <Navigate to={currentRole === UserRole.ADMIN ? "/admin" : (currentRole === UserRole.EMPLOYER ? "/company-dashboard" : "/dashboard")} />} 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.FREELANCER} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/freelancer-profile" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.FREELANCER} viewMode="profile" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-work" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <FindWork />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-projects" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <MyProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/review-submission/:id" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <DeliverablesUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gigs/:id" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <GigDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teams" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Teams />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER, UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Chats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-talent" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <FindTalent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company-dashboard" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.EMPLOYER} viewMode="overview" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company-profile" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.EMPLOYER} viewMode="profile" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/active-gigs" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.EMPLOYER} viewMode="gigs" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wallet" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Dashboard role={UserRole.EMPLOYER} viewMode="wallet" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER, UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <Pricing role={currentRole!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pricing/checkout/:planId" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER, UserRole.EMPLOYER]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <PlanCheckout role={currentRole!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <AdminDashboard viewMode="overview" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/tickets" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]} currentRole={currentRole} isLoggedIn={isLoggedIn}>
                  <AdminDashboard viewMode="tickets" />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;
