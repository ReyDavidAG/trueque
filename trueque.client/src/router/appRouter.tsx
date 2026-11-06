import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AuthGuard from '@/layouts/auth/authGuard'
import RoleGuard from '@/layouts/auth/roleGuard'
import NotFoundPage from '@/pages/core/not_found/notFoundPage'
import RouteErrorPage from '@/pages/core/route_error/routeErrorPage'

const SignInPage = lazy(() => import('@/pages/auth/sign_in/signInPage'))
const ProtectedLayout = lazy(
	() => import('@/layouts/protected/protectedLayout')
)
const MarketPage = lazy(() => import('@/pages/market/list/marketPage'))
const ProductDetailPage = lazy(
	() => import('@/pages/products/detail/productDetailPage')
)
const TradeReviewPage = lazy(
	() => import('@/pages/trade/review/tradeReviewPage')
)
const TradeReceiptPage = lazy(
	() => import('@/pages/trade/receipt/tradeReceiptPage')
)
const WalletPage = lazy(() => import('@/pages/wallet/walletPage'))
const CouponsPage = lazy(() => import('@/pages/coupons/couponsPage'))
const EarnPage = lazy(() => import('@/pages/earn/earnPage'))
const PanelPage = lazy(() => import('@/pages/panel/panelPage'))
const ProductFormPage = lazy(
	() => import('@/pages/panel/product_form/productFormPage')
)
const RedeemPage = lazy(() => import('@/pages/redeem/redeemPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboardPage'))
const SettingsPage = lazy(() => import('@/pages/settings/settingsPage'))

const router = createBrowserRouter([
	{
		path: '/sign-in',
		element: <SignInPage />,
		errorElement: <RouteErrorPage />,
	},
	{
		element: <AuthGuard />,
		errorElement: <RouteErrorPage />,
		children: [
			{
				element: <ProtectedLayout />,
				children: [
					{ index: true, element: <MarketPage /> },
					{ path: '/products/:id', element: <ProductDetailPage /> },
					{ path: '/trade/:id', element: <TradeReviewPage /> },
					{ path: '/trades/:folio', element: <TradeReceiptPage /> },
					{ path: '/wallet', element: <WalletPage /> },
					{ path: '/coupons', element: <CouponsPage /> },
					{ path: '/earn', element: <EarnPage /> },
					{
						element: <RoleGuard roles={['company', 'hr']} />,
						children: [{ path: '/panel', element: <PanelPage /> }],
					},
					{
						element: <RoleGuard roles={['company']} />,
						children: [
							{ path: '/panel/new', element: <ProductFormPage /> },
							{ path: '/panel/edit/:id', element: <ProductFormPage /> },
							{ path: '/redeem', element: <RedeemPage /> },
						],
					},
					{
						element: <RoleGuard roles={['hr']} />,
						children: [
							{ path: '/dashboard', element: <DashboardPage /> },
							{ path: '/settings', element: <SettingsPage /> },
						],
					},
					{ path: '*', element: <NotFoundPage /> },
				],
			},
		],
	},
])

export default router
