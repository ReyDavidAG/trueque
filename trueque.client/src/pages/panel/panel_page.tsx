import { Navigate } from 'react-router'

import { CompanyPanel } from '@/components/panel/company_panel'
import { HrPanel } from '@/components/panel/hr_panel'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'

export default function PanelPage() {
	const { role } = useRequiredSession()
	if (role === 'hr') return <HrPanel />
	if (role === 'company') return <CompanyPanel />
	return <Navigate to={ROUTES.market} replace />
}
