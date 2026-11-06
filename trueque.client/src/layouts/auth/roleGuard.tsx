import { Navigate, Outlet } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'
import type { Role } from '@/types/sessionType'

export default function RoleGuard({ roles }: { roles: Role[] }) {
	const { role } = useRequiredSession()
	return roles.includes(role) ? (
		<Outlet />
	) : (
		<Navigate to={ROUTES.market} replace />
	)
}
