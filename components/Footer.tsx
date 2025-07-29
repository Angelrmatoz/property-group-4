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
                Tu socia inmobiliaria de confianza
              </p>
            </div>
          </Link>
          <div className="text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              © {new Date().getFullYear()} Property Group. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center space-x-3 mt-3 justify-center md:justify-end">
              <a
                href="https://wa.me/18296380380"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  data-testid="geist-icon"
                  strokeLinejoin="round"
                  style={{ color: "currentColor" }}
                  viewBox="0 0 16 16"
                  className="w-6 aspect-square"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.6376 2.32334C12.1421 0.825856 10.153 0.000759757 8.03365 0C3.66658 0 0.112432 3.55377 0.110912 7.92199C0.110152 9.31841 0.475216 10.6814 1.1685 11.8826L0.0444336 15.9883L4.24437 14.8867C5.40147 15.5181 6.70446 15.8504 8.03025 15.8508H8.03365C12.4 15.8508 15.9545 12.2967 15.956 7.92844C15.9568 5.8114 15.1336 3.8212 13.6376 2.32372V2.32334ZM8.03365 14.5129H8.031C6.84956 14.5125 5.69058 14.1949 4.67935 13.5951L4.43887 13.4523L1.94649 14.106L2.61166 11.6759L2.45514 11.4267C1.79605 10.3783 1.4477 9.16645 1.44846 7.92239C1.44998 4.29187 4.40392 1.33793 8.03635 1.33793C9.79515 1.33869 11.4484 2.02438 12.6917 3.26924C13.9351 4.51372 14.6192 6.16849 14.6185 7.92769C14.6169 11.5586 11.663 14.5125 8.03365 14.5125V14.5129ZM11.6455 9.5813C11.4476 9.48217 10.4744 9.00349 10.2928 8.93741C10.1112 8.87129 9.97942 8.83828 9.84757 9.03655C9.71577 9.23487 9.33628 9.68084 9.22079 9.81264C9.1053 9.94484 8.9898 9.96119 8.79188 9.86201C8.594 9.76287 7.95617 9.55394 7.19984 8.87965C6.61142 8.35465 6.21402 7.70661 6.09858 7.50829C5.98309 7.31001 6.08642 7.20287 6.18516 7.10449C6.27405 7.0156 6.38309 6.87315 6.48222 6.75766C6.58141 6.64217 6.61407 6.55938 6.68015 6.42754C6.74627 6.29534 6.71321 6.17989 6.66384 6.08071C6.61442 5.98157 6.21862 5.00716 6.05336 4.61096C5.89265 4.22501 5.72934 4.27744 5.60815 4.27098C5.49265 4.26528 5.36085 4.26414 5.22865 4.26414C5.09646 4.26414 4.88218 4.31352 4.70061 4.51182C4.51904 4.7101 4.00771 5.18913 4.00771 6.16314C4.00771 7.13715 4.71696 8.07889 4.8161 8.21109C4.91524 8.34329 6.21212 10.3426 8.19776 11.2004C8.66998 11.4043 9.03882 11.5263 9.32638 11.6175C9.8005 11.7683 10.232 11.747 10.5731 11.6961C10.9534 11.6391 11.7443 11.2171 11.9092 10.7547C12.074 10.2924 12.074 9.89582 12.0247 9.81339C11.9753 9.73096 11.8431 9.68119 11.6452 9.58206L11.6455 9.5813Z"
                    fill="#25D366"
                  ></path>
                </svg>
              </a>

              <a href="https://www.instagram.com/propertygrouprd/">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 aspect-square"
                >
                  <defs>
                    <linearGradient
                      id="ig-gradient"
                      x1="0"
                      y1="0"
                      x2="32"
                      y2="32"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#f58529" />
                      <stop offset="0.3" stopColor="#dd2a7b" />
                      <stop offset="0.6" stopColor="#8134af" />
                      <stop offset="1" stopColor="#515bd4" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="7"
                    stroke="url(#ig-gradient)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="6"
                    stroke="url(#ig-gradient)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <circle
                    cx="22.5"
                    cy="9.5"
                    r="1.5"
                    fill="url(#ig-gradient)"
                    stroke="url(#ig-gradient)"
                    strokeWidth="1"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
