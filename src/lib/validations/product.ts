
import { z } from "zod";

// Define the product schema for validation
export const productSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Le prix ne peut pas être négatif" }),
  image: z.string().optional(),
  secondaryImage: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  visualCategoryId: z.number().nullable(),
  linkedLotteries: z.array(z.string()).optional(),
  printAreas: z.array(z.any()).optional(),
  type: z.string().optional(),
  productType: z.string().optional(),
  sleeveType: z.string().optional(),
  brand: z.string().optional(),
  fit: z.string().optional(),
  gender: z.string().optional(),
  material: z.string().optional(),
  tickets: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  deliveryPrice: z.coerce.number().optional(),
  allowCustomization: z.boolean().optional(),
  popularity: z.coerce.number().optional(),
  defaultVisualId: z.number().nullable().optional(),
  defaultVisualSettings: z.any().nullable().optional()
});
