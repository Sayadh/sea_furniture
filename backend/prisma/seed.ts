/* eslint-disable no-console */
/**
 * Seed script — sample catalog, services, FAQ, portfolio, settings and the first admin.
 * Idempotent: re-running updates catalog records by slug and never overwrites admin-edited settings.
 *
 * Required env: DATABASE_URL (or DB_* variables, see scripts/with-db.cjs), SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 * Optional env: SEED_ADMIN_NAME, SEED_ADMIN_RESET_PASSWORD=true
 */
import { PrismaClient, ProductAvailability, PortfolioImageKind } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();
const img = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const categories = [
  {
    slug: 'bazmocner',
    name: 'Բազմոցներ',
    description: 'Ուղիղ, անկյունային և ծալովի բազմոցներ՝ բնական և դիմացկուն կտորներով, ամուր փայտե կարկասով։',
    image: '1555041469-a586c61ea9bc',
    seoTitle: 'Բազմոցներ Երևանում — ուղիղ և անկյունային բազմոցներ',
    seoDescription: 'Գնեք բազմոց Երևանում՝ առկա և պատվերով մոդելներ, որակյալ կտորներ, ամուր կարկաս և առաքում ամբողջ Հայաստանում։',
  },
  {
    slug: 'bazkatorner',
    name: 'Բազկաթոռներ',
    description: 'Հարմարավետ բազկաթոռներ հյուրասենյակի, ննջասենյակի և աշխատասենյակի համար։',
    image: '1567538096630-e0c55bd6374c',
    seoTitle: 'Բազկաթոռներ — փափուկ և դասական բազկաթոռներ',
    seoDescription: 'Փափուկ բազկաթոռներ ժամանակակից և դասական ոճով։ Ընտրեք պատրաստի մոդել կամ պատվիրեք ձեր նախընտրած կտորով։',
  },
  {
    slug: 'atorner',
    name: 'Աթոռներ',
    description: 'Փափուկ նստատեղով աթոռներ խոհանոցի, ճաշասենյակի և սրճարանի համար։',
    image: '1592078615290-033ee584e267',
    seoTitle: 'Աթոռներ — փափուկ աթոռներ ճաշասենյակի և խոհանոցի համար',
    seoDescription: 'Ճաշասենյակի և խոհանոցի փափուկ աթոռներ, բարձր աթոռներ և ժամանակակից մոդելներ մատչելի գներով։',
  },
  {
    slug: 'nnjasenyaki-kahuyq',
    name: 'Ննջասենյակի կահույք',
    description: 'Փափուկ գլխամասով մահճակալներ և նստարաններ հանգիստ ու գեղեցիկ ննջասենյակի համար։',
    image: '1505693416388-ac5ce068fe85',
    seoTitle: 'Ննջասենյակի կահույք — փափուկ մահճակալներ',
    seoDescription: 'Փափուկ գլխամասով մահճակալներ և ննջասենյակի կահույք՝ պատրաստված ձեր չափսերով և նախընտրած կտորով։',
  },
  {
    slug: 'hyurasenyaki-kahuyq',
    name: 'Հյուրասենյակի կահույք',
    description: 'Ամբողջական լուծումներ հյուրասենյակի համար՝ բազմոց, բազկաթոռներ և լրացուցիչ տարրեր մեկ ոճով։',
    image: '1618220179428-22790b461013',
    seoTitle: 'Հյուրասենյակի կահույք — փափուկ կահույքի հավաքածուներ',
    seoDescription: 'Հյուրասենյակի փափուկ կահույքի հավաքածուներ՝ ներդաշնակ ոճով, որակյալ նյութերով և անհատական մոտեցմամբ։',
  },
  {
    slug: 'patverov-kahuyq',
    name: 'Պատվերով կահույք',
    description: 'Պատրաստում ենք փափուկ կահույք ձեր չափսերով, ձևով և կտորով՝ դիզայնից մինչև տեղադրում։',
    image: '1631679706909-1844bbd07221',
    seoTitle: 'Պատվերով կահույք — փափուկ կահույք ձեր չափսերով',
    seoDescription: 'Պատվերով փափուկ կահույք Երևանում․ անհատական չափսեր, կտորի լայն ընտրություն և արտադրություն մեր արտադրամասում։',
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  oldPrice?: number;
  dimensions: string;
  material: string;
  color: string;
  availability: ProductAvailability;
  stockQuantity: number;
  productionTime?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  images: string[];
};

const products: SeedProduct[] = [
  {
    slug: 'verona-tavshya-bazmoc',
    name: '«Վերոնա» թավշյա եռատեղ բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-001',
    shortDescription: 'Զմրուխտ կանաչ թավիշ, փափուկ նստատեղ և փայտե ոտքեր՝ ժամանակակից հյուրասենյակի համար։',
    description:
      '«Վերոնա» բազմոցը համադրում է նուրբ թավիշը և դասական գծերը։ Նստատեղը պատրաստված է բարձր խտության սպունգից, որը երկար տարիներ պահպանում է ձևը, իսկ կարկասը՝ չորացված բուկի փայտից։\n\nԲազմոցը հարմար է թե՛ ամենօրյա հանգստի, թե՛ հյուրեր ընդունելու համար։ Կարող ենք պատրաստել նաև այլ գույնով կամ չափսով։',
    price: 420000,
    oldPrice: 480000,
    dimensions: '220 × 92 × 85 սմ',
    material: 'Թավիշ, բուկի փայտ, բարձր խտության սպունգ',
    color: 'Զմրուխտ կանաչ',
    availability: 'IN_STOCK',
    stockQuantity: 3,
    isFeatured: true,
    images: ['1555041469-a586c61ea9bc', '1550254478-ead40cc54513'],
  },
  {
    slug: 'london-kashve-bazmoc',
    name: '«Լոնդոն» կաշվե բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-002',
    shortDescription: 'Բնական կաշի, կոնյակագույն երանգ և ընդարձակ նստատեղ՝ պրեմիում ինտերիերի համար։',
    description:
      '«Լոնդոն» բազմոցը պատրաստված է բնական կաշուց, որը տարիների ընթացքում ձեռք է բերում ազնիվ փայլ։ Լայն բազկակալները և խորը նստատեղը ստեղծում են իսկական հարմարավետություն։\n\nԿարկասը ամրացված է մետաղական տարրերով, իսկ ոտքերը՝ պատրաստված ընկուզենու փայտից։',
    price: 650000,
    dimensions: '240 × 98 × 82 սմ',
    material: 'Բնական կաշի, ընկուզենու փայտ',
    color: 'Կոնյակ',
    availability: 'IN_STOCK',
    stockQuantity: 1,
    isFeatured: true,
    isNew: true,
    images: ['1540574163026-643ea20ade25'],
  },
  {
    slug: 'nord-bazmoc',
    name: '«Նորդ» սկանդինավյան բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-003',
    shortDescription: 'Պարզ գծեր, բաց մոխրագույն կտոր և հանվող բարձեր՝ հեշտ խնամքով։',
    description:
      'Սկանդինավյան ոճի «Նորդ» բազմոցը հարմար է ինչպես փոքր բնակարանների, այնպես էլ ընդարձակ հյուրասենյակների համար։ Բարձերի պատյանները հանվում են և կարելի է լվանալ։\n\nՊատրաստվում է պատվերով՝ ձեր ընտրած կտորով և չափսերով։',
    price: 310000,
    dimensions: '200 × 88 × 84 սմ',
    material: 'Կտոր՝ շենիլ, սոճու կարկաս',
    color: 'Բաց մոխրագույն',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '14–21 աշխատանքային օր',
    images: ['1484101403633-562f891dc89a'],
  },
  {
    slug: 'amalfi-kapitone-bazmoc',
    name: '«Ամալֆի» կապիտոնե բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-004',
    shortDescription: 'Կապիտոնե թիկնակ և նրբագեղ ձև՝ դասական և ժամանակակից ինտերիերների համար։',
    description:
      '«Ամալֆի» բազմոցի կապիտոնե թիկնակը ձեռքով է պատրաստվում մեր վարպետների կողմից։ Կտորը դիմացկուն է մաշվածության նկատմամբ և հեշտությամբ մաքրվում է։',
    price: 365000,
    dimensions: '210 × 90 × 86 սմ',
    material: 'Կտոր՝ վելյուր, բուկի փայտ',
    color: 'Մոխրագույն',
    availability: 'IN_STOCK',
    stockQuantity: 2,
    isNew: true,
    images: ['1493663284031-b7e3aefcae8e'],
  },
  {
    slug: 'komfort-ankyunayin-bazmoc',
    name: '«Կոմֆորտ» անկյունային բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-005',
    shortDescription: 'Ընդարձակ անկյունային բազմոց ամբողջ ընտանիքի համար՝ ձախ կամ աջ անկյունով։',
    description:
      '«Կոմֆորտ» անկյունային բազմոցը ստեղծված է մեծ ընտանիքների և հյուրընկալ տների համար։ Անկյունի կողմը ընտրում եք պատվիրելիս, իսկ չափսերը կարող ենք հարմարեցնել ձեր սենյակին։\n\nՆերառված են դեկորատիվ բարձեր նույն կամ հակադիր կտորով։',
    price: 580000,
    oldPrice: 640000,
    dimensions: '290 × 180 × 85 սմ',
    material: 'Կտոր՝ միկրովելյուր, փայտե կարկաս, զսպանակային բլոկ',
    color: 'Բեժ',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '21–30 աշխատանքային օր',
    isFeatured: true,
    images: ['1616486338812-3dadae4b4ace', '1631679706909-1844bbd07221'],
  },
  {
    slug: 'sienna-erkteg-bazmoc',
    name: '«Սիեննա» երկտեղ բազմոց',
    category: 'bazmocner',
    sku: 'SF-SOF-006',
    shortDescription: 'Կոմպակտ երկտեղ բազմոց տերակոտա երանգով՝ փոքր տարածքների համար։',
    description:
      '«Սիեննա»-ն վառ շեշտադրում է ցանկացած ինտերիերում։ Կոմպակտ չափսերը թույլ են տալիս տեղադրել այն նույնիսկ միջանցքում կամ աշխատասենյակում։',
    price: 245000,
    dimensions: '160 × 85 × 82 սմ',
    material: 'Կտոր՝ բուկլե, բուկի ոտքեր',
    color: 'Տերակոտա',
    availability: 'IN_STOCK',
    stockQuantity: 4,
    isNew: true,
    images: ['1567016432779-094069958ea5'],
  },
  {
    slug: 'viktoria-kapitone-bazkator',
    name: '«Վիկտորիա» կապիտոնե բազկաթոռ',
    category: 'bazkatorner',
    sku: 'SF-ARM-001',
    shortDescription: 'Սպիտակ կապիտոնե բազկաթոռ փորագրված ոտքերով՝ նրբագեղ դասական ոճ։',
    description:
      '«Վիկտորիա» բազկաթոռը կզարդարի ննջասենյակը, հյուրասենյակը կամ զգեստապահարանի անկյունը։ Կապիտոնե թիկնակը և փորագրված ոտքերը ստեղծում են դասական, բայց թեթև տեսք։',
    price: 145000,
    dimensions: '72 × 70 × 98 սմ',
    material: 'Կտոր՝ վելյուր, բուկի փայտ',
    color: 'Կաթնասպիտակ',
    availability: 'IN_STOCK',
    stockQuantity: 2,
    isFeatured: true,
    images: ['1567538096630-e0c55bd6374c'],
  },
  {
    slug: 'soley-bazkator',
    name: '«Սոլեյ» բազկաթոռ',
    category: 'bazkatorner',
    sku: 'SF-ARM-002',
    shortDescription: 'Մանանեխագույն բազկաթոռ, որը լույս ու ջերմություն է բերում սենյակին։',
    description:
      '«Սոլեյ» բազկաթոռի ընդգծված ձևը և վառ գույնը այն դարձնում են ինտերիերի կենտրոնական տարր։ Իդեալական է ընթերցանության անկյան համար։',
    price: 128000,
    oldPrice: 150000,
    dimensions: '78 × 80 × 90 սմ',
    material: 'Կտոր՝ թավիշ, մետաղական ոտքեր',
    color: 'Մանանեխագույն',
    availability: 'IN_STOCK',
    stockQuantity: 5,
    images: ['1586023492125-27b2c045efd7'],
  },
  {
    slug: 'grand-bazkator',
    name: '«Գրանդ» բարձր թիկնակով բազկաթոռ',
    category: 'bazkatorner',
    sku: 'SF-ARM-003',
    shortDescription: 'Բարձր թիկնակ, ամուր փայտե հիմք և դիմացկուն կտոր՝ երկար հանգստի համար։',
    description:
      '«Գրանդ» բազկաթոռի բարձր թիկնակը ապահովում է մեջքի և պարանոցի ճիշտ հենարան։ Պատրաստվում է պատվերով՝ ձեր ընտրած կտորով։',
    price: 165000,
    dimensions: '68 × 72 × 112 սմ',
    material: 'Կտոր՝ ռոգոժկա, կաղնու փայտ',
    color: 'Մոխրագույն',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '10–14 աշխատանքային օր',
    isNew: true,
    images: ['1598300042247-d088f8ab3a91'],
  },
  {
    slug: 'oslo-ator',
    name: '«Օսլո» աթոռ',
    category: 'atorner',
    sku: 'SF-CHR-001',
    shortDescription: 'Էկոկաշվե նստատեղ և բնական փայտե ոտքեր՝ խոհանոցի և ճաշասենյակի համար։',
    description:
      '«Օսլո» աթոռը թեթև է, ամուր և հեշտ խնամվող։ Էկոկաշվե նստատեղը մաքրվում է խոնավ անձեռոցիկով, իսկ փայտե ոտքերը մշակված են պաշտպանիչ լաքով։',
    price: 32000,
    dimensions: '48 × 52 × 83 սմ',
    material: 'Էկոկաշի, բուկի փայտ',
    color: 'Սև',
    availability: 'IN_STOCK',
    stockQuantity: 24,
    images: ['1592078615290-033ee584e267'],
  },
  {
    slug: 'milano-pap-ator',
    name: '«Միլանո» փափուկ աթոռ',
    category: 'atorner',
    sku: 'SF-CHR-002',
    shortDescription: 'Փափուկ, ամբողջովին պաստառապատ աթոռ՝ պտտվող հիմքով։',
    description:
      '«Միլանո» աթոռը հարմար է ինչպես ճաշասենյակի, այնպես էլ տնային աշխատասենյակի համար։ Պտտվող հիմքը և փափուկ նստատեղը ապահովում են հարմարավետություն ամբողջ օրվա ընթացքում։',
    price: 54000,
    dimensions: '52 × 56 × 86 սմ',
    material: 'Կտոր՝ շենիլ, մետաղական հիմք',
    color: 'Ավազագույն',
    availability: 'IN_STOCK',
    stockQuantity: 10,
    isNew: true,
    images: ['1580480055273-228ff5388ef8'],
  },
  {
    slug: 'loft-bardz-ator',
    name: '«Լոֆթ» բարձր աթոռ',
    category: 'atorner',
    sku: 'SF-CHR-003',
    shortDescription: 'Բարձր աթոռ բար-սեղանի և կղզյակի համար՝ ոտքի հենարանով։',
    description: '«Լոֆթ» բարձր աթոռը համադրում է պլաստիկ նստատեղը և փայտե ոտքերը։ Կայուն է, թեթև և հեշտ տեղափոխվող։',
    price: 38000,
    dimensions: '46 × 50 × 105 սմ',
    material: 'Պլաստիկ, բուկի փայտ, մետաղ',
    color: 'Սև',
    availability: 'IN_STOCK',
    stockQuantity: 8,
    images: ['1581539250439-c96689b516dd'],
  },
  {
    slug: 'emerald-tavshya-ator',
    name: '«Էմերալդ» թավշյա աթոռ',
    category: 'atorner',
    sku: 'SF-CHR-004',
    shortDescription: 'Թավշյա աթոռ ոսկեգույն ոտքերով՝ տոնական ճաշասենյակի համար։',
    description:
      '«Էմերալդ» աթոռները հաճախ պատվիրվում են 4, 6 կամ 8 հատանոց հավաքածուներով։ Թավիշը դիմացկուն է, իսկ ոտքերը ծածկված են ոսկեգույն փոշեներկով։',
    price: 46000,
    dimensions: '50 × 55 × 88 սմ',
    material: 'Թավիշ, մետաղ',
    color: 'Մուգ կանաչ',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '7–10 աշխատանքային օր',
    isFeatured: true,
    images: ['1617806118233-18e1de247200'],
  },
  {
    slug: 'royal-pap-mahchakal',
    name: '«Ռոյալ» մահճակալ փափուկ գլխամասով',
    category: 'nnjasenyaki-kahuyq',
    sku: 'SF-BED-001',
    shortDescription: 'Բարձր կապիտոնե գլխամաս և պահեստային տարածք՝ 160×200 սմ ներքնակի համար։',
    description:
      '«Ռոյալ» մահճակալը ննջասենյակին տալիս է հյուրանոցային շքեղություն։ Բարձրացող հիմքի տակ կա ընդարձակ պահեստային տարածք։\n\nՀասանելի է 140×200, 160×200 և 180×200 սմ չափսերով։',
    price: 390000,
    dimensions: '176 × 215 × 130 սմ',
    material: 'Կտոր՝ վելյուր, ԴՍՊ, սոճու կարկաս',
    color: 'Բաց բեժ',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '14–21 աշխատանքային օր',
    isFeatured: true,
    images: ['1505693416388-ac5ce068fe85'],
  },
  {
    slug: 'skandi-mahchakal',
    name: '«Սկանդի» մահճակալ',
    category: 'nnjasenyaki-kahuyq',
    sku: 'SF-BED-002',
    shortDescription: 'Լակոնիկ փափուկ մահճակալ ցածր գլխամասով՝ հանգիստ ու լուսավոր ննջասենյակի համար։',
    description: '«Սկանդի» մահճակալը պարզ ու հարմար լուծում է ժամանակակից ննջասենյակի համար։ Գլխամասի կտորը հեշտ մաքրվող է։',
    price: 285000,
    dimensions: '170 × 210 × 100 սմ',
    material: 'Կտոր՝ շենիլ, սոճու կարկաս',
    color: 'Մոխրագույն',
    availability: 'IN_STOCK',
    stockQuantity: 2,
    images: ['1522771739844-6a9f6d5f14af'],
  },
  {
    slug: 'boho-hyurasenyaki-havaqacu',
    name: '«Բոհո» հյուրասենյակի հավաքածու',
    category: 'hyurasenyaki-kahuyq',
    sku: 'SF-SET-001',
    shortDescription: 'Բազմոց և երկու բազկաթոռ մեկ ոճով՝ ջերմ, բնական երանգներով։',
    description:
      '«Բոհո» հավաքածուն ներառում է եռատեղ բազմոց և երկու բազկաթոռ։ Կտորը և գույները կարող եք ընտրել մեր նմուշներից, իսկ դիզայները կօգնի ներդաշնակեցնել դրանք ձեր ինտերիերի հետ։',
    price: 890000,
    dimensions: 'Բազմոց՝ 220 × 90 սմ, բազկաթոռ՝ 80 × 78 սմ',
    material: 'Կտոր՝ բուկլե և թավիշ, բուկի փայտ',
    color: 'Նարնջագույն և կաթնագույն',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '21–30 աշխատանքային օր',
    images: ['1618220179428-22790b461013', '1556228453-efd6c1ff04f6'],
  },
  {
    slug: 'patverov-bazmoc-dzer-chapserov',
    name: 'Պատվերով բազմոց ձեր չափսերով',
    category: 'patverov-kahuyq',
    sku: 'SF-CUS-001',
    shortDescription: 'Ընտրեք ձևը, չափսերը, կտորը և լցոնումը․ մենք կպատրաստենք բազմոց հենց ձեր տան համար։',
    description:
      'Մեր դիզայները անվճար կչափագրի տարածքը, կառաջարկի կտորի նմուշներ և կպատրաստի էսքիզ։ Նշված գինը սկզբնական է․ վերջնական արժեքը կախված է չափսերից և նյութերից։\n\nՊատվիրեք խորհրդատվություն, և մենք կկապնվենք ձեզ հետ նույն օրը։',
    price: 300000,
    dimensions: 'Ըստ ձեր չափսերի',
    material: 'Ըստ ընտրության',
    color: 'Ըստ ընտրության',
    availability: 'MADE_TO_ORDER',
    stockQuantity: 0,
    productionTime: '21–35 աշխատանքային օր',
    images: ['1631679706909-1844bbd07221'],
  },
];

const services = [
  {
    slug: 'pap-kahuyqi-veranorogum',
    title: 'Փափուկ կահույքի վերանորոգում',
    shortDescription: 'Բազմոցների, բազկաթոռների և աթոռների համալիր վերանորոգում՝ կարկասից մինչև պաստառ։',
    description:
      'Փափուկ կահույքի վերանորոգումը հաճախ ավելի խնայողական է, քան նորի գնումը։ Մենք գնահատում ենք կահույքի վիճակը, առաջարկում լավագույն լուծումը և վերականգնում այն այնպես, որ այն ծառայի ևս երկար տարիներ։\n\nԱշխատանքների մեջ մտնում են կարկասի ամրացումը, սպունգի և զսպանակների փոխարինումը, նոր պաստառապատումը և դեկորատիվ տարրերի վերականգնումը։',
    priceFrom: 30000,
    duration: '3–10 աշխատանքային օր',
    image: '1600210492486-724fe5c67fb0',
    seoTitle: 'Փափուկ կահույքի համալիր վերանորոգում Երևանում',
    seoDescription: 'Կահույքի վերանորոգում Երևանում․ բազմոցների, բազկաթոռների և աթոռների վերապաստառում, սպունգի և կարկասի վերանորոգում։',
  },
  {
    slug: 'bazmoci-veranorogum',
    title: 'Բազմոցի վերանորոգում',
    shortDescription: 'Վերապաստառում, զսպանակային բլոկի և սպունգի փոխարինում, ծալովի մեխանիզմի վերանորոգում։',
    description:
      'Բազմոցի վերանորոգումը սկսվում է անվճար գնահատումից։ Վարպետը կնայի կարկասը, մեխանիզմը և լցոնումը, որից հետո կստանաք հստակ գին և ժամկետ։\n\nԿարող ենք վերցնել բազմոցը ձեր հասցեից և վերադարձնել արդեն վերանորոգված։',
    priceFrom: 60000,
    duration: '5–10 աշխատանքային օր',
    image: '1567016432779-094069958ea5',
    seoTitle: 'Բազմոցի վերանորոգում Երևանում — վերապաստառում',
    seoDescription: 'Բազմոցի վերանորոգում Երևանում՝ վերապաստառում, մեխանիզմի և սպունգի փոխարինում։ Անվճար գնահատում և տեղափոխում։',
  },
  {
    slug: 'bazkatori-veranorogum',
    title: 'Բազկաթոռի վերանորոգում',
    shortDescription: 'Հին կամ սիրելի բազկաթոռին նոր կյանք՝ պահպանելով դրա բնօրինակ ձևը։',
    description:
      'Վերականգնում ենք ինչպես ժամանակակից, այնպես էլ դասական և անտիկ բազկաթոռներ։ Փոխարինում ենք լցոնումը, ամրացնում կարկասը և պաստառապատում ձեր ընտրած կտորով։',
    priceFrom: 35000,
    duration: '4–7 աշխատանքային օր',
    image: '1598300042247-d088f8ab3a91',
    seoTitle: 'Բազկաթոռի վերանորոգում Երևանում',
    seoDescription: 'Բազկաթոռի վերանորոգում և վերապաստառում Երևանում՝ դասական և ժամանակակից մոդելներ, կտորի լայն ընտրություն։ Անվճար գնահատում լուսանկարներով։',
  },
  {
    slug: 'atorneri-veranorogum',
    title: 'Աթոռների վերանորոգում',
    shortDescription: 'Ճաշասենյակի, գրասենյակի և սրճարանի աթոռների նստատեղի և թիկնակի վերապաստառում։',
    description:
      'Աթոռների վերանորոգումը ամենաարագ և մատչելի ձևն է թարմացնելու ինտերիերը։ Աշխատում ենք ինչպես առանձին աթոռների, այնպես էլ սրճարանների և ռեստորանների մեծ պատվերների հետ։',
    priceFrom: 8000,
    duration: '2–5 աշխատանքային օր',
    image: '1574180045827-681f8a1a9622',
    seoTitle: 'Աթոռների վերանորոգում և վերապաստառում Երևանում',
    seoDescription: 'Աթոռների վերանորոգում Երևանում՝ նստատեղի և թիկնակի վերապաստառում, կարկասի ամրացում, մեծածախ պատվերներ։',
  },
  {
    slug: 'pastari-poxarinum',
    title: 'Պաստառի փոխարինում',
    shortDescription: 'Ընտրեք նոր կտոր հարյուրավոր նմուշներից, իսկ մենք կվերապաստառենք ձեր կահույքը։',
    description:
      'Պաստառի փոխարինումը թույլ է տալիս ամբողջովին փոխել կահույքի տեսքը՝ պահպանելով դրա հուսալի կարկասը։ Կառաջարկենք դիմացկուն, հեշտ մաքրվող և հակաճանկային կտորներ։\n\nԳինը կախված է կահույքի չափսից և ընտրված կտորից, ուստի այն որոշվում է գնահատումից հետո։',
    priceFrom: null,
    duration: '3–7 աշխատանքային օր',
    image: '1600166898405-da9535204843',
    seoTitle: 'Կահույքի վերապաստառում Երևանում',
    seoDescription: 'Կահույքի վերապաստառում Երևանում՝ բազմոցներ, բազկաթոռներ և աթոռներ։ Հարյուրավոր կտորների նմուշներ, դիմացկուն և հեշտ մաքրվող նյութեր։',
  },
  {
    slug: 'spungi-poxarinum',
    title: 'Սպունգի և ներքին շերտերի փոխարինում',
    shortDescription: 'Նստած սպունգի, սինտեպոնի և զսպանակների փոխարինում՝ վերադարձնելով կահույքի նախկին հարմարավետությունը։',
    description:
      'Ժամանակի ընթացքում սպունգը կորցնում է առաձգականությունը, և կահույքը դառնում է անհարմար։ Օգտագործում ենք բարձր խտության, հիպոալերգեն սպունգ, որը պահպանում է ձևը տարիներ շարունակ։',
    priceFrom: 20000,
    duration: '2–5 աշխատանքային օր',
    image: '1452860606245-08befc0ff44b',
    seoTitle: 'Բազմոցի սպունգի փոխարինում Երևանում',
    seoDescription: 'Բազմոցի և բազկաթոռի սպունգի փոխարինում Երևանում՝ բարձր խտության սպունգ, սինտեպոն և զսպանակներ։ Անվճար գնահատում։',
  },
  {
    slug: 'karkasi-veranorogum',
    title: 'Կարկասի վերանորոգում',
    shortDescription: 'Կոտրված կամ ճռռացող կարկասի ամրացում և փայտե տարրերի փոխարինում։',
    description:
      'Կարկասը կահույքի հիմքն է։ Վերանորոգում ենք կոտրված ձողերը, փոխարինում վնասված փայտե մասերը և վերացնում ճռռոցը։ Աշխատանքից հետո կահույքը դառնում է նույնքան ամուր, որքան նոր։',
    priceFrom: null,
    duration: '3–8 աշխատանքային օր',
    image: '1530124566582-a618bc2615dc',
    seoTitle: 'Կահույքի կարկասի վերանորոգում Երևանում',
    seoDescription: 'Բազմոցի և բազկաթոռի կարկասի վերանորոգում Երևանում՝ ճռռոցի վերացում, փայտե տարրերի փոխարինում և ամրացում։',
  },
  {
    slug: 'kahuyqi-texapoxum',
    title: 'Կահույքի տեղափոխում',
    shortDescription: 'Կահույքի զգույշ տեղափոխում վերանորոգման համար կամ նոր հասցե։',
    description:
      'Կվերցնենք կահույքը ձեր հասցեից, կտեղափոխենք արտադրամաս և աշխատանքներից հետո կվերադարձնենք։ Կահույքը փաթեթավորվում է պաշտպանիչ թաղանթով։',
    priceFrom: 10000,
    duration: 'Նույն կամ հաջորդ օրը',
    image: '1616486338812-3dadae4b4ace',
    isActive: false,
    seoTitle: 'Կահույքի տեղափոխում Երևանում',
    seoDescription: 'Կահույքի զգույշ տեղափոխում Երևանում՝ փաթեթավորմամբ և բեռնումով։',
  },
];

const faqs = [
  {
    question: 'Որքա՞ն ժամանակ է տևում կահույքի վերանորոգումը։',
    answer:
      'Ժամկետը կախված է աշխատանքի ծավալից։ Աթոռների վերապաստառումը սովորաբար տևում է 2–5 օր, բազկաթոռներինը՝ 4–7 օր, իսկ բազմոցի ամբողջական վերանորոգումը՝ 5–10 աշխատանքային օր։ Ճշգրիտ ժամկետը կնշենք գնահատումից հետո։',
  },
  {
    question: 'Հնարավո՞ր է ընտրել կտորի գույնն ու տեսակը։',
    answer:
      'Այո։ Մենք ունենք հարյուրավոր կտորների նմուշներ՝ թավիշ, բուկլե, շենիլ, էկոկաշի, բնական կաշի և այլն։ Նմուշները կարող եք տեսնել մեր արտադրամասում, կամ մեր մասնագետը դրանք կբերի ձեր տուն։',
  },
  {
    question: 'Ունե՞ք առաքում։',
    answer:
      'Այո, առաքում ենք ամբողջ Երևանում և Հայաստանի մարզերում։ Երևանում առաքումը կազմակերպում ենք 1–3 օրվա ընթացքում, իսկ մարզերում ժամկետը և արժեքը համաձայնեցնում ենք պատվերը հաստատելիս։',
  },
  {
    question: 'Ինչպե՞ս է հաշվարկվում վերանորոգման գինը։',
    answer:
      'Գինը կախված է կահույքի չափսից, վիճակից, կատարվող աշխատանքներից և ընտրված կտորից։ Ուղարկեք կահույքի լուսանկարները կայքի ձևով կամ WhatsApp-ով, և մենք կտանք նախնական գին։ Վերջնական գինը հաստատվում է զննումից հետո։',
  },
  {
    question: 'Կահույքը վերցնո՞ւմ եք հաճախորդի հասցեից։',
    answer:
      'Այո, կարող ենք վերցնել կահույքը ձեր հասցեից և աշխատանքներից հետո վերադարձնել։ Տեղափոխման արժեքը կախված է հասցեից և կահույքի չափսերից։',
  },
  {
    question: 'Հնարավո՞ր է պատվիրել անհատական չափսերով կահույք։',
    answer:
      'Իհարկե։ Պատրաստում ենք բազմոցներ, բազկաթոռներ, մահճակալներ և աթոռներ ձեր չափսերով։ Մեր մասնագետը կչափագրի տարածքը, կօգնի ընտրել ձևն ու կտորը և կպատրաստի էսքիզ։',
  },
  {
    question: 'Ինչպե՞ս կարող եմ պատվեր կատարել։',
    answer:
      'Ավելացրեք ապրանքը զամբյուղ և լրացրեք պատվերի ձևը, կամ զանգահարեք և գրեք մեզ WhatsApp-ով։ Պատվերն ստանալուց հետո մեր մենեջերը կկապնվի ձեզ հետ՝ մանրամասները և առաքման ժամը ճշտելու համար։ Վճարումը կատարվում է ապրանքը ստանալիս։',
  },
  {
    question: 'Որտե՞ղ գնել որակյալ կահույք Երևանում։',
    answer:
      'Sea Furniture-ը փափուկ կահույք է պատրաստում իր արտադրամասում Երևանում։ Կարող եք ընտրել պատրաստի մոդել կատալոգից կամ պատվիրել կահույք ձեր չափսերով։ Պատվեր կարող եք կատարել կայքից, հեռախոսով կամ WhatsApp-ով։',
  },
  {
    question: 'Առաքո՞ւմ եք կահույք Հայաստանի մարզեր։',
    answer:
      'Այո, առաքում ենք Հայաստանի բոլոր մարզերը, այդ թվում՝ Գյումրի, Վանաձոր, Աբովյան, Էջմիածին, Հրազդան և այլ քաղաքներ։ Մարզերի համար առաքման ժամկետը և արժեքը համաձայնեցնում ենք պատվերը հաստատելիս։',
  },
  {
    question: 'Ի՞նչ երաշխիք եք տալիս կահույքի համար։',
    answer:
      'Կահույքի կարկասի, մեխանիզմների և կարերի համար տալիս ենք մինչև 2 տարի երաշխիք։ Երաշխիքի պայմանները ճշտում ենք պատվերը ձևակերպելիս։',
  },
  {
    question: 'Ինչո՞վ է տարբերվում լավ բազմոցը էժանից։',
    answer:
      'Լավ բազմոցն ունի ամուր կարկաս, բարձր խտության սպունգ, դիմացկուն կտոր և որակյալ կարեր։ Այդպիսի բազմոցը տարիներով պահպանում է ձևն ու հարմարավետությունը, իսկ էժան մոդելները հաճախ արագ նստում և մաշվում են։',
  },
  {
    question: 'Ինչպե՞ս խնամել փափուկ կահույքը։',
    answer:
      'Պարբերաբար մաքրեք կահույքը փոշեկուլով, հետքերը հեռացրեք անմիջապես և պաշտպանեք կահույքը արևի ուղիղ ճառագայթներից, որոնք գունաթափում են կտորը։ Կտորի խնամքի մասին մանրամասն խորհուրդներ կտանք ձեր ընտրած կտորի համար։',
  },
  {
    question: 'Պատրաստո՞ւմ եք կահույք սրճարանների համար։',
    answer:
      'Այո, պատրաստում ենք փափուկ աթոռներ և բազմոցներ սրճարանների համար՝ ցանկալի քանակով, չափսերով և կտորով։ Մանրամասները համաձայնեցնում ենք պատվերից առաջ։',
  },
  {
    question: 'Վերանորոգելուց հետո կահույքը կլինի՞ նորի պես։',
    answer:
      'Վերապաստառումից, սպունգի և անհրաժեշտ դետալների փոխարինումից հետո կահույքը ստանում է նոր տեսք և վերականգնում է հարմարավետությունը։ Արդյունքները կարող եք տեսնել «Մեր աշխատանքները» բաժնում։',
  },
];

const portfolio = [
  {
    title: 'Բազմոցի ամբողջական վերապաստառում',
    description: 'Փոխարինվեց մաշված մոխրագույն կտորը թավշյա զմրուխտ կտորով, թարմացվեց սպունգը և ամրացվեց կարկասը։',
    service: 'bazmoci-veranorogum',
    before: '1484101403633-562f891dc89a',
    after: '1555041469-a586c61ea9bc',
  },
  {
    title: 'Հին փայտե աթոռի վերականգնում',
    description: 'Աթոռը մաքրվեց հին լաքից, ամրացվեցին հոդերը և նորից ներկվեց ու լաքապատվեց։',
    service: 'atorneri-veranorogum',
    before: '1506439773649-6e0eb8cfb237',
    after: '1549497538-303791108f95',
  },
  {
    title: 'Բազկաթոռի նոր կյանք',
    description: 'Փոխարինվեց լցոնումը, կատարվեց կապիտոնե վերապաստառում վելյուրով և վերականգնվեցին փորագրված ոտքերը։',
    service: 'bazkatori-veranorogum',
    before: '1550254478-ead40cc54513',
    after: '1567538096630-e0c55bd6374c',
  },
  {
    title: 'Ճաշասենյակի աթոռների վերապաստառում',
    description: 'Ռեստորանի համար վերապաստառվեց 24 աթոռ՝ դիմացկուն, հեշտ մաքրվող թավշյա կտորով։',
    service: 'atorneri-veranorogum',
    before: '1592078615290-033ee584e267',
    after: '1617806118233-18e1de247200',
  },
];

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Ադմինիստրատոր';
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (see backend/.env.example).');
  }
  if (password.length < 10) throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters.');

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    if (process.env.SEED_ADMIN_RESET_PASSWORD === 'true') {
      await prisma.adminUser.update({ where: { email }, data: { passwordHash: await bcrypt.hash(password, 12), isActive: true } });
      console.log(`✔ Admin password reset: ${email}`);
    } else {
      console.log(`• Admin exists, unchanged: ${email}`);
    }
    return;
  }
  await prisma.adminUser.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`✔ Admin created: ${email}`);
}

async function main() {
  await seedAdmin();

  const categoryIds = new Map<string, string>();
  for (const [index, c] of categories.entries()) {
    const data = {
      name: c.name,
      description: c.description,
      imageUrl: img(c.image, 1200),
      sortOrder: index,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
    };
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
    categoryIds.set(c.slug, row.id);
  }
  console.log(`✔ Categories: ${categories.length}`);

  for (const [index, p] of products.entries()) {
    const { images, category, ...rest } = p;
    const data = {
      ...rest,
      categoryId: categoryIds.get(category)!,
      isOnSale: !!p.oldPrice && p.oldPrice > p.price,
      sortOrder: index,
      seoTitle: `${p.name.replace(/[«»]/g, '')} — գնել Երևանում`,
      seoDescription: p.shortDescription,
    };
    const row = await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: data });
    await prisma.productImage.deleteMany({ where: { productId: row.id } });
    await prisma.productImage.createMany({
      data: images.map((id, i) => ({ productId: row.id, url: img(id), alt: p.name.replace(/[«»]/g, ''), isMain: i === 0, sortOrder: i })),
    });
  }
  console.log(`✔ Products: ${products.length}`);

  const serviceIds = new Map<string, string>();
  for (const [index, s] of services.entries()) {
    const { image, ...rest } = s;
    const data = { ...rest, sortOrder: index };
    const row = await prisma.service.upsert({ where: { slug: s.slug }, update: data, create: data });
    serviceIds.set(s.slug, row.id);
    await prisma.serviceImage.deleteMany({ where: { serviceId: row.id } });
    await prisma.serviceImage.create({ data: { serviceId: row.id, url: img(image, 1200), alt: s.title, isMain: true } });
  }
  console.log(`✔ Services: ${services.length}`);

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });
    console.log(`✔ FAQ: ${faqs.length}`);
  } else console.log('• FAQ exists, skipped');

  if ((await prisma.portfolioItem.count()) === 0) {
    for (const [index, item] of portfolio.entries()) {
      await prisma.portfolioItem.create({
        data: {
          title: item.title,
          description: item.description,
          serviceId: serviceIds.get(item.service),
          sortOrder: index,
          images: {
            create: [
              { url: img(item.before, 1200), alt: `${item.title} — մինչև`, kind: PortfolioImageKind.BEFORE, sortOrder: 0 },
              { url: img(item.after, 1200), alt: `${item.title} — հետո`, kind: PortfolioImageKind.AFTER, sortOrder: 1 },
            ],
          },
        },
      });
    }
    console.log(`✔ Portfolio: ${portfolio.length}`);
  } else console.log('• Portfolio exists, skipped');

  const settings = await prisma.siteSettings.findUnique({ where: { key: 'main' } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        key: 'main',
        siteName: 'Sea Furniture',
        phone: '+37494844474',
        phone2: '+37498203424',
        whatsapp: '+37494844474',
        address: 'Երևան, Հայաստան',
        workingHours: 'Երկ–Շբթ՝ 10:00–19:00, Կիրակի՝ հանգստյան օր',
        instagramUrl: 'https://www.instagram.com/sea__furniture',
        tiktokUrl: 'https://www.tiktok.com/@s.e.a.f.u.r.n.i.t',
        mapEmbedUrl: 'https://www.google.com/maps?q=Yerevan&output=embed',
        heroTitle: 'Կահույք, որը ստեղծում է ձեր տան հարմարավետությունը',
        heroSubtitle: 'Բացահայտեք փափուկ կահույքի մեր տեսականին կամ վստահեք մեզ ձեր հին կահույքի վերանորոգումը։',
        heroImageUrl: img('1618220179428-22790b461013', 2000),
        deliveryInfo:
          'Առաքում ենք ամբողջ Երևանում և Հայաստանի մարզերում։ Երևանում առաքումը կատարվում է 1–3 աշխատանքային օրվա ընթացքում։ Պատվերով կահույքի առաքման ժամկետը համաձայնեցվում է պատվերը հաստատելիս։ Վճարումը կատարվում է ապրանքը ստանալիս։',
        seoTitle: 'Կահույք Երևանում — բազմոցներ և պատվերով կահույք | Sea Furniture',
        seoDescription:
          'Կահույք Երևանում սեփական արտադրամասից․ բազմոցներ, բազկաթոռներ, պատվերով փափուկ կահույք և կահույքի վերանորոգում։ Առաքում ամբողջ Հայաստանում, մինչև 2 տարի երաշխիք։',
      },
    });
    console.log('✔ Site settings created');
  } else console.log('• Site settings exist, skipped');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
