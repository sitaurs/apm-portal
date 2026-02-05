/**
 * Common Zod Schemas
 * Reusable validation schemas used across the application
 */

import { z } from 'zod'

// ================================
// Common Field Validators
// ================================

export const emailSchema = z.string().email('Email tidak valid')

export const nimSchema = z.string()
  .min(8, 'NIM minimal 8 karakter')
  .max(20, 'NIM maksimal 20 karakter')
  .regex(/^[0-9A-Za-z]+$/, 'NIM hanya boleh berisi huruf dan angka')

export const whatsappSchema = z.string()
  .min(10, 'Nomor WhatsApp minimal 10 digit')
  .max(15, 'Nomor WhatsApp maksimal 15 digit')
  .regex(/^[0-9+]+$/, 'Nomor WhatsApp tidak valid')

export const slugSchema = z.string()
  .min(3, 'Slug minimal 3 karakter')
  .max(100, 'Slug maksimal 100 karakter')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan strip')

export const fakultasSchema = z.string().min(1, 'Fakultas wajib diisi')

export const prodiSchema = z.string().min(1, 'Program Studi wajib diisi')

// ================================
// Date Validators
// ================================

export const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Format tanggal tidak valid' }
)

export const optionalDateSchema = z.string().nullable().optional().refine(
  (val) => !val || !isNaN(Date.parse(val)),
  { message: 'Format tanggal tidak valid' }
)

// ================================
// Enum Validators
// ================================

export const tingkatEnum = z.enum([
  'internal',
  'universitas',
  'kampus',
  'kota',
  'regional', 
  'provinsi',
  'nasional',
  'internasional'
])

export const kategoriLombaEnum = z.enum([
  'teknologi',
  'bisnis',
  'seni',
  'olahraga',
  'akademik',
  'lainnya'
])

export const statusLombaEnum = z.enum([
  'draft',
  'open',
  'ongoing',
  'published',
  'closed',
  'archived'
])

export const statusRegistrasiEnum = z.enum([
  'registered',
  'confirmed',
  'cancelled',
  'attended'
])

export const statusPrestasiEnum = z.enum([
  'pending',
  'reviewing',
  'approved',
  'rejected',
  'revision_needed'
])

export const tipePendaftaranEnum = z.enum([
  'none',
  'internal',
  'external'
])

export const sumberLombaEnum = z.enum([
  'internal',
  'eksternal'
])

// ================================
// Pagination & Query Schemas
// ================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
})

export type PaginationParams = z.infer<typeof paginationSchema>

// ================================
// ID Schemas
// ================================

export const idParamSchema = z.object({
  id: z.coerce.number().positive('ID tidak valid')
})

export const slugParamSchema = z.object({
  slug: slugSchema
})

// ================================
// Response Types
// ================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: string
  details?: Record<string, string[]>
}

// ================================
// Validation Helper Functions
// ================================

/**
 * Parse and validate data with Zod schema
 * Returns the validated data or throws a formatted error
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten()
    const errorMessages = Object.entries(errors.fieldErrors)
      .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
      .join('; ')
    throw new Error(errorMessages || 'Validation failed')
  }
  return result.data
}

/**
 * Get validation errors as a formatted object
 */
export function getValidationErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>
}
