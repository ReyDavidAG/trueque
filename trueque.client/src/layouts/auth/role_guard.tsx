import { Navigate, Outlet } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import type { Role } from '@/types/session_type'

export default function RoleGuard({ roles }: { roles: Role[] }) {
	const { role } = useRequiredSession()
	return roles.includes(role) ? (
		<Outlet />
	) : (
		<Navigate to={ROUTES.market} replace />
	)
}
