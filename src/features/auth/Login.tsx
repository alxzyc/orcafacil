import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button, GlassCard, Input, Label } from '../../components';
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
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <GlassCard variant="elevated" className="w-full max-w-md p-8 animate-in animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            OrçaFácil
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" aria-hidden="true" />
              <Input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                leftIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
                error={errors.email?.message}
                disabled={isSubmitting || authLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" aria-hidden="true" />
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" aria-hidden="true" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-white transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                error={errors.password?.message}
                disabled={isSubmitting || authLoading}
                className="pl-10 pr-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--accent-lime)] focus:ring-[var(--accent-lime)]"
                aria-label="Lembrar de mim"
              />
              <span className="text-sm text-[var(--text-secondary)]">Lembrar de mim</span>
            </label>
            <Link
              to="/reset-password"
              className="text-sm text-[var(--text-link)] hover:text-[var(--text-link-hover)] transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isSubmitting || authLoading}
            loading={isSubmitting}
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Não tem conta?{' '}
            <Link to="/register" className="text-[var(--text-link)] hover:text-[var(--text-link-hover)] font-medium transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;