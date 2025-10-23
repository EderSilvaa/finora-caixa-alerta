// Componentes SVG com logos oficiais dos bancos

export const NubankLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="24" fill="#8A05BE"/>
    <text x="100" y="130" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="white" textAnchor="middle">nu</text>
  </svg>
);

export const ItauLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="24" fill="#EC7000"/>
    <text x="100" y="135" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="white" textAnchor="middle">itaú</text>
  </svg>
);

export const InterLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" rx="24" fill="#FF7A00"/>
    <text x="100" y="135" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="bold" fill="white" textAnchor="middle">inter</text>
  </svg>
);

export const SantanderLogo = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="white"/>
    {/* Santander flame logo */}
    <path d="M70 60 L80 50 L90 60 L100 50 L110 60 L100 80 L90 70 L80 80 Z" fill="#EC0000"/>
    <text x="100" y="150" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="bold" fill="#EC0000" textAnchor="middle">Santander</text>
  </svg>
);
