import { Transport, PublicClient, createPublicClient } from "viem";
import { http } from "viem";
import { optimism } from "viem/chains";

export const DEFAULT_RESOLVER_INTEROP_ADDRESS: `0x${string}` =
  "0xA0140Ed47a7252756C2ed28d51017076F57B9E6e";

export const DEFAULT_RESOLVER_ADDRESS: `0x${string}` =
  "0xc7cDb7A2E5dDa1B7A0E792Fe1ef08ED20A6F56D4";

export const DEFAULT_PUBLIC_CLIENT: PublicClient<Transport, typeof optimism> =
  createPublicClient({
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });
