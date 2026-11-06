import type { VendorPart } from './vendor'

export const VENDOR_LINES: Record<VendorPart, string[]> = {
	face: [
		'¿Qué tengo en la cara? ¿Polvo de cacao?',
		'Sí, así de guapo amanecí.',
		'No me apachurre los cachetes, que no soy tamal.',
		'¿Me vio cara de vendedor honrado? Pues sí lo soy.',
		'Mi mamá dice que salí igualito a mi abuelo.',
	],
	eye: [
		'¡Ay, mi ojo!',
		'¡Me picaste el ojo, joven!',
		'¡Ahora veo doble! Dos termos por el precio de uno… no, mentira.',
		'¡Con los ojos no, que con esos cuido la mercancía!',
	],
	stache: [
		'El bigote no se toca, joven.',
		'Tres años cultivándolo.',
		'Es bigote de concurso, ¿eh?',
		'Lo peino diario con cera de abeja.',
	],
	pull: [
		'¡Mi bigote no es resorte!',
		'¡Ay, ay, ay, suéltelo!',
		'¡Que no es de los que se despegan!',
		'¡Me va a dejar pelón del labio!',
	],
	shoulder: [
		'¿Mande?',
		'¿Sí, dígame? ¿Se le ofrece algo?',
		'¿Me buscaba? Aquí ando, a sus órdenes.',
		'Ah, es usted. ¿Ya se decidió?',
		'¿Qué pasó, marchante?',
	],
	belly: [
		'¡Jajaja, cosquillas no!',
		'Es pura tortilla, no se burle.',
		'¡Jijiji! ¡Ya, ya, me rindo!',
		'Este es mi almacén de tamales.',
	],
	arm: [
		'¡Ay, mi brazo!',
		'¿Me está saludando o qué?',
		'¡Que no es palanca de tragamonedas!',
		'Con ese brazo cargo las cajas, cuídemelo.',
	],
	hat: [
		'¡Oiga, mi sombrero!',
		'¡Devuélvame el sombrero!',
		'¡Se me va a asolear la calva!',
		'Ese sombrero era de mi papá, ¿eh?',
	],
	hatBack: [
		'Gracias, joven. Así me gusta.',
		'Ahora sí, bien presentable.',
		'Ya decía yo que usted era buena gente.',
	],
	goods: [
		'Ándele, chéquelo sin pena.',
		'Está bien bonito, ¿verdad?',
		'Calidad del grupo, nada de imitaciones.',
		'Agárrelo, siéntalo, enamórese.',
		'Ese es de los que más se llevan.',
	],
	throw: [
		'¡Cuidado con la mercancía!',
		'¡No me la avientes!',
		'¡Es para llevar, no para lanzar!',
		'¡Si se rompe, se lo cobro en cacaos!',
	],
	bonk: [
		'¡Auch! ¡Me dio en la cabeza!',
		'¡Oiga, eso no se avienta!',
		'¡Veo estrellitas… y cacaos!',
		'¡Buena puntería, pero mala educación!',
	],
	nose: [
		'¡Pip! ¿A poco soy claxon?',
		'Mi nariz no es timbre, joven.',
		'¡Ya me la dejó como jitomate!',
		'¡Pip pip! ¡Ya, que no soy camión!',
	],
	five: [
		'¡Chócala!',
		'¡Eso! ¡Buena onda!',
		'¡Así se saluda, marchante!',
		'¡Uy, qué mano tan firme!',
	],
	tip: [
		'¡Buenas! A sus órdenes.',
		'Pásele, está en su casa.',
		'Muy buenas tardes, ¿qué le damos?',
		'Un gusto atenderle.',
	],
	sign: [
		'Precio justo, aprobado por RH.',
		'No le hago descuento, ¿eh?',
		'Ni un cacao más, ni un cacao menos.',
		'Ese letrero lo pinté yo solito.',
	],
	bell: [
		'¡Ya voy, ya voy!',
		'¿Quién toca? ¡Ah, es usted!',
		'¡Aquí estoy, no se me desespere!',
		'Ya lo oí, ya lo oí.',
	],
	idle: [
		'¿Ya vio la pizarra? Ahí viene todo.',
		'Los cacaos se ganan en Chispa, ¿eh? Proponga ideas.',
		'Se usan primero los cacaos que vencen más pronto.',
		'Con el cupón pasa a recogerlo, así de fácil.',
		'Hoy está bonito el día para un trueque.',
		'Aquí no se regatea, pero sí se platica.',
		'¿Le cuento un chiste? Mejor otro día.',
		'Si tiene dudas, pregúnteme sin pena.',
	],
	cheek: [
		'¡Mis cachetes!',
		'No soy masa de tortilla, joven.',
		'¿Me está midiendo lo cachetón?',
		'¡Ay! Mi abuela me los pellizcaba igual.',
	],
	pit: [
		'¡Jajaja! ¡Ahí no, ahí no!',
		'¡Las axilas no, que soy bien cosquilludo!',
		'¡Jijiji! ¡Pare, que se me cae la mercancía!',
		'¡Uy! Ahí ni mi señora me toca.',
	],
	head: [
		'¡No se me quede viendo la calva!',
		'Por eso uso sombrero, ¿ve?',
		'Es que me peino con toalla.',
		'Antes tenía rizos, se lo juro.',
		'¡Brilla, pero no es para que la toque!',
	],
	arrive: [
		'¡Ya voy, ya voy! ¿Quién toca?',
		'¡Uy, perdón, estaba acomodando cajas!',
	],
}

export const shortOfCacaosLines = (missing: number) => [
	`Le faltan ${missing} cacaos, marchante. Pero ahí se lo aparto con la mirada.`,
	`Nomás ${missing} cacaos más y es suyo.`,
	`Échele ganas en Chispa, le faltan ${missing} cacaos.`,
	'Todavía no le alcanza, pero no se me desanime.',
]

export const WARNING_LINES = [
	'Ya, ya… me estás desesperando.',
	'Una más y te saco del puesto, ¿eh?',
]

export const ANGRY_LINE = '¡Ya me hiciste enojar! ¡Fuera de mi puesto!'
