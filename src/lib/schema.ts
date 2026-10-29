import { z } from 'zod'

export const AmountSchema = z.object({
  value: z.number(),
  currency: z.string().length(3),
  context: z.string(),
})

export const DateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  context: z.string(),
})

export const DocumentSchema = z.object({
  fileName: z.string(),
  pages: z.number().int().positive(),
  language: z.string().length(2),
  type: z.enum(['umowa', 'faktura', 'oferta', 'raport', 'inne']),
  title: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
})

export const AnalysisSchema = z.object({
  document: DocumentSchema,
  summary: z.string().min(10).max(500),
  keyPoints: z.array(z.string()).min(3).max(7),
  entities: z.object({
    organizations: z.array(z.string()),
    people: z.array(z.string()),
  }),
  amounts: z.array(AmountSchema),
  dates: z.array(DateSchema),
  keywords: z.array(z.string()).min(0).max(10),
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>
