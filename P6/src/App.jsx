import { useState } from 'react';
import useSWR from 'swr';

import Card from './components/Card';
import Product from './components/Product';

//Fetcher para datos
const fetcher = (url) => fetch(url).then((res) => res.json());

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null); //Variable para seleccionar el producto

  //Pillamos los datos de la API
  const {data, error} = useSWR("https://fakestoreapi.com/products", fetcher);

  if (error) return <p className='mt-5 text-center'>Error al cargar los datos</p>;
  if(!data) return <p className='mt-5 text-center'>Cargando...</p>;

  //Tomamos solo los primeros 3 producots
  const products = data.slice(0,3);

  return (
    <div className='flex justify-center pt-20 items-center h-screen'>
      {selectedProduct ? (
        <Product key={selectedProduct.id} product={selectedProduct} onSelect={() => setSelectedProduct(null)}/>
      ) 
      : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-32 p-6'>
        {products.map((product) => (
          <Card key={product.id} product={product} onSelect={() => setSelectedProduct(product)}/>
        ))}
      </div>) }
    </div>

  );
}

export default App
