export type Project = {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
  statusColor?: string;
  price?: string;
  image?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  area?: string;
  description?: string;
};

const projects: Project[] = [
  {
    id: "proj-1",
    name: "Torre Central",
    location: "Ciudad Central",
    type: "Residencial",
    status: "Disponible",
    statusColor: "bg-green-500",
    price: "$120,000",
    image: "/images/Properties/sample-1.jpg",
    bedrooms: 3,
    bathrooms: 2,
    area: "120 m²",
    description: "Apartamentos modernos en el corazón de la ciudad.",
  },
  {
    id: "proj-2",
    name: "Plaza Comercial",
    location: "Zona Norte",
    type: "Comercial",
    status: "En Construcción",
    statusColor: "bg-yellow-500",
    price: "$450,000",
    image: "/images/Properties/sample-2.jpg",
    bedrooms: "N/A",
    bathrooms: "N/A",
    area: "1,200 m²",
    description: "Locales comerciales en un nuevo desarrollo de usos mixtos.",
  },
];

export default projects;
