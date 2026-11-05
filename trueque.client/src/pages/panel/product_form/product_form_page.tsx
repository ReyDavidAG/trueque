import { useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ConfirmPublish } from '@/components/product_form/confirm_publish'
import { StepLook } from '@/components/product_form/step_look'
import { StepPrice } from '@/components/product_form/step_price'
import { StepReview } from '@/components/product_form/step_review'
import { StepWhat } from '@/components/product_form/step_what'
import { StepWhen } from '@/components/product_form/step_when'
import { Stepper, STEPS } from '@/components/product_form/stepper'
import { burstCacao } from '@/components/ui/cacao_confetti'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useCacaoValue } from '@/hooks/config/use_config'
import { useProductImages } from '@/hooks/market/use_images'
import {
	useCategories,
	useCompanyMap,
	useLocations,
	useProducts,
} from '@/hooks/market/use_market'
import { useSaveProduct } from '@/hooks/panel/use_panel'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import {
	type ProductForm,
	productSchema,
	STEP_FIELDS,
} from '@/schemas/panel/product/product.schema'
import type { Product, ProductImage } from '@/types/product_type'

import { toInput, toValues } from './product_form_values'

export default function ProductFormPage() {
	const { id } = useParams()
	const session = useRequiredSession()
	const companyId = session.managedCompanyIds[0] ?? session.person.companyId
	const products = useProducts()
	const categories = useCategories()
	const locations = useLocations()
	const companies = useCompanyMap()
	const cacaoValue = useCacaoValue()
	const product = id
		? products.data?.find(p => p.id === id && p.origin === 'manual')
		: undefined
	if (products.isLoading || categories.isLoading || locations.isLoading)
		return <LoadingPage />
	if (id && !product) return <NotFoundPage />
	return (
		<FormBody
			key={id ?? 'new'}
			product={product}
			companyId={companyId}
			companyName={companies.get(companyId)?.name ?? session.person.companyName}
			categories={categories.data ?? []}
			locations={(locations.data ?? []).filter(l => l.companyId === companyId)}
			cacaoValue={cacaoValue}
		/>
	)
}

interface BodyProps {
	product?: Product
	companyId: string
	companyName: string
	categories: NonNullable<ReturnType<typeof useCategories>['data']>
	locations: NonNullable<ReturnType<typeof useLocations>['data']>
	cacaoValue: number
}

function FormBody({
	product,
	companyId,
	companyName,
	categories,
	locations,
	cacaoValue,
}: BodyProps) {
	const navigate = useNavigate()
	const save = useSaveProduct()
	const [step, setStep] = useState(0)
	const [dir, setDir] = useState(1)
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

	const go = (i: number) => {
		setDir(i >= step ? 1 : -1)
		setStep(i)
		window.scrollTo({ top: 0 })
	}

	const shown = imagesChanged ? images : (existing.data ?? [])

	const next = async () => {
		if (!(await form.trigger([...STEP_FIELDS[step]]))) return
		if (step < STEPS.length - 1) return go(step + 1)
		setConfirming(true)
	}

	const values = useWatch({ control: form.control })
	const reach = useMemo(() => {
		const result = schema.safeParse(values)
		if (result.success) return STEPS.length - 1
		const bad = new Set(result.error.issues.map(i => String(i.path[0])))
		const first = STEP_FIELDS.findIndex(fields => fields.some(f => bad.has(f)))
		return first < 0 ? STEPS.length - 1 : first
	}, [schema, values])

	const jump = (to: number) => {
		if (to !== step && to <= reach) go(to)
	}

	const publish = () => {
		const values = form.getValues()
		save.mutate(
			{
				input: toInput(values, product?.id ?? null, companyId),
				images,
				imagesChanged,
			},
			{
				onSuccess: () => {
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

	const body = [
		<StepWhat key='what' categories={categories} />,
		<StepLook
			key='look'
			images={shown}
			onImages={list => {
				setImages(list)
				setImagesChanged(true)
			}}
		/>,
		<StepPrice key='price' category={category} cacaoValue={cacaoValue} />,
		<StepWhen key='when' locations={locations} />,
		<StepReview
			key='review'
			images={shown}
			category={category}
			location={locations.find(l => l.id === form.getValues('locationId'))}
			companyId={companyId}
			companyName={companyName}
		/>,
	][step]

	return (
		<div className='wrap narrow-wide'>
			<Link className='back-link' to={ROUTES.panel}>
				<Icon name='arrowLeft' />
				Tu puesto
			</Link>
			<header className='page-head'>
				<h1 className='h1'>
					{product ? 'Editar producto' : 'Publicar un producto'}
				</h1>
				<p className='lede'>
					Cinco pasos. Puedes volver a cualquiera antes de mandarlo.
				</p>
			</header>
			<Stepper step={step} reach={Math.max(reach, step)} onGo={jump} />
			<FormProvider {...form}>
				<form
					key={step}
					className='form-card step-card'
					style={{ '--dir': dir }}
					noValidate
					onSubmit={e => {
						e.preventDefault()
						void next()
					}}>
					<h2 className='h3'>{STEPS[step]}</h2>
					{body}
					<div className='form-card__actions'>
						{step ? (
							<button
								className='btn btn--ghost'
								type='button'
								onClick={() => go(step - 1)}>
								<Icon name='arrowLeft' />
								Atrás
							</button>
						) : (
							<Link className='btn btn--ghost' to={ROUTES.panel}>
								Cancelar
							</Link>
						)}
						<button
							className='btn btn--grana'
							type='submit'
							disabled={
								save.isPending ||
								(step < STEPS.length - 1 ? reach <= step : reach < step)
							}>
							{save.isPending ? (
								<span className='spinner' aria-hidden='true' />
							) : (
								step === STEPS.length - 1 && <Icon name='shield' />
							)}
							{step < STEPS.length - 1
								? 'Siguiente'
								: product
									? 'Guardar cambios'
									: 'Mandar a RH'}
							{step < STEPS.length - 1 && <Icon name='arrowRight' />}
						</button>
					</div>
				</form>
			</FormProvider>
			{confirming && (
				<ConfirmPublish
					open={confirming}
					editing={!!product}
					pending={save.isPending}
					values={form.getValues()}
					categoryName={category.name}
					locationName={
						locations.find(l => l.id === form.getValues('locationId'))?.name
					}
					photos={shown.length}
					onCancel={() => setConfirming(false)}
					onConfirm={publish}
				/>
			)}
		</div>
	)
}
