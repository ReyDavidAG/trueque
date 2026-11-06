import { useEffect, useRef } from 'react'

import { mountWalletJarScene } from './wallet_jar_scene'

export function WalletJar({ balance, earned }: { balance: number; earned: number }) {
	const host = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = host.current
		if (!element) return
		return mountWalletJarScene(element, balance, earned)
	}, [balance, earned])

	return <div ref={host} className='jar' aria-hidden='true' />
}
