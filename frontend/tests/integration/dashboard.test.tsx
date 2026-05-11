"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { transformCloudinaryUrl } from "@/lib/utils";

type Property = {
  id?: string;
  _id?: string;
  title?: string;
  titulo?: string;
  province?: string;
  provincia?: string;
  city?: string;
  municipio?: string;
  price?: number;
  precio?: number;
  type?: string;
  tipo?: string;
};

const PropertyList = ({ properties }: { properties: Property[] }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = properties.filter((p) => {
    const title = (p.title || p.titulo || "").toLowerCase();
    const province = (p.province || p.provincia || "").toLowerCase();
    const city = (p.city || p.municipio || "").toLowerCase();
    return (
      title.includes(searchTerm.toLowerCase()) ||
      province.includes(searchTerm.toLowerCase()) ||
      city.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <label htmlFor="search">Buscar propiedades</label>
      <input
        id="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por título, provincia o ciudad..."
      />
      <div aria-label="conteo de resultados">{filtered.length}</div>
      <ul>
        {filtered.map((p) => (
          <li key={p.id || p._id} aria-label="propiedad">
            <h3>{p.title || p.titulo}</h3>
            <p>{p.province || p.provincia}</p>
            <p>${(p.price || p.precio)?.toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const mockProperties: Property[] = [
  { id: "1", title: "Casa en la Playa", province: "Punta Cana", city: "Higuey", price: 250000, type: "sale" },
  { id: "2", title: "Apartamento en Sto Dgo", province: "Santo Domingo", city: "Distrito Nacional", price: 180000, type: "rent" },
  { id: "3", titulo: "Villa Moderna", provincia: "Santiago", ciudad: "Santiago", precio: 350000, tipo: "sale" },
];

describe("Dashboard Property List", () => {
  const user = userEvent.setup();

  it("renders all properties initially", () => {
    render(<PropertyList properties={mockProperties} />);
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("3");
    expect(screen.getAllByRole("listitem", { name: /propiedad/i })).toHaveLength(3);
  });

  it("filters by title using user-event", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "casa");
    
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("1");
    expect(screen.getByRole("heading", { name: /casa en la playa/i })).toBeInTheDocument();
  });

  it("filters by province", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "Punta");
    
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("1");
    expect(screen.getByRole("heading", { name: /casa en la playa/i })).toBeInTheDocument();
  });

  it("filters by city", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "Santiago");
    
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("1");
    expect(screen.getByRole("heading", { name: /villa moderna/i })).toBeInTheDocument();
  });

  it("filters case-insensitively", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "PUNTA");
    
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("1");
  });

  it("shows empty list when no matches", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "xyz123");
    
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("0");
    expect(screen.queryByRole("listitem", { name: /propiedad/i })).not.toBeInTheDocument();
  });

  it("clears filter when input is cleared", async () => {
    render(<PropertyList properties={mockProperties} />);
    
    const searchInput = screen.getByRole("textbox", { name: /buscar propiedades/i });
    await user.type(searchInput, "casa");
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("1");
    
    await user.clear(searchInput);
    expect(screen.getByLabelText(/conteo de resultados/i)).toHaveTextContent("3");
  });
});

describe("Property data helpers", () => {
  it("formats price with locale string", () => {
    const price = 250000;
    // Note: depending on environment, locale might differ (250,000 vs 250.000)
    // We check if it contains the numbers and some separator
    expect(price.toLocaleString()).toMatch(/250.000|250,000/);
  });
});

describe("transformCloudinaryUrl integration", () => {
  it("transforms HEIC image URLs", () => {
    const url = "https://res.cloudinary.com/property-group/image/upload/v1/properties/photo.heic";
    const result = transformCloudinaryUrl(url);
    expect(result).toContain("/upload/f_auto,q_auto/");
    expect(result).toContain("photo.heic");
  });
});
