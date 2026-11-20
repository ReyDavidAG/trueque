import type { GrantRecipient } from '@/types/grantType'
import { cacaos } from '@/utils/cacaos'

export function GiftRecipients({
	recipients,
	frozen,
}: {
	recipients: GrantRecipient[]
	frozen: boolean
}) {
	return (
		<section className='gift-section' aria-labelledby='gift-people-t'>
			<h2 className='h4' id='gift-people-t'>
				Quién recibe
			</h2>
			{recipients.length ? (
				<div className='table-wrap'>
					<table className='rules-table'>
						<thead>
							<tr>
								<th scope='col'>Persona</th>
								<th scope='col'>Yemas</th>
								<th scope='col'>Estado</th>
							</tr>
						</thead>
						<tbody>
							{recipients.map(r => (
								<tr key={r.personId}>
									<th scope='row'>
										<b>{r.fullName}</b>
										<small>
											<span className='num'>{r.employeeNumber}</span>
											{r.note && ` · ${r.note}`}
										</small>
									</th>
									<td className='num'>{cacaos(r.amount)}</td>
									<td>
										{r.delivered
											? 'Entregado'
											: (r.skippedReason ??
												(frozen ? 'En espera' : 'Borrador'))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className='muted'>
					La lista se arma al mandarlo a autorizar, con las personas activas de
					ese momento.
				</p>
			)}
		</section>
	)
}
