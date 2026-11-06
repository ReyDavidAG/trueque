import * as THREE from 'three'

import { WALLET_JAR } from '@/constants/walletJar'
import { easeOutCubic } from '@/utils/easing'

import type { JarCoin } from './walletJarCoins'

export function createHandMotion(
	hand: THREE.Group,
	coins: JarCoin[],
	takeCount: number
) {
	const peak = coins.length ? Math.max(...coins.map(c => c.to.y)) : 0
	const down = coins.length * WALLET_JAR.gapMs + WALLET_JAR.dropMs + 250
	const grab = down + 650
	const lift = grab + 300
	const gone = lift + 950
	const from = new THREE.Vector3(0.5, 3.4, 0.3)
	const at = new THREE.Vector3(0, peak + 0.42, 0.1)
	const to = new THREE.Vector3(2.9, 3.2, 0.2)
	const taking = coins.slice(coins.length - takeCount)
	let grabbed = false

	const takeCoins = () => {
		grabbed = true
		for (const coin of taking) {
			coin.taken = true
			hand.attach(coin.mesh)
			coin.grab.copy(coin.mesh.position)
		}
	}

	return (elapsed: number) => {
		if (takeCount <= 0 || elapsed < down || elapsed >= gone + 100) return
		hand.visible = elapsed < gone
		if (elapsed < grab) {
			const k = easeOutCubic((elapsed - down) / (grab - down))
			hand.position.lerpVectors(from, at, k)
			hand.rotation.z = (1 - k) * 0.4
		} else if (elapsed < lift) {
			if (!grabbed) takeCoins()
			const k = (elapsed - grab) / (lift - grab)
			hand.position
				.copy(at)
				.add(new THREE.Vector3(0, -0.06 * Math.sin(k * Math.PI), 0))
			for (const coin of taking)
				coin.mesh.position.lerpVectors(coin.grab, coin.hold, easeOutCubic(k))
		} else {
			const k = Math.min(1, (elapsed - lift) / (gone - lift))
			hand.position.lerpVectors(at, to, k * k)
			hand.rotation.z = -k * 0.5
		}
	}
}
