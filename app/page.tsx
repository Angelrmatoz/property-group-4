"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Phone, Mail, MapPin, Users, TrendingUp, Menu, X, Sun, Moon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

function MobileMenu({ isDarkMode, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    if (href.startsWith("#")) {
      // Smooth scroll for anchor links
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-yellow-400 hover:bg-transparent"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-yellow-500/20 z-40">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <a
              href="#inicio"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("#inicio")}
            >
              Inicio
            </a>
            <a
              href="#servicios"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("#servicios")}
            >
              Servicios
            </a>
            <Link
              href="/projects"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Proyectos
            </Link>
            <a
              href="#nosotros"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("#nosotros")}
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("#contacto")}
            >
              Contacto
            </a>
            <Button
              onClick={() => {
                toggleTheme()
                setIsOpen(false)
              }}
              variant="ghost"
              className={`w-full justify-start transition-all duration-300 ${
                isDarkMode
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="relative w-6 h-6 mr-3">
                <Sun
                  className={`absolute inset-0 transition-all duration-500 ${
                    isDarkMode ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 transition-all duration-500 ${
                    isDarkMode ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
              {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default function PropertyGroupLanding() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`fixed top-0 w-full backdrop-blur-sm z-50 border-b transition-colors duration-300 ${
          isDarkMode ? "bg-black/90 border-yellow-500/20" : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">PG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Property Group</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#inicio"
              className="hover:text-yellow-400 transition-colors"
              onClick={(e) => handleSmoothScroll(e, "#inicio")}
            >
              Inicio
            </a>
            <a
              href="#servicios"
              className="hover:text-yellow-400 transition-colors"
              onClick={(e) => handleSmoothScroll(e, "#servicios")}
            >
              Servicios
            </a>
            <Link href="/projects" className="hover:text-yellow-400 transition-colors">
              Proyectos
            </Link>
            <a
              href="#nosotros"
              className="hover:text-yellow-400 transition-colors"
              onClick={(e) => handleSmoothScroll(e, "#nosotros")}
            >
              Nosotros
            </a>
            <a
              href="#contacto"
              className="hover:text-yellow-400 transition-colors"
              onClick={(e) => handleSmoothScroll(e, "#contacto")}
            >
              Contacto
            </a>
          </nav>

          {/* Desktop Theme Toggle */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className={`relative overflow-hidden transition-all duration-300 ${
              isDarkMode
                ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <div className="relative w-6 h-6">
              <Sun
                className={`absolute inset-0 transition-all duration-500 ${
                  isDarkMode ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Moon
                className={`absolute inset-0 transition-all duration-500 ${
                  isDarkMode ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </div>
          </Button>

          {/* Mobile Hamburger Menu */}
          <MobileMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-20 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=800&width=1200&text=Edificio+moderno+de+lujo"
            alt="Edificio moderno de lujo"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-black font-bold text-3xl">PG</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Property</span>
              <br />
              <span className="text-white">Group</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Expertos en bienes raíces con más de 15 años de experiencia. Convertimos tus sueños inmobiliarios en
              realidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/projects">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Ver Propiedades
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black text-lg px-8 py-4 bg-transparent"
                onClick={(e) => handleSmoothScroll(e, "#contacto")}
              >
                Contactar Ahora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-black">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg font-semibold">Propiedades Vendidas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-lg font-semibold">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-lg font-semibold">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-lg font-semibold">Atención al Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="servicios"
        className={`py-20 transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Servicios</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Ofrecemos soluciones integrales en el sector inmobiliario, adaptadas a las necesidades específicas de cada
              cliente.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <Card
              className={`transition-all duration-300 group ${
                isDarkMode
                  ? "bg-black border-yellow-500/20 hover:border-yellow-500/50"
                  : "bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-black" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                  Venta de Propiedades
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Asesoría completa en la venta de casas, apartamentos, locales comerciales y terrenos.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 group ${
                isDarkMode
                  ? "bg-black border-yellow-500/20 hover:border-yellow-500/50"
                  : "bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                  Inversión Inmobiliaria
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Análisis de mercado y oportunidades de inversión para maximizar tu rentabilidad.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 group ${
                isDarkMode
                  ? "bg-black border-yellow-500/20 hover:border-yellow-500/50"
                  : "bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                  Asesoría Personalizada
                </h3>
                <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Acompañamiento integral desde la búsqueda hasta la firma de escrituras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className={`py-20 ${isDarkMode ? "bg-black" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Sobre <span className="text-yellow-400">Nosotros</span>
              </h2>
              <p className={`text-xl mb-6 leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Property Group nació de la pasión por ayudar a las familias a encontrar el hogar de sus sueños. Con más
                de 15 años en el mercado inmobiliario, nos hemos consolidado como una empresa de confianza.
              </p>
              <p className={`text-lg mb-8 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Nuestro enfoque personalizado y conocimiento profundo del mercado local nos permite ofrecer las mejores
                oportunidades a nuestros clientes, ya sea que busquen comprar, vender o invertir.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Experiencia comprobada en el mercado
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Atención personalizada y profesional
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Red amplia de contactos y propiedades
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl"></div>
              <Image
                src="/placeholder.svg?height=600&width=500&text=Equipo+Property+Group"
                alt="Equipo Property Group"
                width={500}
                height={600}
                className="rounded-2xl object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contacto"
        className={`py-20 transition-colors duration-300 ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-yellow-400">Contacta</span> con Nosotros
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              ¿Listo para dar el siguiente paso? Estamos aquí para ayudarte en tu próxima decisión inmobiliaria.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-8">Información de Contacto</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Teléfono</p>
                    <p className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Email</p>
                    <p className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      info@propertygroup.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Dirección</p>
                    <p className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Av. Principal 123, Ciudad
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card
              className={`transition-all duration-300 ${isDarkMode ? "bg-black border-yellow-500/20" : "bg-white border-gray-200 shadow-lg"}`}
            >
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">Envíanos un Mensaje</h3>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}
                      >
                        Nombre
                      </label>
                      <Input
                        className={
                          isDarkMode
                            ? "bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                            : "bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                        }
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}
                      >
                        Teléfono
                      </label>
                      <Input
                        className={
                          isDarkMode
                            ? "bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                            : "bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                        }
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                      Email
                    </label>
                    <Input
                      type="email"
                      className={
                        isDarkMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500"
                      }
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                      Mensaje
                    </label>
                    <Textarea
                      className={
                        isDarkMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-yellow-500 min-h-[120px]"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 min-h-[120px]"
                      }
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    />
                  </div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg py-3">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-12 transition-colors duration-300 ${
          isDarkMode ? "bg-black border-yellow-500/20" : "bg-gray-100 border-gray-300"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">PG</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Property Group</h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Tu socio inmobiliario de confianza
                </p>
              </div>
            </Link>
            <div className="text-center md:text-right">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                © 2024 Property Group. Todos los derechos reservados.
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                Diseñado con ❤️ para tu éxito inmobiliario
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
