import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { login, register, googleOAuthUrl } from '@/api/auth'

const SPRING_GENTLE = { type: 'spring' as const, stiffness: 300, damping: 30 }

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
})
type RegisterValues = z.infer<typeof registerSchema>

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: '', password: '', name: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true)
    try {
      let data
      if (isRegister) {
        data = await register({ email: values.email, password: values.password, name: values.name })
      } else {
        data = await login({ email: values.email, password: values.password })
      }
      setTokens(data.accessToken, data.refreshToken, data.tokenType)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = googleOAuthUrl()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="#7C3AED" fillOpacity="0.1"/>
              <rect x="8" y="16" width="48" height="36" rx="8" fill="#7C3AED" fillOpacity="0.15"/>
              <rect x="8" y="16" width="48" height="36" rx="8" stroke="#7C3AED" strokeWidth="2"/>
              <line x1="8" y1="26" x2="56" y2="26" stroke="#7C3AED" strokeWidth="2" opacity="0.5"/>
              <circle cx="44" cy="34" r="5" fill="#7C3AED"/>
              <rect x="16" y="32" width="14" height="2" rx="1" fill="#7C3AED" fillOpacity="0.6"/>
              <rect x="16" y="36" width="8" height="2" rx="1" fill="#7C3AED" fillOpacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t('appName')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col gap-4">
          {isRegister && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nguyễn Văn A" {...registerForm('name')} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...registerForm('email')}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              {...registerForm('password')}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
            {isLoading
              ? t('common.loading')
              : isRegister
              ? t('auth.signUp')
              : t('auth.signIn')}
          </Button>

          {/* Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Google */}
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand font-medium hover:underline bg-transparent border-none cursor-pointer"
          >
            {isRegister ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
