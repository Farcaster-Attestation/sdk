import { Chain, getAddress, PublicClient, Transport } from "viem";
import axios from "axios";
import FarcasterResolverInteropABI from "./abi/FarcasterResolverInteropABI";
import {
  FarcasterVerificationMessage,
  FarcasterVerificationResponse,
} from "./interfaces";
import {
  DEFAULT_PUBLIC_CLIENT,
  DEFAULT_RESOLVER_INTEROP_ADDRESS,
} from "./const";

export async function getFarcasterVerificationAttestationUid<C extends Chain>(
  fid: bigint,
  walletAddress: `0x${string}`,
  publicClient: PublicClient<Transport, C> = DEFAULT_PUBLIC_CLIENT as any,
  resolverAddress: `0x${string}` = DEFAULT_RESOLVER_INTEROP_ADDRESS
) {
  return publicClient.readContract({
    address: resolverAddress,
    abi: FarcasterResolverInteropABI,
    functionName: "getAttestationUid",
    args: [fid, walletAddress],
  });
}

/**
 * Get verification messages for the given wallet address from the Farcaster Hub.
 *
 * NOTE: This does NOT check for matching "remove" messages, so it may
 * return messages for addresses that were previously removed.
 *
 * @param fid The Farcaster FID to check
 * @param walletAddress A `0x`-prefixed Ethereum address
 * @returns Array of verification messages that match the wallet address
 */
export async function checkFarcasterVerificationOnHub(
  fid: bigint,
  walletAddress: `0x${string}`
): Promise<FarcasterVerificationMessage | undefined> {
  const normalizedAddr = getAddress(walletAddress); // EIP-55 normalization

  const { data } = await axios.get<FarcasterVerificationResponse>(
    `https://farcaster-attestation.upnode.org/v1/verificationsByFid?fid=${fid}&pageSize=100`
  );

  const messages = data?.messages ?? [];

  // Keep querying pages until we find a match or run out of pages
  let nextPageToken = data.nextPageToken;
  let matchingMessage = messages.find((msg: any) => {
    const addr = msg?.data?.verificationAddAddressBody?.address;
    return addr && getAddress(addr) === normalizedAddr;
  });

  while (!matchingMessage && nextPageToken) {
    const { data: nextData } = await axios.get<FarcasterVerificationResponse>(
      `https://farcaster-attestation.upnode.org/v1/verificationsByFid?fid=${fid}&pageSize=100&pageToken=${nextPageToken}`
    );

    matchingMessage = nextData.messages?.find((msg) => {
      const addr = msg?.data?.verificationAddAddressBody?.address;
      return (
        addr &&
        getAddress(addr) === normalizedAddr &&
        msg.data.type === "MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS" &&
        msg.data.network == "FARCASTER_NETWORK_MAINNET" &&
        msg.data.verificationAddAddressBody.protocol == "PROTOCOL_ETHEREUM" &&
        (msg.data.verificationAddAddressBody.chainId == 0 ||
          msg.data.verificationAddAddressBody.chainId == 10)
      );
    });

    nextPageToken = nextData.nextPageToken;
  }

  return matchingMessage;
}

/**
 * Check if the given wallet is verified on FarcasterResolver
 *
 * @param fid The Farcaster FID
 * @param walletAddress A `0x`-prefixed Ethereum address
 * @param publicClient Optional Viem public client, defaults to optimism client
 * @param resolverAddress Optional resolver contract address
 * @returns Boolean indicating whether FarcasterResolver considers the address verified
 */
export async function checkFarcasterVerificationOnResolver<C extends Chain>(
  fid: bigint,
  walletAddress: `0x${string}`,
  publicClient: PublicClient<Transport, C> = DEFAULT_PUBLIC_CLIENT as any,
  resolverAddress: `0x${string}` = DEFAULT_RESOLVER_INTEROP_ADDRESS
): Promise<boolean> {
  return publicClient.readContract({
    address: resolverAddress,
    abi: FarcasterResolverInteropABI,
    functionName: "isVerified",
    args: [fid, walletAddress],
  });
}

/**
 * Return whether a given wallet is verified on both the Hub and FarcasterResolver
 *
 * @param resolver FarcasterResolver viem contract instance
 * @param fid Farcaster ID
 * @param walletAddress The wallet to check
 * @returns { verifiedOnResolver: boolean; verifiedOnHub: boolean }
 */
export async function checkFarcasterVerification<C extends Chain>(
  fid: bigint,
  walletAddress: `0x${string}`,
  publicClient: PublicClient<Transport, C> = DEFAULT_PUBLIC_CLIENT as any,
  resolverInteropAddress: `0x${string}` = DEFAULT_RESOLVER_INTEROP_ADDRESS
): Promise<{
  verifiedOnResolver: boolean;
  verificationData: FarcasterVerificationMessage | undefined;
}> {
  const [verifiedOnResolver, verificationData] = await Promise.all([
    checkFarcasterVerificationOnResolver(
      fid,
      walletAddress,
      publicClient,
      resolverInteropAddress
    ),
    checkFarcasterVerificationOnHub(fid, walletAddress),
  ]);

  return {
    verifiedOnResolver,
    verificationData,
  };
}
