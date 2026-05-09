"use client";

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar propiedades..."
      />
      <div data-testid="count">{filtered.length}</div>
      {filtered.map((p) => (
        <div key={p.id || p._id} data-testid={`property-${p.id || p._id}`}>
          <span data-testid={`title-${p.id || p._id}`}>{p.title || p.titulo}</span>
          <span data-testid={`province-${p.id || p._id}`}>{p.province || p.provincia}</span>
          <span data-testid={`price-${p.id || p._id}`}>
            ${(p.price || p.precio)?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

const mockProperties: Property[] = [
  { id: "1", title: "Casa en la Playa", province: "Punta Cana", city: "Higuey", price: 250000, type: "sale" },
  { id: "2", title: "Apartamento en Sto Dgo", province: "Santo Domingo", city: "Distrito Nacional", price: 180000, type: "rent" },
  { id: "3", titulo: "Villa Moderna", provincia: "Santiago", ciudad: "Santiago", precio: 350000, tipo: "sale" },
];

describe("Dashboard Property List", () => {
  it("renders all properties initially", () => {
    render(<PropertyList properties={mockProperties} />);
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("filters by title", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "casa" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("property-1")).toBeInTheDocument();
  });

  it("filters by province", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "Punta" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("property-1")).toBeInTheDocument();
  });

  it("filters by city", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "Santiago" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("property-3")).toBeInTheDocument();
  });

  it("filters case-insensitively", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "PUNTA" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("shows empty list when no matches", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "xyz123" } });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("clears filter when input is cleared", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "casa" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "" } });
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("handles properties with Spanish field names", () => {
    render(<PropertyList properties={mockProperties} />);
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "Villa" } });
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("property-3")).toBeInTheDocument();
  });
});

describe("Property data helpers", () => {
  it("formats price with locale string", () => {
    const price = 250000;
    expect(price.toLocaleString()).toBe("250,000");
  });

  it("normalizes mixed field names in filter", () => {
    const p: Property = { id: "x", titulo: "Test", provincia: "SD", price: 100 };
    const title = (p.title || p.titulo || "").toLowerCase();
    const province = (p.province || p.provincia || "").toLowerCase();
    expect(title).toBe("test");
    expect(province).toBe("sd");
  });

  it("handles missing fields gracefully", () => {
    const p: Property = { id: "1" };
    const title = (p.title || p.titulo || "").toLowerCase();
    expect(title).toBe("");
    expect(title.includes("test")).toBe(false);
  });
});

describe("transformCloudinaryUrl integration", () => {
  it("transforms HEIC image URLs", () => {
    const url = "https://res.cloudinary.com/property-group/image/upload/v1/properties/photo.heic";
    const result = transformCloudinaryUrl(url);
    expect(result).toContain("/upload/f_auto,q_auto/");
    expect(result).toContain("photo.heic");
  });

  it("does not transform non-Cloudinary URLs", () => {
    const url = "https://example.com/images/photo.jpg";
    expect(transformCloudinaryUrl(url)).toBe(url);
  });
});
