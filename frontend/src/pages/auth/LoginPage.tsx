import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Network, User, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import '@fontsource/playfair-display/700.css'

const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Usuario o correo electrónico es obligatorio'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading, sesionExpirada, error: errorSesion } = useAuthStore()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { usernameOrEmail: '', password: '', rememberMe: false },
    mode: 'onBlur',
  })

  const { register, handleSubmit, formState: { errors } } = form

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setGeneralError(null)
    try {
      const email = /@/.test(values.usernameOrEmail) ? values.usernameOrEmail : values.usernameOrEmail
      await login(email, values.password, 'frontend-web')
      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Credenciales incorrectas o error de conexión'
      setGeneralError(msg)
      toast.error(msg)
    }
  }

  const submitting = isLoading

  // Se distingue entre "se te acabo el tiempo" y "el servidor no respondio" para
  // que el usuario sepa si tiene que volver a entrar o solo reintentar.
  const avisoSesion = sesionExpirada
    ? 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.'
    : errorSesion

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/login-bg.jpg'), linear-gradient(135deg, #0f7bff 0%, #1f2937 100%)" }} />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
      <div className="relative z-20 flex w-full flex-col items-center px-4 sm:px-0">
        <div className="flex flex-col items-center -mt-14 sm:-mt-20 md:-mt-24">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B2B44]/95 shadow-sm backdrop-blur-sm sm:h-11 sm:w-11">
            <Network className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <h1 className="mt-2 text-4xl font-bold uppercase tracking-tight text-[#1B2B44] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] sm:mt-3 sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>SIGPOA</h1>
        </div>
        <Card className="mt-4 w-full max-w-sm rounded-xl border-white/30 bg-slate-400/30 p-0 shadow-lg backdrop-blur sm:mt-5">
          <CardContent className="space-y-3 p-5 sm:p-6">
            {avisoSesion && <Alert variant="destructive" className="border-red-400/40 bg-red-500/10 text-red-100"><AlertDescription>{avisoSesion}</AlertDescription></Alert>}
            {generalError && <Alert variant="destructive" className="border-red-400/40 bg-red-500/10 text-red-100"><AlertDescription>{generalError}</AlertDescription></Alert>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="usernameOrEmail" className="sr-only">Usuario o Correo Electrónico</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="usernameOrEmail" type="text" placeholder="Usuario o Correo Electrónico" aria-label="Usuario o Correo Electrónico" autoComplete="username" className="pl-9 rounded-md bg-white text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#4A6FA5]" disabled={submitting} {...register('usernameOrEmail')} />
                </div>
                {errors.usernameOrEmail && <p className="text-xs text-red-200">{errors.usernameOrEmail.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="sr-only">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="password" type="password" placeholder="Contraseña" aria-label="Contraseña" autoComplete="current-password" className="pl-9 rounded-md bg-white text-sm text-gray-900 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#4A6FA5]" disabled={submitting} {...register('password')} />
                </div>
                {errors.password && <p className="text-xs text-red-200">{errors.password.message}</p>}
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" disabled={submitting} className="border-white/70 data-[state=checked]:bg-[#4A6FA5] data-[state=checked]:border-[#4A6FA5]" {...register('rememberMe')} />
                  <Label htmlFor="rememberMe" className="text-xs text-white/95 hover:cursor-pointer">Recordarme</Label>
                </div>
                <a href="#" className="text-xs text-white/95 underline-offset-2 hover:underline">¿Olvidó su contraseña?</a>
              </div>
              <Button type="submit" className="w-full rounded-md bg-[#4A6FA5] uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#3E5F8F] disabled:opacity-80" disabled={submitting}>
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />INICIANDO SESIÓN</>) : ('INICIAR SESIÓN')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
