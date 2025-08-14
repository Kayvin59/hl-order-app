import './App.css'
import OrderForm from './components/order-form'

function App() {
  return (
    <>
      <div className='flex flex-col items-center'>
        <h1 className="mb-4 text-3xl font-bold underline">Hyperliquid Order APP</h1>
          <OrderForm />
      </div>
    </>
  )
}

export default App
