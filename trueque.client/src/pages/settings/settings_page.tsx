import { BudgetsSection } from '@/components/settings/budgets_section'
import { CategoriesSection } from '@/components/settings/categories_section'
import { ExpirySection } from '@/components/settings/expiry_section'
import { LocationsSection } from '@/components/settings/locations_section'
import { RulesSection } from '@/components/settings/rules_section'
import { ValueSection } from '@/components/settings/value_section'
import { DemoNote } from '@/components/ui/state_views'
import { useConfig } from '@/hooks/config/use_config'
import {
	useCategories,
	useCompanies,
	useLocations,
	useProducts,
} from '@/hooks/market/use_market'
import { useBudgets } from '@/hooks/panel/use_panel'
import { useRules } from '@/hooks/wallet/use_wallet'
import LoadingPage from '@/pages/core/loading/loading_page'

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
