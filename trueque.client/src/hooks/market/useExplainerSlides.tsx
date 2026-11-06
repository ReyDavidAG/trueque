import { type ReactNode, useMemo } from 'react'

import { useConfig } from '@/hooks/config/useConfig'
import { useRules } from '@/hooks/wallet/useWallet'
import type { Product } from '@/types/productType'
import { cacaos, formatMoney } from '@/utils/cacaos'

export type ExplainerSlide = { title: string; text: string; note?: ReactNode }

const DEFAULT_CACAO_VALUE = 5
const DEFAULT_LOT_MONTHS = 12
const IMPLEMENTED_RULE = 'done'

const cheapestOf = (products: Product[]) =>
	products.reduce<Product | null>(
		(min, p) => (!min || p.price < min.price ? p : min),
		null
	)

export function useExplainerSlides(products: Product[]) {
	const { data: config } = useConfig()
	const rules = useRules()
	const cacaoValue = config?.cacaoValue ?? DEFAULT_CACAO_VALUE
	const months = config?.lotMonths ?? DEFAULT_LOT_MONTHS
	const implemented = rules.data?.find(r => r.code === IMPLEMENTED_RULE)
	const cheapest = useMemo(() => cheapestOf(products), [products])

	const slides: ExplainerSlide[] = [
		{
			title: 'Lo ganas en Chispa',
			text: 'Cuando tu chispa avanza, publicas un reto o tu encargado te da una insignia.',
			note: implemented && (
				<>
					Una chispa implementada da <b>{cacaos(implemented.cacaos)}</b> (≈{' '}
					{formatMoney(implemented.cacaos * cacaoValue)}).
				</>
			),
		},
		{
			title: 'Eliges algo que te alcance',
			text: 'Cada puesto del mercado tiene su precio en cacaos. Con "Sólo lo que me alcanza" ves lo que ya puedes cambiar.',
			note: cheapest && (
				<>
					Lo más barato hoy: <b>{cheapest.name.toLowerCase()}</b> por{' '}
					{cacaos(cheapest.price)}.
				</>
			),
		},
		{
			title: 'Haces el trueque',
			text: 'Se descuentan tus cacaos y recibes un cupón con código.',
		},
		{
			title: 'Enseñas tu cupón',
			text: 'Lo canjeas en el lugar de canje del producto y listo.',
		},
		{
			title: `Duran ${months} meses`,
			text: 'Desde que los ganas. Al cambiar se usan primero los más viejos, para que no se te venzan.',
		},
	]

	return { slides, cacaoValue }
}
