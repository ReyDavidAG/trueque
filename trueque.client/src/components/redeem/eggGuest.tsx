import type { EggKind } from '@/constants/easterEggs'

function KarateCat() {
	return (
		<svg className='egg__art egg-cat' viewBox='0 0 160 200' aria-hidden='true'>
			<path className='ec-fur ec-tail' d='M112 150c26-6 34-30 22-52' />
			<g className='ec-kick'>
				<path className='ec-gi' d='M92 150l44-20 6 14-44 22z' />
				<ellipse className='ec-paw' cx='144' cy='134' rx='9' ry='7' />
			</g>
			<path className='ec-gi' d='M62 152l-6 36h18l6-34z' />
			<ellipse className='ec-paw' cx='64' cy='190' rx='11' ry='6' />
			<path className='ec-gi' d='M52 96h56l8 60H44z' />
			<path className='ec-line' d='M80 96l-14 30M80 96l14 30' />
			<path className='ec-belt' d='M46 136h68v10H46z' />
			<path className='ec-belt' d='M78 146l-8 18M84 146l8 18' />
			<g className='ec-punch'>
				<path className='ec-gi' d='M108 102l30-14 6 12-30 16z' />
				<circle className='ec-paw' cx='144' cy='92' r='8' />
			</g>
			<path className='ec-gi' d='M52 102l-22 24 10 8 22-20z' />
			<circle className='ec-paw' cx='32' cy='130' r='8' />
			<path className='ec-fur' d='M50 40l6-26 18 18zM110 40l-6-26-18 18z' />
			<circle className='ec-fur' cx='80' cy='62' r='32' />
			<path
				className='ec-band'
				d='M48 50c20-8 44-8 64 0l-2 9c-20-7-40-7-60 0z'
			/>
			<path className='ec-band' d='M112 52l14-6-4 12zM112 54l12 8-12 2z' />
			<ellipse className='ec-eye' cx='68' cy='62' rx='6' ry='7' />
			<ellipse className='ec-eye' cx='92' cy='62' rx='6' ry='7' />
			<path className='ec-pupil' d='M68 57v10M92 57v10' />
			<path className='ec-nose' d='M76 74h8l-4 5z' />
			<path
				className='ec-line'
				d='M80 79v4M60 76l-16-2M60 80l-15 4M100 76l16-2M100 80l15 4'
			/>
		</svg>
	)
}

function DancingSkeleton() {
	return (
		<svg
			className='egg__art egg-bones'
			viewBox='0 0 160 220'
			aria-hidden='true'>
			<g className='eb-body'>
				<g className='eb-leg eb-leg--l'>
					<path className='eb-bone' d='M70 132l-8 38M62 170l2 34' />
					<path className='eb-bone eb-foot' d='M64 204h-14' />
				</g>
				<g className='eb-leg eb-leg--r'>
					<path className='eb-bone' d='M90 132l8 38M98 170l-2 34' />
					<path className='eb-bone eb-foot' d='M96 204h14' />
				</g>
				<path className='eb-bone' d='M62 128c6-8 30-8 36 0l-4 8H66z' />
				<path className='eb-bone' d='M80 58v72' />
				<path
					className='eb-rib'
					d='M66 72c4-4 24-4 28 0M64 84c6-5 26-5 32 0M66 96c4-4 24-4 28 0M68 108c4-3 20-3 24 0'
				/>
				<g className='eb-arm eb-arm--l'>
					<path className='eb-bone' d='M66 66l-22 18M44 84l-14-22' />
					<circle className='eb-joint' cx='30' cy='60' r='5' />
				</g>
				<g className='eb-arm eb-arm--r'>
					<path className='eb-bone' d='M94 66l22 18M116 84l14-22' />
					<circle className='eb-joint' cx='130' cy='60' r='5' />
				</g>
				<g className='eb-head'>
					<circle className='eb-skull' cx='80' cy='32' r='22' />
					<path className='eb-skull' d='M68 48h24v10H68z' />
					<path
						className='eb-hole'
						d='M66 26a6 6 0 1 0 12 0a6 6 0 1 0-12 0M82 26a6 6 0 1 0 12 0a6 6 0 1 0-12 0M78 38l2-5 2 5z'
					/>
					<path className='eb-line' d='M74 48v10M80 48v10M86 48v10' />
				</g>
			</g>
		</svg>
	)
}

const COPY: Record<
	Exclude<EggKind, 'asteroids'>,
	{ title: string; line: string }
> = {
	cat: {
		title: '¡Tú puedes!',
		line: 'Lucy, maestra cinta negra, te echa porras.',
	},
	skeleton: {
		title: 'Dance!',
		line: 'El esqueleto no deja de mover el hueso.',
	},
}

export function EggGuest({
	kind,
	onClose,
}: {
	kind: Exclude<EggKind, 'asteroids'>
	onClose: () => void
}) {
	const copy = COPY[kind]
	return (
		<div className='egg' role='dialog' aria-label={copy.title}>
			<div className='egg__card'>
				{kind === 'cat' ? <KarateCat /> : <DancingSkeleton />}
				<p className='egg__title'>{copy.title}</p>
				<p className='egg__line'>{copy.line}</p>
				<button
					type='button'
					className='btn btn--grana'
					onClick={onClose}
					autoFocus>
					Cerrar
				</button>
			</div>
		</div>
	)
}
