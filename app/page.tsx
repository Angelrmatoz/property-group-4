"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Phone, Mail, MapPin, Users, TrendingUp, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

function MobileMenu() {
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
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
              onClick={() => setIsOpen(false)}
            >
              Consulta Gratis
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default function PropertyGroupLanding() {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-yellow-500/20">
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

          {/* Desktop CTA Button */}
          <Button className="hidden md:block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            Consulta Gratis
          </Button>

          {/* Mobile Hamburger Menu */}
          <MobileMenu />
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
      <section id="servicios" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Servicios</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ofrecemos soluciones integrales en el sector inmobiliario, adaptadas a las necesidades específicas de cada
              cliente.
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-black border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Venta de Propiedades</h3>
                <p className="text-gray-300 leading-relaxed">
                  Asesoría completa en la venta de casas, apartamentos, locales comerciales y terrenos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Inversión Inmobiliaria</h3>
                <p className="text-gray-300 leading-relaxed">
                  Análisis de mercado y oportunidades de inversión para maximizar tu rentabilidad.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Asesoría Personalizada</h3>
                <p className="text-gray-300 leading-relaxed">
                  Acompañamiento integral desde la búsqueda hasta la firma de escrituras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Sobre <span className="text-yellow-400">Nosotros</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Property Group nació de la pasión por ayudar a las familias a encontrar el hogar de sus sueños. Con más
                de 15 años en el mercado inmobiliario, nos hemos consolidado como una empresa de confianza.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Nuestro enfoque personalizado y conocimiento profundo del mercado local nos permite ofrecer las mejores
                oportunidades a nuestros clientes, ya sea que busquen comprar, vender o invertir.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-lg">Experiencia comprobada en el mercado</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-lg">Atención personalizada y profesional</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-lg">Red amplia de contactos y propiedades</span>
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
      <section id="contacto" className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-yellow-400">Contacta</span> con Nosotros
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
                    <p className="text-gray-400">Teléfono</p>
                    <p className="text-xl font-semibold">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-xl font-semibold">info@propertygroup.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-gray-400">Dirección</p>
                    <p className="text-xl font-semibold">Av. Principal 123, Ciudad</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-black border-yellow-500/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">Envíanos un Mensaje</h3>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <Input
                        className="bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Teléfono</label>
                      <Input
                        className="bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      className="bg-gray-900 border-gray-700 text-white focus:border-yellow-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensaje</label>
                    <Textarea
                      className="bg-gray-900 border-gray-700 text-white focus:border-yellow-500 min-h-[120px]"
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
      <footer className="bg-black border-t border-yellow-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">PG</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Property Group</h3>
                <p className="text-gray-400 text-sm">Tu socio inmobiliario de confianza</p>
              </div>
            </Link>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Property Group. Todos los derechos reservados.</p>
              <p className="text-gray-500 text-sm mt-1">Diseñado con ❤️ para tu éxito inmobiliario</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
