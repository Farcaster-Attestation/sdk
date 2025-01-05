import { Transport, PublicClient, createPublicClient } from "viem";
import { http } from "viem";
import { optimism } from "viem/chains";

export const DEFAULT_RESOLVER_INTEROP_ADDRESS: `0x${string}` =
  "0x5Ad594dcC74Ba496190d77C03c53D89867A0515e";

export const DEFAULT_RESOLVER_ADDRESS: `0x${string}` =
  "0xc7cDb7A2E5dDa1B7A0E792Fe1ef08ED20A6F56D4";

export const DEFAULT_PUBLIC_CLIENT: PublicClient<Transport, typeof optimism> =
  createPublicClient({
    chain: optimism,
    transport: http("http://127.0.0.1:9545"),
  });
