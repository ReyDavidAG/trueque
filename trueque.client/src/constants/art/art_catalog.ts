import { EVERYDAY_ART } from './art_everyday'
import { GOODS_ART } from './art_goods'
import type { ArtGroup } from './art_types'

export const ART_GROUPS: { id: ArtGroup; label: string }[] = [
	{ id: 'food', label: 'Comida' },
	{ id: 'health', label: 'Salud y bienestar' },
	{ id: 'learn', label: 'Aprendizaje' },
	{ id: 'service', label: 'Servicios' },
	{ id: 'merch', label: 'Artículos del grupo' },
	{ id: 'leisure', label: 'Tiempo libre' },
	{ id: 'custodia', label: 'Equipo de Custodia' },
]

export const ART = [...EVERYDAY_ART, ...GOODS_ART]

export const ART_IDS = ART.map(a => a.id)

export const SYSTEM_ART: Record<string, string> = {
	closed: `
    <ellipse class="a-shadow" cx="120" cy="160" rx="96" ry="8"/>
    <path class="a-cacao ln" d="M34 70h172v88H34z"/>
    <path class="a-amate2" d="M44 80h152v78H44z" opacity=".6"/>
    <clipPath id="shutter-clip"><rect x="44" y="74" width="152" height="84"/></clipPath>
    <g clip-path="url(#shutter-clip)"><g class="closed__shutter">
      <path class="a-amate2 ln" d="M44 80h152v78H44z"/>
      <path class="ln" d="M44 92h152M44 104h152M44 116h152M44 128h152M44 140h152"/>
      <path class="a-cacao ln" d="M108 150h24v8h-24z"/>
    </g></g>
    <path class="a-grana ln" d="M26 34h188v30c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12z"/>
    <path class="a-estraza" d="M58 36h24v28H58zM114 36h24v28h-24zM170 36h24v28h-24z" opacity=".9"/>
    <g class="closed__sign">
      <circle class="a-ink" cx="120" cy="64" r="3.5"/>
      <path class="ln" d="M102 84l18-20 18 20"/>
      <g transform="rotate(-6 120 104)"><rect class="a-estraza ln" x="78" y="82" width="84" height="40" rx="6"/><text class="sign-text" x="120" y="109" text-anchor="middle">Cerrado</text></g>
    </g>`,
}
