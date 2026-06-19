/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Github, Lock, Database } from 'lucide-react';

export default function LauncherPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="max-w-3xl w-full space-y-12 text-center">
          
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              GitHub Pages Auditor
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Identify unprotected custom domains and unenforced HTTPS configurations across your GitHub network before they become security weaknesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center mb-4 text-slate-600">
                <Github className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold mb-2">Network Wide Discovery</h3>
              <p className="text-sm text-slate-600">Scan all repositories with Pages enabled to gain immediate visibility into deployment footprints.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center mb-4 text-slate-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold mb-2">HTTPS Verification</h3>
              <p className="text-sm text-slate-600">Proactively detect and report when HTTPS enforcement drops or certificates expire.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center mb-4 text-slate-600">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold mb-2">Structured V2 Exports</h3>
              <p className="text-sm text-slate-600">Download robust, deeply nested JSON and CSV analytical metadata for external ingestion.</p>
            </div>
          </div>

          <div className="pt-8 pb-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg font-medium tracking-tight shadow-md hover:bg-slate-800 hover:shadow-lg transition-all"
            >
              Launch Auditor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="shrink-0 w-full bg-white border-t border-slate-200 py-6 text-center">
        <p className="text-sm text-slate-500">
          Built securely on Firebase and Cloud Run. Read-only API access.
        </p>
      </footer>
    </div>
  );
}
