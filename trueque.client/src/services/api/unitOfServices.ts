import { configRepository } from './configRepository'
import { dashboardRepository } from './dashboardRepository'
import { notificationRepository } from './notificationRepository'
import { panelRepository } from './panelRepository'
import { productRepository } from './productRepository'
import { sessionRepository } from './sessionRepository'
import { tradeRepository } from './tradeRepository'
import { walletRepository } from './walletRepository'

export const services = {
	session: sessionRepository,
	products: productRepository,
	wallet: walletRepository,
	trades: tradeRepository,
	panel: panelRepository,
	config: configRepository,
	notifications: notificationRepository,
	dashboard: dashboardRepository,
}
