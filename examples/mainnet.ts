import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, optimism } from "viem/chains";
import { checkFarcasterVerificationOnResolver, farcasterAttest } from "../src";
import * as readline from "readline";
import { VerificationNotFoundError } from "../src/error";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query: string) =>
  new Promise((resolve) => rl.question(query, resolve));

async function run() {
  // Get wallet and fid from user input
  const verifyingWallet = (await question(
    "Enter wallet address (0x...): "
  )) as `0x${string}`;
  const fidInput = (await question("Enter Farcaster ID: ")) as string;
  const fid = BigInt(fidInput);

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
      rl.close();
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

  // Close readline interface
  rl.close();
}

run().catch((err) => {
  console.trace(err);
  process.exit(1);
});
