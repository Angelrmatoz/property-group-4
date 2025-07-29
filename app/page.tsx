"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import { useCarousel } from "@/hooks/useCarousel";

export default function PropertyGroupLanding() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { nextImage, currentImage } = useCarousel();
  const [heroImage, setHeroImage] = useState(currentImage());
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeroImage(nextImage());
        setFade(true);
      }, 300); // duración del fade out
    }, 4000);
    return () => clearInterval(interval);
  }, [nextImage]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}

      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section
        id="inicio"
        className="pt-16 md:pt-20 min-h-screen flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Edificio moderno de lujo"
            fill
            className={`object-cover bg-no-repeat transition-opacity duration-300 w-full h-full ${
              fade ? "opacity-40" : "opacity-0"
            }`}
            priority
          />
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-4xl">
            <div className="mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6">
                <span>
                  <img src="/images/icons/PG-icon-dorado.png" alt="Logo PG" />
                </span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-satin-sheen-gold">Property</span>
              <br />
              <span className="text-white">Group</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
              Expertos en bienes raíces con más de 15 años de experiencia.
              Convertimos tus sueños inmobiliarios en realidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md sm:max-w-none">
              <Link href="/projects" className="flex-1 sm:flex-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4"
                >
                  Ver Propiedades
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black text-lg px-8 py-4 bg-transparent"
                onClick={(e) => handleSmoothScroll(e, "#contacto")}
              >
                Contactar Ahora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r bg-saffron">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-black">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                500+
              </div>
              <div className="text-sm sm:text-base md:text-lg font-semibold">
                Propiedades Vendidas
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                15+
              </div>
              <div className="text-sm sm:text-base md:text-lg font-semibold">
                Años de Experiencia
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                98%
              </div>
              <div className="text-sm sm:text-base md:text-lg font-semibold">
                Clientes Satisfechos
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                24/7
              </div>
              <div className="text-sm sm:text-base md:text-lg font-semibold">
                Atención al Cliente
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="servicios"
        className={`py-16 md:py-20 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Servicios</span>
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Ofrecemos soluciones integrales en el sector inmobiliario,
              adaptadas a las necesidades específicas de cada cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              className={`transition-all duration-300 group ${
                isDarkMode
                  ? "bg-black border-yellow-500/20 hover:border-yellow-500/50"
                  : "bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-black" />
                </div>
                <h3
                  className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? "text-saffron" : "text-satin-sheen-gold"
                  }`}
                >
                  Venta de Propiedades
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Asesoría completa en la venta de casas, apartamentos, locales
                  comerciales y terrenos.
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
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3
                  className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? "text-saffron" : "text-satin-sheen-gold"
                  }`}
                >
                  Inversión Inmobiliaria
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Análisis de mercado y oportunidades de inversión para
                  maximizar tu rentabilidad.
                </p>
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-300 group md:col-span-2 lg:col-span-1 ${
                isDarkMode
                  ? "bg-black border-yellow-500/20 hover:border-yellow-500/50"
                  : "bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3
                  className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? "text-saffron" : "text-satin-sheen-gold"
                  }`}
                >
                  Asesoría Personalizada
                </h3>
                <p
                  className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Acompañamiento integral desde la búsqueda hasta la firma de
                  escrituras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="Testimonios">
        <Testimonials isDarkMode={isDarkMode} />
      </section>

      {/* About Section */}
      <section
        id="nosotros"
        className={`py-16 md:py-20 ${isDarkMode ? "bg-black" : "bg-white"}`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
                Sobre <span className="text-saffron">Nosotros</span>
              </h2>
              <p
                className={`text-xl mb-6 leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Property Group nació de la pasión por ayudar a las familias a
                encontrar el hogar de sus sueños. Con más de 15 años en el
                mercado inmobiliario, nos hemos consolidado como una empresa de
                confianza.
              </p>
              <p
                className={`text-lg mb-8 leading-relaxed ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Nuestro enfoque personalizado y conocimiento profundo del
                mercado local nos permite ofrecer las mejores oportunidades a
                nuestros clientes, ya sea que busquen comprar, vender o
                invertir.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span
                    className={`text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Experiencia comprobada en el mercado
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span
                    className={`text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Atención personalizada y profesional
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span
                    className={`text-lg ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Red amplia de contactos y propiedades
                  </span>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl"></div>
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=500&text=Equipo+Property+Group"
                  alt="Equipo Property Group"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contacto"
        className={`py-16 md:py-20 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-black"
            : "bg-gradient-to-br from-gray-100 to-gray-200"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="text-saffron">Contacta</span> con Nosotros
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              ¿Listo para dar el siguiente paso? Estamos aquí para ayudarte en
              tu próxima decisión inmobiliaria.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-saffron mb-8">
                Información de Contacto
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Teléfono
                    </p>
                    <p
                      className={`text-xl font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      +1 (829) 638-0380
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Email
                    </p>
                    <p
                      className={`text-xl font-semibold break-words ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      info@propertygroup.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Dirección
                    </p>
                    <p
                      className={`text-xl font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Punta Cana, República Dominicana
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card
              className={`transition-all duration-300 ${
                isDarkMode
                  ? "bg-black border-yellow-500/20"
                  : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-saffron mb-6">
                  Envíanos un Mensaje
                </h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
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
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-700"
                        }`}
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
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      }`}
                    >
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
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      }`}
                    >
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
                  <Button className="w-full bg-saffron hover:bg-satin-sheen-gold text-black font-semibold text-lg py-3">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
