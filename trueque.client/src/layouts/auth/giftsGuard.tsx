import { Navigate, Outlet } from 'react-router'

import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'

export default function GiftsGuard({ build = false }: { build?: boolean }) {
	const session = useRequiredSession()
	const allowed = build
		? session.isHr
		: session.isHr || Boolean(session.canApproveGrants)
	return allowed ? <Outlet /> : <Navigate to={ROUTES.market} replace />
}
