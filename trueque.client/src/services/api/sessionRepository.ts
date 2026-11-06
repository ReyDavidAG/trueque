import type { Person, Role, Session } from '@/types/sessionType'

import { supabase, toMessage, trueque } from '../supabase/supabaseClient'

export interface SessionRepository {
	current(): Promise<Session | null>
	claim(employeeNumber: string): Promise<Session>
	signOut(): Promise<void>
}

const PERSON_FIELDS =
	'id, employee_number, full_name, area_id, area:areas!people_area_id_fkey(name, company:companies(id, code, name)), department:departments!people_department_id_area_id_fkey(name)'

interface PersonRow {
	id: string
	employee_number: string
	full_name: string
	area_id: string
	area: {
		name: string
		company: { id: string; code: string; name: string }
	} | null
	department: { name: string } | null
}

const toPerson = (r: PersonRow): Person => ({
	id: r.id,
	employeeNumber: r.employee_number,
	fullName: r.full_name,
	areaId: r.area_id,
	areaName: r.area?.name ?? '',
	departmentName: r.department?.name ?? null,
	companyId: r.area?.company.id ?? '',
	companyCode: r.area?.company.code ?? '',
	companyName: r.area?.company.name ?? '',
})

async function buildSession(person: Person): Promise<Session> {
	const [managers, hr] = await Promise.all([
		trueque
			.from('store_managers')
			.select('company_id')
			.eq('person_id', person.id)
			.returns<{ company_id: string }[]>(),
		trueque
			.from('hr_reviewers')
			.select('person_id')
			.eq('person_id', person.id)
			.returns<{ person_id: string }[]>(),
	])
	const error = managers.error ?? hr.error
	if (error) throw new Error(toMessage(error))
	const managedCompanyIds = (managers.data ?? []).map(m => m.company_id)
	const isHr = (hr.data ?? []).length > 0
	const role: Role = isHr
		? 'hr'
		: managedCompanyIds.length
			? 'company'
			: 'member'
	return { person, role, isHr, managedCompanyIds }
}

async function loadPerson(column: string, value: string) {
	const { data, error } = await supabase
		.from('people')
		.select(PERSON_FIELDS)
		.eq(column, value)
		.maybeSingle<PersonRow>()
	if (error) throw new Error(toMessage(error))
	return data ? toPerson(data) : null
}

export const sessionRepository: SessionRepository = {
	async current() {
		const { data } = await supabase.auth.getSession()
		const uid = data.session?.user.id
		if (!uid) return null
		const person = await loadPerson('auth_subject', uid)
		return person ? buildSession(person) : null
	},

	async claim(employeeNumber) {
		const { data } = await supabase.auth.getSession()
		if (!data.session) {
			const { error } = await supabase.auth.signInAnonymously()
			if (error) throw new Error(toMessage(error))
		}
		const { error } = await supabase.rpc('claim_employee_number', {
			p_employee_number: employeeNumber,
		})
		if (error) throw new Error(toMessage(error))
		const person = await loadPerson('employee_number', employeeNumber)
		if (!person) throw new Error('No encontramos ese número de trabajador.')
		return buildSession(person)
	},

	async signOut() {
		await supabase.auth.signOut()
	},
}
