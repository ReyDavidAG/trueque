import type { RefObject } from 'react'

import type { ComboboxOption } from '@/types/combobox_type'
import { cn } from '@/utils/cn'

import { Icon } from './icon'

interface ComboboxListProps {
	listRef: RefObject<HTMLUListElement | null>
	listId: string
	options: ReadonlyArray<ComboboxOption>
	active: number
	value: string
	onHover: (index: number) => void
	onPick: (option: ComboboxOption) => void
}

export function ComboboxList({
	listRef,
	listId,
	options,
	active,
	value,
	onHover,
	onPick,
}: ComboboxListProps) {
	return (
		<ul ref={listRef} id={listId} role='listbox' className='combo-pop__list'>
			{options.length === 0 ? (
				<li className='combo-pop__empty' role='presentation'>
					Sin coincidencias
				</li>
			) : (
				options.map((option, index) => {
					const isSelected = option.value === value
					return (
						<li
							key={option.value || '__clear__'}
							id={`${listId}-${index}`}
							data-idx={index}
							role='option'
							aria-selected={isSelected}
							className={cn(
								'combo-opt',
								index === active && 'is-active',
								isSelected && 'is-selected'
							)}
							onMouseEnter={() => onHover(index)}
							onMouseDown={e => e.preventDefault()}
							onClick={() => onPick(option)}>
							{option.leading}
							<span className='combo-opt__text'>
								<span className='combo-opt__label'>{option.label}</span>
								{option.description && (
									<span className='combo-opt__desc'>{option.description}</span>
								)}
							</span>
							{isSelected && <Icon name='check' className='combo-opt__check' />}
						</li>
					)
				})
			)}
		</ul>
	)
}
