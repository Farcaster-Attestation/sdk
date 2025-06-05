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
  checkFarcasterVerificationOnHub,
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
import axios from "axios";
import { VerificationNotFoundError } from "./error";

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
    skipGasSupport = false,
  } = options;

  // Get the wallet address from the client
  const [address] = walletAddress
    ? [walletAddress]
    : await walletClient.getAddresses();

  // Check verification status on resolver first
  const verifiedOnResolver = await checkFarcasterVerificationOnResolver(
    fid,
    address,
    publicClient,
    resolverInteropAddress
  );

  // If already verified on resolver, skip attestation
  if (verifiedOnResolver) {
    return null;
  }

  // Check verification status on hub
  const verificationData = await checkFarcasterVerificationOnHub(fid, address);

  // If not verified on hub, throw error
  if (!verificationData) {
    throw new VerificationNotFoundError(
      "Verification not found on the Farcaster Hub"
    );
  }

  // Notify start of attestation if callback provided
  if (onVerificationAttesting) {
    await onVerificationAttesting();
  }

  /*
  {
    "data":{
      "type":"MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS",
      "fid":328679,
      "timestamp":110966760,
      "network":"FARCASTER_NETWORK_MAINNET",
      "verificationAddAddressBody":{
        "address":"0x5f4bcccb5c2cbb01c619f5cfed555466e31679b6",
        "claimSignature":"d5QNIGmRKARAiG8p8PdQL56rWJoQyCWmtavzcFUG9R5vL4yv3ji0auT8KZb3gPD76v7Q4hXQo3Ee6NGnf8kfdRw=",
        "blockHash":"0xb5af0f1626171b2624b93eb2e9192e88dba950dc8d3881a62e514b239fa12bb4",
        "type":0,
        "chainId":0,
        "protocol":"PROTOCOL_ETHEREUM"
      }
    },
    "hash":"0x75c483fa367ba1e53adbd9cec101d204560bb019",
    "hashScheme":"HASH_SCHEME_BLAKE3",
    "signature":"oLV+KYAcrN3ymsfNRQ62NIbKswT1Dq9F+wCzsbmxTb9KD7FOGBbbch2OJrgGl/Es/83AzHp2O/VWUC1vtOz2Dg==",
    "signatureScheme":"SIGNATURE_SCHEME_ED25519",
    "signer":"0xbb77ee11e6651a87e4537d80eca20ee9036b0260eb77150065b2c02148f9603a"
  }
  */

  const transformedData = {
    type: MessageType.VERIFICATION_ADD_ETH_ADDRESS,
    fid: Number(verificationData.data.fid),
    timestamp: verificationData.data.timestamp,
    network: FarcasterNetwork.MAINNET,
    verificationAddAddressBody: {
      address: toBytes(
        verificationData.data.verificationAddAddressBody.address
      ),
      claimSignature: Buffer.from(
        verificationData.data.verificationAddAddressBody.claimSignature,
        "base64"
      ),
      blockHash: toBytes(
        verificationData.data.verificationAddAddressBody.blockHash
      ),
      verificationType: verificationData.data.verificationAddAddressBody.type,
      chainId: verificationData.data.verificationAddAddressBody.chainId,
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
    if (!skipGasSupport) {
      try {
        const response = await axios.post(
          "https://farcaster-attestation.upnode.org/submitVerification",
          {
            fid: Number(fid),
            walletAddress: address,
          }
        );

        if (response.data?.hash) {
          return response.data.hash;
        }
      } catch (error) {}
    }

    const verifiedOnResolver = await checkFarcasterVerificationOnResolver(
      fid,
      address,
      publicClient,
      resolverInteropAddress
    );

    if (!verifiedOnResolver) {
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
    }
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
