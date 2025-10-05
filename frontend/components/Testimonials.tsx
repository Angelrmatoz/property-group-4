import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "Compradora de Apartamento",
      content:
        "Property Group me ayudó a encontrar el hogar perfecto para mi familia. Su profesionalismo y dedicación fueron excepcionales durante todo el proceso.",
      rating: 5,
      image: "/images/Person/Testimonials/testimonial2.jpg",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Inversionista",
      content:
        "He trabajado con Property Group en múltiples proyectos. Su conocimiento del mercado y asesoría han sido fundamentales para mis inversiones exitosas.",
      rating: 5,
      image: "/images/Person/Testimonials/testimonial1.jpg",
    },
    {
      id: 3,
      name: "Ana Martínez",
      role: "Vendedora de Propiedad",
      content:
        "Vendí mi casa a través de Property Group y el proceso fue muy fluido. Lograron venderla por encima del precio esperado en tiempo récord.",
      rating: 5,
      image: "/images/Person/Testimonials/testimonial3.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-20 transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Lo que dicen nuestros{" "}
            <span className="text-satin-sheen-gold">Clientes</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            La satisfacción de nuestros clientes es nuestra mayor recompensa.
            Descubre por qué confían en nosotros para sus decisiones
            inmobiliarias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="transition-all duration-300 group h-full bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-black dark:border-yellow-500/20 dark:hover:border-yellow-500/50"
            >
              <CardContent className="p-8 flex flex-col h-full">
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-satin-sheen-gold fill-current"
                    />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-lg mb-6 leading-relaxed flex-grow text-gray-700 dark:text-gray-300">
                  "{testimonial.content}"
                </blockquote>

                {/* Client Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            ¿Listo para ser nuestro próximo cliente satisfecho?
          </h3>
          <p className="text-lg mb-3 text-gray-700 dark:text-gray-300">
            Únete a los cientos de clientes que han confiado en Property Group
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
