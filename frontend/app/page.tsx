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
import { event } from "@/lib/fbpixel";

export default function PropertyGroupLanding() {
  // Theme now follows system preference via CSS variables / Tailwind `dark:` rules.
  const { nextImage, currentImage } = useCarousel();
  const [heroImage, setHeroImage] = useState(currentImage());
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Inicia el fade-out
      // Espera a que termine el fade-out antes de cambiar la imagen
      const timeout = setTimeout(() => {
        setHeroImage(nextImage()); // Cambia la imagen justo cuando termina el fade-out
        setFade(true); // Inicia el fade-in
      }, 300); // duración del fade out
      // Limpia el timeout si el componente se desmonta antes de que termine
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, [nextImage]);

  // toggleTheme removed; theme is automatic

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
    <div className="min-h-screen transition-colors duration-300 overflow-x-hidden bg-background text-foreground dark:bg-black dark:text-foreground">
      {/* Header */}

      <Header />

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
              <span className="text-foreground">Group</span>
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
                onClick={(e) => {
                  handleSmoothScroll(e, "#contacto");
                  event("Contact", { location: "Hero" });
                }}
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
        className="py-16 md:py-20 transition-colors duration-300 bg-gray-50 dark:bg-gray-900"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Servicios</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
              Ofrecemos soluciones integrales en el sector inmobiliario,
              adaptadas a las necesidades específicas de cada cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="transition-all duration-300 group bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-black dark:border-yellow-500/20 dark:hover:border-yellow-500/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-satin-sheen-gold dark:text-saffron">
                  Venta de Propiedades
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  Asesoría completa en la venta de casas, apartamentos, locales
                  comerciales y terrenos.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 group bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-black dark:border-yellow-500/20 dark:hover:border-yellow-500/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-satin-sheen-gold dark:text-saffron">
                  Inversión Inmobiliaria
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  Análisis de mercado y oportunidades de inversión para
                  maximizar tu rentabilidad.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 group md:col-span-2 lg:col-span-1 bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-black dark:border-yellow-500/20 dark:hover:border-yellow-500/50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-saffron rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-satin-sheen-gold dark:text-saffron">
                  Asesoría Personalizada
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
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
        <Testimonials />
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-16 md:py-20 bg-white dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
                Sobre <span className="text-saffron">Nosotros</span>
              </h2>
              <p className="text-xl mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
                Property Group nació de la pasión por ayudar a las familias a
                encontrar el hogar de sus sueños. Con más de 15 años en el
                mercado inmobiliario, nos hemos consolidado como una empresa de
                confianza.
              </p>
              <p className="text-lg mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                Nuestro enfoque personalizado y conocimiento profundo del
                mercado local nos permite ofrecer las mejores oportunidades a
                nuestros clientes, ya sea que busquen comprar, vender o
                invertir.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span className="text-lg text-gray-900 dark:text-white">
                    Experiencia comprobada en el mercado
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span className="text-lg text-gray-900 dark:text-white">
                    Atención personalizada y profesional
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-saffron rounded-full flex-shrink-0"></div>
                  <span className="text-lg text-gray-900 dark:text-white">
                    Red amplia de contactos y propiedades
                  </span>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl"></div>
              <div className="relative h-60 sm:h-80 md:h-96 lg:h-[600px] rounded-2xl overflow-hidden">
                <Image
                  src="/images/Person/CEO/img6.jpg"
                  alt="Equipo Property Group"
                  fill
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover object-[center_top] md:object-[center_15%] lg:object-[center_30%]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contacto"
        className="py-16 md:py-20 transition-colors duration-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="text-saffron">Contacta</span> con Nosotros
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
              ¿Listo para dar el siguiente paso? Estamos aquí para ayudarte en
              tu próxima decisión inmobiliaria.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 justify-center">
            <div>
              <h3 className="text-2xl font-bold text-saffron mb-8">
                Información de Contacto
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-black " />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Teléfono</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      +1 (829) 638-0380
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-xl font-semibold break-words text-gray-900 dark:text-white">
                      Propertygrouprd@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Dirección
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      Punta Cana, República Dominicana
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="mx-auto w-full max-w-md transition-all duration-300 bg-white border-gray-200 shadow-lg dark:bg-black dark:border-yellow-500/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-saffron mb-6">
                  Envíanos un Mensaje
                </h3>
                <form
                  className="space-y-6"
                  action={"https://formspree.io/f/mqalbgej"}
                  method="POST"
                  onSubmit={() => event("Lead", { location: "ContactForm" })}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                        Nombre
                      </label>
                      <Input
                        name="nombre"
                        className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                        Teléfono
                      </label>
                      <Input
                        name="telefono"
                        className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
                      Mensaje
                    </label>
                    <Textarea
                      name="mensaje"
                      className="resize-none bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 min-h-[120px] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
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
      <Footer />
    </div>
  );
}
