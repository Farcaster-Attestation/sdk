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
import { checkFarcasterVerificationOnResolver, farcasterAttest } from "@farcaster-attestation/sdk";

async function run() {
  const verifyingWallet = "0xf01Dd015Bc442d872275A79b9caE84A6ff9B2A27";
  const fid = 328679n;

  // Create wallet client from private key (Using test junk private key)
  const account = privateKeyToAccount(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  );

  const walletClient = createWalletClient({
    account,
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });

  // Create public clients
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });

  const publicClientBase = createPublicClient({
    chain: base,
    transport: http("http://127.0.0.1:9546"),
  });

  {
    // Call farcasterAttest with FID 328679 on Optimism
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

    // Check verification status on Optimism
    const isVerified = await checkFarcasterVerificationOnResolver(
      fid,
      verifyingWallet,
      publicClient
    );
    console.log("Is verified on Optimism:", isVerified);

    console.log("================================================");
  }

  {
    // Call farcasterAttest with FID 328679 on Base
    const hash = await farcasterAttest({
      fid,
      walletAddress: verifyingWallet,
      walletClient,
      publicClient: publicClientBase,
      onVerificationAttesting: () => {
        console.log("Starting attestation on Base...");
      },
    });

    if (hash) {
      console.log("Attestation successful! Hash:", hash);
    } else {
      console.log("Already verified on resolver");
    }

    // Check verification status on Base
    const isVerified = await checkFarcasterVerificationOnResolver(
      fid,
      verifyingWallet,
      publicClientBase
    );
    console.log("Is verified on Base:", isVerified);

    console.log("================================================");
  }
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
```

This example demonstrates how to:

1. **Initialize Clients**: Set up wallet and public clients for different blockchain networks (Optimism and Base).
2. **Perform Attestation**: Use the `farcasterAttest` function to verify a wallet address with a Farcaster ID on the specified network.
3. **Check Verification**: Utilize the `checkFarcasterVerificationOnResolver` function to confirm the verification status on the resolver contracts.
4. **Handle Results**: Log the outcomes of the attestation and verification processes.

Ensure that you replace the placeholder private key and RPC URLs with your actual credentials and endpoints before running the script.


