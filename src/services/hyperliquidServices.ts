import type { PerpsMetaAndAssetCtxs, PerpsUniverse } from '@nktkas/hyperliquid/types';
import type { ConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { initializeHyperliquid } from '../lib/hyperliquid';



/**
 * Place an order on Hyperliquid
 */

export const placeOrder = async (
  authenticated: boolean,
  wallets: ConnectedWallet[],
  pair: string,
  isSelected: { buy: boolean; sell: boolean },
  price: string,
  quantity: string,
  setStatus: (msg: string) => void
) => {
  if (!authenticated || !wallets.length) {
    setStatus('Please log in and connect a wallet');
    return;
  }

  try {
    // Get Ethereum provider and signer
    const ethereumProvider = await wallets[0].getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
    const network = await ethersProvider.getNetwork();

    console.log('Network Chain ID:', network.chainId.toString());

    // Ensure user is on HyperEVM testnet (998) or mainnet (999)
    if (network.chainId !== BigInt(998) && network.chainId !== BigInt(999)) {
      setStatus('Wrong network. Switch to HyperEVM Testnet (998) or Mainnet (999).');
      console.error('Wrong network. Chain ID detected:', network.chainId);
      return;
    }

    const signer = await ethersProvider.getSigner();
    const chainIdHex = '0x' + network.chainId.toString(16);

    // Initialize Hyperliquid clients
    const { infoClient, exchClient, agentAddress } = await initializeHyperliquid(signer, chainIdHex);

    // Store agent address for later use
    localStorage.setItem('agentAddress', agentAddress);
    console.log('Agent Wallet Address stored:', agentAddress);

    // Fetch trading metadata & contexts
    const metaAndCtx: PerpsMetaAndAssetCtxs = await infoClient.metaAndAssetCtxs();
    const meta = metaAndCtx[0];
    const ctx = metaAndCtx[1];
    console.log('Universe:', meta.universe.map((u: PerpsUniverse) => u.name));
    console.log('Contexts:', ctx);

    // Find correct coin index for selected pair
    const coinIndex = meta.universe.findIndex((u: PerpsUniverse) => `${u.name}-PERP` === pair);
    console.log('Coin Index for HYPE-PERP:', coinIndex);

    if (coinIndex === -1) {
      setStatus('Invalid trading pair');
      console.error('Invalid trading pair:', pair);
      return;
    }

    // Check if account exists on Hyperliquid
    const preTransferCheck = await infoClient.preTransferCheck({
      user: await signer.getAddress() as `0x${string}`,
      source: '0x2222222222222222222222222222222222222222',
    });
    console.log('PreTransferCheck:', preTransferCheck);

    if (!preTransferCheck.userExists) {
      setStatus('Hyperliquid account does not exist for this wallet.');
      return;
    }

    // Place the actual order
    const result = await exchClient.order({
      orders: [
        {
          a: coinIndex,
          b: isSelected.buy,
          p: price,
          s: quantity,
          r: false,
          t: { limit: { tif: 'Gtc' } },
        },
      ],
      grouping: 'na',
    });

    setStatus('Order placed successfully: ' + JSON.stringify(result));
  } catch (error) {
    console.error('Error placing order:', error);
    setStatus('Failed to place order: ' + (error as Error).message);
  }
};
