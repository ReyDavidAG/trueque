import { FormProvider } from 'react-hook-form'
import { Link, useParams } from 'react-router'

import { GiftStepAmount } from '@/components/gifts/giftStepAmount'
import { GiftStepReason } from '@/components/gifts/giftStepReason'
import { GiftStepReview } from '@/components/gifts/giftStepReview'
import { GiftStepWhen } from '@/components/gifts/giftStepWhen'
import { GiftStepWho } from '@/components/gifts/giftStepWho'
import { Stepper } from '@/components/product_form/stepper'
import { Icon } from '@/components/ui/icon'
import { GIFT_STEPS, GRANT_SCOPES } from '@/constants/grants'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/useSession'
import { useConfig } from '@/hooks/config/useConfig'
import { type GiftValues, useGiftTotals } from '@/hooks/grants/useGiftTotals'
import { useGiftWizard } from '@/hooks/grants/useGiftWizard'
import {
	useGrant,
	useGrantOccasions,
	useGrantRecipients,
	useGrantScopes,
} from '@/hooks/grants/useGrants'
import LoadingPage from '@/pages/core/loading/loadingPage'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import type { GrantLimits } from '@/schemas/grants/grant.schema'
import type {
	Grant,
	GrantOccasion,
	GrantRecipient,
	GrantScopes,
} from '@/types/grantType'

const EDITABLE = new Set(['draft', 'rejected'])

export default function GiftFormPage() {
	const { id } = useParams()
	const grant = useGrant(id)
	const recipients = useGrantRecipients(id ?? '')
	const occasions = useGrantOccasions()
	const scopes = useGrantScopes()
	const config = useConfig()
	const session = useRequiredSession()
	if (
		(id && (grant.isLoading || recipients.isLoading)) ||
		!occasions.data ||
		!scopes.data ||
		!config.data
	)
		return <LoadingPage />
	if (id && (!grant.data || !EDITABLE.has(grant.data.status)))
		return <NotFoundPage />
	return (
		<GiftForm
			key={id ?? 'new'}
			grant={grant.data}
			recipients={recipients.data ?? []}
			occasions={occasions.data}
			scopes={scopes.data}
			limits={config.data}
			ownNumber={session.person.employeeNumber}
		/>
	)
}

interface FormProps {
	grant?: Grant | null
	recipients: GrantRecipient[]
	occasions: GrantOccasion[]
	scopes: GrantScopes
	limits: GrantLimits
	ownNumber: string
}

function scopeLabel(v: GiftValues, scopes: GrantScopes) {
	const all = [...scopes.companies, ...scopes.areas, ...scopes.departments]
	if (v.scope === 'group') return 'Todo el grupo'
	if (v.scope === 'list')
		return `Lista de ${v.list?.length ?? 0} ${v.list?.length === 1 ? 'persona' : 'personas'}`
	const kind = GRANT_SCOPES.find(([s]) => s === v.scope)?.[1] ?? ''
	return `${kind}: ${all.find(o => o.id === v.scopeId)?.name ?? '—'}`
}

function GiftForm({
	grant,
	recipients,
	occasions,
	scopes,
	limits,
	ownNumber,
}: FormProps) {
	const wizard = useGiftWizard({ grant, recipients, limits, ownNumber })
	const { form, step, values } = wizard
	const totals = useGiftTotals(values)

	const body = [
		<GiftStepReason key='reason' occasions={occasions} />,
		<GiftStepWho
			key='who'
			scopes={scopes}
			list={wizard.list}
			maxList={limits.grantMaxList}
			defaultAmount={values.amount || '50'}
		/>,
		<GiftStepAmount
			key='amount'
			maxPerPerson={limits.grantMaxPerPerson}
			maxPerYear={limits.grantMaxPerYear}
			totals={totals}
		/>,
		<GiftStepWhen key='when' maxDaysAhead={limits.grantMaxDaysAhead} />,
		<GiftStepReview
			key='review'
			values={form.getValues()}
			occasionName={
				occasions.find(o => o.code === values.occasion)?.name ?? '—'
			}
			scopeName={scopeLabel(values, scopes)}
			totals={totals}
		/>,
	][step]

	return (
		<div className='wrap narrow-wide'>
			<Link
				className='back-link'
				to={grant ? ROUTES.gift(grant.id) : ROUTES.gifts}>
				<Icon name='arrowLeft' />
				Regalos
			</Link>
			<header className='page-head'>
				<p className='kicker'>Regalo de yemas</p>
				<h1 className='h1'>
					{grant ? `Editar ${grant.folio}` : 'Armar un regalo'}
				</h1>
				<p className='lede'>
					Cinco pasos. Lo guardas como borrador o lo mandas a autorizar.
				</p>
			</header>
			<Stepper
				step={step}
				reach={Math.max(wizard.reach, step)}
				onGo={wizard.jump}
				steps={GIFT_STEPS}
			/>
			<FormProvider {...form}>
				<form
					key={step}
					className='form-card step-card'
					noValidate
					onSubmit={e => {
						e.preventDefault()
						void wizard.next()
					}}>
					<h2 className='h3'>{GIFT_STEPS[step]}</h2>
					{body}
					<div className='form-card__actions'>
						{step === 0 ? (
							<Link className='btn btn--ghost' to={ROUTES.gifts}>
								Cancelar
							</Link>
						) : (
							<button
								className='btn btn--ghost'
								type='button'
								onClick={() => wizard.go(step - 1)}>
								<Icon name='arrowLeft' />
								Atrás
							</button>
						)}
						<button
							className='btn btn--ghost'
							type='button'
							disabled={wizard.isSaving}
							onClick={() => void wizard.saveDraft()}>
							Guardar borrador
						</button>
						<button
							className='btn btn--grana'
							type='submit'
							disabled={wizard.isSaving}>
							{wizard.isSaving && (
								<span className='spinner' aria-hidden='true' />
							)}
							{wizard.isLastStep ? 'Mandar a autorizar' : 'Siguiente'}
							{!wizard.isLastStep && <Icon name='arrowRight' />}
						</button>
					</div>
				</form>
			</FormProvider>
		</div>
	)
}
