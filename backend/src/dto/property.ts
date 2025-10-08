// DTOs for Property entity (English field names)

export interface PropertyCreateDTO {
  title: string;
  description: string;
  price: number;
  province: string;
  city: string;
  neighborhood?: string;
  type?: string;
  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  parkingSpaces?: number;
  builtArea?: number;
  images?: string[];
  furnished?: boolean;
}

export interface PropertyDTO extends PropertyCreateDTO {
  id: string;
  createdBy: string; // user id
  createdAt: string;
}

export default {};
