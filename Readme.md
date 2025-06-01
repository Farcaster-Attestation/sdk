# Farcaster Attestation SDK

> Note: This is a beta version of the SDK and is not yet ready for production use. It's intended to be used for auditing and development purposes. It defaults to using Supersim forked OP and Base chains.

An SDK for on-chain Farcaster wallet verification and attestation.

## Installation

```bash
npm install @farcaster-attestation/sdk
```

## Example Usage

Below is an example of how to use the SDK to perform wallet verification and attestation on supersim forked OP and Base chains.

```typescript
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, optimism } from "viem/chains";
import { checkFarcasterVerificationOnResolver, farcasterAttest } from "../src";

async function run() {
  const verifyingWallet = "0xb92c8a7096d15795f310c04817eceb1ff86c63db";
  const fid = 928679n;

  // Create wallet client from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: optimism,
    transport: http(),
  });

  // Create public client
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(),
  });

  // Call farcasterAttest with FID 328679
  const hash = await farcasterAttest({
    fid,
    walletAddress: verifyingWallet,
    walletClient,
    publicClient,
    onVerificationAttesting: () => {
      console.log("Starting attestation on Optimism...");
    },
  });

  if (hash) {
    console.log("Attestation successful! Hash:", hash);
  } else {
    console.log("Already verified on resolver");
  }

  // checkFarcasterVerificationOnResolver
  const isVerified = await checkFarcasterVerificationOnResolver(
    fid,
    verifyingWallet,
    publicClient
  );
  console.log("Is verified on Optimism:", isVerified);
}
```

This example demonstrates how to:

1. **Initialize Clients**: Set up wallet and public clients for different blockchain networks (Optimism and Base).
2. **Perform Attestation**: Use the `farcasterAttest` function to verify a wallet address with a Farcaster ID on the specified network.
3. **Check Verification**: Utilize the `checkFarcasterVerificationOnResolver` function to confirm the verification status on the resolver contracts.
4. **Handle Results**: Log the outcomes of the attestation and verification processes.

Ensure that you replace the placeholder private key and RPC URLs with your actual credentials and endpoints before running the script.


