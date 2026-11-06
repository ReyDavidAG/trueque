import { Navigate } from 'react-router'

import { CompanyPanel } from '@/components/panel/companyPanel'
import { HrPanel } from '@/components/panel/hrPanel'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'

export default function PanelPage() {
	const { role } = useRequiredSession()
	if (role === 'hr') return <HrPanel />
	if (role === 'company') return <CompanyPanel />
	return <Navigate to={ROUTES.market} replace />
}
