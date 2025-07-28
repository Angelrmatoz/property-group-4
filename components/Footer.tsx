import Link from "next/link";

const Footer = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <footer
      className={`border-t py-12 transition-colors duration-300 ${
        isDarkMode
          ? "bg-black border-yellow-500/20"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center">
              <span>
                <img src="/images/icons/PG-icon-dorado.png" alt="Logo PG" />
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-satin-sheen-gold">
                Property Group
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Tu socio inmobiliario de confianza
              </p>
            </div>
          </Link>
          <div className="text-center md:text-right">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              © {new Date().getFullYear()} Property Group. Todos los derechos
              reservados.
            </p>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Diseñado con ❤️ para tu éxito inmobiliario
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;