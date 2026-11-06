import type * as CANNON from 'cannon-es'
import type * as THREE from 'three'

export type Part = {
	mesh: THREE.Mesh
	body: CANNON.Body
	stall: Stall
	home: THREE.Vector3
	homeQuaternion: THREE.Quaternion
	from: THREE.Vector3
	fromQuaternion: THREE.Quaternion
	mass: number
	hp: number
	maxHp: number
	loose: boolean
	needs: Part[]
	minSupports: number
}

export type Stall = {
	parts: Part[]
	shake: number
	lastHit: number
	rebuildStart: number
}

export type Fruit = { mesh: THREE.Object3D; body: CANNON.Body }

export type Picked = { part?: Part; fruit?: Fruit }

export type Grab = {
	body: CANNON.Body
	part?: Part
	offset: THREE.Vector3
	point: THREE.Vector3
	direction: THREE.Vector3
	x: number
	y: number
	moved: boolean
}

export type Triple = [number, number, number]
