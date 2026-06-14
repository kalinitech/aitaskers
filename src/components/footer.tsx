'use client'

import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-lg text-white">AITaskers</span>
            </div>
            <p className="text-sm">
              Verified by evidence, not just payment.
            </p>
            <p className="text-xs mt-2 text-slate-500">
              The only directory where every badge is backed by real proof of work on Outlier, Handshake, DataAnnotation, RWS and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-1.5 text-sm">
              <li><button className="hover:text-emerald-400 transition-colors">Browse Taskers</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Create Profile</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">Pricing</button></li>
              <li><button className="hover:text-emerald-400 transition-colors">How It Works</button></li>
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Supported Platforms</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Outlier AI', 'Handshake AI', 'DataAnnotation', 'Alignerr', 'RWS', 'Appen', 'Scale AI', 'UHRS', 'Micro1', 'Afterquery'].map((p) => (
                <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AITaskers. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart size={10} className="text-red-400 fill-red-400" /> for the AI training community
          </p>
        </div>
      </div>
    </footer>
  )
}
