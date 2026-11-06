export function Hand({ className = '' }: { className?: string }) {
	return (
		<svg className={`hand ${className}`} viewBox='0 0 60 96' aria-hidden='true'>
			<rect className='hand__cuff' x='13' y='0' width='34' height='24' rx='5' />
			<path
				className='hand__skin'
				d='M11 26h38v20c0 9-6 15-13 17H24c-7-2-13-8-13-17z'
			/>
			<rect
				className='hand__skin'
				x='18'
				y='54'
				width='10'
				height='36'
				rx='5'
			/>
			<rect
				className='hand__skin'
				x='30'
				y='54'
				width='10'
				height='32'
				rx='5'
			/>
			<rect
				className='hand__skin'
				x='41'
				y='40'
				width='9'
				height='24'
				rx='4.5'
				transform='rotate(-24 45 52)'
			/>
		</svg>
	)
}
