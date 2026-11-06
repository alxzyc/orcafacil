import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { signIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Bem-vindo de volta!');
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          OrçaFácil
        </h1>
        <p className="mt-2 text-white/60">Entre na sua conta</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : ''}`}
              disabled={isSubmitting || authLoading}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : ''}`}
              disabled={isSubmitting || authLoading}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/30 bg-white/5 text-accent-lime focus:ring-accent-lime"
              aria-label="Lembrar de mim"
            />
            <span className="text-sm text-white/70">Lembrar de mim</span>
          </label>
          <Link
            to="/reset-password"
            className="text-sm text-accent-lime hover:text-accent-lime/80 transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg"
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/60">
          Não tem conta?{' '}
          <Link to="/register" className="text-accent-lime hover:text-accent-lime/80 font-medium transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </GlassCard>
  );
};



