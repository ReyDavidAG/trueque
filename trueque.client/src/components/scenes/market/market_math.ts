import * as CANNON from 'cannon-es'
import type * as THREE from 'three'

export const spread = (range: number) => (Math.random() - 0.5) * range

export const pickOne = <T,>(list: readonly T[]) =>
	list[Math.floor(Math.random() * list.length)]

export const shuffle = <T,>(list: readonly T[]) => {
	const out = [...list]
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[out[i], out[j]] = [out[j], out[i]]
	}
	return out
}

export const toCannonVec = (v: THREE.Vector3) => new CANNON.Vec3(v.x, v.y, v.z)

export const copyBodyToMesh = (body: CANNON.Body, mesh: THREE.Object3D) => {
	mesh.position.set(body.position.x, body.position.y, body.position.z)
	mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
}

export const copyMeshToBody = (mesh: THREE.Object3D, body: CANNON.Body) => {
	body.position.copy(toCannonVec(mesh.position))
	body.quaternion.set(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
}
