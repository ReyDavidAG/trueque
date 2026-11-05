import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/lilita-one'
import '@fontsource-variable/figtree'

import App from './App'
import { installNumericGuard } from './utils/numeric_guard'

import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './index.css'

installNumericGuard()

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)
