export const SHEET_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261113_115509_577e7e29-0e80-43e6-93ac-e6cf71972818.png&w=3200&q=85';

export interface Colourway {
  row: number;
  name: 'Peach' | 'Pink' | 'Sage' | 'Butter';
  hex: string;
  swatchNote: string;
}

export const COLOURWAYS: Colourway[] = [
  { row: 0, name: 'Peach', hex: '#FEDBDA', swatchNote: 'Sun-washed mineral peach' },
  { row: 1, name: 'Pink', hex: '#FCB7CC', swatchNote: 'Soft blossom rose' },
  { row: 2, name: 'Sage', hex: '#C8C997', swatchNote: 'Muted garden sage' },
  { row: 3, name: 'Butter', hex: '#F5B55A', swatchNote: 'Warm churned butter' },
];

export interface GarmentProduct {
  id: string;
  col: number;
  kind: string;
  shortLabel: string;
  category: string;
  ageRange: string;
  description: string;
  editorialNote: string;
  price: number;
  sizes: string[];
  defaultSize: string;
  fabric: string;
  care: string;
  fit: string;
  details: string[];
}

export const PRODUCTS: GarmentProduct[] = [
  {
    id: 'dungarees',
    col: 0,
    kind: 'Dungarees',
    shortLabel: 'DUNGAREES',
    category: 'Dungarees · Ages 1–5',
    ageRange: 'Ages 1–5',
    description:
      'Washed cotton twill with a bib pocket, adjustable straps and rolled-up cuffs.',
    editorialNote:
      'Cut with generous room through the seat and knee so little climbers can crouch, stretch and grow across two seasons.',
    price: 68,
    sizes: ['1–2Y', '2–3Y', '3–4Y', '4–5Y'],
    defaultSize: '2–3Y',
    fabric: '100% GOTS-certified organic cotton twill (280 gsm)',
    care: 'Machine wash cold with similar colours, reshape and dry flat.',
    fit: 'Relaxed straight leg with turn-up cuffs and two-stage strap buttons.',
    details: [
      'Deep front bib pocket sized for pebbles and treasures',
      'Corozo-nut buttons with two strap length settings',
      'Reinforced double-stitched knees built to hand down',
      'Garment-washed for lived-in softness from day one',
    ],
  },
  {
    id: 'romper',
    col: 1,
    kind: 'Romper',
    shortLabel: 'ROMPER',
    category: 'Romper · Ages 1–3',
    ageRange: 'Ages 1–3',
    description:
      'Soft knit in organic cotton, with wooden shoulder buttons and snaps for easy changes.',
    editorialNote:
      'Our signature one-piece knit breathes easily over a bare tummy in summer or layers neatly over our long-sleeve tee when mornings turn crisp.',
    price: 54,
    sizes: ['1–2Y', '2–3Y'],
    defaultSize: '1–2Y',
    fabric: '100% GOTS-certified organic combed cotton fine rib knit',
    care: 'Gentle machine wash at 30°C inside a mesh bag, dry flat.',
    fit: 'Softly rounded silhouette with flexible ribbed leg openings.',
    details: [
      'Smooth olive-wood shoulder buttons for effortless dressing',
      'Nickel-free tonal snap gusset for quick nappy changes',
      'Tagless neckline stitched flat against sensitive skin',
      'Pre-shrunk organic yarn that keeps its recovery wash after wash',
    ],
  },
  {
    id: 'tee',
    col: 2,
    kind: 'Tee',
    shortLabel: 'TEE',
    category: 'Long-sleeve tee · Ages 1–6',
    ageRange: 'Ages 1–6',
    description:
      'Heavyweight organic jersey with a little chest pocket and ribbed cuffs.',
    editorialNote:
      'Knitted slightly denser than standard jersey so it drapes cleanly, resists twisting in the wash and stands up to daily playground wear.',
    price: 38,
    sizes: ['1–2Y', '2–3Y', '3–4Y', '4–5Y', '5–6Y'],
    defaultSize: '3–4Y',
    fabric: '100% GOTS-certified organic cotton interlock jersey (220 gsm)',
    care: 'Machine wash cold, tumble dry low or line dry in shade.',
    fit: 'Easy boxy cut with dropped shoulders and snug ribbed wrists.',
    details: [
      'Single patch chest pocket stitched with tonal bar tacks',
      'Soft 1×1 ribbed neckline that never pinches or bags out',
      'Stay-put ribbed cuffs that push up easily for painting',
      'Low-impact garment dye for gentle, muted colour depth',
    ],
  },
  {
    id: 'cardigan',
    col: 3,
    kind: 'Cardigan',
    shortLabel: 'CARDIGAN',
    category: 'Cardigan · Ages 1–6',
    ageRange: 'Ages 1–6',
    description:
      'Chunky hand-feel knit with wooden buttons, made for layering on cool mornings.',
    editorialNote:
      'Lofty fisherman-stitch organic cotton delivers wool-like warmth without a hint of itch—soft enough for naps and sturdy enough for coastal walks.',
    price: 76,
    sizes: ['1–2Y', '2–3Y', '3–4Y', '4–5Y', '5–6Y'],
    defaultSize: '3–4Y',
    fabric: '100% GOTS-certified organic cotton 5-gauge chunky knit',
    care: 'Cold hand wash or wool cycle, reshape and dry flat.',
    fit: 'Cosy relaxed layer designed to sit comfortably over tees and rompers.',
    details: [
      'Chunky textured rib knit with plush, breathable loft',
      'Smooth matte wooden buttons sized for small learning fingers',
      'Generous fold-back cuffs that grow with long arms',
      'Zero synthetic blends or scratchy fibres',
    ],
  },
  {
    id: 'bucket-hat',
    col: 4,
    kind: 'Bucket hat',
    shortLabel: 'BUCKET HAT',
    category: 'Bucket hat · Ages 1–6',
    ageRange: 'Ages 1–6',
    description:
      'Garment-dyed cotton canvas with a soft brim that folds into any pocket.',
    editorialNote:
      'Structured with concentric topstitching so the brim shades eyes and necks without ever flopping into view, then packs completely flat in a tote.',
    price: 32,
    sizes: ['1–2Y', '2–4Y', '4–6Y'],
    defaultSize: '2–4Y',
    fabric: '100% GOTS-certified organic cotton brushed canvas (240 gsm)',
    care: 'Machine wash cold, reshape brim while damp and air dry.',
    fit: 'Soft crown with gentle inner cotton sweatband for all-day comfort.',
    details: [
      'Multi-row stitched brim holds a gentle sun-shielding curve',
      'Unlined breathable crown with neat taped interior seams',
      'Crushable and packable without permanent creasing',
      'Garment-dyed in matching LUNO® palette tones',
    ],
  },
];

export interface RingPieceConfig {
  ringIndex: number;
  col: number;
  startRow: number;
}

// Exact ring order from specification (0..5) so neighbours never share a colour
export const RING_PIECES: RingPieceConfig[] = [
  { ringIndex: 0, col: 1, startRow: 0 }, // 01: Peach Romper
  { ringIndex: 1, col: 2, startRow: 1 }, // 02: Pink Tee
  { ringIndex: 2, col: 0, startRow: 2 }, // 03: Sage Dungarees
  { ringIndex: 3, col: 3, startRow: 3 }, // 04: Butter Cardigan
  { ringIndex: 4, col: 4, startRow: 1 }, // 05: Pink Bucket hat
  { ringIndex: 5, col: 3, startRow: 2 }, // 06: Sage Cardigan
];

export function getProductByCol(col: number): GarmentProduct {
  return PRODUCTS.find((p) => p.col === col) || PRODUCTS[0];
}

export function getColourByRow(row: number): Colourway {
  return COLOURWAYS.find((c) => c.row === row) || COLOURWAYS[0];
}

export function getGarmentTitle(col: number, row: number): string {
  const product = getProductByCol(col);
  const colour = getColourByRow(row);
  return `${colour.name} ${product.kind}`;
}

export function getSpritePosition(col: number, row: number): string {
  return `${col * 25}% ${row * 33.333}%`;
}

export interface SizeChartRow {
  size: string;
  ageLabel: string;
  heightCm: [number, number];
  chestCm: [number, number];
  waistCm: [number, number];
  headCm: [number, number];
  fitNote: string;
}

export const SIZE_CHART: SizeChartRow[] = [
  {
    size: '1–2Y',
    ageLabel: '12–24 months',
    heightCm: [80, 92],
    chestCm: [49, 52],
    waistCm: [48, 50],
    headCm: [46, 48],
    fitNote: 'Extra nappy room through seat',
  },
  {
    size: '2–3Y',
    ageLabel: '2–3 years',
    heightCm: [92, 98],
    chestCm: [52, 54],
    waistCm: [50, 52],
    headCm: [48, 50],
    fitNote: 'Relaxed everyday toddler cut',
  },
  {
    size: '3–4Y',
    ageLabel: '3–4 years',
    heightCm: [98, 104],
    chestCm: [54, 56],
    waistCm: [52, 53],
    headCm: [50, 51],
    fitNote: 'Room to layer over tees',
  },
  {
    size: '4–5Y',
    ageLabel: '4–5 years',
    heightCm: [104, 110],
    chestCm: [56, 58],
    waistCm: [53, 55],
    headCm: [51, 52],
    fitNote: 'Longer cuff allowance for growth',
  },
  {
    size: '5–6Y',
    ageLabel: '5–6 years',
    heightCm: [110, 118],
    chestCm: [58, 61],
    waistCm: [55, 57],
    headCm: [52, 54],
    fitNote: 'Easy straight proportions',
  },
];

export const FREE_SHIPPING_THRESHOLD = 120;
export const STANDARD_SHIPPING_COST = 9;
