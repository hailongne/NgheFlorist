import React from 'react'
import ProductCard from './ProductCard'

type Product = { id: number; name: string; price: number; currency: string; slug?: string }

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section id="products" className="product-grid container">
      <h3>Featured products</h3>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} currency={p.currency} slug={p.slug || String(p.id)} />
        ))}
      </div>
    </section>
  )
}
