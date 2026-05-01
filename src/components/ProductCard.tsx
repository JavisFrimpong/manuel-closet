import React, { useState } from 'react';
import { ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../lib/types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div
      className="group bg-dark-800 rounded-2xl overflow-hidden border border-dark-700 hover:border-brand-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1"
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-dark-700">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="text-dark-600" size={48} />
            <span className="text-dark-600 text-xs">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
              Out of Stock
            </span>
          )}
          {!isOutOfStock && product.stock_quantity <= 5 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Quick View Overlay */}
        {showQuickAdd && !isOutOfStock && (
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-[2px] flex items-end p-4 animate-fade-in">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-500 hover:bg-brand-600 text-white'
              }`}
            >
              {added ? '✓ Added to Cart' : 'Quick Add'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-brand-400 font-medium uppercase tracking-wider">{product.category}</span>
            <h3 className="text-white font-semibold text-sm mt-0.5 truncate group-hover:text-brand-300 transition-colors">
              {product.name}
            </h3>
          </div>
          <p className="text-brand-400 font-bold text-lg flex-shrink-0">₵{product.price.toFixed(2)}</p>
        </div>

        {product.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-gray-500 text-xs mb-1.5">Size</p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedSize === size
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                      : 'border-dark-600 text-gray-400 hover:border-dark-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-1.5">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedColor === color
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                      : 'border-dark-600 text-gray-400 hover:border-dark-500'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          id={`add-to-cart-${product.id}`}
          className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
            isOutOfStock
              ? 'bg-dark-700 text-gray-600 cursor-not-allowed'
              : added
              ? 'bg-green-500 text-white'
              : 'bg-dark-700 hover:bg-brand-500 text-gray-300 hover:text-white border border-dark-600 hover:border-brand-500'
          }`}
        >
          <ShoppingBag size={15} />
          {isOutOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
