import { Coin } from '@/components/ui/art'
import { Icon } from '@/components/ui/icon'
import type { Lot } from '@/types/walletType'
import { cn } from '@/utils/cn'
import { daysUntil, shortDate } from '@/utils/dates'
import { stagger } from '@/utils/stagger'

export function LotsSection({ lots, months }: { lots: Lot[]; months: number }) {
	return (
		<section className='section'>
			<h2 className='h3'>Tus yemas y cuándo vencen</h2>
			<p className='muted'>
				Cada yema vale {months} meses desde que la ganas. Al canjear se usan
				primero las más viejas.
			</p>
			<ol className='lots' role='list'>
				{lots
					.filter(l => l.remaining > 0 && daysUntil(l.expiresOn) >= 0)
					.map((l, i) => (
						<li key={l.id} className='lot animate-row-in' style={stagger(i)}>
							<span className='lot__beans' aria-hidden='true'>
								<Coin />
							</span>
							<span className='lot__n num'>{l.remaining}</span>
							<span className='lot__src'>
								{l.sourceRef}
								<small>Ganado el {shortDate(l.createdAt)}</small>
							</span>
							<span
								className={cn(
									'lot__exp',
									daysUntil(l.expiresOn) <= 60 && 'is-soon'
								)}>
								<Icon name='clock' />
								{shortDate(l.expiresOn)}
							</span>
						</li>
					))}
			</ol>
		</section>
	)
}
