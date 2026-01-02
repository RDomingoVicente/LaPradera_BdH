import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Upload, Loader2, CheckCircle, Image as ImageIcon, X } from 'lucide-react';

const ALLERGENS_LIST = [
    'gluten', 'lacteos', 'huevos', 'frutos_de_cascara', 'pescado', 'marisco', 'soja', 'apio', 'mostaza', 'sesamo', 'sulfitos'
];

const AdminDishForm = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'entrante',
        photo_url: '',
        allergens: [],
        available: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAllergenChange = (allergen) => {
        setFormData(prev => {
            const current = prev.allergens || []; // Aseguramos que sea array
            if (current.includes(allergen)) {
                return { ...prev, allergens: current.filter(a => a !== allergen) };
            } else {
                return { ...prev, allergens: [...current, allergen] };
            }
        });
    };

    // Manejo de selección de fichero para previsualización
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            let finalPhotoUrl = formData.photo_url;

            // 1. Subir imagen si hay un fichero nuevo seleccionado
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`; // Usamos Date.now para evitar duplicados
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('dishes')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('dishes')
                    .getPublicUrl(filePath);
                
                finalPhotoUrl = data.publicUrl;
            }

            // 2. Guardar en Base de Datos
            const { error } = await supabase
                .from('dishes')
                .insert([{
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    photo_url: finalPhotoUrl,
                    allergens: formData.allergens,
                    available: formData.available
                }]);

            if (error) throw error;

            // 3. Resetear y Feedback
            setSuccess(true);
            setFormData({
                name: '', description: '', price: '', category: 'entrante', photo_url: '', allergens: [], available: true
            });
            setImageFile(null);
            setPreviewUrl(null);
            
            // Quitar mensaje de éxito tras 3 segundos
            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl shadow-lg border border-stone-200 space-y-6">
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                    <CheckCircle size={20} />
                    <span className="font-bold">¡Plato guardado en la carta!</span>
                </div>
            )}

            {/* FOTO (Drag & Drop visual) */}
            <div>
                <label className="block text-sm font-bold text-primary mb-2">Fotografía</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${previewUrl ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-secondary hover:bg-stone-50'}`}>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    
                    {previewUrl ? (
                        <div className="relative h-48 w-full rounded-lg overflow-hidden shadow-sm">
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Cambiar foto</span>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 flex flex-col items-center text-gray-400">
                            <ImageIcon size={48} strokeWidth={1} className="mb-2" />
                            <span className="text-sm font-medium">Toca para subir una imagen</span>
                        </div>
                    )}
                </div>
            </div>

            {/* DATOS BÁSICOS */}
            <div>
                <label className="block text-sm font-bold text-primary mb-1">Nombre del Plato</label>
                <input 
                    type="text" name="name" required 
                    value={formData.name} onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                    placeholder="Ej: Chuletón de Ávila"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-primary mb-1">Precio (€)</label>
                    <input 
                        type="number" step="0.10" name="price" required 
                        value={formData.price} onChange={handleChange} 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-primary mb-1">Categoría</label>
                    <select 
                        name="category" 
                        value={formData.category} onChange={handleChange} 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                        <option value="entrante">Entrante</option>
                        <option value="principal">Principal</option>
                        <option value="racion">Ración</option>
                        <option value="postre">Postre</option>
                        <option value="bebida">Bebida</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-primary mb-1">Descripción</label>
                <textarea 
                    name="description" rows="3" 
                    value={formData.description} onChange={handleChange} 
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ingredientes principales..."
                ></textarea>
            </div>

            {/* ALÉRGENOS */}
            <div>
                <label className="block text-sm font-bold text-primary mb-2">Alérgenos</label>
                <div className="flex flex-wrap gap-2">
                    {ALLERGENS_LIST.map(allergen => (
                        <button
                            key={allergen}
                            type="button"
                            onClick={() => handleAllergenChange(allergen)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                                formData.allergens.includes(allergen) 
                                ? 'bg-secondary text-white border-secondary shadow-sm' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-secondary'
                            }`}
                        >
                            {allergen}
                        </button>
                    ))}
                </div>
            </div>

            {/* DISPONIBILIDAD */}
            <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input 
                    type="checkbox" id="avail"
                    name="available" 
                    checked={formData.available} onChange={handleChange} 
                    className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" 
                />
                <label htmlFor="avail" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    Disponible para venta inmediata
                </label>
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-900 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Guardar Plato'}
            </button>
        </form>
    );
};

export default AdminDishForm;
