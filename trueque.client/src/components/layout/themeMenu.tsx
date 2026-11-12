import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'

import { Icon } from '@/components/ui/icon'
import { type ThemeId, THEMES } from '@/constants/theme'
import { saveTheme, storedTheme } from '@/utils/theme'

export function ThemeMenu() {
	const [theme, setTheme] = useState<ThemeId>(storedTheme)
	const current = THEMES.find(t => t.id === theme) ?? THEMES[0]

	const choose = (next: ThemeId) => {
		setTheme(next)
		saveTheme(next)
	}

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					className='theme-btn'
					type='button'
					aria-label={`Tema: ${current.label}`}>
					<Icon name={current.icon} />
				</button>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					className='menu theme-menu'
					align='end'
					sideOffset={10}
					collisionPadding={12}>
					<fieldset className='menu__roles'>
						<legend>Tema</legend>
						{THEMES.map(t => (
							<label key={t.id} className='theme-option'>
								<input
									type='radio'
									name='theme'
									value={t.id}
									checked={theme === t.id}
									onChange={() => choose(t.id)}
								/>
								<Icon name={t.icon} />
								<span>{t.label}</span>
								<span
									className={`theme-option__swatch is-${t.id}`}
									aria-hidden='true'
								/>
							</label>
						))}
					</fieldset>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
