import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { placeOrder } from '../services/hyperliquidServices';

const OrderForm = () => {
  const [pair, setPair] = useState('HYPE-PERP');
  const [isSelected, setIsSelected] = useState({ buy: false, sell: false });
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');

  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  return (
    <>
      <h2 className="text-center text-2xl font-light text-teal-600">Place Order</h2>
      <div className="max-w-md mx-auto bg-white p-6 border border-teal-500 rounded-lg shadow mt-6">
        {/* Trading Pair Selection */}
        <div className="mb-4">
          <label className="block mb-2 text-emerald-950">Trading Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
          >
            <option value="HYPE-PERP">HYPE-PERP</option>
            <option value="BTC-PERP" disabled>BTC-PERP</option>
            <option value="SOL-PERP" disabled>SOL-PERP</option>
          </select>
        </div>

        {/* Buy / Sell buttons */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setIsSelected({ buy: true, sell: false })}
            className={`flex-1 p-2 border border-transparent rounded hover:border hover:border-teal-950 ${isSelected.buy ? 'bg-teal-600 text-white hover:border-white' : 'bg-emerald-200 text-teal-950'}`}
          >
            Buy
          </button>
          <button
            onClick={() => setIsSelected({ buy: false, sell: true })}
            className={`flex-1 p-2 border border-transparent rounded hover:border hover:border-teal-950 ${isSelected.sell ? 'bg-teal-600 text-white hover:border-white' : 'bg-emerald-200 text-teal-950'}`}
          >
            Sell
          </button>
        </div>

        {/* Quantity input */}
        <div className="mb-4">
          <label className="block mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder="e.g., 1 HYPE"
          />
        </div>

        {/* Price input */}
        <div className="mb-4">
          <label className="block mb-2">Limit Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder="e.g., 0.02 USDC"
          />
        </div>

        {/* Action buttons */}
        <button
          onClick={() => placeOrder(authenticated, wallets, pair, isSelected, price, quantity, setStatus)}
          className="border border-transparent w-full bg-teal-600 text-white p-2 rounded shadow-md hover:border-teal-950 hover:shadow-lg"
          disabled={!authenticated}
        >
          Place Order
        </button>

        {/* Status messages */}
        {status && (
          <p className={`mt-4 text-center ${status.includes('success') ? 'bg-teal-100' : 'bg-red-100'} p-2 rounded`}>
            {status}
          </p>
        )}
      </div>
    </>
  );
};

export default OrderForm;
