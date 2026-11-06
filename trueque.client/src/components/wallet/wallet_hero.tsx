import { CountUp } from '@/components/ui/count_up'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

import { WalletJar } from './wallet_jar'

type WalletStatProps = {
	label: string
	value: number
	icon: IconName
	tone: string
	index: number
}

function WalletStat({ label, value, icon, tone, index }: WalletStatProps) {
	return (
		<div className={cn('wallet-stat', tone)} style={{ '--i': index }}>
			<span className='wallet-stat__icon' aria-hidden='true'>
				<Icon name={icon} />
			</span>
			<dt>{label}</dt>
			<dd className='num'>
				<CountUp to={value} />
			</dd>
		</div>
	)
}

type WalletHeroProps = {
	balance: number
	earned: number
	spent: number
	moveCount: number
	expiringSoon: number
}

export function WalletHero({ balance, earned, spent, moveCount, expiringSoon }: WalletHeroProps) {
	return (
		<section className='wallet-hero' aria-label='Tu saldo'>
			<dl className='wallet-hero__side'>
				<WalletStat label='Ganados' value={earned} icon='spark' tone='is-earn' index={0} />
				<WalletStat label='Movimientos' value={moveCount} icon='chart' tone='is-count' index={1} />
			</dl>
			<div className='wallet-hero__center'>
				<WalletJar balance={balance} earned={earned} />
				<p className='wallet-hero__n'>
					<span className='num'>
						<CountUp to={balance} />
					</span>
					<span>{balance === 1 ? 'cacao' : 'cacaos'}</span>
				</p>
				<p className='wallet-hero__hint'>
					{spent > 0
						? 'Lo que cambiaste sale de la jícara · arrástrala para girarla'
						: 'Arrastra la jícara para girarla'}
				</p>
			</div>
			<dl className='wallet-hero__side'>
				<WalletStat label='Cambiados' value={spent} icon='ticket' tone='is-spend' index={2} />
				<WalletStat
					label='Vencen pronto'
					value={expiringSoon}
					icon='clock'
					tone={expiringSoon ? 'is-soon' : 'is-calm'}
					index={3}
				/>
			</dl>
		</section>
	)
}
