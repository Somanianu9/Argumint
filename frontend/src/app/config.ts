import { createConfig } from "@0xsequence/connect";

export const config = createConfig("waas" /*or, 'universal'*/, {
  projectAccessKey: "AQAAAAAAAKgVMzcagySytUTCknIxx8It4bI",
  chainIds: [128123],
  defaultChainId: 128123,
  appName: "Demo Dapp",
  waasConfigKey: "eyJwcm9qZWN0SWQiOjQzMDI5LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=", // for waas
  google: {
    clientId: "<your-google-client-id>",
  },
  walletConnect: {
    projectId: "<your-wallet-connect-project-id>",
  },
});