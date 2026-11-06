import type { NotificationItem } from '@/types/configType'

import { toMessage, trueque } from '../supabase/supabaseClient'

export interface NotificationRepository {
	list(): Promise<NotificationItem[]>
	markAllRead(): Promise<void>
}

export const notificationRepository: NotificationRepository = {
	async list() {
		const { data, error } = await trueque
			.from('notifications')
			.select('id, kind, body, link, read_at, created_at')
			.order('created_at', { ascending: false })
			.limit(20)
			.returns<
				{
					id: number
					kind: NotificationItem['kind']
					body: string
					link: string | null
					read_at: string | null
					created_at: string
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(n => ({
			id: n.id,
			kind: n.kind,
			body: n.body,
			link: n.link,
			read: n.read_at !== null,
			createdAt: n.created_at,
		}))
	},

	async markAllRead() {
		const { error } = await trueque
			.from('notifications')
			.update({ read_at: new Date().toISOString() })
			.is('read_at', null)
		if (error) throw new Error(toMessage(error))
	},
}
