export const APP_VERSION = "0.3.0";

export const companies = [
  { id: "valle", name: "Alimentos del Valle" },
  { id: "altos", name: "Transportes Los Altos" },
  { id: "mirador", name: "Granjas El Mirador" },
];

export const defaultConfig = {
  cacaoValue: 5,
  lotMonths: 12,
  refundOnExpiry: false,
  payer: "offering",
};

export const defaultCategories = [
  { id: "service", label: "Servicios", min: 15, max: 400 },
  { id: "item", label: "Artículos", min: 15, max: 300 },
  { id: "custodia", label: "De Custodia", min: 60, max: 800 },
];

export const filters = [{ id: "all", label: "Todo" }, ...defaultCategories.map(({ id, label }) => ({ id, label }))];

export const defaultLocations = [
  { id: "comedor", name: "Comedor de planta", address: "Planta norte, edificio B", reference: "Junto a la caja del comedor", attendant: "Jorge Medina" },
  { id: "optica", name: "Óptica en convenio", address: "Av. Juárez 210, centro", reference: "Presenta el cupón en mostrador", attendant: "Óptica Visión Clara" },
  { id: "taller", name: "Taller mecánico interno", address: "Patio de flotilla", reference: "Agenda antes de llevar el auto", attendant: "Raúl Ortega" },
  { id: "rh", name: "Oficina de RH", address: "Corporativo, piso 2", reference: "Ventanilla de atención", attendant: "Jorge Medina" },
  { id: "it", name: "Mesa de soporte de IT", address: "Corporativo, planta baja", reference: "Con folio de Custodia", attendant: "Soporte de IT" },
  { id: "salud", name: "Consultorio de planta", address: "Planta norte, enfermería", reference: "Agenda tu cita", attendant: "Dra. Paola Núñez" },
];

export const seedProducts = [
  {
    id: "comida", art: "plate", stall: "achiote", kind: "service", category: "service",
    name: "Comida corrida en el comedor", blurb: "Plato fuerte, agua del día y postre.",
    cost: 80, price: 16, stock: null, couponDays: 30, swaps: 1, place: "comedor", company: "valle", status: "live",
    detail: "Se canjea en el comedor de planta en cualquier turno. El cupón vale por una comida.",
    includes: ["Plato fuerte del día", "Agua fresca", "Postre"],
  },
  {
    id: "termo", art: "thermos", stall: "anil", kind: "item", category: "item",
    name: "Termo de acero 750 ml", blurb: "Mantiene el café caliente todo el turno.",
    cost: 200, price: 40, stock: 18, couponDays: 45, swaps: 1, place: "rh", company: "valle", status: "live",
    detail: "Se recoge en la oficina de RH presentando el cupón.",
    includes: ["Termo de acero inoxidable", "Tapa a prueba de derrames"],
  },
  {
    id: "nutri", art: "apple", stall: "nopal", kind: "service", category: "service",
    name: "Consulta con nutrióloga", blurb: "Valoración y plan de alimentación.",
    cost: 300, price: 60, stock: null, couponDays: 60, swaps: 1, place: "salud", company: "mirador", status: "live",
    detail: "Agenda tu cita en el consultorio. Incluye medición y plan para un mes.",
    includes: ["Medición corporal", "Plan de alimentación de un mes", "Seguimiento a las 4 semanas"],
  },
  {
    id: "psico", art: "chat", stall: "anil", kind: "service", category: "service",
    name: "Sesión de acompañamiento psicológico", blurb: "Una sesión confidencial de 50 minutos.",
    cost: 400, price: 80, stock: null, couponDays: 90, swaps: 1, place: "salud", company: "mirador", status: "live",
    detail: "Nadie en tu área se entera del canje: el cupón lo valida sólo el consultorio.",
    includes: ["Sesión individual de 50 minutos", "Confidencial"],
  },
  {
    id: "optica", art: "glasses", stall: "grana", kind: "service", category: "service",
    name: "Examen de la vista y armazón básico", blurb: "Graduación y armazón con micas sencillas.",
    cost: 900, price: 180, stock: null, couponDays: 90, swaps: 1, place: "optica", company: "altos", status: "live",
    detail: "En la óptica en convenio. Micas especiales se pagan aparte.",
    includes: ["Examen de la vista", "Armazón básico", "Micas sencillas"],
  },
  {
    id: "taller", art: "wrench", stall: "maiz", kind: "service", category: "service",
    name: "Afinación en el taller interno", blurb: "Mano de obra de una afinación menor.",
    cost: 1250, price: 250, stock: 6, couponDays: 60, swaps: 1, place: "taller", company: "altos", status: "live",
    detail: "Las refacciones van por tu cuenta. Agenda con el taller antes de llevar el auto.",
    includes: ["Mano de obra de afinación menor", "Revisión de niveles"],
  },
  {
    id: "cert", art: "diploma", stall: "cacao", kind: "service", category: "service",
    name: "Vale para una certificación", blurb: "Paga el examen de una certificación técnica.",
    cost: 1500, price: 300, stock: 4, couponDays: 120, swaps: 1, place: "rh", company: "valle", status: "live",
    detail: "RH confirma que la certificación tiene relación con tu puesto antes de pagarla.",
    includes: ["Pago del examen", "Constancia para tu expediente"],
  },
  {
    id: "laptop", art: "laptop", stall: "cacao", kind: "item", category: "custodia",
    name: "Laptop reacondicionada", blurb: "14 pulgadas, 8 GB, disco sólido. Revisada por IT.",
    cost: 0, price: 450, stock: 1, couponDays: 15, swaps: 1, place: "it", company: "altos", status: "live",
    fromCustodia: { folio: "EQ-0412", year: 2021, wiped: true, accounting: true },
    detail: "Viene de Custodia: IT la revisó y borró los datos, y contabilidad ya la dio de baja. Se entrega en soporte de IT.",
    includes: ["Laptop con cargador", "Sistema limpio"],
  },
  {
    id: "gorra", art: "cap", stall: "grana", kind: "item", category: "item",
    name: "Gorra bordada del grupo", blurb: "Gorra con el logo bordado.",
    cost: 175, price: 35, stock: 40, couponDays: 30, swaps: 1, place: "rh", company: "valle", status: "pending",
    detail: "Talla única con ajuste. Se recoge en RH.",
    includes: ["Gorra bordada"],
  },
  {
    id: "lavado", art: "wrench", stall: "anil", kind: "service", category: "service",
    name: "Lavado de auto en planta", blurb: "Lavado exterior en el patio de flotilla.",
    cost: 150, price: 70, stock: null, couponDays: 30, swaps: 1, place: "taller", company: "altos", status: "pending",
    detail: "Lavado exterior con aspirado básico.",
    includes: ["Lavado exterior", "Aspirado básico"],
  },
  {
    id: "yoga", art: "gym", stall: "nopal", kind: "service", category: "service",
    name: "Clase de yoga (4 sesiones)", blurb: "Cuatro clases en la sala de capacitación.",
    cost: 450, price: 90, stock: 20, couponDays: 45, swaps: 4, place: "salud", company: "mirador", status: "pending",
    detail: "Martes y jueves al salir del turno. Trae tu tapete.",
    includes: ["4 clases de 1 hora", "Instructora certificada"],
  },
];

export const defaultRules = [
  { id: "idea", source: "Chispa", label: "Mandas una chispa", cacaos: 5, cap: 4, active: true, note: "Premia participar, no mandar diez iguales." },
  { id: "review", source: "Chispa", label: "Tu chispa pasa a revisión", cacaos: 10, cap: null, active: true, note: "Quiere decir que el área la tomó en serio." },
  { id: "challenge", source: "Chispa", label: "Publicas un reto (aceptado)", cacaos: 15, cap: 2, active: true, note: "Contar bien un problema también vale." },
  { id: "selected", source: "Chispa", label: "Tu chispa llega a la feria", cacaos: 60, cap: null, active: true, note: "La decide el comité con la rúbrica." },
  { id: "done", source: "Chispa", label: "Tu chispa se implementa", cacaos: 150, cap: null, active: true, note: "El impacto real es lo que más paga." },
  { id: "badge", source: "Insignias", label: "Recibes una insignia", cacaos: null, cap: null, active: true, note: "Lo que valga la insignia: de 10 a 100 cacaos." },
  { id: "support", source: "Chispa", label: "Avivas una chispa", cacaos: 0, cap: null, active: true, note: "Si diera cacaos, todos avivarían todo." },
];

export const defaultBudgets = [
  { company: "valle", period: 2026, assigned: 120000, committed: 21550, redeemed: 14375 },
  { company: "altos", period: 2026, assigned: 90000, committed: 9800, redeemed: 22400 },
  { company: "mirador", period: 2026, assigned: 60000, committed: 6900, redeemed: 8150 },
];

export const roleNames = { member: "Colaborador", company: "Encargado de tienda", hr: "RH corporativo" };

export const profiles = [
  { number: "10001", name: "Mariana Ruiz", position: "Analista de calidad", company: "valle", role: "member" },
  { number: "10002", name: "Jorge Medina", position: "Coordinador de RH", company: "valle", role: "company" },
  { number: "10003", name: "Laura Ponce", position: "Gerente de RH corporativo", company: "valle", role: "hr" },
];

export const seedLots = [
  { id: "L0", source: "Chispa CHI-001 pasó a revisión y llegó a la feria", amount: 85, earned: "2026-01-20", used: 85 },
  { id: "L1", source: "Chispa CHI-004 llegó a la feria", amount: 60, earned: "2025-12-10" },
  { id: "L2", source: "Chispa CHI-011 pasó a revisión", amount: 10, earned: "2026-03-02" },
  { id: "L3", source: "Reto RET-007 publicado", amount: 15, earned: "2026-06-18" },
  { id: "L6", source: "Insignia Gracias, de tu encargado", amount: 10, earned: "2026-08-12" },
  { id: "L4", source: "Chispa CHI-019 recibida", amount: 5, earned: "2026-09-21" },
  { id: "L5", source: "Chispa CHI-022 pasó a revisión", amount: 10, earned: "2026-10-14" },
];

export const seedCoupons = [
  { folio: "TRQ-0988", productId: "comida", date: "2026-08-04", validUntil: "2026-09-03", status: "used", usedOn: "2026-08-11", code: "CAC-QK0988" },
  { folio: "TRQ-0951", productId: "nutri", date: "2026-05-02", validUntil: "2026-07-01", status: "expired", code: "CAC-NT0951" },
];

export const redeemSamples = [
  { code: "CAC-TR1042", folio: "TRQ-1042", productId: "termo", person: "Mariana Ruiz", number: "10001", validUntil: "2026-12-17", status: "valid", place: "rh" },
  { code: "CAC-CM1007", folio: "TRQ-1007", productId: "comida", person: "Luis Herrera", number: "10014", validUntil: "2026-10-20", status: "expired", place: "comedor" },
  { code: "CAC-QK0988", folio: "TRQ-0988", productId: "comida", person: "Mariana Ruiz", number: "10001", validUntil: "2026-09-03", status: "used", usedOn: "2026-08-11", place: "comedor" },
  { code: "CAC-OP1033", folio: "TRQ-1033", productId: "optica", person: "Ana Torres", number: "10022", validUntil: "2027-01-12", status: "valid", place: "optica" },
];

export const custodiaQueue = [
  { folio: "EQ-0398", name: "Monitor 24 pulgadas", art: "monitor", year: 2020, it: true, accounting: true, suggested: 120 },
  { folio: "EQ-0405", name: "Laptop 13 pulgadas", art: "laptop", year: 2019, it: true, accounting: false, suggested: 300 },
];

export const seedNotifications = {
  member: [
    { id: "n1", kind: "earn", text: "Ganaste 10 cacaos: tu chispa CHI-022 pasó a revisión.", date: "2026-10-14", href: "#/wallet" },
    { id: "n2", kind: "expire", text: "60 cacaos vencen el 10 dic 2026. Úsalos primero.", date: "2026-10-28", href: "#/" },
    { id: "n3", kind: "coupon", text: "Tu cupón de comida vence en 5 días.", date: "2026-10-30", href: "#/coupons" },
  ],
  company: [
    { id: "n4", kind: "review", text: "RH aprobó «Termo de acero 750 ml»: ya está en el mercado.", date: "2026-10-22", href: "#/panel" },
    { id: "n5", kind: "rejected", text: "RH ajustó el precio de «Lavado de auto»: revisa el motivo.", date: "2026-10-29", href: "#/panel" },
    { id: "n6", kind: "budget", text: "Tu empresa lleva 30% del presupuesto 2026.", date: "2026-11-01", href: "#/panel" },
  ],
  hr: [
    { id: "n7", kind: "review", text: "3 precios esperan tu revisión.", date: "2026-11-01", href: "#/panel" },
    { id: "n8", kind: "custodia", text: "Custodia postuló un monitor de 24 pulgadas.", date: "2026-10-31", href: "#/panel" },
    { id: "n9", kind: "expire", text: "1,240 cacaos del grupo vencen este mes.", date: "2026-11-01", href: "#/dashboard" },
  ],
};

export const dashboardSeed = {
  months: ["jun", "jul", "ago", "sep", "oct", "nov"],
  earned: [1840, 2210, 2480, 2950, 3320, 1260],
  spent: [920, 1380, 1710, 2040, 2390, 780],
  people: { active: 412, total: 1180 },
  areas: [
    { name: "Producción", share: 0.34 },
    { name: "Calidad", share: 0.18 },
    { name: "Logística", share: 0.16 },
    { name: "Mantenimiento", share: 0.14 },
    { name: "Administración", share: 0.1 },
    { name: "Otras", share: 0.08 },
  ],
  top: [
    { id: "comida", trades: 318 },
    { id: "termo", trades: 96 },
    { id: "nutri", trades: 71 },
    { id: "optica", trades: 34 },
    { id: "psico", trades: 29 },
  ],
  sources: [
    { name: "Chispa · ideas y retos", share: 0.71 },
    { name: "Insignias de tu encargado", share: 0.24 },
    { name: "Ajustes de RH", share: 0.05 },
  ],
  outstanding: 18420,
  expiringThisMonth: 1240,
};
