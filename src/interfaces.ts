import { WalletClient, PublicClient, Transport, Chain } from "viem";
import { optimism } from "viem/chains";

export interface FarcasterAttestOptions<C extends Chain> {
  fid: bigint;
  walletAddress?: `0x${string}`;
  walletClient: WalletClient<Transport, typeof optimism>;
  publicClient: PublicClient<Transport, C>;
  onVerificationAttesting?(): any;
  resolverAddress?: `0x${string}`;
  resolverInteropAddress?: `0x${string}`;
  skipGasSupport?: boolean;
}

export interface FarcasterVerificationMessage {
  data: {
    type: string;
    fid: number;
    timestamp: number;
    network: string;
    verificationAddAddressBody: {
      address: `0x${string}`;
      claimSignature: string;
      blockHash: `0x${string}`;
      type: number;
      chainId: number;
      protocol: string;
      ethSignature: string;
    };
    verificationAddEthAddressBody: {
      address: `0x${string}`;
      claimSignature: string;
      blockHash: `0x${string}`;
      verificationType: number;
      chainId: number;
      protocol: string;
      ethSignature: string;
    };
  };
  hash: `0x${string}`;
  hashScheme: string;
  signature: string;
  signatureScheme: string;
  signer: `0x${string}`;
}

export interface FarcasterVerificationResponse {
  messages: FarcasterVerificationMessage[];
  nextPageToken: string;
}
