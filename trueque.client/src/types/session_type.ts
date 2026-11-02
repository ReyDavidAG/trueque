export type Role = 'member' | 'company' | 'hr'

export interface Person {
	id: string
	employeeNumber: string
	fullName: string
	areaId: string
	areaName: string
	departmentName: string | null
	companyId: string
	companyCode: string
	companyName: string
}

export interface Session {
	person: Person
	role: Role
	isHr: boolean
	managedCompanyIds: string[]
}
