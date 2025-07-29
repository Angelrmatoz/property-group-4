"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header = ({ isDarkMode, toggleTheme }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const pathname = usePathname();

  // Helper para saber si estamos en la home
  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 w-full backdrop-blur-sm z-50 border-b transition-colors duration-300 ${
        isDarkMode
          ? "bg-black/90 border-yellow-500/20"
          : "bg-white/90 border-gray-200"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br flex items-center justify-center">
              <span>
                <img src="/images/icons/PG-icon-dorado.png" alt="Logo PG" />
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-satin-sheen-gold">
                Property Group
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation solo en lg+ */}
          <nav className="hidden lg:flex items-center space-x-8">
            {isHome ? (
              <>
                <a
                  href="#inicio"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                  onClick={(e) => handleSmoothScroll(e, "#inicio")}
                >
                  Inicio
                </a>
                <a
                  href="#servicios"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                  onClick={(e) => handleSmoothScroll(e, "#servicios")}
                >
                  Servicios
                </a>
                {/* <Link
                  href="/projects"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Proyectos
                </Link> */}
                <a
                  href="#nosotros"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                  onClick={(e) => handleSmoothScroll(e, "#nosotros")}
                >
                  Nosotros
                </a>
                <a
                  href="#Testimonios"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                  onClick={(e) => handleSmoothScroll(e, "#Testimonios")}
                >
                  Testimonios
                </a>
                <a
                  href="#contacto"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                  onClick={(e) => handleSmoothScroll(e, "#contacto")}
                >
                  Contacto
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/#inicio"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/#servicios"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Servicios
                </Link>
                <Link
                  href="/projects"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Proyectos
                </Link>
                <Link
                  href="/#nosotros"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Nosotros
                </Link>
                <Link
                  href="/#contacto"
                  className="text-sm lg:text-base hover:text-satin-sheen-gold transition-colors"
                >
                  Contacto
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Desktop Theme Toggle solo en lg+ */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className={`hidden lg:flex p-2 transition-all duration-300 ${
                isDarkMode
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="relative w-5 h-5">
                <Sun
                  className={`absolute inset-0 transition-all duration-500 ${
                    isDarkMode
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 transition-all duration-500 ${
                    isDarkMode
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
            </Button>

            {/* Mobile Menu Button visible hasta lg-1 */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="ghost"
              size="sm"
              className={`flex lg:hidden p-2 transition-all duration-300 ${
                isDarkMode
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`absolute transition-all duration-300 ${
                    isOpen
                      ? "opacity-0 rotate-180 scale-0"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                  size={20}
                />
                <X
                  className={`absolute transition-all duration-300 ${
                    isOpen
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-180 scale-0"
                  }`}
                  size={20}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="py-4 space-y-3 border-t border-yellow-500/20">
            <a
              href="#inicio"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("#inicio")}
            >
              Inicio
            </a>
            <a
              href="#servicios"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("#servicios")}
            >
              Servicios
            </a>
            <a
              href="#Testimonios"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("#Testimonios")}
            >
              Testimonios
            </a>
            {/* <Link
              href="/projects"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("/projects")}
            >
              Proyectos
            </Link> */}
            <a
              href="#nosotros"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("#nosotros")}
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              className="block px-4 py-2 text-base hover:text-satin-sheen-gold hover:bg-yellow-500/10 rounded-lg transition-colors"
              onClick={() => handleNavClick("#contacto")}
            >
              Contacto
            </a>
            <div className="px-4 py-2">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className={`w-full justify-start p-2 transition-all duration-300 ${
                  isDarkMode
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="relative w-5 h-5">
                    <Sun
                      className={`absolute transition-all duration-300 ${
                        isDarkMode
                          ? "opacity-0 rotate-180 scale-0"
                          : "opacity-100 rotate-0 scale-100"
                      }`}
                      size={20}
                    />
                    <Moon
                      className={`absolute transition-all duration-300 ${
                        isDarkMode
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-180 scale-0"
                      }`}
                      size={20}
                    />
                  </div>
                  <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
                </div>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
