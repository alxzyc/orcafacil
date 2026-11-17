import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button, GlassCard, Input, Label } from '../../components';
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

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-[var(--error)]';
    if (score <= 2) return 'bg-[var(--warning)]';
    if (score <= 3) return 'bg-[var(--info)]';
    if (score <= 4) return 'bg-[var(--success)]';
    return 'bg-[var(--success)]';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return 'Muito fraca';
    if (score === 1) return 'Fraca';
    if (score === 2) return 'Regular';
    if (score === 3) return 'Boa';
    if (score === 4) return 'Forte';
    return 'Muito forte';
  };

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
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <GlassCard variant="elevated" className="w-full max-w-md p-8 animate-in animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            OrçaFácil
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">Crie sua conta grátis</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              {...register('companyName')}
              id="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Minha Empresa"
              leftIcon={<Building className="w-5 h-5" aria-hidden="true" />}
              error={errors.companyName?.message}
              disabled={isSubmitting || authLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
              error={errors.email?.message}
              disabled={isSubmitting || authLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
              className="pr-12"
            />

            <div className="mt-3" role="group" aria-label="Força da senha">
              <div className="flex gap-1 mb-2" role="progressbar" aria-valuenow={strengthScore} aria-valuemin={0} aria-valuemax={5} aria-label="Força da senha">
                {passwordStrengthChecks.map((check, index) => (
                  <div
                    key={check.label}
                    className={`flex-1 h-1.5 rounded transition-all duration-300 ${index < strengthScore ? getStrengthColor(strengthScore) : 'bg-[var(--border-default)]'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">Força da senha: <span className="font-medium">{getStrengthLabel(strengthScore)}</span></p>
              <ul className="mt-2 space-y-1 text-xs text-[var(--text-tertiary)]" aria-label="Requisitos de senha">
                {passwordStrengthChecks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2">
                    {check.test(password) ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--success)] flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className={check.test(password) ? 'text-[var(--success-text)]' : ''}>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" aria-hidden="true" />}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting || authLoading}
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--accent-lime)] focus:ring-[var(--accent-lime)]"
              aria-required="true"
            />
            <label htmlFor="terms" className="text-sm text-[var(--text-secondary)]">
              Concordo com os {' '}
              <a href="#" className="text-[var(--text-link)] hover:underline">Termos de Uso</a>
              {' '}e {' '}
              <a href="#" className="text-[var(--text-link)] hover:underline">Política de Privacidade</a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isSubmitting || authLoading}
            loading={isSubmitting}
          >
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            Já tem conta?{' '}
            <Link to="/login" className="text-[var(--text-link)] hover:text-[var(--text-link-hover)] font-medium transition-colors">
              Entre
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;