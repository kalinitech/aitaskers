'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { HomePage } from '@/components/home-page'
import { BrowsePage } from '@/components/browse-page'
import { ProfilePage } from '@/components/profile-page'
import { DashboardPage } from '@/components/dashboard-page'
import { AdminPage } from '@/components/admin-page'
import { Footer } from '@/components/footer'
import { AnimatePresence, motion } from 'framer-motion'

function AppContent() {
  const { currentView } = useStore()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'home' && <HomePage />}
            {currentView === 'browse' && <BrowsePage />}
            {currentView === 'profile' && <ProfilePage />}
            {currentView === 'dashboard' && <DashboardPage />}
            {currentView === 'admin' && <AdminPage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
