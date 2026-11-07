import { Link } from 'react-router'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'

interface WizardActionsProps {
	isFirstStep: boolean
	isLastStep: boolean
	isEditing: boolean
	isSaving: boolean
	onBack: () => void
}

export function WizardActions({
	isFirstStep,
	isLastStep,
	isEditing,
	isSaving,
	onBack,
}: WizardActionsProps) {
	const submitLabel = !isLastStep
		? 'Siguiente'
		: isEditing
			? 'Guardar cambios'
			: 'Mandar a RH'

	return (
		<div className='form-card__actions'>
			{isFirstStep ? (
				<Link className='btn btn--ghost' to={ROUTES.panel}>
					Cancelar
				</Link>
			) : (
				<button className='btn btn--ghost' type='button' onClick={onBack}>
					<Icon name='arrowLeft' />
					Atrás
				</button>
			)}
			<button
				className='btn btn--grana'
				type='submit'
				disabled={isSaving}>
				{isSaving ? (
					<span className='spinner' aria-hidden='true' />
				) : (
					isLastStep && <Icon name='shield' />
				)}
				{submitLabel}
				{!isLastStep && <Icon name='arrowRight' />}
			</button>
		</div>
	)
}
