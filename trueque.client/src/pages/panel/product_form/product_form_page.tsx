import { FormProvider } from 'react-hook-form'
import { Link, useParams } from 'react-router'

import { ConfirmPublish } from '@/components/product_form/confirm_publish'
import { StepLook } from '@/components/product_form/step_look'
import { StepPrice } from '@/components/product_form/step_price'
import { StepReview } from '@/components/product_form/step_review'
import { StepWhat } from '@/components/product_form/step_what'
import { StepWhen } from '@/components/product_form/step_when'
import { Stepper, STEPS } from '@/components/product_form/stepper'
import { WizardActions } from '@/components/product_form/wizard_actions'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { useCacaoValue } from '@/hooks/config/use_config'
import {
	useCategories,
	useCompanyMap,
	useLocations,
	useProducts,
} from '@/hooks/market/use_market'
import { useProductWizard } from '@/hooks/panel/use_product_wizard'
import LoadingPage from '@/pages/core/loading/loading_page'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import type { CategoryInfo, ExchangeLocation, Product } from '@/types/product_type'

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
	categories: CategoryInfo[]
	locations: ExchangeLocation[]
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
	const wizard = useProductWizard({ product, companyId, categories })
	const { form, step, category, shownImages } = wizard
	const location = locations.find(l => l.id === form.getValues('locationId'))

	const stepBody = [
		<StepWhat key='what' categories={categories} />,
		<StepLook key='look' images={shownImages} onImages={wizard.replaceImages} />,
		<StepPrice key='price' category={category} cacaoValue={cacaoValue} />,
		<StepWhen key='when' locations={locations} />,
		<StepReview
			key='review'
			images={shownImages}
			category={category}
			location={location}
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
				<h1 className='h1'>{product ? 'Editar producto' : 'Publicar un producto'}</h1>
				<p className='lede'>Cinco pasos. Puedes volver a cualquiera antes de mandarlo.</p>
			</header>
			<Stepper step={step} reach={Math.max(wizard.reach, step)} onGo={wizard.jump} />
			<FormProvider {...form}>
				<form
					key={step}
					className='form-card step-card'
					style={{ '--dir': wizard.direction }}
					noValidate
					onSubmit={e => {
						e.preventDefault()
						void wizard.next()
					}}>
					<h2 className='h3'>{STEPS[step]}</h2>
					{stepBody}
					<WizardActions
						isFirstStep={step === 0}
						isLastStep={wizard.isLastStep}
						isEditing={!!product}
						isSaving={wizard.isSaving}
						canAdvance={wizard.canAdvance}
						onBack={() => wizard.go(step - 1)}
					/>
				</form>
			</FormProvider>
			{wizard.confirming && (
				<ConfirmPublish
					open={wizard.confirming}
					editing={!!product}
					pending={wizard.isSaving}
					values={form.getValues()}
					categoryName={category.name}
					locationName={location?.name}
					photos={shownImages.length}
					onCancel={wizard.cancelConfirm}
					onConfirm={wizard.publish}
				/>
			)}
		</div>
	)
}
