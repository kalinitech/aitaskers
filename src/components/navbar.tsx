'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, LogOut, Shield, LayoutDashboard, Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export function Navbar() {
  const { currentView, setView, user, setUser, isLoginOpen, setIsLoginOpen, logout } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const { toast } = useToast()

  const navItems = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'browse' as const, label: 'Browse Taskers', icon: Search },
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'admin' as const, label: 'Admin', icon: Shield },
  ]

  const handleLogin = async () => {
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Login Failed', description: data.error, variant: 'destructive' })
        return
      }
      setUser(data)
      setIsLoginOpen(false)
      setLoginEmail('')
      setLoginPassword('')
      toast({ title: 'Welcome back!', description: `Logged in as ${data.email}` })
    } catch {
      toast({ title: 'Error', description: 'Failed to connect', variant: 'destructive' })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({ title: 'Logged out', description: 'You have been logged out' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-navy to-brand-navyLight flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent">
                AITaskers
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-brand-teal bg-brand-teal/10 dark:bg-brand-teal/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-teal rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut size={14} className="mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setIsLoginOpen(true)}
                >
                  <LogIn size={14} className="mr-1" />
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setView(item.key);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-brand-teal bg-brand-teal/10 dark:bg-brand-teal/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="pt-2 border-t mt-2">
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground px-3">{user.email}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { handleLogout(); setMobileOpen(false) }}>
                        <LogOut size={14} className="mr-1" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => { setIsLoginOpen(true); setMobileOpen(false) }}>
                      <LogIn size={14} className="mr-1" />
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login to AITaskers</DialogTitle>
            <DialogDescription>Enter your credentials to access your dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Admin: admin@aitaskers.com / admin123</p>
              <p>Tasker: grace@aitaskers.com / password123</p>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
