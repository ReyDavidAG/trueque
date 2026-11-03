const gear = (cx, cy, r, teeth, depth) => {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (Math.PI * 2 * i) / (teeth * 4);
    const rr = i % 4 < 2 ? r + depth : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}z`;
};

const custodiaTag = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">
      <path class="ln" d="M${x - 22} ${y - 30}c10 4 16 12 18 22"/>
      <path class="a-cacao ln" d="M${x - 14} ${y - 12}h30l10 14-10 14h-30z"/>
      <circle class="a-amate2" cx="${x + 18}" cy="${y + 2}" r="3.5"/>
      <path class="a-on-dark" d="M${x - 8} ${y}h18v4h-18z" opacity=".8"/>
    </g>`;

const calendarGrid = () => {
  let s = "";
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++) {
      if (row === 1 && col === 3) continue;
      s += `<rect x="${66 + col * 20}" y="${82 + row * 20}" width="12" height="12" rx="3"/>`;
    }
  return s;
};

export const ART_GROUPS = [
  { id: "food", label: "Comida" },
  { id: "health", label: "Salud y bienestar" },
  { id: "learn", label: "Aprendizaje" },
  { id: "service", label: "Servicios" },
  { id: "merch", label: "Artículos del grupo" },
  { id: "leisure", label: "Tiempo libre" },
  { id: "custodia", label: "Equipo de Custodia" },
];

export const ART = [
  {
    id: "plate", group: "food", label: "Comida corrida",
    draw: `
    <ellipse class="a-shadow" cx="114" cy="152" rx="88" ry="9"/>
    <path class="a-grana ln" d="M14 112l12-22h40l12 22z"/>
    <ellipse class="a-maiz ln" cx="46" cy="94" rx="24" ry="7"/>
    <ellipse class="a-maiz ln" cx="46" cy="86" rx="24" ry="7"/>
    <ellipse class="a-maiz ln" cx="46" cy="78" rx="24" ry="7"/>
    <ellipse class="a-estraza ln" cx="112" cy="122" rx="66" ry="28"/>
    <ellipse class="a-amate2 ln" cx="112" cy="118" rx="48" ry="18"/>
    <path class="a-achiote ln" d="M70 120c0-14 14-20 26-18 10 2 14 10 10 16-8 8-36 8-36 2z"/>
    <path class="ln" d="M80 112h4M90 108h4M86 116h4"/>
    <path class="a-grana ln" d="M108 112c8-12 34-12 42 0 4 8-6 14-21 14s-25-6-21-14z"/>
    <ellipse class="a-cacao ln" cx="98" cy="126" rx="12" ry="5"/>
    <path class="a-nopal ln" d="M128 104c4-8 12-10 16-6-2 6-8 9-16 6z"/>
    <path class="a-anil-soft ln" d="M180 62h34l-5 76a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6z"/>
    <path class="a-grana" d="M183 86h28l-3 50a4 4 0 0 1-4 4h-14a4 4 0 0 1-4-4z"/>
    <path class="ln" d="M180 62h34l-5 76a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6z"/>
    <path class="ln" d="M202 46l-6 30"/>`,
  },
  {
    id: "coffee", group: "food", label: "Café y pan dulce",
    draw: `
    <ellipse class="a-shadow" cx="122" cy="154" rx="92" ry="8"/>
    <ellipse class="a-estraza ln" cx="96" cy="142" rx="54" ry="10"/>
    <path class="ln-thick" d="M128 96h10a13 13 0 0 1 0 26h-12"/>
    <path class="a-grana ln" d="M60 88h72v28a30 30 0 0 1-30 30h-12a30 30 0 0 1-30-30z"/>
    <path class="a-estraza" d="M62 104h68v7H62z" opacity=".85"/>
    <ellipse class="a-cacao ln" cx="96" cy="88" rx="36" ry="8"/>
    <path class="ln a-steam" d="M82 72c-6-8 6-12 0-20M98 70c-6-8 6-12 0-20M114 72c-6-8 6-12 0-20"/>
    <path class="a-maiz ln" d="M160 144c0-28 18-40 32-40s32 12 32 40z"/>
    <path class="a-achiote-soft" d="M166 126c6-14 46-14 52 0-4-18-48-18-52 0z" opacity=".9"/>
    <path class="ln" d="M166 130c10-12 42-12 52 0M174 118c8-8 28-8 36 0M192 104v40"/>`,
  },
  {
    id: "groceries", group: "food", label: "Despensa",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="70" ry="8"/>
    <path class="a-nopal ln" d="M92 80c-10-22 0-38 12-42 8 16 4 32-12 42z"/>
    <path class="a-maiz ln" d="M114 82l14-44c3-7 13-5 13 2l-8 44z"/>
    <circle class="a-grana ln" cx="152" cy="74" r="14"/>
    <path class="ln" d="M152 60c0-6 4-10 8-12"/>
    <path class="ln-thick" d="M90 78c0-30 60-30 60 0"/>
    <path class="a-achiote ln" d="M66 78h108l-9 74H75z"/>
    <path class="a-anil" d="M69 96h102v10H69zM71 122h98v10H71z" opacity=".9"/>
    <path class="ln" d="M69 96h102M69 106h102M71 122h98M71 132h98"/>`,
  },
  {
    id: "apple", group: "health", label: "Nutrición",
    draw: `
    <ellipse class="a-shadow" cx="116" cy="152" rx="90" ry="8"/>
    <g transform="translate(-18 0)">
      <path class="a-grana ln" d="M112 62c-14-12-48-8-50 28-2 34 22 60 38 60 6 0 8-4 12-4s6 4 12 4c16 0 40-26 38-60-2-36-36-40-50-28z"/>
      <path class="a-estraza" d="M78 82c4-8 12-12 20-12" opacity=".6"/>
      <path class="ln" d="M112 62c0-10 2-18 8-24"/>
      <path class="a-nopal ln" d="M120 44c10-12 28-12 34-4-8 10-24 12-34 4z"/>
    </g>
    <path class="a-estraza ln" d="M168 140H118v10h50z"/>
    <path class="ln" d="M126 140v5M136 140v5M146 140v5M156 140v5"/>
    <rect class="a-maiz ln" x="164" y="102" width="46" height="48" rx="13"/>
    <circle class="a-estraza ln" cx="187" cy="126" r="9"/>`,
  },
  {
    id: "chat", group: "health", label: "Apoyo psicológico",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="70" ry="8"/>
    <path class="a-anil ln" d="M40 44h104a16 16 0 0 1 16 16v38a16 16 0 0 1-16 16H82l-24 20v-20H40a16 16 0 0 1-16-16V60a16 16 0 0 1 16-16z"/>
    <path class="a-estraza ln" d="M120 82h76a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14h-8v18l-20-18h-48a14 14 0 0 1-14-14V96a14 14 0 0 1 14-14z"/>
    <path class="a-grana ln" d="M158 102c6-8 18-4 16 6-1 8-16 18-16 18s-15-10-16-18c-2-10 10-14 16-6z"/>
    <g class="a-estraza"><circle cx="58" cy="80" r="5"/><circle cx="78" cy="80" r="5"/><circle cx="98" cy="80" r="5"/></g>`,
  },
  {
    id: "glasses", group: "health", label: "Óptica",
    draw: `
    <rect class="a-estraza ln" x="66" y="18" width="108" height="72" rx="6"/>
    <g class="a-ink chart"><text x="120" y="44" text-anchor="middle">E</text><text x="120" y="62" text-anchor="middle" font-size="12">F P</text><text x="120" y="78" text-anchor="middle" font-size="8">T O Z</text></g>
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <circle class="a-anil-soft ln-thick" cx="80" cy="120" r="30"/>
    <circle class="a-anil-soft ln-thick" cx="160" cy="120" r="30"/>
    <path class="ln-thick" d="M110 116c6-6 14-6 20 0M50 114l-24-10M190 114l24-10"/>
    <path class="a-estraza" d="M64 106c4-6 10-8 16-8M144 106c4-6 10-8 16-8" opacity=".8"/>`,
  },
  {
    id: "doctor", group: "health", label: "Consulta médica",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="86" ry="8"/>
    <rect class="a-estraza ln" x="150" y="34" width="62" height="62" rx="12"/>
    <path class="a-grana ln" d="M174 46h14v14h14v14h-14v14h-14V74h-14V60h14z"/>
    <path class="ln-thick" d="M52 36v30c0 30 56 30 56 0V36"/>
    <circle class="a-ink" cx="52" cy="34" r="6"/>
    <circle class="a-ink" cx="108" cy="34" r="6"/>
    <path class="ln-thick" d="M80 94v24c0 22 30 26 44 12"/>
    <circle class="a-anil ln" cx="136" cy="124" r="18"/>
    <circle class="a-anil-soft ln" cx="136" cy="124" r="8"/>`,
  },
  {
    id: "gym", group: "health", label: "Deporte y gimnasio",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="96" ry="8"/>
    <rect class="a-anil-soft ln" x="190" y="74" width="30" height="80" rx="9"/>
    <rect class="a-anil" x="192" y="98" width="26" height="22"/>
    <rect class="ln" x="190" y="74" width="30" height="80" rx="9" fill="none"/>
    <rect class="a-ink" x="196" y="60" width="18" height="16" rx="4"/>
    <rect class="a-ink" x="58" y="118" width="100" height="10" rx="4"/>
    <rect class="a-grana ln" x="42" y="94" width="18" height="58" rx="5"/>
    <rect class="a-grana ln" x="26" y="104" width="16" height="38" rx="4"/>
    <rect class="a-grana ln" x="156" y="94" width="18" height="58" rx="5"/>
    <rect class="a-grana ln" x="174" y="104" width="14" height="38" rx="4"/>`,
  },
  {
    id: "diploma", group: "learn", label: "Certificación",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="80" ry="8"/>
    <path class="a-estraza ln" d="M48 42h140v96H48z"/>
    <path class="a-amate2 ln" d="M40 36a10 10 0 0 1 0 20h8V36zM196 124a10 10 0 0 1 0 20h-8v-20z"/>
    <path class="ln" d="M70 66h96M70 82h80M70 98h88"/>
    <path class="a-grana ln" d="M142 112l-8 34 14-8 12 10 4-36z"/>
    <circle class="a-maiz ln" cx="152" cy="112" r="16"/>
    <path class="ln" d="M144 112l6 6 10-12"/>`,
  },
  {
    id: "book", group: "learn", label: "Curso o capacitación",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="88" ry="8"/>
    <path class="a-anil ln" d="M36 76v76c30-6 60-4 84 8 24-12 54-14 84-8V76"/>
    <path class="a-estraza ln" d="M120 80c-20-12-52-14-78-8v74c26-6 58-4 78 8z"/>
    <path class="a-estraza ln" d="M120 80c20-12 52-14 78-8v74c-26-6-58-4-78 8z"/>
    <path class="ln" d="M56 90c16-3 32-2 48 4M56 104c16-3 32-2 48 4M56 118c16-3 32-2 48 4M136 94c16-6 32-7 48-4M136 108c16-6 32-7 48-4M136 122c16-6 32-7 48-4"/>
    <path class="a-ink" d="M120 20l46 16-46 16-46-16z"/>
    <path class="a-ink" d="M96 44v14c14 8 34 8 48 0V44l-24 8z"/>
    <path class="ln" d="M166 36v22"/>
    <circle class="a-maiz ln" cx="166" cy="62" r="5"/>`,
  },
  {
    id: "wrench", group: "service", label: "Taller mecánico",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="154" rx="92" ry="8"/>
    <path class="a-achiote ln" d="${gear(176, 46, 20, 8, 7)}"/>
    <circle class="a-estraza ln" cx="176" cy="46" r="8"/>
    <path class="a-maiz ln" d="M30 124v-18c0-8 6-12 14-14l26-6 22-22c4-4 10-6 16-6h44c8 0 14 4 18 10l16 22 22 4c8 2 12 8 12 16v14z"/>
    <path class="a-anil-soft ln" d="M96 82l14-14c2-2 4-2 6-2h20v16zM146 66h14c4 0 6 2 8 4l9 12h-31z"/>
    <path class="ln" d="M30 112h180"/>
    <circle class="a-ink" cx="74" cy="128" r="18"/><circle class="a-amate2" cx="74" cy="128" r="7"/>
    <circle class="a-ink" cx="172" cy="128" r="18"/><circle class="a-amate2" cx="172" cy="128" r="7"/>`,
  },
  {
    id: "scissors", group: "service", label: "Estética y barbería",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="8"/>
    <path class="a-estraza ln" d="M98 112L150 36c4-5 11-1 9 4l-46 78z"/>
    <path class="a-estraza ln" d="M122 112L70 36c-4-5-11-1-9 4l46 78z"/>
    <circle class="a-grana ln" cx="90" cy="128" r="17"/><circle class="a-amate2 ln" cx="90" cy="128" r="7"/>
    <circle class="a-grana ln" cx="130" cy="128" r="17"/><circle class="a-amate2 ln" cx="130" cy="128" r="7"/>
    <circle class="a-ink" cx="110" cy="96" r="4.5"/>
    <path class="ln" d="M180 60h-12M180 68h-12M180 76h-12M180 84h-12M180 92h-12M180 100h-12M180 108h-12M180 116h-12M180 124h-12M180 132h-12"/>
    <rect class="a-maiz ln" x="178" y="50" width="22" height="98" rx="6"/>`,
  },
  {
    id: "thermos", group: "merch", label: "Termo",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="46" ry="8"/>
    <rect class="a-anil ln" x="92" y="52" width="56" height="102" rx="16"/>
    <rect class="a-ink" x="96" y="36" width="48" height="22" rx="7"/>
    <rect class="a-estraza ln" x="104" y="80" width="32" height="44" rx="8"/>
    <path class="a-cacao ln" d="M120 88c9 4 9 24 0 28-9-4-9-24 0-28z"/>
    <path class="ln" d="M120 90v24"/>
    <path class="ln a-steam" d="M108 28c-6-8 6-12 0-20M124 30c-6-8 6-12 0-20M140 28c-6-8 6-12 0-20"/>
    <path class="a-maiz ln" d="M150 70h12a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-12"/>`,
  },
  {
    id: "cap", group: "merch", label: "Gorra",
    draw: `
    <ellipse class="a-shadow" cx="126" cy="150" rx="92" ry="8"/>
    <path class="a-grana ln" d="M150 122c34-8 68-4 72 8 2 7-12 11-34 11-16 0-32-4-46-9z"/>
    <path class="ln" d="M160 128c18-3 38-2 52 2"/>
    <path class="a-grana ln" d="M44 130c0-50 32-80 74-80 38 0 60 28 62 70z"/>
    <path class="ln" d="M118 50c-8 22-10 50-10 80M86 60c-12 20-16 44-16 70M150 60c8 16 12 36 12 60"/>
    <path class="ln" d="M44 130h136"/>
    <circle class="a-maiz ln" cx="118" cy="50" r="6"/>
    <path class="a-maiz ln" d="M90 84c9 5 9 25 0 30-9-5-9-25 0-30z"/>`,
  },
  {
    id: "tshirt", group: "merch", label: "Playera",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="72" ry="8"/>
    <path class="a-anil ln" d="M86 34L44 52l14 32 20-8v74h84V76l20 8 14-32-42-18c-4 10-14 16-34 16s-30-6-34-16z"/>
    <path class="ln" d="M86 34c4 10 14 16 34 16s30-6 34-16"/>
    <path class="a-maiz ln" d="M120 82c11 5 11 28 0 33-11-5-11-28 0-33z"/>
    <path class="ln" d="M120 84v29"/>`,
  },
  {
    id: "ticket", group: "leisure", label: "Boletos y eventos",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="150" rx="88" ry="8"/>
    <g transform="rotate(-6 120 96)">
      <path class="a-estraza ln" d="M36 52h168v28a12 12 0 0 0 0 24v28H36v-28a12 12 0 0 0 0-24z"/>
      <path class="ln" d="M150 56v72" stroke-dasharray="6 7"/>
      <path class="ln" d="M56 78h70M56 96h52M56 114h62"/>
      <circle class="a-cacao ln" cx="178" cy="92" r="14"/>
    </g>`,
  },
  {
    id: "dayoff", group: "leisure", label: "Día libre",
    draw: `
    <ellipse class="a-shadow" cx="114" cy="156" rx="80" ry="8"/>
    <rect class="a-estraza ln" x="48" y="44" width="124" height="106" rx="10"/>
    <path class="a-grana ln" d="M48 72V54a10 10 0 0 1 10-10h104a10 10 0 0 1 10 10v18z"/>
    <path class="ln-thick" d="M78 32v22M142 32v22"/>
    <g class="a-amate2">${calendarGrid()}</g>
    <circle class="a-maiz ln" cx="132" cy="108" r="11"/>
    <path class="ln" d="M127 108l4 4 7-8"/>
    <circle class="a-maiz ln" cx="200" cy="54" r="15"/>
    <path class="ln" d="M200 28v-8M200 88v-8M226 54h8M174 54h-8M218 36l6-6M218 72l6 6M182 36l-6-6"/>`,
  },
  {
    id: "ball", group: "leisure", label: "Torneo deportivo",
    draw: `
    <ellipse class="a-shadow" cx="128" cy="154" rx="56" ry="8"/>
    <path class="ln" d="M58 82H30M60 102H24M64 122H38"/>
    <circle class="a-estraza ln" cx="128" cy="100" r="48"/>
    <path class="a-ink" d="M128 80l19 14-7 22h-24l-7-22z"/>
    <path class="ln" d="M128 52v28M147 94l27-9M140 116l17 22M116 116l-17 22M109 94l-27-9"/>
    <path class="a-ink" d="M164 70l10 14-6 4-12-10zM92 70l-10 14 6 4 12-10z" opacity=".9"/>`,
  },
  {
    id: "laptop", group: "custodia", label: "Laptop",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="92" ry="8"/>
    <rect class="a-ink" x="58" y="40" width="124" height="82" rx="8"/>
    <rect class="a-anil" x="66" y="48" width="108" height="66" rx="3"/>
    <path class="a-anil-soft" d="M72 56h44v6H72zM72 68h70v4H72zM72 78h56v4H72z" opacity=".75"/>
    <path class="a-amate2 ln" d="M36 124h168l-12 22H48z"/>
    <path class="ln" d="M104 132h32"/>
    ${custodiaTag(208, 88, 14)}`,
  },
  {
    id: "monitor", group: "custodia", label: "Monitor",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="156" rx="84" ry="8"/>
    <rect class="a-ink" x="46" y="32" width="142" height="94" rx="8"/>
    <rect class="a-anil" x="54" y="40" width="126" height="76" rx="3"/>
    <path class="a-anil-soft" d="M62 50h50v7H62zM62 64h80v4H62zM62 74h64v4H62z" opacity=".75"/>
    <path class="a-amate2 ln" d="M106 126l-6 20h34l-6-20z"/>
    <path class="ln-thick" d="M84 148h66"/>
    ${custodiaTag(210, 96, 12)}`,
  },
  {
    id: "phone", group: "custodia", label: "Celular",
    draw: `
    <ellipse class="a-shadow" cx="120" cy="158" rx="60" ry="8"/>
    <rect class="a-ink" x="86" y="22" width="68" height="132" rx="13"/>
    <rect class="a-anil" x="93" y="34" width="54" height="104" rx="5"/>
    <path class="a-anil-soft" d="M100 46h30v6h-30zM100 58h40v4h-40zM100 68h34v4h-34z" opacity=".75"/>
    <path class="a-on-dark" d="M110 144h20v3h-20z"/>
    ${custodiaTag(180, 96, 12)}`,
  },
];

export const SYSTEM_ART = {
  closed: `
    <ellipse class="a-shadow" cx="120" cy="160" rx="96" ry="8"/>
    <path class="a-cacao ln" d="M34 70h172v88H34z"/>
    <path class="a-amate2 ln" d="M44 80h152v78H44z"/>
    <path class="ln" d="M44 92h152M44 104h152M44 116h152M44 128h152M44 140h152"/>
    <path class="a-grana ln" d="M26 34h188v30c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12c0 8-8 12-16 12s-16-4-16-12z"/>
    <path class="a-estraza" d="M58 36h24v28H58zM114 36h24v28h-24zM170 36h24v28h-24z" opacity=".9"/>
    <path class="ln" d="M100 78l20-16 20 16"/>
    <g transform="rotate(-8 120 104)"><rect class="a-estraza ln" x="78" y="80" width="84" height="40" rx="6"/><text class="sign-text" x="120" y="107" text-anchor="middle">Cerrado</text></g>`,
};
