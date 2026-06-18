/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './AuthContext';
import { LogOut, LogIn, UserCircle } from 'lucide-react';

function AppContent() {
  const { user, loading, signInWithGoogle, signInAsGuest, logout } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to Auditor</h1>
            <p className="text-sm text-slate-500">Authenticate to securely store your session and tokens</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Sign in with Google
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-500 uppercase tracking-widest font-medium">Or</span>
              </div>
            </div>
            <button 
              onClick={signInAsGuest}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
            >
              <UserCircle className="w-5 h-5 opacity-80" />
              Continue as Guest (In-Memory)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              GitHub Pages Auditor
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 flex items-center gap-2 mr-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {user.isAnonymous ? 'Guest Session' : user.email}
              </div>
              <button 
                onClick={logout} 
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
