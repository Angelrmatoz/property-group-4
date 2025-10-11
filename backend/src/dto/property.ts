// DTOs for Property entity (English field names)

export interface PropertyCreateDTO {
  title: string;
  description: string;
  price: number;
  currency?: "USD" | "DOP";
  province: string;
  city: string;
  neighborhood?: string;
  type?: string;
  category?: "apartment" | "house" | "land" | "commercial";
  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  parkingSpaces?: number;
  builtArea?: number;
  images?: string[];
  // 'yes' | 'no' to support multilingual UI and explicitness. Older boolean
  // values may still be present in the DB; controllers will normalize.
  furnished?: "yes" | "no" | boolean;
}

export interface PropertyDTO extends PropertyCreateDTO {
  id: string;
  createdBy: string; // user id
  createdAt: string;
}

export default {};
