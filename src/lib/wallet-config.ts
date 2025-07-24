
import { QueryClient } from '@tanstack/react-query';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: '44-wagr',
  projectId: 'd94b2704f084c392272685d0efe2d63b',
  chains: [mainnet, polygon, arbitrum],
  ssr: true,
});

export const queryClient = new QueryClient();