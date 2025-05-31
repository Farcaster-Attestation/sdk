export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "_sourceResolverAddr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_sourceChainId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [],
    name: "CallerNotL2ToL2CrossDomainMessenger",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCrossDomainSender",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidDestination",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAllowedOnSourceChain",
    type: "error",
  },
  {
    inputs: [],
    name: "NotSourceChain",
    type: "error",
  },
  {
    inputs: [],
    name: "SmartContractWalletNotAllowed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "toChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "uid",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
    ],
    name: "CrossChainSyncInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "InteropEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "verifyAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "verificationMethod",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "publicKey",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "VerificationAttested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "verifyAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "verificationMethod",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "publicKey",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "VerificationRevoked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_fid",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_verifyAddr",
        type: "address",
      },
    ],
    name: "computeKey",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_toChainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_fid",
        type: "uint256",
      },
    ],
    name: "crossChainSync",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "enableInterop",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
    ],
    name: "fidAttestationsLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "getAttestationUid",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
    ],
    name: "getFidAttestations",
    outputs: [
      {
        internalType: "address[]",
        name: "wallets",
        type: "address[]",
      },
      {
        internalType: "bytes32[]",
        name: "uids",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "len",
        type: "uint256",
      },
    ],
    name: "getFidAttestations",
    outputs: [
      {
        internalType: "address[]",
        name: "wallets",
        type: "address[]",
      },
      {
        internalType: "bytes32[]",
        name: "uids",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "getWalletAttestations",
    outputs: [
      {
        internalType: "uint256[]",
        name: "fids",
        type: "uint256[]",
      },
      {
        internalType: "bytes32[]",
        name: "uids",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "len",
        type: "uint256",
      },
    ],
    name: "getWalletAttestations",
    outputs: [
      {
        internalType: "uint256[]",
        name: "fids",
        type: "uint256[]",
      },
      {
        internalType: "bytes32[]",
        name: "uids",
        type: "bytes32[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isSourceChain",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "fid",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "isVerified",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_fid",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_uid",
        type: "bytes32",
      },
    ],
    name: "receiveSync",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sourceResolver",
    outputs: [
      {
        internalType: "contract IFarcasterResolver",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "walletAttestationsLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
