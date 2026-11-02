export type Availability = 'IN_STOCK' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK';
export type OrderStatus = 'NEW' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type RequestStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RequestSource = 'REPAIR' | 'CONTACT' | 'CONSULTATION';
export type PortfolioImageKind = 'BEFORE' | 'AFTER' | 'GALLERY';

export interface ImageRef {
  id?: string;
  url: string;
  path?: string | null;
  alt?: string | null;
  isMain?: boolean;
  sortOrder?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePath?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle: string | null;
  seoDescription: string | null;
  _count?: { products: number };
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  oldPrice: number | null;
  availability: Availability;
  isNew: boolean;
  isOnSale: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string };
  images: { url: string; alt: string | null }[];
}

export interface ProductDetail extends Omit<ProductCard, 'images' | 'category'> {
  sku: string | null;
  description: string | null;
  dimensions: string | null;
  material: string | null;
  color: string | null;
  stockQuantity: number;
  productionTime: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string | null; isMain: boolean }[];
  related: ProductCard[];
}

/** GET /products/hero-slides — home page hero slider (newest first, max 10) */
export interface HeroSlide {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  category: { name: string };
  images: { url: string; alt: string | null }[];
}

export interface ProductList extends Paginated<ProductCard> {
  priceRange: { min: number; max: number };
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  priceFrom: number | null;
  duration: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive?: boolean;
  sortOrder?: number;
  images: ImageRef[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  service: { title: string; slug: string } | null;
  images: { url: string; alt: string | null; kind: PortfolioImageKind }[];
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
  logoPath?: string | null;
  phone: string | null;
  phone2: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  mapEmbedUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  heroImagePath?: string | null;
  aboutImage1Url: string | null;
  aboutImage1Path?: string | null;
  aboutImage1Alt: string | null;
  aboutImage2Url: string | null;
  aboutImage2Path?: string | null;
  aboutImage2Alt: string | null;
  aboutImage3Url: string | null;
  aboutImage3Path?: string | null;
  aboutImage3Alt: string | null;
  deliveryInfo: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  productSku: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string | null;
  region: string;
  address: string;
  deliveryNotes: string | null;
  comment: string | null;
  status: OrderStatus;
  totalAmount: number;
  itemsCount: number;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items?: OrderItem[];
}

export interface RepairRequest {
  id: string;
  requestNumber: string;
  source: RequestSource;
  name: string;
  phone: string;
  serviceId: string | null;
  serviceTitle: string | null;
  address: string | null;
  description: string | null;
  status: RequestStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images?: { id: string; url: string }[];
  _count?: { images: number };
  service?: { id: string; title: string; slug: string } | null;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
