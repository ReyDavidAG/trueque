import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import * as Popover from '@radix-ui/react-popover'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { ROLE_NAMES } from '@/constants/stall'
import { useRequiredSession, useSession } from '@/hooks/auth/use_session'
import { initials } from '@/utils/initials'

export function UserMenu() {
	const session = useRequiredSession()
	const { signOut } = useSession()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const firstRef = useRef<HTMLAnchorElement>(null)
	const { person } = session

	useEffect(() => {
		if (open) firstRef.current?.focus()
	}, [open])

	const leave = async () => {
		setOpen(false)
		await signOut()
		toast('Saliste de El Trueque')
		navigate(ROUTES.signIn, { replace: true })
	}

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger asChild>
				<button
					className='role-chip'
					type='button'
					aria-label={`Menú de ${person.fullName}`}>
					<span className='who__avatar is-xs' aria-hidden='true'>
						{initials(person.fullName)}
					</span>
					<span className='role-chip__label'>{ROLE_NAMES[session.role]}</span>
					<Icon name='chevronDown' />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className='menu'
					align='end'
					sideOffset={10}
					collisionPadding={12}>
					<div className='menu__head'>
						<span className='who__avatar is-sm' aria-hidden='true'>
							{initials(person.fullName)}
						</span>
						<span>
							<strong>{person.fullName}</strong>
							<small>
								No. <span className='num'>{person.employeeNumber}</span> ·{' '}
								{person.companyCode}
							</small>
						</span>
					</div>
					<Link
						ref={firstRef}
						className='menu-item'
						to={ROUTES.wallet}
						onClick={() => setOpen(false)}>
						<Icon name='store' />
						Mi jícara
					</Link>
					<Link
						className='menu-item'
						to={ROUTES.coupons}
						onClick={() => setOpen(false)}>
						<Icon name='ticket' />
						Mis cupones
					</Link>
					<button className='menu-item' type='button' onClick={leave}>
						<Icon name='logout' />
						Salir
					</button>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
