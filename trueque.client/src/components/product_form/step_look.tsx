import { type PointerEvent, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Art, layerDrawing } from '@/components/ui/art'
import { Icon, type IconName } from '@/components/ui/icon'
import { PriceSign } from '@/components/ui/price_sign'
import { ART, ART_GROUPS } from '@/constants/art/art_catalog'
import { SHAPES } from '@/constants/art/art_shapes'
import { STALLS } from '@/constants/stall'
import type { ProductForm } from '@/schemas/panel/product/product.schema'
import type { ProductImage } from '@/types/product_type'
import {
	ART_COLORS,
	type ArtColor,
	colorsIn,
	decodeDesign,
	encodeDesign,
	type Layer,
	type LayerKind,
	MAX_LAYERS,
	MAX_WORD,
	newLayer,
	TEXT_COLOR,
} from '@/utils/art_recipe'
import { cn } from '@/utils/cn'

import { PhotoField } from './photo_field'

interface Props {
	images: ProductImage[]
	onImages: (images: ProductImage[]) => void
}

const TABS = [
	['stall', 'Tienda', 'store'],
	['design', 'Diseño', 'spark'],
	['photos', 'Fotos', 'eye'],
] as const
type Tab = (typeof TABS)[number][0]

const EDIT = [
	['what', 'Qué es'],
	['colors', 'Colores'],
	['size', 'Tamaño y lugar'],
] as const
type Edit = (typeof EDIT)[number][0]

const ADD: [LayerKind, string, IconName][] = [
	['f', 'Figura', 'box'],
	['s', 'Forma', 'plus'],
	['t', 'Texto', 'edit'],
]

const FIGURES = new Map(ART.map(a => [a.id, a.label]))
const SHAPE_LABELS = new Map<string, string>(SHAPES.map(s => [s.id, s.label]))
const pickOne = <T,>(list: readonly T[]) =>
	list[Math.floor(Math.random() * list.length)]

const layerLabel = (l: Layer) =>
	l.kind === 't'
		? `“${l.ref}”`
		: l.kind === 's'
			? (SHAPE_LABELS.get(l.ref) ?? 'Forma')
			: (FIGURES.get(l.ref) ?? 'Figura')

const thumb = (l: Layer) =>
	encodeDesign([{ ...l, x: 120, y: 90, s: 100, r: 0, flip: false }])

export function StepLook({ images, onImages }: Props) {
	const { register, control, setValue } = useFormContext<ProductForm>()
	const stall = useWatch({ control, name: 'stall' })
	const code = useWatch({ control, name: 'art' }) ?? 'ticket'
	const name = useWatch({ control, name: 'name' })
	const price = Number(useWatch({ control, name: 'price' }))
	const [tab, setTab] = useState<Tab>('design')
	const [edit, setEdit] = useState<Edit>('what')
	const [sel, setSel] = useState(0)
	const [group, setGroup] = useState('all')
	const [query, setQuery] = useState('')
	const drag = useRef<{ x: number; y: number; lx: number; ly: number; w: number } | null>(
		null
	)

	const layers = decodeDesign(code)
	const at = Math.min(sel, layers.length - 1)
	const layer = layers[at]
	const palette =
		layer.kind === 't' ? [TEXT_COLOR] : colorsIn(layerDrawing({ ...layer, swaps: {} }))
	const shape = layers.map(l => l.kind + l.ref).join()

	const save = (next: Layer[]) =>
		setValue('art', encodeDesign(next), { shouldDirty: true, shouldValidate: true })
	const update = (patch: Partial<Layer>) =>
		save(layers.map((l, i) => (i === at ? { ...l, ...patch } : l)))

	const add = (kind: LayerKind) => {
		if (layers.length >= MAX_LAYERS) return
		const ref = kind === 'f' ? 'ticket' : kind === 's' ? 'star' : 'Nuevo'
		const base = newLayer(kind, ref)
		const next = [...layers, { ...base, x: 120 + (layers.length % 3) * 18 - 18, s: kind === 'f' ? 100 : 70 }]
		save(next)
		setSel(next.length - 1)
		setEdit('what')
	}
	const remove = () => {
		if (layers.length < 2) return
		save(layers.filter((_, i) => i !== at))
		setSel(Math.max(0, at - 1))
	}
	const duplicate = () => {
		if (layers.length >= MAX_LAYERS) return
		const next = [...layers.slice(0, at + 1), { ...layer, x: layer.x + 16, y: layer.y - 10 }, ...layers.slice(at + 1)]
		save(next)
		setSel(at + 1)
	}
	const shift = (dir: -1 | 1) => {
		const to = at + dir
		if (to < 0 || to >= layers.length) return
		const next = [...layers]
		;[next[at], next[to]] = [next[to], next[at]]
		save(next)
		setSel(to)
	}
	const shuffle = () =>
		update({ swaps: Object.fromEntries(palette.map(c => [c, pickOne(ART_COLORS)[0]])) })

	const figures = ART.filter(
		a =>
			(group === 'all' || a.group === group) &&
			a.label.toLowerCase().includes(query.trim().toLowerCase())
	)

	const grab = (e: PointerEvent<HTMLSpanElement>) => {
		if (tab !== 'design') return
		const r = e.currentTarget.getBoundingClientRect()
		drag.current = { x: e.clientX, y: e.clientY, lx: layer.x, ly: layer.y, w: r.width }
		e.currentTarget.setPointerCapture(e.pointerId)
	}
	const move = (e: PointerEvent<HTMLSpanElement>) => {
		const d = drag.current
		if (!d) return
		const k = 240 / d.w
		update({
			x: Math.min(240, Math.max(0, d.lx + (e.clientX - d.x) * k)),
			y: Math.min(180, Math.max(0, d.ly + (e.clientY - d.y) * k)),
		})
	}
	const release = () => {
		drag.current = null
	}

	const slider = (
		label: string,
		key: 's' | 'x' | 'y' | 'r',
		min: number,
		max: number,
		unit: string
	) => (
		<label className='knob'>
			<span className='knob__head'>
				{label}
				<b className='num'>
					{Math.round(layer[key])}
					{unit}
				</b>
			</span>
			<input
				type='range'
				min={min}
				max={max}
				value={layer[key]}
				onChange={e => update({ [key]: Number(e.target.value) })}
			/>
		</label>
	)

	return (
		<div className='wizard'>
			<aside className='wizard__preview' aria-label='Así se verá tu puesto'>
				<article className='stall wizard__stall' data-stall={stall}>
					<div className='stall__awning' aria-hidden='true' />
					<div className='stall__link'>
						<div className='stall__art'>
							<span
								key={shape}
								className={cn('wizard__art', tab === 'design' && 'is-draggable')}
								onPointerDown={grab}
								onPointerMove={move}
								onPointerUp={release}
								onPointerCancel={release}>
								<Art id={code} label={layerLabel(layers[0])} />
							</span>
						</div>
						{price > 0 && <PriceSign price={price} className='stall__sign' />}
						<div className='stall__body'>
							<h3 className='stall__name'>{name?.trim() || 'Tu producto'}</h3>
							<p className='stall__blurb'>{layers.map(layerLabel).join(' + ')}</p>
						</div>
					</div>
				</article>
				<p className='wizard__hint muted'>
					<Icon name='eye' />
					{tab === 'design'
						? 'Arrastra el dibujo para mover la capa elegida'
						: 'Vista previa en vivo'}
				</p>
			</aside>

			<div className='wizard__panel'>
				<div className='wizard__tabs' role='tablist' aria-label='Personalizar'>
					{TABS.map(([id, label, icon]) => (
						<button
							key={id}
							type='button'
							role='tab'
							aria-selected={tab === id}
							aria-controls='wizard-pane'
							className={cn('wizard__tab', tab === id && 'is-active')}
							onClick={() => setTab(id)}>
							<Icon name={icon} />
							{label}
							{id === 'photos' && images.length > 0 && (
								<span className='wizard__count num'>{images.length}</span>
							)}
						</button>
					))}
				</div>

				<div key={tab} id='wizard-pane' role='tabpanel' className='wizard__pane'>
					{tab === 'stall' && (
						<fieldset className='field'>
							<legend>Color de la tienda</legend>
							<div className='swatches' role='radiogroup'>
								{STALLS.map(([v, l], i) => (
									<label key={v} className='swatch' data-stall={v} style={{ '--i': i }}>
										<input type='radio' value={v} {...register('stall')} />
										<span className='swatch__card'>
											<span className='swatch__awning' aria-hidden='true' />
											<span className='swatch__name'>{l}</span>
										</span>
									</label>
								))}
							</div>
						</fieldset>
					)}

					{tab === 'design' && (
						<div className='composer'>
							<div className='layers' role='listbox' aria-label='Capas'>
								{layers.map((l, i) => (
									<button
										key={`${i}${l.kind}${l.ref}`}
										type='button'
										role='option'
										aria-selected={i === at}
										className={cn('layer', i === at && 'is-active')}
										data-stall={stall}
										onClick={() => setSel(i)}>
										<span className='layer__thumb'>
											<Art id={thumb(l)} />
										</span>
										<span className='layer__label'>{layerLabel(l)}</span>
									</button>
								))}
								{ADD.map(([kind, label, icon]) => (
									<button
										key={kind}
										type='button'
										className='layer layer--add'
										disabled={layers.length >= MAX_LAYERS}
										onClick={() => add(kind)}>
										<span className='layer__thumb'>
											<Icon name={icon} />
										</span>
										<span className='layer__label'>+ {label}</span>
									</button>
								))}
							</div>

							<div className='composer__edit'>
								<div className='subtabs' role='tablist' aria-label='Editar capa'>
									{EDIT.map(([id, label]) => (
										<button
											key={id}
											type='button'
											role='tab'
											aria-selected={edit === id}
											className={cn('subtab', edit === id && 'is-active')}
											onClick={() => setEdit(id)}>
											{label}
										</button>
									))}
								</div>

								<div key={`${edit}${at}`} className='wizard__pane'>
									{edit === 'what' && layer.kind === 'f' && (
										<div className='field'>
											<div className='figure-tools'>
												<label className='figure-search'>
													<Icon name='search' />
													<input
														className='input'
														type='search'
														placeholder='Busca una figura: taza, comida, gorra…'
														value={query}
														onChange={e => setQuery(e.target.value)}
														aria-label='Buscar figura'
													/>
												</label>
												<div className='chip-row' role='radiogroup' aria-label='Tipo de figura'>
													{[{ id: 'all', label: 'Todas' }, ...ART_GROUPS].map(g => (
														<label key={g.id} className='chip-radio'>
															<input
																type='radio'
																name='figure-group'
																checked={group === g.id}
																onChange={() => setGroup(g.id)}
															/>
															<span>{g.label}</span>
														</label>
													))}
												</div>
											</div>
											{figures.length ? (
												<div className='figure-grid' role='radiogroup' aria-label='Figura'>
													{figures.map((a, i) => (
														<label
															key={a.id}
															className='figure'
															data-stall={stall}
															style={{ '--i': Math.min(i, 16) }}>
															<input
																type='radio'
																name='figure'
																checked={layer.ref === a.id}
																onChange={() => update({ ref: a.id, swaps: {} })}
															/>
															<span className='figure__img'>
																<Art id={a.id} />
															</span>
															<span className='figure__label'>{a.label}</span>
														</label>
													))}
												</div>
											) : (
												<p className='muted'>No hay figuras con “{query}”.</p>
											)}
										</div>
									)}

									{edit === 'what' && layer.kind === 's' && (
										<div className='figure-grid' role='radiogroup' aria-label='Forma'>
											{SHAPES.map((s, i) => (
												<label key={s.id} className='figure' data-stall={stall} style={{ '--i': i }}>
													<input
														type='radio'
														name='shape'
														checked={layer.ref === s.id}
														onChange={() => update({ ref: s.id, swaps: {} })}
													/>
													<span className='figure__img'>
														<Art id={encodeDesign([newLayer('s', s.id)])} />
													</span>
													<span className='figure__label'>{s.label}</span>
												</label>
											))}
										</div>
									)}

									{edit === 'what' && layer.kind === 't' && (
										<label className='field'>
											<span>Texto de la capa</span>
											<input
												className='input'
												maxLength={MAX_WORD}
												value={layer.ref}
												onChange={e => update({ ref: e.target.value.slice(0, MAX_WORD) })}
											/>
											<small className='field__help'>
												Hasta {MAX_WORD} letras. Por ejemplo: 2x1, Nuevo, Hoy.
											</small>
										</label>
									)}

									{edit === 'colors' &&
										(palette.length ? (
											<div className='field'>
												{palette.map((from, i) => {
													const now = layer.swaps[from] ?? from
													return (
														<fieldset key={from} className='tint-row' style={{ '--i': i }}>
															<legend>Color {i + 1}</legend>
															<div className='tint-row__chips' role='radiogroup'>
																{ART_COLORS.map(([c, l]) => (
																	<label key={c} className='tint' data-tint={c} title={l}>
																		<input
																			type='radio'
																			name={`tint-${from}`}
																			checked={now === c}
																			onChange={() =>
																				update({ swaps: { ...layer.swaps, [from]: c as ArtColor } })
																			}
																			aria-label={l}
																		/>
																		<span aria-hidden='true' />
																	</label>
																))}
															</div>
														</fieldset>
													)
												})}
												<div className='tint-actions'>
													<button type='button' className='btn btn--ghost btn--sm' onClick={shuffle}>
														<Icon name='spark' />
														Al azar
													</button>
													<button
														type='button'
														className='btn btn--ghost btn--sm'
														disabled={!Object.keys(layer.swaps).length}
														onClick={() => update({ swaps: {} })}>
														Como venía
													</button>
												</div>
											</div>
										) : (
											<p className='muted'>Esta capa no tiene colores para cambiar.</p>
										))}

									{edit === 'size' && (
										<div className='field'>
											<div className='knobs'>
												{slider('Tamaño', 's', 20, 220, '%')}
												{slider('Giro', 'r', -180, 180, '°')}
												{slider('Horizontal', 'x', 0, 240, '')}
												{slider('Vertical', 'y', 0, 180, '')}
											</div>
											<div className='tint-actions'>
												<button
													type='button'
													className={cn('btn btn--ghost btn--sm', layer.flip && 'is-on')}
													aria-pressed={layer.flip}
													onClick={() => update({ flip: !layer.flip })}>
													Espejo
												</button>
												<button
													type='button'
													className='btn btn--ghost btn--sm'
													onClick={() => update({ x: 120, y: 90, s: 100, r: 0, flip: false })}>
													Centrar
												</button>
											</div>
										</div>
									)}
								</div>

								<div className='layer-actions'>
									<button
										type='button'
										className='btn btn--ghost btn--sm'
										disabled={at === layers.length - 1}
										onClick={() => shift(1)}>
										Al frente
									</button>
									<button
										type='button'
										className='btn btn--ghost btn--sm'
										disabled={at === 0}
										onClick={() => shift(-1)}>
										Atrás
									</button>
									<button
										type='button'
										className='btn btn--ghost btn--sm'
										disabled={layers.length >= MAX_LAYERS}
										onClick={duplicate}>
										Duplicar
									</button>
									<button
										type='button'
										className='btn btn--ghost btn--sm'
										disabled={layers.length < 2}
										onClick={remove}>
										<Icon name='trash' />
										Quitar capa
									</button>
								</div>
							</div>
						</div>
					)}

					{tab === 'photos' && (
						<div className='field'>
							<PhotoField images={images} onChange={onImages} />
							{images.length > 0 && (
								<p className='muted'>Con fotos, el diseño se usa sólo si las quitas.</p>
							)}
						</div>
					)}
				</div>
				<input type='hidden' {...register('art')} />
			</div>
		</div>
	)
}
