import { LogOut, ShieldAlert, Timer, User } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useHoraCaducidad, useSesionRestante } from '@/hooks/useSesionRestante'
import { useAuthStore } from '@/stores/auth.store'

const MINUTOS_AVISO = 5

export function Header() {
  const { user, logout } = useAuthStore()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const restanteMs = useSesionRestante()
  const horaCaducidad = useHoraCaducidad()

  const handleLogout = async () => {
    setIsLogoutOpen(false)
    await logout()
  }

  // Con el rol sin resolver no se sabe que puede ver esta persona. Se dice de
  // forma explicita en vez de dejar la interfaz en modo lectura sin explicacion,
  // que es lo que paso tras un refresh antes de popular el usuario.
  const sinRol = !user?.rol

  const minutosRestantes =
    restanteMs === null ? null : Math.max(0, Math.floor(restanteMs / 60_000))
  const sesionPorCaducar = restanteMs !== null && restanteMs <= MINUTOS_AVISO * 60_000

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">SIGPOA</span>
        </div>
        <div className="flex items-center gap-3">
          {sinRol && (
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert className="h-3 w-3" />
              Rol no verificado
            </Badge>
          )}

          {horaCaducidad !== null && (
            <Badge
              variant={sesionPorCaducar ? 'destructive' : 'outline'}
              className="gap-1 font-normal"
              title="La sesión se cierra automáticamente cuando el token caduca"
            >
              <Timer className="h-3 w-3" />
              {sesionPorCaducar && minutosRestantes !== null
                ? `Sesión: ${minutosRestantes} min`
                : `Sesión hasta ${horaCaducidad}`}
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.nombre || user?.email || 'Usuario'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-sm text-muted-foreground">
                  {user?.rol || 'Sin rol'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsLogoutOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title="Cerrar sesión"
        description="¿Estás seguro de cerrar tu sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        variant="default"
        onConfirm={handleLogout}
      />
    </>
  )
}
