import { Art } from './art'

export function Cover({
	art,
	src,
	label = '',
	className = '',
}: {
	art: string
	src?: string
	label?: string
	className?: string
}) {
	return src ? (
		<img
			className={`cover ${className}`}
			src={src}
			alt={label}
			loading='lazy'
			decoding='async'
		/>
	) : (
		<Art id={art} label={label} />
	)
}
