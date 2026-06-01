'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { IconBarbell, IconMail, IconLock, IconUser, IconWindow } from '@tabler/icons-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                 process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isDemo) {
        // Just reload for demo
        window.location.href = '/';
        return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        alert('Проверьте почту для подтверждения регистрации!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-custom">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-accent/20">
            <IconWindow size={28} />
          </div>
          <h1 className="text-2xl font-bold text-t1 tracking-tight">Окошко</h1>
          <p className="text-t3 text-sm mt-1">Сервис управления записями</p>
        </div>

        <div className="flex bg-bg-custom p-1 rounded-xl mb-8 border border-border">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isSignUp ? 'bg-surface shadow-sm text-t1' : 'text-t3'}`}
          >
            Вход
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isSignUp ? 'bg-surface shadow-sm text-t1' : 'text-t3'}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[13px] font-semibold text-t2 mb-1.5 ml-1">ФИО</label>
              <div className="relative">
                <IconUser size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
                <input
                  type="text"
                  required
                  placeholder="Алексей Смирнов"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm text-t1"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-t2 mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <IconMail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm text-t1"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-t2 mb-1.5 ml-1">Пароль</label>
            <div className="relative">
              <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-t3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-custom border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm text-t1"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[12px] font-medium animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-bold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-[12px] text-t3 mt-6">
          Продолжая, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
