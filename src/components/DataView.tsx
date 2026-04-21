import React, { useState } from 'react';
import { 
  Database, Download, Search, Filter, 
  ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { EWMRow } from '../types';
import { cn } from '../lib/utils';

interface DataViewProps {
  data: EWMRow[];
}

export default function DataView({ data }: DataViewProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const displayedData = data.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const columns = ['Tarea de almacén', 'Documento', 'Status de tarea de almacén', 'Confirmado por', 'Actividad', 'Ubic.procedencia', 'Ubicación de destino'];

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Histórico de Datos</h2>
            <p className="text-gray-500 text-sm">Visualización cruda de todas las tareas confirmadas en el sistema.</p>
         </div>
         <button className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-2xl text-[13px] font-bold hover:bg-gray-50 transition-all shadow-sm">
            <FileText className="w-4 h-4" />
            Exportar JSON
         </button>
      </div>

       <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">TOTAL: {data.length} FILAS</span>
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">82 COLUMNAS</span>
             </div>
             
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-4">Página {page + 1} de {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-gray-100">
                      {columns.map(col => (
                        <th key={col} className="px-6 py-4 text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
                           {col}
                        </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {displayedData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                         {columns.map(col => (
                           <td key={col} className="px-6 py-3.5">
                              <span className={cn(
                                "text-xs font-medium",
                                col === 'Tarea de almacén' ? "font-mono text-blue-600" : "text-gray-600"
                              )}>
                                {row[col] || '-'}
                              </span>
                           </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
}
