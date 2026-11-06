import { WALLET_JAR } from '@/constants/wallet_jar'
import { easeOutBounce } from '@/utils/easing'
import { createThreeStage, type ThreeStage } from '@/utils/three_stage'

import { coinCount, fillJar, type JarCoin } from './wallet_jar_coins'
import { createHandMotion } from './wallet_jar_hand_motion'
import { addJarLights, buildHand, buildJar } from './wallet_jar_model'

function createDragSpin(stage: ThreeStage) {
	const drag = { active: false, x: 0, spin: 0, velocity: WALLET_JAR.spinSpeed as number }
	stage.listen('pointerdown', event => {
		drag.active = true
		drag.x = event.clientX
		stage.canvas.setPointerCapture(event.pointerId)
	})
	stage.listen('pointermove', event => {
		if (!drag.active) return
		const dx = (event.clientX - drag.x) * 0.012
		drag.x = event.clientX
		drag.spin += dx
		drag.velocity = dx * 30
	})
	const release = () => {
		drag.active = false
	}
	stage.listen('pointerup', release)
	stage.listen('pointercancel', release)

	return (deltaSeconds: number) => {
		if (!drag.active) {
			drag.velocity +=
				(WALLET_JAR.spinSpeed - drag.velocity) * Math.min(1, deltaSeconds * 1.5)
			if (!stage.reducedMotion) drag.spin += drag.velocity * deltaSeconds
		}
		return drag.spin
	}
}

function dropCoins(coins: JarCoin[], elapsed: number, reducedMotion: boolean) {
	for (const coin of coins) {
		if (coin.taken) continue
		const k = reducedMotion
			? 1
			: Math.min(1, Math.max(0, (elapsed - coin.delay) / WALLET_JAR.dropMs))
		coin.mesh.visible = k > 0
		coin.mesh.position.y = coin.from + (coin.to.y - coin.from) * easeOutBounce(k)
	}
}

export function mountWalletJarScene(host: HTMLDivElement, balance: number, earned: number) {
	const stage = createThreeStage(host, {
		className: 'jar__canvas',
		fov: 32,
		near: 0.1,
		far: 50,
	})
	stage.camera.position.set(0, 2.3, 4.6)
	stage.camera.lookAt(0, -0.15, 0)
	addJarLights(stage)

	const jar = buildJar(stage)
	const keepCount = coinCount(balance)
	const total = stage.reducedMotion ? keepCount : Math.max(keepCount, coinCount(earned))
	const coins = fillJar(stage, jar, total)
	const hand = buildHand(stage)
	const moveHand = createHandMotion(hand, coins, total - keepCount)
	const spin = createDragSpin(stage)

	const startedAt = performance.now()
	let previous = startedAt
	stage.start(now => {
		const deltaSeconds = Math.min((now - previous) / 1000, 1 / 30)
		previous = now
		const elapsed = now - startedAt
		dropCoins(coins, elapsed, stage.reducedMotion)
		moveHand(elapsed)
		jar.rotation.y = spin(deltaSeconds)
		stage.renderer.render(stage.scene, stage.camera)
	})

	return stage.dispose
}
