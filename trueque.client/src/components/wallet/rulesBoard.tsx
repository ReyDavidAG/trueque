import { Coin } from '@/components/ui/art'
import type { EarningRule } from '@/types/walletType'
import { formatMoney } from '@/utils/cacaos'
import { stagger } from '@/utils/stagger'

const SOURCE = { chispa: 'Chispa', insignias: 'Insignias', rh: 'RH' } as const

export function RulesBoard({
	rules,
	cacaoValue,
}: {
	rules: EarningRule[]
	cacaoValue: number
}) {
	return (
		<section className='board' aria-labelledby='board-title'>
			<h2 className='board__title' id='board-title'>
				Lo que paga cada cosa
			</h2>
			<ul className='board__list' role='list'>
				{rules.map((r, i) => (
					<li
						key={r.code}
						className='board__row animate-row-in'
						style={stagger(i)}>
						<span className='board__what'>
							{r.label}
							<small>
								{SOURCE[r.source]}
								{r.note && ` · ${r.note}`}
							</small>
						</span>
						<span className='board__pay'>
							<b className='num'>{r.isVariable ? '10–100' : r.cacaos}</b>
							{(r.cacaos > 0 || r.isVariable) && (
								<Coin className='board__bean' />
							)}
							{r.monthlyCap ? (
								<small>hasta {r.monthlyCap} al mes</small>
							) : (
								r.cacaos > 0 && (
									<small>≈ {formatMoney(r.cacaos * cacaoValue)}</small>
								)
							)}
						</span>
					</li>
				))}
			</ul>
			<p className='board__foot'>
				1 cacao = {formatMoney(cacaoValue)} en productos. Valores de prueba, por
				calibrar con RH.
			</p>
		</section>
	)
}
