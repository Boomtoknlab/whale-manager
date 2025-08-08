import { Router, Route, Switch } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider } from '@/contexts/AuthContext'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import PricingPage from '@/pages/PricingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import WhaleDetailPage from '@/pages/WhaleDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/pricing" component={PricingPage} />
            
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/whale/:address" component={WhaleDetailPage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            
            <Route>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-300">The page you're looking for doesn't exist.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App
