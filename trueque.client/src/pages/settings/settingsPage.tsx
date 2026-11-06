import { BudgetsSection } from '@/components/settings/budgetsSection'
import { CategoriesSection } from '@/components/settings/categoriesSection'
import { ExpirySection } from '@/components/settings/expirySection'
import { LocationsSection } from '@/components/settings/locationsSection'
import { RulesSection } from '@/components/settings/rulesSection'
import { ValueSection } from '@/components/settings/valueSection'
import { DemoNote } from '@/components/ui/stateViews'
import { useConfig } from '@/hooks/config/useConfig'
import {
	useCategories,
	useCompanies,
	useLocations,
	useProducts,
} from '@/hooks/market/useMarket'
import { useBudgets } from '@/hooks/panel/usePanel'
import { useRules } from '@/hooks/wallet/useWallet'
import LoadingPage from '@/pages/core/loading/loadingPage'

export default function SettingsPage() {
	const config = useConfig()
	const rules = useRules()
	const categories = useCategories()
	const companies = useCompanies()
	const budgets = useBudgets()
	const locations = useLocations()
	const products = useProducts()
	const year = new Date().getFullYear()
	if (
		!config.data ||
		!rules.data ||
		!categories.data ||
		!companies.data ||
		!budgets.data ||
		!locations.data
	)
		return <LoadingPage />
	const withStore = companies.data.filter(
		c =>
			budgets.data.some(b => b.companyId === c.id) ||
			locations.data.some(l => l.companyId === c.id)
	)

	return (
		<div className='wrap narrow-wide'>
			<header className='page-head'>
				<p className='kicker'>RH corporativo</p>
				<h1 className='h1'>Ajustes de El Trueque</h1>
				<p className='lede'>
					Las reglas del mercado. Cada cambio aplica desde que lo guardas; lo ya
					ganado y los cupones emitidos no cambian.
				</p>
			</header>
			<div className='settings'>
				<ValueSection
					cacaoValue={config.data.cacaoValue}
					rules={rules.data}
					products={products.data ?? []}
				/>
				<RulesSection rules={rules.data} />
				<ExpirySection config={config.data} />
				<CategoriesSection categories={categories.data} />
				<BudgetsSection
					companies={withStore.length ? withStore : companies.data}
					budgets={budgets.data}
					year={year}
				/>
				<LocationsSection
					locations={locations.data}
					companies={companies.data}
				/>
			</div>
			<DemoNote>
				Ajustes de la demostración: aplican a todos los que la usan.
			</DemoNote>
		</div>
	)
}
