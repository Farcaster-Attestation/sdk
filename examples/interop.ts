import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, optimism } from "viem/chains";
import { checkFarcasterVerificationOnResolver, farcasterAttest } from "../src";

async function run() {
  const verifyingWallet = "0xf01Dd015Bc442d872275A79b9caE84A6ff9B2A27";

  // Create wallet client from private key
  const account = privateKeyToAccount(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  );

  const walletClient = createWalletClient({
    account,
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });

  // Create public client
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });

  const publicClientBase = createPublicClient({
    chain: base,
    transport: http("http://127.0.0.1:9546"),
  });

  // Call farcasterAttest with FID 328679
  const hash = await farcasterAttest({
    fid: 328679n,
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

  // checkFarcasterVerificationOnResolver
  const isVerified = await checkFarcasterVerificationOnResolver(
    328679n,
    verifyingWallet,
    publicClientBase
  );
  console.log("Is verified on Base:", isVerified);
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
