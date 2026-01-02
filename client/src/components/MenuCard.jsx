import React from 'react';
import { Utensils } from 'lucide-react';

const MenuCard = ({ dish }) => {
  // Desestructuramos usando los nombres de Antigravity
  const { name, description, price, photo_url, allergens, category } = dish;

  // Formateador de moneda
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="bg-surface rounded-xl shadow-md overflow-hidden border border-stone-200 flex flex-col h-full group transition-transform hover:-translate-y-1">
      
      {/* IMAGEN */}
      <div className="h-48 w-full relative overflow-hidden bg-gray-100">
        {photo_url ? (
            <img 
              src={photo_url} 
              alt={name} 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
        ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <Utensils className="mb-2 opacity-20" size={40} />
                <span className="text-xs uppercase tracking-widest opacity-40">Sin foto</span>
            </div>
        )}
        
        {/* Precio flotante (Estilo etiqueta) */}
        <span className="absolute bottom-3 right-3 bg-secondary text-white px-3 py-1 rounded-lg font-bold shadow-lg text-sm border-2 border-white/20 backdrop-blur-sm">
          {formatPrice(price)}
        </span>
      </div>
      
      {/* CONTENIDO */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-serif font-bold text-primary leading-tight">{name}</h3>
        </div>
        
        <p className="text-text/70 text-sm mb-4 line-clamp-3 flex-1 font-sans">
          {description}
        </p>
        
        {/* ALÉRGENOS (Badges) */}
        {allergens && allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-gray-100">
            {allergens.map((allergen) => (
              <span 
                key={allergen} 
                className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200 font-bold"
              >
                {allergen}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;