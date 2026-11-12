import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/baloo-2'
import '@fontsource-variable/nunito'

import { installNumericGuard } from './utils/numericGuard'
import { applyTheme, storedTheme } from './utils/theme'
import App from './App'

import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './index.css'

applyTheme(storedTheme())
installNumericGuard()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
