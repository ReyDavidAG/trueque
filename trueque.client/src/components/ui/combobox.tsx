import * as Popover from '@radix-ui/react-popover'

import { useCombobox } from '@/hooks/ui/use_combobox'
import type { ComboboxOption } from '@/types/combobox_type'
import { cn } from '@/utils/cn'

import { ComboboxList } from './combobox_list'
import { Icon } from './icon'

export type { ComboboxOption }

interface ComboboxProps {
	options: ReadonlyArray<ComboboxOption>
	value: string
	onChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	clearLabel?: string
	disabled?: boolean
	invalid?: boolean
	id?: string
	label?: string
	describedBy?: string
	variant?: 'field' | 'pill'
}

export function Combobox({
	options,
	value,
	onChange,
	placeholder = 'Selecciona…',
	searchPlaceholder = 'Buscar…',
	clearLabel,
	disabled,
	invalid,
	id,
	label,
	describedBy,
	variant = 'field',
}: ComboboxProps) {
	const combo = useCombobox({ options, value, clearLabel, onChange })
	const { selected, filtered, active, listId } = combo

	return (
		<Popover.Root open={combo.open} onOpenChange={combo.toggle}>
			<Popover.Trigger asChild>
				<button
					type='button'
					id={id}
					disabled={disabled}
					aria-haspopup='listbox'
					aria-expanded={combo.open}
					aria-label={label ? `${label}: ${selected?.label ?? placeholder}` : undefined}
					aria-invalid={invalid || undefined}
					aria-describedby={describedBy}
					className={cn('combo', variant === 'pill' && 'combo--pill')}>
					<span className='combo__value'>
						{selected?.leading}
						<span className={cn('combo__label', !selected && 'is-placeholder')}>
							{selected?.label ?? placeholder}
						</span>
						{selected?.description && variant === 'field' && (
							<span className='combo__desc'>{selected.description}</span>
						)}
					</span>
					<Icon name='chevronDown' className='combo__chevron' />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					align='start'
					sideOffset={6}
					collisionPadding={12}
					className='combo-pop'
					style={{ width: 'max(var(--radix-popover-trigger-width), 240px)' }}
					onOpenAutoFocus={e => {
						e.preventDefault()
						combo.inputRef.current?.focus()
					}}>
					<div className='combo-pop__search'>
						<Icon name='search' />
						<input
							ref={combo.inputRef}
							role='combobox'
							aria-expanded='true'
							aria-controls={listId}
							aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
							aria-autocomplete='list'
							aria-label={searchPlaceholder}
							value={combo.query}
							placeholder={searchPlaceholder}
							onChange={e => combo.search(e.target.value)}
							onKeyDown={combo.onKeyDown}
						/>
					</div>
					<ComboboxList
						listRef={combo.listRef}
						listId={listId}
						options={filtered}
						active={active}
						value={value}
						onHover={combo.setActive}
						onPick={combo.commit}
					/>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
