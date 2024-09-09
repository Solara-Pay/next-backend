// app/api/keypair/route.ts

import { Keypair } from "@solana/web3.js";
import { NextResponse } from 'next/server';

// Export the GET method explicitly
export async function GET() {
  const keypair = Keypair.generate();

  const publicKey = keypair.publicKey.toBase58();
  const secretKey = keypair.secretKey;

  console.log(`The public key is: `, publicKey);
  console.log(`The secret key is: `, secretKey);

  return NextResponse.json({
    publicKey,
    secretKey: Array.from(secretKey), // Convert Uint8Array to a regular array for JSON compatibility
  });
}
