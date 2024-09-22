import { Keypair } from "@solana/web3.js";
import { NextResponse } from 'next/server';

export async function GET() {
  const { publicKey, secretKey } = Keypair.generate();

  console.log(`The public key is: ${publicKey.toBase58()}`);
  console.log(`The secret key is: ${secretKey}`);

  const response = NextResponse.json({
    publicKey: publicKey.toBase58(),
    secretKey: Array.from(secretKey), // Convert Uint8Array to a regular array for JSON compatibility
  });

  response.headers.set('Cache-Control', 'no-store');
  return response;
}
