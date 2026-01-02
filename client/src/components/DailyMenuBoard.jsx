import React from 'react';

const DailyMenuBoard = ({ menu, items }) => {
  if (!menu) return null;

  // Filtrado simple basado en la categoría del plato
  const entrantes = items.filter(i => i.category === 'entrante');
  const principales = items.filter(i => i.category === 'principal');
  const postres = items.filter(i => i.category === 'postre');

  // Formateador de moneda
  const formatPrice = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="relative max-w-md mx-auto my-6 perspective-1000">
        
      {/* TARJETA PAPEL */}
      <div className="bg-[#FFFDF7] text-stone-800 p-8 rounded-sm shadow-2xl border-t-8 border-primary relative overflow-hidden">
        
        {/* Marca de agua decorativa opcional */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mr-12 -mt-12 blur-xl pointer-events-none"></div>

        {/* CABECERA */}
        <div className="text-center mb-8 border-b-2 border-double border-stone-200 pb-6">
            <h3 className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-2">Restaurante</h3>
            <h1 className="text-4xl font-serif font-bold text-primary mb-1">La Pradera</h1>
            <p className="text-xs text-gray-400 font-sans tracking-widest uppercase">Barbadillo de Herreros</p>
            
            <div className="mt-4 bg-stone-100 inline-block px-4 py-1 rounded-full border border-stone-200">
                <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">
                    {new Date(menu.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
        </div>

        {/* LISTA DE PLATOS */}
        <div className="space-y-8 px-2">
            
            {/* Primeros */}
            {entrantes.length > 0 && (
                <div className="text-center group">
                    <h3 className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-secondary/30"></span> Primeros <span className="w-8 h-[1px] bg-secondary/30"></span>
                    </h3>
                    <ul className="space-y-3">
                        {entrantes.map(dish => (
                            <li key={dish.id} className="font-serif text-lg leading-tight text-gray-800">
                                {dish.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Segundos */}
            {principales.length > 0 && (
                <div className="text-center group">
                    <h3 className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-secondary/30"></span> Segundos <span className="w-8 h-[1px] bg-secondary/30"></span>
                    </h3>
                    <ul className="space-y-3">
                        {principales.map(dish => (
                            <li key={dish.id} className="font-serif text-lg leading-tight text-gray-800">
                                {dish.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

             {/* Postres */}
             {postres.length > 0 && (
                <div className="text-center group">
                    <h3 className="text-secondary font-bold uppercase tracking-widest text-xs mb-4 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-secondary/30"></span> Postres <span className="w-8 h-[1px] bg-secondary/30"></span>
                    </h3>
                    <ul className="space-y-3">
                        {postres.map(dish => (
                            <li key={dish.id} className="font-serif text-lg leading-tight text-gray-800">
                                {dish.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* PRECIO */}
        <div className="mt-10 pt-6 border-t border-dashed border-gray-300 text-center">
             <div className="inline-block relative">
                <span className="text-4xl font-serif font-bold text-primary">{formatPrice(menu.price)}</span>
                {/* Etiqueta pequeña "IVA Incluido" */}
                <span className="absolute -right-8 top-0 text-[0.5rem] text-gray-400 rotate-90 origin-left">IVA INC.</span>
             </div>
             <p className="text-xs text-stone-500 mt-2 font-sans">Pan, agua y vino incluidos</p>
        </div>
        
        {/* Decoración inferior */}
        <div className="h-2 bg-primary/10 w-full absolute bottom-0 left-0"></div>
      </div>
    </div>
  );
};

export default DailyMenuBoard;
