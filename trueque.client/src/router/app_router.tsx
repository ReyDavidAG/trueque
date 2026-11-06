import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import AuthGuard from '@/layouts/auth/auth_guard'
import RoleGuard from '@/layouts/auth/role_guard'
import NotFoundPage from '@/pages/core/not_found/not_found_page'
import RouteErrorPage from '@/pages/core/route_error/route_error_page'

const SignInPage = lazy(() => import('@/pages/auth/sign_in/sign_in_page'))
const ProtectedLayout = lazy(
	() => import('@/layouts/protected/protected_layout')
)
const MarketPage = lazy(() => import('@/pages/market/list/market_page'))
const ProductDetailPage = lazy(
	() => import('@/pages/products/detail/product_detail_page')
)
const TradeReviewPage = lazy(
	() => import('@/pages/trade/review/trade_review_page')
)
const TradeReceiptPage = lazy(
	() => import('@/pages/trade/receipt/trade_receipt_page')
)
const WalletPage = lazy(() => import('@/pages/wallet/wallet_page'))
const CouponsPage = lazy(() => import('@/pages/coupons/coupons_page'))
const EarnPage = lazy(() => import('@/pages/earn/earn_page'))
const PanelPage = lazy(() => import('@/pages/panel/panel_page'))
const ProductFormPage = lazy(
	() => import('@/pages/panel/product_form/product_form_page')
)
const RedeemPage = lazy(() => import('@/pages/redeem/redeem_page'))
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard_page'))
const SettingsPage = lazy(() => import('@/pages/settings/settings_page'))

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
