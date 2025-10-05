export interface Project {
  id: number;
  name: string;
  type: string;
  location: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  status: string;
  statusColor: string;
  image: string;
  description: string;
  features: string[];
}

const projects: Project[] = [
  {
    id: 1,
    name: "Golden Heights",
    type: "Torre Residencial",
    location: "Zona Premium",
    price: "$180,000",
    bedrooms: "2-3",
    bathrooms: "2-3",
    area: "85-120 m²",
    status: "Disponible",
    statusColor: "bg-green-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Torre+Residencial+Moderna",
    description:
      "Torre residencial de lujo con 25 pisos, ubicada en el corazón de la zona premium de la ciudad.",
    features: [
      "Gimnasio",
      "Piscina",
      "Seguridad 24/7",
      "Parqueadero",
      "Salón Social",
    ],
  },
  {
    id: 2,
    name: "Property Plaza",
    type: "Complejo Residencial",
    location: "Sector Norte",
    price: "$220,000",
    bedrooms: "3-4",
    bathrooms: "2-3",
    area: "120-180 m²",
    status: "En Construcción",
    statusColor: "bg-blue-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Complejo+Residencial+Moderno",
    description:
      "Complejo residencial con amenidades completas y espacios verdes para toda la familia.",
    features: [
      "Parque Infantil",
      "Cancha Deportiva",
      "Zona BBQ",
      "Senderos",
      "Club House",
    ],
  },
  {
    id: 3,
    name: "Golden Business",
    type: "Centro Comercial",
    location: "Centro Financiero",
    price: "$95,000",
    bedrooms: "N/A",
    bathrooms: "1-2",
    area: "50-200 m²",
    status: "Pre-venta",
    statusColor: "bg-purple-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Torre+Comercial+Elegante",
    description:
      "Centro comercial y oficinas ejecutivas en el distrito financiero más importante.",
    features: [
      "Locales Comerciales",
      "Oficinas",
      "Food Court",
      "Parqueadero",
      "Seguridad",
    ],
  },
  {
    id: 4,
    name: "Property Gardens",
    type: "Villas Exclusivas",
    location: "Zona Residencial",
    price: "$350,000",
    bedrooms: "4-5",
    bathrooms: "3-4",
    area: "200-300 m²",
    status: "Últimas Unidades",
    statusColor: "bg-orange-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Desarrollo+Residencial+Exclusivo",
    description:
      "Villas exclusivas con jardín privado y acabados de primera calidad.",
    features: [
      "Jardín Privado",
      "Garaje Doble",
      "Terraza",
      "Estudio",
      "Cuarto de Servicio",
    ],
  },
  {
    id: 5,
    name: "Golden View",
    type: "Apartamentos",
    location: "Vista Panorámica",
    price: "$125,000",
    bedrooms: "1-2",
    bathrooms: "1-2",
    area: "60-90 m²",
    status: "Disponible",
    statusColor: "bg-green-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Edificio+Apartamentos+Modernos",
    description:
      "Apartamentos modernos con vista panorámica de la ciudad y acabados contemporáneos.",
    features: [
      "Vista Panorámica",
      "Balcón",
      "Cocina Integral",
      "Closets",
      "Aire Acondicionado",
    ],
  },
  {
    id: 6,
    name: "Golden Lots",
    type: "Terrenos",
    location: "Desarrollo Futuro",
    price: "$75,000",
    bedrooms: "N/A",
    bathrooms: "N/A",
    area: "500-1000 m²",
    status: "Inversión",
    statusColor: "bg-yellow-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Terrenos+Desarrollo+Premium",
    description:
      "Terrenos para desarrollo residencial en zona de alta valorización.",
    features: [
      "Servicios Públicos",
      "Vías Pavimentadas",
      "Zona Comercial",
      "Transporte",
      "Valorización",
    ],
  },
  {
    id: 7,
    name: "Skyline Towers",
    type: "Torres Gemelas",
    location: "Distrito Moderno",
    price: "$195,000",
    bedrooms: "2-3",
    bathrooms: "2",
    area: "90-130 m²",
    status: "Próximamente",
    statusColor: "bg-gray-500",
    image: "/placeholder.svg?height=300&width=400&text=Torres+Gemelas+Modernas",
    description:
      "Proyecto de torres gemelas con diseño arquitectónico vanguardista.",
    features: ["Rooftop", "Co-working", "Spa", "Concierge", "Smart Home"],
  },
  {
    id: 8,
    name: "Eco Residences",
    type: "Desarrollo Sostenible",
    location: "Zona Verde",
    price: "$165,000",
    bedrooms: "2-4",
    bathrooms: "2-3",
    area: "80-150 m²",
    status: "En Construcción",
    statusColor: "bg-blue-500",
    image:
      "/placeholder.svg?height=300&width=400&text=Desarrollo+Ecologico+Sostenible",
    description:
      "Desarrollo residencial sostenible con tecnologías verdes y espacios naturales.",
    features: [
      "Paneles Solares",
      "Jardines Verticales",
      "Reciclaje",
      "Huerta Comunitaria",
      "Ciclovía",
    ],
  },
];

export default projects;
