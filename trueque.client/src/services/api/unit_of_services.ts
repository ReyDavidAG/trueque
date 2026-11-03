import { configRepository } from './config_repository'
import { dashboardRepository } from './dashboard_repository'
import { notificationRepository } from './notification_repository'
import { panelRepository } from './panel_repository'
import { productRepository } from './product_repository'
import { sessionRepository } from './session_repository'
import { tradeRepository } from './trade_repository'
import { walletRepository } from './wallet_repository'

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
