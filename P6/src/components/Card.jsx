import React from "react";

export default function Card({ product, onSelect }) {
    return (
        <div className="card bg-base-100 w-96 shadow-xl">
            <figure>
                <img
                    src={product.image}
                    alt={product.title} className="h-64 mx-auto" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{product.title}</h2>
                <p>{product.description}</p>
                <div className="card-actions justify-end">
                    <button onClick={onSelect} className="btn btn-primary">Buy Now</button>
                </div>
            </div>
        </div>
    )
}