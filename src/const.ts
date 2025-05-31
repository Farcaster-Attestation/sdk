import { Transport, PublicClient, createPublicClient } from "viem";
import { http } from "viem";
import { optimism } from "viem/chains";

export const DEFAULT_RESOLVER_INTEROP_ADDRESS: `0x${string}` =
  "0x98561CaF79eb6a22B23fEb6366f798d7F3898c44";

export const DEFAULT_RESOLVER_ADDRESS: `0x${string}` =
  "0xF99C4e843033831c570946a97F6195e47051C443";

export const DEFAULT_PUBLIC_CLIENT: PublicClient<Transport, typeof optimism> =
  createPublicClient({
    chain: optimism,
    transport: http(),
  });
