'use client';

import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    document.cookie = 'lazo_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'lazo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth';
  }, []);

  return (
    <div className="mx-auto max-w-2xl py-16 text-slate-100">
      <div className="glass-card rounded-[2rem] border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Logging out</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Goodbye</h1>
        <p className="mt-3 text-sm text-slate-400">Clearing your session and redirecting to the login page.</p>
      </div>
    </div>
  );
}
