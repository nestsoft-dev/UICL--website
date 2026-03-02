import { type FC, type ReactNode } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import type { ClearanceRole } from '../lib/auth'

type RoleGateProps = {
  allow: ClearanceRole[]
  children: ReactNode
  fallback?: ReactNode
}

const RoleGate: FC<RoleGateProps> = ({ allow, children, fallback }) => {
  const { user } = useAuthStore()
  if (!user || !allow.includes(user.role)) {
    return <>{fallback ?? null}</>
  }
  return <>{children}</>
}

export default RoleGate
