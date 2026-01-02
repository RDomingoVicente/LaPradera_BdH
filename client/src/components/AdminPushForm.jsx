import { useState } from 'react';
import { Send, Bell } from 'lucide-react';

export default function AdminPushForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'; // Adjust as needed
    // Assuming backend is on port 3000 or same host if proxied.
    // In dev, usually vite proxies /api or we use full URL.
    // Let's assume standard local setup: client 5173, server 3000.
    
    try {
      const response = await fetch(`${SERVER_URL}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${process.env.ADMIN_SECRET}` // If implemented
        },
        body: JSON.stringify({ title, message })
      });

      if (!response.ok) {
        throw new Error('Error enviando notificación');
      }

      const data = await response.json();
      setStatus({ type: 'success', msg: 'Notificaciones enviadas correctamente' });
      setTitle('');
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: ¡Menú del día listo!"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Mensaje</label>
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)}
          placeholder="Hoy tenemos cocido montañés..."
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-24"
          required
        />
      </div>
      
      {status && (
        <div className={`text-sm p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.msg}
        </div>
      )}

      <button 
        type="submit" 
        disabled={sending}
        className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
      >
        {sending ? 'Enviando...' : (
            <>
                <Send size={18} /> Enviar Aviso a Todos
            </>
        )}
      </button>
    </form>
  );
}
