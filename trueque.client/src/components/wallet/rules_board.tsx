import { Coin } from '@/components/ui/art'
import type { EarningRule } from '@/types/wallet_type'
import { stagger } from '@/utils/stagger'

export function RulesBoard({ rules }: { rules: EarningRule[] }) {
	return (
		<section className='board' aria-labelledby='board-title'>
			<h2 className='board__title' id='board-title'>
				Lo que paga Chispa
			</h2>
			<ul className='board__list' role='list'>
				{rules.map((r, i) => (
					<li
						key={r.code}
						className='board__row animate-row-in'
						style={stagger(i)}>
						<span className='board__what'>{r.label}</span>
						<span className='board__pay'>
							<b className='num'>{r.cacaos}</b>
							{r.cacaos > 0 && <Coin className='board__bean' />}
							{r.monthlyCap && <small>hasta {r.monthlyCap} al mes</small>}
						</span>
					</li>
				))}
			</ul>
			<p className='board__foot'>Valores de prueba, por calibrar con RH.</p>
		</section>
	)
}
