import {
  encodeAbiParameters,
  parseAbiParameters,
  Hex,
  getContract,
  toBytes,
  Chain,
} from "viem";
import { toHexString, wait } from "./utils";
import {
  checkFarcasterVerification,
  checkFarcasterVerificationOnResolver,
} from "./checkVerification";
import { FarcasterAttestOptions } from "./interfaces";
import {
  DEFAULT_PUBLIC_CLIENT,
  DEFAULT_RESOLVER_ADDRESS,
  DEFAULT_RESOLVER_INTEROP_ADDRESS,
} from "./const";
import FarcasterResolverABI from "./abi/FarcasterResolverABI";
import {
  FarcasterNetwork,
  MessageData,
  MessageType,
  Protocol,
} from "@farcaster/core";
import { optimism } from "viem/chains";
import FarcasterResolverInteropABI from "./abi/FarcasterResolverInteropABI";

/**
 * Build the `bytes memory signature` argument for the FarcasterResolver `attest` function,
 * given a Farcaster message’s Ed25519 signature and the protobuf-encoded `messageData`.
 *
 * @param signatureBuffer The full 64-byte Ed25519 signature
 * @param messageBytes The protobuf-encoded message data
 * @returns Hex-encoded ABI data suitable for passing as the `signature` param to `attest()`
 */
export function buildAttestSignatureParam(
  signatureBuffer: Uint8Array, // length = 64
  messageBytes: Uint8Array
): Hex {
  const r = signatureBuffer.subarray(0, 32);
  const s = signatureBuffer.subarray(32);

  return encodeAbiParameters(
    parseAbiParameters("bytes32 r, bytes32 s, bytes message"),
    [
      toHexString(r), // convert subarray to 0x-hex
      toHexString(s),
      toHexString(messageBytes),
    ]
  );
}

/**
 * Example building the full data array for viem’s `contract.write.attest` call.
 *
 * @param recipient The address being verified
 * @param fid Farcaster ID
 * @param publicKey The `message.signer` (32-byte Ed25519 public key, 0x-hex)
 * @param verificationMethod 1 = Onchain, 2 = Optimistic
 * @param signatureParam The hex string returned by `buildAttestSignatureParam`
 * @returns The `[recipient, fid, publicKey, verificationMethod, signatureParam]` array
 */
export function buildAttestParameters(
  fid: bigint,
  recipient: `0x${string}`,
  publicKey: `0x${string}`,
  verificationMethod: bigint,
  signatureParam: Hex
): [`0x${string}`, bigint, `0x${string}`, bigint, Hex] {
  return [recipient, fid, publicKey, verificationMethod, signatureParam];
}

export async function farcasterAttest<C extends Chain>(
  options: FarcasterAttestOptions<C>
) {
  const {
    fid,
    walletAddress,
    walletClient,
    publicClient,
    onVerificationAttesting,
    resolverAddress = DEFAULT_RESOLVER_ADDRESS,
    resolverInteropAddress = DEFAULT_RESOLVER_INTEROP_ADDRESS,
  } = options;

  // Get the wallet address from the client
  const [address] = walletAddress
    ? [walletAddress]
    : await walletClient.getAddresses();

  // Check verification status on both hub and resolver
  const { verifiedOnResolver, verificationData } =
    await checkFarcasterVerification(
      fid,
      address,
      publicClient,
      resolverInteropAddress
    );

  // If not verified on hub, throw error regardless of resolver status
  if (!verificationData) {
    throw new Error("No verification found on Farcaster Hub");
  }

  // If already verified on resolver, skip attestation
  if (verifiedOnResolver) {
    return null;
  }

  // Notify start of attestation if callback provided
  if (onVerificationAttesting) {
    await onVerificationAttesting();
  }

  const transformedData = {
    type: MessageType.VERIFICATION_ADD_ETH_ADDRESS,
    fid: Number(verificationData.data.fid),
    timestamp: verificationData.data.timestamp,
    network: FarcasterNetwork.MAINNET,
    verificationAddAddressBody: {
      address: toBytes(
        verificationData.data.verificationAddEthAddressBody.address
      ),
      claimSignature: Buffer.from(
        verificationData.data.verificationAddEthAddressBody.claimSignature,
        "base64"
      ),
      blockHash: toBytes(
        verificationData.data.verificationAddEthAddressBody.blockHash
      ),
      verificationType:
        verificationData.data.verificationAddEthAddressBody.verificationType,
      chainId: verificationData.data.verificationAddEthAddressBody.chainId,
      protocol: Protocol.ETHEREUM,
    },
  };

  const messageBytes = MessageData.encode(transformedData).finish();

  // Build and encode signature data
  const signatureParam = buildAttestSignatureParam(
    Buffer.from(verificationData.signature, "base64"),
    messageBytes
  );

  const chainId = await publicClient.getChainId();

  if (chainId === optimism.id) {
    // Create contract instance
    const resolver = getContract({
      address: resolverAddress,
      abi: FarcasterResolverABI,
      client: walletClient,
    });

    // Call attest function
    const hash = await resolver.write.attest(
      [
        verificationData.data.verificationAddAddressBody.address,
        fid,
        verificationData.signer,
        1n,
        signatureParam,
      ],
      {
        account: walletClient.account ?? null,
        chain: optimism,
      }
    );

    await publicClient.waitForTransactionReceipt({ hash });

    // while resolver is not verified, wait 0.5 second max 10 seconds
    let isVerified = false;
    for (let i = 0; i < 20; i++) {
      let verifiedOnResolver = await checkFarcasterVerificationOnResolver(
        fid,
        address,
        publicClient,
        resolverInteropAddress
      );

      if (verifiedOnResolver) {
        isVerified = true;
        break;
      }

      await wait(500);
    }

    if (!isVerified) {
      throw new Error("Timed out waiting for verification on resolver");
    }

    return hash;
  } else {
    // Attest on optimism first
    await farcasterAttest({
      fid,
      walletAddress,
      walletClient,
      publicClient: DEFAULT_PUBLIC_CLIENT,
      resolverAddress,
      resolverInteropAddress,
    });

    // Create contract instance
    const resolver = getContract({
      address: resolverInteropAddress,
      abi: FarcasterResolverInteropABI,
      client: walletClient,
    });

    // Call crossChainSync function
    const hash = await resolver.write.crossChainSync(
      [
        BigInt(chainId),
        verificationData.data.verificationAddAddressBody.address,
        fid,
      ],
      {
        account: walletClient.account ?? null,
        chain: optimism,
      }
    );

    // while resolver is not verified, wait 1 second max 600 seconds
    let isVerified = false;
    for (let i = 0; i < 600; i++) {
      let verifiedOnResolver = await checkFarcasterVerificationOnResolver(
        fid,
        address,
        publicClient,
        resolverInteropAddress
      );

      if (verifiedOnResolver) {
        isVerified = true;
        break;
      }

      await wait(1000);
    }

    if (!isVerified) {
      throw new Error("Timed out waiting for verification on resolver");
    }

    return hash;
  }
}
