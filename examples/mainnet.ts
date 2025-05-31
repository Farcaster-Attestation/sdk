import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, optimism } from "viem/chains";
import { checkFarcasterVerificationOnResolver, farcasterAttest } from "../src";

async function run() {
  const verifyingWallet = "0xf01Dd015Bc442d872275A79b9caE84A6ff9B2A27";

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
    fid: 328679n,
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
    328679n,
    verifyingWallet,
    publicClient
  );
  console.log("Is verified on Optimism:", isVerified);
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
