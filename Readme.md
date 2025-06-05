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
import { VerificationNotFoundError } from "../src/error";

async function run() {
  // Get wallet and fid from user input
  const verifyingWallet = "0x...";
  const fid = BigInt(...);

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

  // Call farcasterAttest with input FID
  try {
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
      console.log("Wallet verified successfully! Hash:", hash);
    } else {
      console.log("Already verified on resolver");
    }
  } catch (error) {
    if (error instanceof VerificationNotFoundError) {
      console.log("Verification not found on the Farcaster Hub");
      return;
    } else {
      throw error;
    }
  }

  // TODO: Attest your message on EAS as usual
  console.log("TODO: Attest your message on EAS as usual");

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
2. **Perform Verification Attestation**: Use the `farcasterAttest` function to verify a wallet address with a Farcaster ID on the specified network.
3. **Perform Attestation**: Call `attest` function on EAS Contract or using EAS SDK to attest your message as usual.
4. **Check Verification**: Utilize the `checkFarcasterVerificationOnResolver` function to confirm the verification status on the resolver contracts.
5. **Handle Results**: Log the outcomes of the attestation and verification processes.

## Example Project




