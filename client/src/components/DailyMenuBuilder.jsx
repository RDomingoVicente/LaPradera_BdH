import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Calendar, Check, Loader2 } from 'lucide-react';

const DailyMenuBuilder = () => {
    // Estado inicial
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [price, setPrice] = useState(14.00);
    const [dishes, setDishes] = useState([]);
    const [selectedDishes, setSelectedDishes] = useState([]); // Array de IDs
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Cargar platos al iniciar
    useEffect(() => {
        fetchDishes();
    }, []);

    const fetchDishes = async () => {
        setLoading(true);
        // Traemos solo los disponibles para no llenar la lista de cosas viejas
        const { data, error } = await supabase
            .from('dishes')
            .select('*')
            .eq('available', true) 
            .order('name');
            
        if (data) setDishes(data);
        setLoading(false);
    };

    // Manejar selección (Checkboxes)
    const handleToggleDish = (dishId) => {
        if (selectedDishes.includes(dishId)) {
            setSelectedDishes(selectedDishes.filter(id => id !== dishId));
        } else {
            setSelectedDishes([...selectedDishes, dishId]);
        }
    };

    // GUARDAR EL MENÚ
    const handleSubmit = async () => {
        try {
            setSaving(true);
            
            // 1. Verificar si ya hay menú para esa fecha y borrarlo (para evitar duplicados)
            await supabase.from('daily_menus').delete().eq('date', date);

            // 2. Crear Menú (Cabecera)
            const { data: menuData, error: menuError } = await supabase
                .from('daily_menus')
                .insert([{ 
                    date, 
                    price: parseFloat(price), 
                    active: true 
                }])
                .select()
                .single();

            if (menuError) throw menuError;

            // 3. Crear Relaciones (Platos del menú)
            if (selectedDishes.length > 0) {
                const menuItems = selectedDishes.map(dishId => ({
                    menu_id: menuData.id,
                    dish_id: dishId
                    // Nota: Usamos la categoría original del plato para ordenarlos
                }));

                const { error: itemsError } = await supabase
                    .from('daily_menu_items')
                    .insert(menuItems);

                if (itemsError) throw itemsError;
            }

            alert('¡Menú del día publicado correctamente!');
            
        } catch (error) {
            console.error(error);
            alert('Error al publicar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Agrupar platos para mostrarlos ordenados en el selector
    const groupedDishes = {
        entrante: dishes.filter(d => d.category === 'entrante'),
        principal: dishes.filter(d => d.category === 'principal'),
        postre: dishes.filter(d => d.category === 'postre'),
    };

    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg border border-stone-200 mt-6">
            <div className="flex items-center gap-2 mb-6 border-b pb-4 border-gray-200">
                <Calendar className="text-primary" />
                <h2 className="text-xl font-serif font-bold text-primary">Configurar Menú del Día</h2>
            </div>
            
            {/* Configuración Fecha y Precio */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Fecha</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-primary outline-none" 
                    />
                </div>
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Precio (€)</label>
                    <input 
                        type="number" 
                        step="0.5" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white font-bold text-primary text-center focus:ring-2 focus:ring-primary outline-none" 
                    />
                </div>
            </div>

            {/* Selectores por Categoría */}
            {loading ? (
                <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-primary"/></div>
            ) : (
                ['entrante', 'principal', 'postre'].map(category => (
                    <div key={category} className="mb-4">
                        <h3 className="text-sm font-bold text-white bg-primary/80 px-3 py-1 rounded-t-lg inline-block capitalize tracking-wide">
                            {category === 'principal' ? 'Segundos' : category + 's'}
                        </h3>
                        <div className="bg-stone-50 border border-stone-200 p-2 rounded-b-lg rounded-tr-lg max-h-48 overflow-y-auto grid grid-cols-1 gap-2">
                            {groupedDishes[category].map(dish => (
                                <label 
                                    key={dish.id} 
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                        selectedDishes.includes(dish.id) 
                                        ? 'bg-secondary text-white shadow-md transform scale-[1.01]' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                                    }`}
                                >
                                    <span className="text-sm font-medium">{dish.name}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedDishes.includes(dish.id)}
                                        onChange={() => handleToggleDish(dish.id)}
                                        className="hidden" // Ocultamos el checkbox nativo y usamos estilos
                                    />
                                    {selectedDishes.includes(dish.id) && <Check size={18} />}
                                </label>
                            ))}
                            {groupedDishes[category].length === 0 && (
                                <p className="text-xs text-gray-400 p-2 italic">No hay platos disponibles en esta categoría.</p>
                            )}
                        </div>
                    </div>
                ))
            )}

            <button 
                onClick={handleSubmit} 
                disabled={saving || loading} 
                className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-900 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {saving ? <><Loader2 className="animate-spin"/> Publicando...</> : <><Save size={20}/> Publicar Menú</>}
            </button>
        </div>
    );
};

export default DailyMenuBuilder;
