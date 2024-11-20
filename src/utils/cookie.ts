import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

export const config = createConfig({
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
});
