import { useState } from 'react'

import Card from './components/Card';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='flex justify-center pt-20 items-center h-screen'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-32 p-6'>
        <Card />
        <Card />
        <Card />
      </div>
    </div>

  );
}

export default App
