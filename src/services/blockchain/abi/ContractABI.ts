
export const AUDIT_ANCHOR_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "auditHash", "type": "string"},
      {"internalType": "uint256", "name": "logCount", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "anchorAuditHash",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "anchorId", "type": "bytes32"}],
    "name": "getAnchor",
    "outputs": [
      {"internalType": "string", "name": "auditHash", "type": "string"},
      {"internalType": "uint256", "name": "logCount", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "address", "name": "anchorer", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export type AuditAnchorABI = typeof AUDIT_ANCHOR_ABI;
