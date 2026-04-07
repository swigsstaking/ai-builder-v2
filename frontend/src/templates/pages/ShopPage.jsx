import React from 'react';
import { Star, ShoppingCart, SlidersHorizontal } from 'lucide-react';

/**
 * ShopPage - Product listing page with grid layout, product cards, filters.
 * Extracted from the original AI Builder v1 bundle (qm component).
 */
const ShopPage = ({ content, pageContent, colors, siteName, designStyle, styleConfig }) => {
  const { primary, secondary } = colors;
  const config = styleConfig || { borderRadius: 'rounded-lg', buttonStyle: 'rounded-lg' };
  const products = pageContent?.products || [];
  const title = pageContent?.title || 'Notre Boutique';
  const subtitle = pageContent?.subtitle || 'Découvrez tous nos produits';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-16 px-6" style={{ backgroundColor: secondary }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/70">{subtitle}</p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-4 px-6 bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-gray-500">
            <span className="font-semibold text-gray-900">{products.length}</span> produits
          </p>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" /> Filtrer
          </button>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, idx) => (
                <div
                  key={idx}
                  className={`bg-white ${config.borderRadius} overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer`}
                >
                  <div
                    className="h-56 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: `${primary}08` }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primary}15` }}
                      >
                        <Star className="w-10 h-10" style={{ color: primary }} />
                      </div>
                    )}
                    <button
                      className="absolute bottom-4 right-4 p-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: primary }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors"
                      style={{ color: secondary }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {product.price && (
                        <p className="font-bold text-xl" style={{ color: primary }}>
                          {product.price}
                        </p>
                      )}
                      <button
                        className={`px-4 py-2 ${config.buttonStyle} text-sm font-medium text-white transition-colors`}
                        style={{ backgroundColor: primary }}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${primary}10` }}
              >
                <ShoppingCart className="w-12 h-12" style={{ color: primary }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit pour le moment
              </h3>
              <p className="text-gray-500">Notre catalogue sera bientôt disponible</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
