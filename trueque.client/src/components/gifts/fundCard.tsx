import { useState } from 'react'
import { toast } from 'sonner'

import { useCacaoValue } from '@/hooks/config/useConfig'
import { useSetGrantFund } from '@/hooks/grants/useGrantActions'
import type { GrantFund } from '@/types/grantType'
import { cacaos, formatMoney } from '@/utils/cacaos'
import { cn } from '@/utils/cn'

interface Props {
	year: number
	fund: GrantFund | null
	canEdit: boolean
}

export function FundCard({ year, fund, canEdit }: Props) {
	const cacaoValue = useCacaoValue()
	const set = useSetGrantFund()
	const [value, setValue] = useState(String(fund?.fund ?? ''))
	const [error, setError] = useState<string | null>(null)
	const used = (fund?.scheduled ?? 0) + (fund?.delivered ?? 0)
	const pct = fund?.fund ? Math.min(100, (used / fund.fund) * 100) : 0

	const save = () => {
		if (!/^\d+$/.test(value.trim())) {
			setError('Un número entero de yemas.')
			return
		}
		if (Number(value) < used) {
			setError(`No puede quedar abajo de lo ya autorizado (${cacaos(used)}).`)
			return
		}
		setError(null)
		set.mutate(
			{ year, amount: Number(value) },
			{
				onSuccess: () => toast.success('Fondo guardado'),
				onError: e => setError(e.message),
			}
		)
	}

	return (
		<section className='budget fund-card' aria-labelledby='fund-t'>
			<div className='budget__head'>
				<h2 className='h4' id='fund-t'>
					Fondo de regalos {year}
				</h2>
			</div>
			{fund ? (
				<>
					<p className='budget__total'>
						<b className='num'>{cacaos(fund.available)}</b> libres de{' '}
						{cacaos(fund.fund)}
						<small className='muted'>
							{' '}
							· {formatMoney(fund.available * cacaoValue)}
						</small>
					</p>
					<div
						className='budget__bar'
						role='img'
						aria-label={`Autorizado ${cacaos(used)} de ${cacaos(fund.fund)}`}>
						<span className='is-redeemed' style={{ width: `${pct}%` }} />
					</div>
					<dl className='budget__legend'>
						<div>
							<dt>Entregado</dt>
							<dd className='num'>{cacaos(fund.delivered)}</dd>
						</div>
						<div>
							<dt>Programado</dt>
							<dd className='num'>{cacaos(fund.scheduled)}</dd>
						</div>
						<div>
							<dt>Por autorizar</dt>
							<dd className='num'>{cacaos(fund.pending)}</dd>
						</div>
					</dl>
				</>
			) : (
				<p className='muted'>
					Todavía no hay fondo para {year}. Sin fondo no se autoriza ningún
					regalo.
				</p>
			)}
			{canEdit && (
				<div className='field'>
					<label htmlFor='fund-amount'>Fondo del año en yemas</label>
					<div className='field-inline'>
						<input
							id='fund-amount'
							className={cn('input num', error && 'animate-nudge')}
							inputMode='numeric'
							value={value}
							aria-invalid={Boolean(error)}
							aria-describedby='fund-amount-help'
							onChange={e => setValue(e.target.value)}
						/>
						<button
							type='button'
							className='btn btn--grana'
							disabled={set.isPending}
							onClick={save}>
							{set.isPending && <span className='spinner' aria-hidden='true' />}
							Guardar
						</button>
					</div>
					<p
						className={cn('field__help', error && 'is-error')}
						id='fund-amount-help'>
						{error ?? 'Lo define quien autoriza. No baja de lo ya autorizado.'}
					</p>
				</div>
			)}
		</section>
	)
}
