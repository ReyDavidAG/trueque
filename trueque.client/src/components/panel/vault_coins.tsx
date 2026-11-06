import { useEffect, useRef } from 'react'

import { mountVaultCoinsScene } from './vault_coins_scene'

export function VaultCoins({ active, free, total }: { active: boolean; free: number; total: number }) {
	const host = useRef<HTMLDivElement>(null)
	const isActive = useRef(active)

	useEffect(() => {
		isActive.current = active
	}, [active])

	useEffect(() => {
		const element = host.current
		if (!element) return
		return mountVaultCoinsScene(element, free, total, () => isActive.current)
	}, [free, total])

	return <div ref={host} className='vault-coins' aria-hidden='true' />
}
