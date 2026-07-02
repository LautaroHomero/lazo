'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'secret';

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim() === VALID_USERNAME && password.trim() === VALID_PASSWORD) {
      document.cookie = `lazo_auth=true; path=/; max-age=${60 * 60}`;
      document.cookie = `lazo_user=${encodeURIComponent(username.trim())}; path=/; max-age=${60 * 60}`;
      router.replace('/dashboard?lang=en');
      return;
    }

    setError('Usuario o contraseña incorrectos. Usa admin / secret.');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12 lg:px-8">
        <div className="grid w-full gap-10 rounded-[2rem] border border-slate-800/60 bg-slate-900/95 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.45)] lg:grid-cols-[1.4fr_1fr] lg:p-0">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-800 via-slate-950 to-slate-900 px-8 py-10 text-white lg:px-12 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />
            <div className="relative space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Autenticación segura</p>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Accede al dashboard.</h1>
                <p className="mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
                  Para revisar obligaciones, documentos y el panel de control, primero debes iniciar sesión con las credenciales válidas.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-slate-950/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Usuario</p>
                  <p className="mt-3 text-lg font-semibold text-white">admin</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-950/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contraseña</p>
                  <p className="mt-3 text-lg font-semibold text-white">secret</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-slate-950/95 p-8 sm:p-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Iniciar sesión</p>
              <h2 className="text-3xl font-semibold text-white">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-400">Ingresa tus credenciales para continuar hacia el panel de obligaciones.</p>
            </div>

            {error ? (
              <div className="mt-6 rounded-[1.5rem] border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">Usuario</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="admin"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                <span className="mb-2 block text-slate-500">Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="secret"
                  required
                />
              </label>

              <button className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                Entrar al dashboard
              </button>
            </form>

            <div className="mt-6 rounded-[1.75rem] border border-slate-800/60 bg-slate-900/90 px-5 py-4 text-sm text-slate-400">
              Solo el usuario autenticado puede acceder al dashboard. Si necesitas las credenciales, también están disponibles en la página de información.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
