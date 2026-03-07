// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner'; // <-- Importamos Sonner
import { LogIn, UserPlus } from 'lucide-react'; // <-- Importamos iconos

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('¡Bienvenido de vuelta a Harimedia!'); // <-- Notificación de éxito
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('¡Tu cuenta ha sido creada con éxito!'); // <-- Notificación de éxito
      }
      // No necesitamos usar router.push('/') aqui porque nuestro AuthContext
      // detectara el cambio de estado y hara la redireccion automaticamente.
    } catch (err: any) {
      // Manejo basico de errores de Firebase
      let errorMessage = 'Ocurrió un error. Inténtalo de nuevo.';
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Correo o contraseña incorrectos.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage); // <-- Notificación de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <div className="w-full max-w-sm space-y-8 bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
        
        <div className="text-center flex flex-col items-center">
          {/* Contenedor del icono dinámico */}
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${
            isLogin 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}>
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Harimedia
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Inicia sesión para continuar' : 'Comienza tu bitácora hoy mismo'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className={`block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 outline-none transition-all ${
                  isLogin ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                }`}
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`block w-full rounded-xl border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 outline-none transition-all ${
                  isLogin ? 'focus:ring-blue-600' : 'focus:ring-emerald-600'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full justify-center rounded-xl px-3 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-all duration-300 ${
                isLogin 
                  ? 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600' 
                  : 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline-emerald-600'
              }`}
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={`text-sm font-semibold transition-colors ${
              isLogin 
                ? 'text-blue-600 hover:text-blue-500 dark:text-blue-400' 
                : 'text-emerald-600 hover:text-emerald-500 dark:text-emerald-400'
            }`}
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate aquí' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}