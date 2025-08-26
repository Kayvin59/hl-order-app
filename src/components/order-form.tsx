import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { getMidPrice, placeOrder } from '../services/hyperliquidServices';

const OrderForm = () => {
  const [pair, setPair] = useState('HYPE-PERP');
  const [isSelected, setIsSelected] = useState({ buy: false, sell: false });
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  // const [maxLeverage, setMaxLeverage] = useState(50);


  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Fetch current mid price for selected pair
  useEffect(() => {
    const fetchMidPrice = async () => {
      const price = await getMidPrice(pair);
      if (price) setCurrentPrice(price);
    };
    fetchMidPrice();
  }, [pair]);

  // TODO: Fix leverage range
  // Fetch and set max leverage for selected pair
/*   useEffect(() => {
    const fetchLimits = async () => {
      const maxLev = await getMaxLeverage(pair);
      setLeverage((prev) => Math.min(prev, maxLev));
      setMaxLeverage(maxLev);
    };
    fetchLimits();
  }, [pair]); */



  return (
    <>
      <h2 className="text-center text-2xl font-light text-teal-600">Place Order</h2>
      <div className="max-w-md mx-auto bg-white p-6 border border-teal-500 rounded-lg shadow mt-6">
        
        {/* Trading Pair Selection */}
        <div className="mb-4">
          <label htmlFor="pair-selection" className="block mb-2 text-emerald-950">Trading Pair</label>
          <select
            id="pair-selection"
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
          <label htmlFor="quantity-input" className="block mb-2">Quantity</label>
          <input
            id="quantity-input"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder="e.g., 1 HYPE"
            min="0.01"
          />
        </div>

        {/* Price input */}
        <div className="mb-4">
          <label htmlFor="price-input" className="block mb-2">Limit Price</label>
          <input
            id="price-input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder={currentPrice ? `Current ≈ ${currentPrice}` : "e.g., 0.02 USDC"}
            min={currentPrice ? (currentPrice * 0.5).toFixed(4) : "0.0001"}
          />
        </div>

        {/* 🔹 Leverage Slider */}
        <div className="relative mb-6">
          <label htmlFor="leverage-range" className="block mb-2">Leverage</label>
          <div className="relative w-full">
            <input
              id="leverage-range"
              type="range"
              min="1"
              max="50"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
              style={{
                background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(leverage - 1) / 49 * 100}%, #e5e7eb ${(leverage - 1) / 49 * 100}%, #e5e7eb 100%)`
              }}
            />

            {/* Tooltip */}
            <div
              className="absolute -bottom-6 px-2 py-1 text-xs font-semibold bg-teal-600 text-white rounded shadow transition-all"
              style={{
                left: `calc(${((leverage - 1) / 49) * 100}% - 10px)`,
                minWidth: "32px",
                textAlign: "center"
              }}
            >
              {leverage}x
            </div>
          </div>

          {/* Static labels under slider */}
          <div className="flex justify-between mt-7 text-sm text-gray-500">
            <span>1x</span>
            <span>10x</span>
            <span>20x</span>
            <span>30x</span>
            <span>40x</span>
            <span>50x</span>
          </div>
        </div>


        {/* Action button */}
        <button
          onClick={() =>
            placeOrder(authenticated, wallets, pair, isSelected, price, quantity, setStatus, leverage)
          }
          className="border border-transparent w-full bg-teal-600 text-white p-2 rounded shadow-md hover:border-teal-950 hover:shadow-lg"
          disabled={!authenticated || Number(price) <= 0 || Number(quantity) <= 0}
        >
          Place Order
        </button>

        {/* Status messages */}
        {status && (
          <div className={`mt-4 text-center p-2 rounded ${status.includes('success') ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
            {status.includes('success') ? (
              <p>
                ✅ Order placed successfully.{' '}
                <a
                  href={status.split('|')[1]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-teal-700"
                >
                  View on Explorer
                </a>
              </p>
            ) : (
              <p>{status}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderForm;
