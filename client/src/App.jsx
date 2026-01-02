import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, UtensilsCrossed, Calendar, User, MessageCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

// Importamos las fotos (Asegúrate de tenerlas en assets)
import heroImage from './assets/hero-bg.jpg'; 

// Importamos los componentes que generó Antigravity (asumiendo que existen en su carpeta)
import MenuCard from './components/MenuCard';
import DailyMenuBoard from './components/DailyMenuBoard';
import AdminDishForm from './components/AdminDishForm';
import DailyMenuBuilder from './components/DailyMenuBuilder';

// --- COMPONENTES DE PÁGINA (Integrados con el nuevo diseño) ---

// 1. PORTADA (Diseño visual nuevo con foto Terraza)
const HomePage = () => (
  <div className="pb-24">
    {/* HERO SECTION */}
    <div className="relative h-72 md:h-96 w-full overflow-hidden rounded-b-3xl shadow-lg">
      <img src={heroImage} alt="Terraza La Pradera" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-white text-4xl md:text-6xl font-serif font-bold drop-shadow-md mb-2">La Pradera</h1>
        <p className="text-white/90 text-lg font-sans">Barbadillo de Herreros</p>
        <div className="mt-4 px-4 py-1 bg-primary/80 text-white rounded-full text-sm backdrop-blur-sm border border-green-600">
          Abierto hoy hasta las 23:00
        </div>
      </div>
    </div>

    {/* TARJETAS DE ACCESO RÁPIDO */}
    <div className="p-6 grid gap-4 max-w-md mx-auto -mt-10 relative z-10">
      <Link to="/menu-dia">
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-secondary flex justify-between items-center transform active:scale-95 transition-transform">
          <div>
            <h2 className="text-xl font-serif font-bold text-primary">Menú del Día</h2>
            <p className="text-gray-500 text-sm">Ver platos de hoy</p>
          </div>
          <Calendar className="text-secondary" size={32} />
        </div>
      </Link>
      
      <Link to="/carta">
        <div className="bg-surface p-6 rounded-xl shadow-md border-l-4 border-primary flex justify-between items-center transform active:scale-95 transition-transform">
          <div>
            <h2 className="text-xl font-serif font-bold text-primary">Nuestra Carta</h2>
            <p className="text-gray-500 text-sm">Raciones y picoteo</p>
          </div>
          <UtensilsCrossed className="text-primary" size={32} />
        </div>
      </Link>
    </div>
  </div>
);

// 2. CARTA DIGITAL (Lógica de Antigravity + Diseño Nuevo)
const MenuCartaPage = () => {
  const [dishes, setDishes] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDishes = async () => {
      // CORRECCIÓN AQUÍ: Usamos 'available' en lugar de 'is_available'
      let query = supabase.from('dishes').select('*').eq('available', true);
      
      if (filter !== 'all') query = query.eq('category', filter); // Nota: Revisa si en tu DB es 'category' o 'category_id'
      
      const { data, error } = await query;
      if (error) console.error("Error cargando carta:", error);
      if (data) setDishes(data);
    };
    fetchDishes();
  }, [filter]);

  // Categorías
  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'entrante', label: 'Entrantes' },
    { id: 'principal', label: 'Principal' },
    { id: 'racion', label: 'Raciones' },
    { id: 'postre', label: 'Postres' }, // Agregado Postre
  ];

  return (
    <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-primary mb-6">Nuestra Carta</h2>
      
      {/* Filtros horizontales */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
              filter === cat.id 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Platos */}
      <div className="grid grid-cols-1 gap-4">
        {dishes.length > 0 ? (
            dishes.map(dish => <MenuCard key={dish.id} dish={dish} />)
        ) : (
            <div className="text-center py-10">
                <p className="text-gray-500">Cargando platos...</p>
                <p className="text-xs text-gray-400 mt-2">(Si no ves nada, prueba a añadir un plato en Admin)</p>
            </div>
        )}
      </div>
    </div>
  );
};

// 3. PÁGINA DE MENÚ DEL DÍA (Lógica de Antigravity)
const DailyMenuPage = () => {
    const [menu, setMenu] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDailyMenu = async () => {
            const today = new Date().toISOString().split('T')[0];
            
            // 1. Buscar menú del día activo
            const { data: menuData, error } = await supabase
                .from('daily_menus')
                .select('*')
                .eq('date', today)
                .eq('active', true) // CORRECCIÓN AQUÍ: 'active' en vez de 'is_active'
                .maybeSingle();
            
            if (error) console.error("Error buscando menú:", error);

            if (menuData) {
                setMenu(menuData);
                
                // 2. Buscar los platos relacionados
                const { data: itemsData, error: itemsError } = await supabase
                    .from('daily_menu_items')
                    .select('dish_id, dishes(*)') 
                    .eq('menu_id', menuData.id);
                
                if (itemsError) console.error("Error buscando platos del menú:", itemsError);
                
                // Mapeamos para sacar el objeto 'dishes' limpio
                if (itemsData) setItems(itemsData.map(i => i.dishes));
            }
            setLoading(false);
        };
        fetchDailyMenu();
    }, []);

    if (loading) return <div className="text-center py-20">Buscando menú de hoy...</div>;

    return (
        <div className="pb-24 pt-6 px-4">
             <h2 className="text-3xl font-serif font-bold text-primary mb-4 text-center">Menú del Día</h2>
             {menu ? (
                <DailyMenuBoard menu={menu} items={items} />
             ) : (
                <div className="bg-surface p-8 rounded-xl shadow text-center border border-gray-200 mt-10">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-bold">Menú no disponible online hoy.</p>
                    <p className="text-sm mt-2 text-gray-400">¡Pregúntanos en barra o consulta la pizarra del local!</p>
                </div>
             )}
        </div>
    );
};

// 4. ADMIN PAGE (Simple wrapper)
const AdminPage = () => (
    <div className="pb-24 pt-6 px-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-serif text-primary mb-6 border-b pb-2">Gestión La Pradera</h1>
        <div className="bg-surface p-4 rounded-xl shadow mb-8">
            <h3 className="font-bold text-lg mb-4">Añadir Nuevo Plato</h3>
            <AdminDishForm />
        </div>
        <div className="bg-surface p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-4">Montar Menú del Día</h3>
            <DailyMenuBuilder />
        </div>
    </div>
);

// --- COMPONENTES DE UI ---

// Navegación Inferior Móvil (Tu diseño nuevo)
const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "text-secondary font-bold" : "text-white/70 hover:text-white";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary pb-safe pt-3 px-6 shadow-[0_-4px_10px_rgba(0,0,0,0.15)] z-50 md:hidden rounded-t-2xl">
      <div className="flex justify-between items-end h-14 max-w-md mx-auto pb-2">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
          <HomeIcon size={24} />
          <span className="text-[10px]">INICIO</span>
        </Link>
        <Link to="/carta" className={`flex flex-col items-center gap-1 ${isActive('/carta')}`}>
          <UtensilsCrossed size={24} />
          <span className="text-[10px]">CARTA</span>
        </Link>
        
        {/* Botón Central Flotante para Menú del Día */}
        <Link to="/menu-dia" className="relative -top-6">
          <div className="bg-secondary p-4 rounded-full shadow-lg border-4 border-background transform transition-transform active:scale-90">
            <Calendar size={28} color="white" />
          </div>
        </Link>

        <Link to="/reservas" className={`flex flex-col items-center gap-1 ${isActive('/reservas')}`}>
          <MessageCircle size={24} />
          <span className="text-[10px]">RESERVAR</span>
        </Link>
        <Link to="/admin" className={`flex flex-col items-center gap-1 ${isActive('/admin')}`}>
          <User size={24} />
          <span className="text-[10px]">ADMIN</span>
        </Link>
      </div>
    </nav>
  );
};

// --- APP PRINCIPAL ---

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans text-text antialiased selection:bg-secondary selection:text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/carta" element={<MenuCartaPage />} />
          <Route path="/menu-dia" element={<DailyMenuPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/reservas" element={
            <div className="p-10 text-center pt-20">
               <h2 className="text-2xl font-serif text-primary mb-4">Reservas</h2>
               <p className="mb-6">Para reservar, envíanos un WhatsApp:</p>
               <a href="https://wa.me/34600000000" className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg inline-flex items-center gap-2">
                 <MessageCircle /> Enviar WhatsApp
               </a>
            </div>
          } />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
