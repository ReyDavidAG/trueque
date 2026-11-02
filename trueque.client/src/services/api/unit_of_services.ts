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
}
