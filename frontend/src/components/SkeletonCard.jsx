const SkeletonCard = ({ width = 'w-full', height = 'h-64', className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${width} ${className}`}>
      <div className={`${height} bg-gray-200 animate-pulse`}></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="pt-4 flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
