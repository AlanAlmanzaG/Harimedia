// src/components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="flex gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
      {/* Esqueleto de la imagen */}
      <div className="w-24 h-36 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0"></div>
      
      {/* Esqueleto del contenido */}
      <div className="flex flex-col flex-grow py-1 space-y-3">
        {/* Título y Director */}
        <div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        </div>
        
        {/* Etiquetas (Año, Género) */}
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
        </div>
        
        {/* Estado y Calificación (Abajo) */}
        <div className="mt-auto flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
}