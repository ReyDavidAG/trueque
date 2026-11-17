import { Coin } from '@/components/ui/art'

export default function LoadingPage() {
	return (
		<div className='boot' role='status' aria-live='polite'>
			<Coin className='boot__coin' />
			<p className='boot__text'>Abriendo La Despensa…</p>
		</div>
	)
}
