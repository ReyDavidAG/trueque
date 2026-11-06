import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { STEPS } from '@/components/product_form/stepper'
import { burstCacao } from '@/components/ui/cacaoConfetti'
import { ROUTES } from '@/constants/routes'
import { useProductImages } from '@/hooks/market/useImages'
import { useSaveProduct } from '@/hooks/panel/usePanel'
import { toInput, toValues } from '@/pages/panel/product_form/productFormValues'
import {
	type ProductForm,
	productSchema,
	STEP_FIELDS,
} from '@/schemas/panel/product/product.schema'
import type { CategoryInfo, Product, ProductImage } from '@/types/productType'
import { editedFields, markEdited } from '@/utils/editMarks'

const LAST_STEP = STEPS.length - 1

interface WizardOptions {
	product?: Product
	companyId: string
	categories: CategoryInfo[]
}

export function useProductWizard({
	product,
	companyId,
	categories,
}: WizardOptions) {
	const navigate = useNavigate()
	const save = useSaveProduct()
	const [step, setStep] = useState(0)
	const [direction, setDirection] = useState(1)
	const [confirming, setConfirming] = useState(false)
	const [images, setImages] = useState<ProductImage[]>([])
	const [imagesChanged, setImagesChanged] = useState(false)
	const existing = useProductImages(product?.id, !!product?.hasImages)
	const schema = useMemo(() => productSchema(categories), [categories])
	const form = useForm<ProductForm>({
		resolver: zodResolver(schema),
		defaultValues: toValues(product),
		mode: 'onTouched',
	})
	const watchedCategory = useWatch({ control: form.control, name: 'category' })
	const category =
		categories.find(c => c.code === watchedCategory) ?? categories[0]
	const values = useWatch({ control: form.control })

	const reach = useMemo(() => {
		const result = schema.safeParse(values)
		if (result.success) return LAST_STEP
		const invalid = new Set(result.error.issues.map(i => String(i.path[0])))
		const first = STEP_FIELDS.findIndex(fields =>
			fields.some(f => invalid.has(f))
		)
		return first < 0 ? LAST_STEP : first
	}, [schema, values])

	const go = (to: number) => {
		setDirection(to >= step ? 1 : -1)
		setStep(to)
		window.scrollTo({ top: 0 })
	}

	const next = async () => {
		if (!(await form.trigger([...STEP_FIELDS[step]]))) return
		if (step < LAST_STEP) return go(step + 1)
		setConfirming(true)
	}

	const jump = (to: number) => {
		if (to !== step && to <= reach) go(to)
	}

	const replaceImages = (list: ProductImage[]) => {
		setImages(list)
		setImagesChanged(true)
	}

	const publish = () => {
		const input = toInput(form.getValues(), product?.id ?? null, companyId)
		save.mutate(
			{ input, images, imagesChanged },
			{
				onSuccess: () => {
					if (product)
						markEdited(product.id, editedFields(product, input, imagesChanged))
					setConfirming(false)
					burstCacao()
					toast.success(
						product
							? 'Cambios guardados'
							: 'Mandado a RH: te avisamos cuando lo apruebe'
					)
					navigate(ROUTES.panel)
				},
				onError: e => toast.error(e.message),
			}
		)
	}

	return {
		form,
		step,
		direction,
		reach,
		category,
		isLastStep: step === LAST_STEP,
		canAdvance: step < LAST_STEP ? reach > step : reach >= step,
		isSaving: save.isPending,
		shownImages: imagesChanged ? images : (existing.data ?? []),
		confirming,
		go,
		next,
		jump,
		replaceImages,
		publish,
		cancelConfirm: () => setConfirming(false),
	}
}
