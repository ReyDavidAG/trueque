export const companies = [
  { id: "valle", name: "Alimentos del Valle" },
  { id: "altos", name: "Transportes Los Altos" },
  { id: "mirador", name: "Granjas El Mirador" },
];

export const categories = [
  { id: "all", label: "Todo" },
  { id: "service", label: "Servicios" },
  { id: "item", label: "Artículos" },
  { id: "custodia", label: "De Custodia" },
];

export const places = {
  comedor: "Comedor de planta",
  optica: "Óptica en convenio",
  taller: "Taller mecánico interno",
  rh: "Oficina de RH",
  it: "Mesa de soporte de IT",
  salud: "Consultorio de planta",
};

export const products = [
  {
    id: "comida", art: "plate", stall: "achiote", kind: "service", category: "service",
    name: "Comida corrida en el comedor", blurb: "Plato fuerte, agua del día y postre.",
    price: 25, stock: null, couponDays: 30, swaps: 1, place: "comedor", company: "valle",
    detail: "Se canjea en el comedor de planta en cualquier turno. El cupón vale por una comida.",
  },
  {
    id: "termo", art: "thermos", stall: "anil", kind: "item", category: "item",
    name: "Termo de acero 750 ml", blurb: "Mantiene el café caliente todo el turno.",
    price: 40, stock: 18, couponDays: 45, swaps: 1, place: "rh", company: "valle",
    detail: "Se recoge en la oficina de RH presentando el cupón.",
  },
  {
    id: "nutri", art: "apple", stall: "nopal", kind: "service", category: "service",
    name: "Consulta con nutrióloga", blurb: "Valoración y plan de alimentación.",
    price: 60, stock: null, couponDays: 60, swaps: 1, place: "salud", company: "mirador",
    detail: "Agenda tu cita en el consultorio. Incluye medición y plan para un mes.",
  },
  {
    id: "psico", art: "chat", stall: "anil", kind: "service", category: "service",
    name: "Sesión de acompañamiento psicológico", blurb: "Una sesión confidencial de 50 minutos.",
    price: 80, stock: null, couponDays: 90, swaps: 1, place: "salud", company: "mirador",
    detail: "Nadie en tu área se entera del canje: el cupón lo valida sólo el consultorio.",
  },
  {
    id: "optica", art: "glasses", stall: "grana", kind: "service", category: "service",
    name: "Examen de la vista y armazón básico", blurb: "Graduación y armazón con micas sencillas.",
    price: 180, stock: null, couponDays: 90, swaps: 1, place: "optica", company: "altos",
    detail: "En la óptica en convenio. Micas especiales se pagan aparte.",
  },
  {
    id: "taller", art: "wrench", stall: "maiz", kind: "service", category: "service",
    name: "Afinación en el taller interno", blurb: "Mano de obra de una afinación menor.",
    price: 250, stock: 6, couponDays: 60, swaps: 1, place: "taller", company: "altos",
    detail: "Las refacciones van por tu cuenta. Agenda con el taller antes de llevar el auto.",
  },
  {
    id: "cert", art: "diploma", stall: "cacao", kind: "service", category: "service",
    name: "Vale para una certificación", blurb: "Paga el examen de una certificación técnica.",
    price: 300, stock: 4, couponDays: 120, swaps: 1, place: "rh", company: "valle",
    detail: "RH confirma que la certificación tiene relación con tu puesto antes de pagarla.",
  },
  {
    id: "laptop", art: "laptop", stall: "cacao", kind: "item", category: "custodia",
    name: "Laptop reacondicionada", blurb: "14 pulgadas, 8 GB, disco sólido. Revisada por IT.",
    price: 450, stock: 1, couponDays: 15, swaps: 1, place: "it", company: "altos",
    fromCustodia: { folio: "EQ-0412", year: 2021, wiped: true, accounting: true },
    detail: "Viene de Custodia: IT la revisó y borró los datos, y contabilidad ya la dio de baja. Se entrega en soporte de IT.",
  },
];

export const rules = [
  { id: "idea", label: "Mandas una chispa", cacaos: 5, cap: "hasta 4 al mes", note: "Premia participar, no mandar diez iguales." },
  { id: "review", label: "Tu chispa pasa a revisión", cacaos: 10, cap: null, note: "Quiere decir que el área la tomó en serio." },
  { id: "challenge", label: "Publicas un reto (aceptado)", cacaos: 15, cap: "hasta 2 al mes", note: "Contar bien un problema también vale." },
  { id: "selected", label: "Tu chispa llega a la feria", cacaos: 60, cap: null, note: "La decide el comité con la rúbrica." },
  { id: "done", label: "Tu chispa se implementa", cacaos: 150, cap: null, note: "El impacto real es lo que más paga." },
  { id: "support", label: "Avivas una chispa", cacaos: 0, cap: null, note: "Si diera cacaos, todos avivarían todo." },
];

export const users = {
  member: { name: "Colaborador de ejemplo", company: "valle" },
  company: { name: "Responsable de El Trueque", company: "valle" },
  hr: { name: "RH corporativo", company: null },
};

export const roleNames = { member: "Colaborador", company: "Empresa", hr: "RH corporativo" };

export const seedLots = [
  { id: "L0", source: "Chispa CHI-001 pasó a revisión y llegó a la feria", amount: 85, earned: "2026-01-20", used: 85 },
  { id: "L1", source: "Chispa CHI-004 llegó a la feria", amount: 60, earned: "2025-12-10" },
  { id: "L2", source: "Chispa CHI-011 pasó a revisión", amount: 10, earned: "2026-03-02" },
  { id: "L3", source: "Reto RET-007 publicado", amount: 15, earned: "2026-06-18" },
  { id: "L4", source: "Chispa CHI-019 recibida", amount: 5, earned: "2026-09-21" },
  { id: "L5", source: "Chispa CHI-022 pasó a revisión", amount: 10, earned: "2026-10-14" },
];

export const companyQueue = [
  { id: "termo", status: "live" },
  { id: "comida", status: "live" },
  { id: "cert", status: "live" },
  { id: "draft-gorra", name: "Gorra bordada del grupo", price: 35, status: "pending", suggested: 35, range: [30, 45] },
];

export const hrQueue = [
  { id: "q1", name: "Gorra bordada del grupo", company: "valle", price: 35, range: [30, 45], art: "cap" },
  { id: "q2", name: "Lavado de auto en planta", company: "altos", price: 70, range: [30, 50], art: "wrench" },
  { id: "q3", name: "Clase de yoga (4 sesiones)", company: "mirador", price: 90, range: [80, 110], art: "apple" },
];

export const custodiaQueue = [
  { folio: "EQ-0398", name: "Monitor 24 pulgadas", year: 2020, it: true, accounting: true, suggested: 120 },
  { folio: "EQ-0405", name: "Laptop 13 pulgadas", year: 2019, it: true, accounting: false, suggested: 300 },
];

export const budget = { company: "valle", period: "2026", assigned: 24000, committed: 4310, redeemed: 2875 };

export const profiles = [
  { number: "10001", name: "Mariana Ruiz", position: "Analista de calidad", company: "valle", role: "member" },
  { number: "10002", name: "Jorge Medina", position: "Coordinador de RH", company: "valle", role: "company" },
  { number: "10003", name: "Laura Ponce", position: "Gerente de RH corporativo", company: "valle", role: "hr" },
];

export const seedCoupons = [
  { folio: "TRQ-0988", productId: "comida", date: "2026-08-04", validUntil: "2026-09-03", status: "used", usedOn: "2026-08-11", code: "CAC-QK0988" },
  { folio: "TRQ-0951", productId: "nutri", date: "2026-05-02", validUntil: "2026-07-01", status: "expired", code: "CAC-NT0951" },
];
