import React from 'react'
import Link from 'next/link'

const Breadcrumbs = ({ product }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">

    {product.productCategories && product.productCategories.nodes && product.productCategories.nodes.length > 0 && (
        <>
            <Link
                href={`/product-category/${product.productCategories.nodes[0].slug}`}
                className="hover:text-orange-500 transition-colors"
            >
                {product.productCategories.nodes[0].name}
            </Link>
        </>
    )}
    <span>/</span>
    <span className="text-gray-900 font-medium">{product.title}</span>
</nav>
  )
}

export default Breadcrumbs