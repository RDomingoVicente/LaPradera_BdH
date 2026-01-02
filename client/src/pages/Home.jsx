import { useEffect, useState } from 'react';

// Si pusiste las imágenes en assets, impórtalas así:
// Asegúrate de que los nombres coinciden con los que guardaste
import heroImage from '../assets/hero-bg.jpg'; 

export default function Home() {
  return (
    <div className="pb-20"> {/* Padding bottom para no tapar la barra de navegación móvil */}
      
      {/* SECCIÓN HERO (La Terraza) */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-b-3xl shadow-lg">
        <img 
          src={heroImage} 
          alt="Terraza La Pradera" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-white text-4xl md:text-6xl font-serif font-bold drop-shadow-md mb-2">
            La Pradera
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-sans max-w-md">
            Tu rincón en Barbadillo de Herreros
          </p>
          <div className="mt-4 px-4 py-1 bg-green-800/80 text-white rounded-full text-sm backdrop-blur-sm border border-green-600">
            Abierto hoy hasta las 23:00
          </div>
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="p-6 grid gap-4 md:grid-cols-2 max-w-4xl mx-auto -mt-8 relative z-10">
        
        {/* Tarjeta Menú del Día */}
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-primary transform hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-serif font-bold text-primary mb-1">Menú del Día</h2>
              <p className="text-gray-500 text-sm">Comida casera de la sierra</p>
            </div>
            <span className="bg-secondary text-white font-bold px-3 py-1 rounded-lg text-sm shadow-sm">
              14,00€
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">Haz clic para ver los platos de hoy</p>
          </div>
        </div>

        {/* Tarjeta Carta */}
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-secondary transform hover:scale-[1.02] transition-transform cursor-pointer">
          <h2 className="text-xl font-serif font-bold text-primary mb-1">Nuestra Carta</h2>
          <p className="text-gray-500 text-sm">Raciones, carnes y picoteo</p>
          <div className="mt-4 flex gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Raciones</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Bocadillos</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Carnes</span>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFORMACIÓN */}
      <div className="px-6 py-4 text-center">
        <p className="text-sm text-gray-500">
          📍 Plaza Mayor, Barbadillo de Herreros<br/>
          Sierra de la Demanda
        </p>
      </div>
    </div>
  );
}