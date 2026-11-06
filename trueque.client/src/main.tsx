import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/lilita-one'
import '@fontsource-variable/figtree'

import { installNumericGuard } from './utils/numericGuard'
import App from './App'

import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './index.css'

installNumericGuard()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
