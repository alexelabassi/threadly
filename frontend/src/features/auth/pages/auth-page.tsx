import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Feather, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { ApiError } from '../../../api/client';
import { Button } from '../../../components/ui/button';
import { authApi } from '../api';
import { sessionKey, useSession } from '../hooks';

const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Enter your username or email.').max(254),
  password: z.string().min(1, 'Enter your password.').max(128),
});
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .max(24, 'Use 24 characters or fewer.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscores.'),
  email: z.email('Enter a valid email address.').max(254),
  password: z
    .string()
    .min(10, 'Use at least 10 characters.')
    .max(128)
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[0-9]/, 'Include a number.'),
});
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

function PasswordInput({
  input,
  error,
}: {
  input: UseFormRegisterReturn<'password'>;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <div className="password-field">
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? 'password-error' : undefined}
          {...input}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span id="password-error" className="field-error">
          {error}
        </span>
      )}
    </>
  );
}

function LoginForm({ onComplete }: { onComplete: () => void }) {
  const client = useQueryClient();
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      client.setQueryData(sessionKey, user);
      toast.success(`Welcome back, ${user.username}.`);
      onComplete();
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate className="auth-form">
      <div className="field">
        <label htmlFor="usernameOrEmail">Username or email</label>
        <input
          id="usernameOrEmail"
          autoComplete="username"
          placeholder="You, in a few characters"
          aria-invalid={!!form.formState.errors.usernameOrEmail}
          aria-describedby="identifier-error"
          {...form.register('usernameOrEmail')}
        />
        <span id="identifier-error" className="field-error">
          {form.formState.errors.usernameOrEmail?.message}
        </span>
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <PasswordInput
          input={form.register('password')}
          error={form.formState.errors.password?.message}
        />
      </div>
      {mutation.error && (
        <p className="form-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      <Button className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="spin" size={17} />
        ) : (
          <>
            Welcome back
            <ArrowRight size={17} />
          </>
        )}
      </Button>
    </form>
  );
}

function RegisterForm({ onComplete }: { onComplete: () => void }) {
  const client = useQueryClient();
  const [visible, setVisible] = useState(false);
  const form = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      client.setQueryData(sessionKey, user);
      toast.success('You’re in. Make yourself at home.');
      onComplete();
    },
    onError: (e) => {
      if (e instanceof ApiError && e.errors) {
        for (const [key, messages] of Object.entries(e.errors)) {
          const field = key.toLowerCase();
          if (field === 'username' || field === 'email' || field === 'password')
            form.setError(field, { message: messages[0] });
        }
      }
      toast.error(e.message);
    },
  });
  return (
    <form className="auth-form" noValidate onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
      {(['username', 'email', 'password'] as const).map((name) => (
        <div className="field" key={name}>
          <label htmlFor={name}>{name[0].toUpperCase() + name.slice(1)}</label>
          <div className={name === 'password' ? 'password-field' : undefined}>
            <input
              id={name}
              type={
                name === 'password'
                  ? visible
                    ? 'text'
                    : 'password'
                  : name === 'email'
                    ? 'email'
                    : 'text'
              }
              autoComplete={name === 'password' ? 'new-password' : name}
              aria-invalid={!!form.formState.errors[name]}
              aria-describedby={`${name}-help`}
              placeholder={
                name === 'username'
                  ? 'Find a name that feels like you'
                  : name === 'email'
                    ? 'you@example.com'
                    : 'Make it a good one'
              }
              {...form.register(name)}
            />
            {name === 'password' && (
              <button
                type="button"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
          <span
            id={`${name}-help`}
            className={form.formState.errors[name] ? 'field-error' : 'field-hint'}
          >
            {form.formState.errors[name]?.message ||
              (name === 'password'
                ? '10+ characters, with uppercase, lowercase, and a number.'
                : name === 'username'
                  ? '3–24 letters, numbers, or underscores.'
                  : '')}
          </span>
        </div>
      ))}
      {mutation.error && (
        <p className="form-error" role="alert">
          {mutation.error.message}
        </p>
      )}
      <Button className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="spin" size={17} />
        ) : (
          <>
            Create your account
            <ArrowRight size={17} />
          </>
        )}
      </Button>
      <p className="auth-privacy">Your email stays private. Your perspective is yours to share.</p>
    </form>
  );
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: user } = useSession();
  const target = params.get('returnTo');
  const returnTo =
    target?.startsWith('/') &&
    !target.includes('\\') &&
    !target.startsWith('//') &&
    !target.startsWith('/login') &&
    !target.startsWith('/register')
      ? target
      : '/';
  if (user) return <Navigate to={returnTo} replace />;
  const alternate = `${register ? '/login' : '/register'}${target ? `?returnTo=${encodeURIComponent(target)}` : ''}`;
  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to the feed
        </Link>
        <div className="auth-intro-content">
          <span className="auth-feather">
            <Feather size={40} strokeWidth={1.2} />
          </span>
          <span className="eyebrow">GOOD THINGS START WITH A THOUGHT</span>
          <h1>
            A little curiosity.
            <br />A fresh perspective.
            <br />
            <span>A place for you.</span>
          </h1>
          <p>
            Come as you are. Share what’s on your mind.
            <br />
            There’s room for your story here.
          </p>
        </div>
        <p className="auth-intro-foot">Stay curious. Be kind. Keep sharing.</p>
      </div>
      <div className="auth-panel">
        <span className="section-kicker">
          {register ? 'MAKE YOURSELF AT HOME' : 'YOUR CORNER IS WAITING'}
        </span>
        <h2>{register ? 'Find your place.' : 'Good to see you.'}</h2>
        <p>
          {register
            ? 'Join a space for thoughts worth sharing.'
            : 'Sign in and pick up where you left off.'}
        </p>
        {register ? (
          <RegisterForm onComplete={() => navigate(returnTo, { replace: true })} />
        ) : (
          <LoginForm onComplete={() => navigate(returnTo, { replace: true })} />
        )}
        <div className="auth-switch">
          {register ? 'Already part of Threadly?' : 'New around here?'}{' '}
          <Link to={alternate}>
            {register ? 'Log in' : 'Create an account'}
            <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={14} />;
}
