import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ROUTES } from '@/constants/routes'
import {
	GIFT_STEP_FIELDS,
	type GrantForm,
	type GrantLimits,
	grantSchema,
} from '@/schemas/grants/grant.schema'
import type { Grant, GrantInput, GrantRecipient } from '@/types/grantType'
import { isoDay } from '@/utils/dates'

import { useSaveGrant } from './useGrantActions'

const LAST_STEP = GIFT_STEP_FIELDS.length - 1

export function toGiftValues(
	grant?: Grant | null,
	recipients: GrantRecipient[] = []
): GrantForm {
	return {
		occasion: grant?.occasionCode ?? '',
		name: grant?.name ?? '',
		reason: grant?.reason ?? '',
		scope: grant?.scope ?? 'group',
		scopeId: grant?.scopeId ?? '',
		amount: grant?.amount ? String(grant.amount) : '',
		deliverOn: grant?.deliverOn ?? isoDay(),
		lotMonths: String(grant?.lotMonths ?? 6),
		list:
			grant?.scope === 'list'
				? recipients.map(r => ({
						employeeNumber: r.employeeNumber,
						amount: String(r.amount),
						note: r.note ?? '',
					}))
				: [],
	}
}

const toGiftInput = (v: GrantForm, id: string | null): GrantInput => ({
	id,
	occasion: v.occasion,
	name: v.name.trim(),
	reason: v.reason.trim(),
	scope: v.scope,
	scopeId: v.scopeId || null,
	amount: v.scope === 'list' ? null : Number(v.amount),
	deliverOn: v.deliverOn,
	lotMonths: Number(v.lotMonths),
	list: v.list.map(i => ({
		employeeNumber: i.employeeNumber.trim(),
		amount: Number(i.amount),
		note: i.note.trim(),
	})),
})

interface Options {
	grant?: Grant | null
	recipients?: GrantRecipient[]
	limits: GrantLimits
	ownNumber: string
}

export function useGiftWizard({
	grant,
	recipients,
	limits,
	ownNumber,
}: Options) {
	const navigate = useNavigate()
	const save = useSaveGrant()
	const [step, setStep] = useState(0)
	const schema = useMemo(
		() => grantSchema(limits, ownNumber),
		[limits, ownNumber]
	)
	const form = useForm<GrantForm>({
		resolver: zodResolver(schema),
		defaultValues: toGiftValues(grant, recipients),
		mode: 'onTouched',
	})
	const list = useFieldArray({ control: form.control, name: 'list' })
	const values = useWatch({ control: form.control })

	const reach = useMemo(() => {
		const result = schema.safeParse(values)
		if (result.success) return LAST_STEP
		const invalid = new Set(result.error.issues.map(i => String(i.path[0])))
		const first = GIFT_STEP_FIELDS.findIndex(fields =>
			fields.some(f => invalid.has(f))
		)
		return first < 0 ? LAST_STEP : first
	}, [schema, values])

	const go = (to: number) => {
		setStep(to)
		window.scrollTo({ top: 0 })
	}

	const persist = (submit: boolean) =>
		save.mutate(
			{ input: toGiftInput(form.getValues(), grant?.id ?? null), submit },
			{
				onSuccess: id => {
					toast.success(
						submit
							? 'Mandado a autorizar: te avisamos cuando lo decidan'
							: 'Borrador guardado'
					)
					navigate(ROUTES.gift(id))
				},
				onError: e => toast.error(e.message),
			}
		)

	const next = async () => {
		if (!(await form.trigger([...GIFT_STEP_FIELDS[step]]))) return
		if (step < LAST_STEP) return go(step + 1)
		if (reach < LAST_STEP) {
			go(reach)
			toast.error('Falta corregir este paso antes de mandarlo.')
			return
		}
		persist(true)
	}

	return {
		form,
		list,
		values,
		step,
		reach,
		isLastStep: step === LAST_STEP,
		isSaving: save.isPending,
		go,
		next,
		jump: (to: number) => to !== step && to <= reach && go(to),
		saveDraft: async () => {
			if (await form.trigger(['occasion', 'name', 'reason'])) persist(false)
			else go(0)
		},
	}
}
