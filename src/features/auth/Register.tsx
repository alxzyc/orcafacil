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
import { Mail, Lock, User, Building, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const registerSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const passwordStrengthChecks = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Um caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const Register: React.FC = () => {
  const { signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');
  const strengthScore = passwordStrengthChecks.filter((check) => check.test(password)).length;

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.companyName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.');
        navigate('/login');
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
        <p className="mt-2 text-white/60">Crie sua conta grátis</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-white/80 mb-2">
            Nome da empresa
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <input
              {...register('companyName')}
              id="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Minha Empresa"
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.companyName ? 'border-red-500' : ''}`}
              disabled={isSubmitting || authLoading}
              aria-invalid={errors.companyName ? 'true' : 'false'}
              aria-describedby={errors.companyName ? 'company-error' : undefined}
            />
          </div>
          {errors.companyName && (
            <p id="company-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.companyName.message}
            </p>
          )}
        </div>

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
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : ''}`}
              disabled={isSubmitting || authLoading}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : 'password-strength'}
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

          {/* Password Strength Indicator */}
          <div id="password-strength" className="mt-3" aria-live="polite">
            <div className="flex gap-1 mb-2" role="progressbar" aria-valuenow={strengthScore} aria-valuemin={0} aria-valuemax={5} aria-label="Força da senha">
              {passwordStrengthChecks.map((check, index) => (
                <div
                  key={check.label}
                  className={`flex-1 h-1.5 rounded transition-colors ${
                    index < strengthScore
                      ? strengthScore <= 2
                        ? 'bg-red-500'
                        : strengthScore <= 3
                        ? 'bg-yellow-500'
                        : strengthScore <= 4
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-white/50">
              Força da senha:{' '}
              {strengthScore === 0 && 'Muito fraca'}
              {strengthScore === 1 && 'Fraca'}
              {strengthScore === 2 && 'Regular'}
              {strengthScore === 3 && 'Boa'}
              {strengthScore === 4 && 'Forte'}
              {strengthScore === 5 && 'Muito forte'}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-white/60" aria-label="Requisitos de senha">
              {passwordStrengthChecks.map((check) => (
                <li key={check.label} className="flex items-center gap-2">
                  {check.test(password) ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className={check.test(password) ? 'text-green-400' : ''}>{check.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
            Confirmar senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
              disabled={isSubmitting || authLoading}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
          </div>
          {errors.confirmPassword && (
            <p id="confirm-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-accent-lime focus:ring-accent-lime"
            aria-required="true"
          />
          <label htmlFor="terms" className="text-sm text-white/70">
            Concordo com os {' '}
            <a href="#" className="text-accent-lime hover:underline">Termos de Uso</a>
            {' '}e {' '}
            <a href="#" className="text-accent-lime hover:underline">Política de Privacidade</a>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-lg"
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/60">
          Já tem conta?{' '}
          <Link to="/login" className="text-accent-lime hover:text-accent-lime/80 font-medium transition-colors">
            Entre
          </Link>
        </p>
      </div>
    </GlassCard>
  );
};



