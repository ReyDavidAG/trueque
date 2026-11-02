import { Coin } from '@/components/ui/art'
import type { Lot } from '@/types/wallet_type'
import { shortDate } from '@/utils/dates'

export function PaymentPlan({
	plan,
}: {
	plan: { lot: Lot; amount: number }[]
}) {
	return (
		<section className='pay'>
			<h2 className='h4'>Así se pagaría</h2>
			<p className='muted small'>
				Se usan primero los cacaos que vencen antes.
			</p>
			<ol className='pay__list' role='list'>
				{plan.map(({ lot, amount }) => (
					<li key={lot.id}>
						<span className='pay__n num'>
							<Coin />
							{amount}
						</span>
						<span className='pay__src'>{lot.sourceRef}</span>
						<span className='pay__exp'>vence {shortDate(lot.expiresOn)}</span>
					</li>
				))}
			</ol>
		</section>
	)
}
