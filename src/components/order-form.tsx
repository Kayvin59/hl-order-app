import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useState } from 'react';
import { initializeHyperliquid } from '../lib/hyperliquid';

const OrderForm = () => {
  const [pair, setPair] = useState('HYPE');
  const [isBuy, setIsBuy] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');

  const { ready, login, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();

  const disableLogout = !ready || (ready && !authenticated);

  const placeOrder = async () => {
    if (!authenticated || !wallets.length) {
      setStatus('Please log in and connect a wallet');
      return;
    }

    try {
      // Get the Ethereum provider from Privy and wrap it with ethers
      const ethereumProvider = await wallets[0].getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await ethersProvider.getSigner();

      const { infoClient, exchClient } = await initializeHyperliquid(signer);

      // Fetch meta data and find coin index
      const meta = await infoClient.meta();
      console.log('Available pairs:', meta.universe.map(coin => coin.name));
      const coinIndex = meta.universe.findIndex((coin) => coin.name === pair);
      console.log('Coin Index:', coinIndex);

      if (coinIndex === -1) {
        setStatus('Invalid trading pair');
        console.error('Invalid trading pair:', pair);
        return;
      }

      const preTransferCheck = await infoClient.preTransferCheck({
        user: await signer.getAddress() as `0x${string}`,
        source: '0x2222222222222222222222222222222222222222', // Default source for HyperEVM
      });
      console.log('PreTransferCheck:', preTransferCheck);
      
      if (!preTransferCheck.userExists) {
        setStatus('Hyperliquid account does not exist for this wallet.');
        return;
      }

      const result = await exchClient.order({
        orders: [{
          a: coinIndex,
          b: isBuy,
          p: price,
          s: quantity,
          r: false,
          t: { limit: { tif: 'Gtc' } },
        }],
        grouping: 'na',
      });

      setStatus('Order placed successfully: ' + JSON.stringify(result));
    } catch (error) {
      console.error('Error placing order:', error);
      setStatus('Failed to place order: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-8 bg-white text-black rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl mb-4 text-center">Place Order</h2>
      {!authenticated ? (
        <button
          onClick={login}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 mb-4"
        >
          Log In
        </button>
      ) : (
        <>
        <p className="mb-4 text-center">Connected: {wallets[0]?.address}</p>
        <button
          onClick={logout}
          disabled={disableLogout}
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 mb-4"
        >
          Logout
        </button>
        </>
      )}
      <div className="mb-4">
        <label className="block mb-2">Trading Pair</label>
        <input
          type="text"
          value={pair}
          onChange={(e) => setPair(e.target.value.toUpperCase())}
          className="w-full p-2 border rounded text-black"
          placeholder="e.g., BTC-PERP"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Order Type</label>
        <select
          value={isBuy ? 'buy' : 'sell'}
          onChange={(e) => setIsBuy(e.target.value === 'buy')}
          className="w-full p-2 border rounded text-black"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded text-black"
          placeholder="e.g., 0.1"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Limit Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded text-black"
          placeholder="e.g., 30000"
        />
      </div>
      <button
        onClick={placeOrder}
        className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        disabled={!authenticated}
      >
        Place Order
      </button>
      {status && <p className="mt-4 text-center">{status}</p>}
    </div>
  );
};

export default OrderForm;