import React from "react";

export default function Product({ product, onSelect }) {
    const amount_of_stars = Math.round(product.rating.rate);

    const stars_code = Array.from({ length: 5 }, (_, i) => {
        if (i < amount_of_stars) {
          return <span key={i} className="fa fa-star" style={{ color: "orange" }}></span>;
        } else {
          return <span key={i} className="fa fa-star checked"></span>;
        }
      });

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <img
                    src={product.image}
                    className="max-w-sm rounded-lg shadow-2xl"
                    alt={product.title} />
                <div>
                    <h1 className="text-5xl font-bold">{product.title}</h1>
                    <h3 className="text-3xl font-semibold mt-5"> {product.price} €</h3>
                    <span className="stars" data-_id="{product.id}">
                        {stars_code}
                    </span>
                    <p className="py-6">
                        {product.description}
                    </p>
                    <button onClick={onSelect} className="btn btn-primary">Volver</button>
                </div>
            </div>
        </div>
    )
}