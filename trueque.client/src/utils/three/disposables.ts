export type Disposable = { dispose: () => void }

export type Keep = <T extends Disposable>(item: T) => T

export function createDisposables() {
	const items: Disposable[] = []
	const keep: Keep = item => {
		items.push(item)
		return item
	}
	const disposeAll = () => {
		for (const item of items) item.dispose()
	}
	return { keep, disposeAll }
}
