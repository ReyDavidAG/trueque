import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { TextField } from '@/components/panel/textField'
import { useSetConfig } from '@/hooks/config/useConfig'
import {
	type GrantLimitsForm,
	grantLimitsSchema,
} from '@/schemas/settings/settings.schema'
import type { StoreConfig } from '@/types/configType'

import { SettingsCard } from './settingsCard'

const FIELDS = [
	['grantMaxPerPerson', 'Yemas por persona en un regalo', 'De 1 a 1,000.'],
	[
		'grantMaxPerYear',
		'Yemas de regalo por persona al año',
		'Suma de todos los regalos. De 1 a 5,000.',
	],
	[
		'grantMaxList',
		'Personas en una lista',
		'Para reconocimientos uno a uno. De 1 a 500.',
	],
	[
		'grantMaxDaysAhead',
		'Días hacia adelante para programar',
		'Nunca hacia atrás. De 0 a 365.',
	],
] as const

export function GrantsSection({ config }: { config: StoreConfig }) {
	const set = useSetConfig()
	const { register, handleSubmit, formState } = useForm<GrantLimitsForm>({
		resolver: zodResolver(grantLimitsSchema),
		defaultValues: {
			grantMaxPerPerson: String(config.grantMaxPerPerson),
			grantMaxPerYear: String(config.grantMaxPerYear),
			grantMaxList: String(config.grantMaxList),
			grantMaxDaysAhead: String(config.grantMaxDaysAhead),
		},
	})
	const submit = handleSubmit(v =>
		set.mutate(
			{
				grantMaxPerPerson: Number(v.grantMaxPerPerson),
				grantMaxPerYear: Number(v.grantMaxPerYear),
				grantMaxList: Number(v.grantMaxList),
				grantMaxDaysAhead: Number(v.grantMaxDaysAhead),
			},
			{
				onSuccess: () => toast.success('Límites de regalos guardados'),
				onError: e => toast.error(e.message),
			}
		)
	)
	return (
		<SettingsCard
			id='grants'
			title='Regalos'
			lede='Los topes que la base revisa al mandar un regalo a autorizar. El fondo del año lo define quien autoriza.'
			busy={set.isPending}
			onSubmit={e => void submit(e)}>
			{FIELDS.map(([name, label, hint]) => (
				<TextField
					key={name}
					id={`s-${name}`}
					label={label}
					hint={hint}
					error={formState.errors[name]?.message}
					className='input--sm num'
					inputMode='numeric'
					register={register(name)}
				/>
			))}
		</SettingsCard>
	)
}
