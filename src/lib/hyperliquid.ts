import * as hl from '@nktkas/hyperliquid';
import { ethers } from 'ethers';

export const initializeHyperliquid = async (signer: ethers.Signer) => {
  const transport = new hl.HttpTransport({ isTestnet: true });
  const infoClient = new hl.InfoClient({ transport });
  const exchClient = new hl.ExchangeClient({ wallet: signer, transport });

  return { infoClient, exchClient };
};