import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body
    const body = await request.json();
    const publicKey = body.publicKey;

    if (!publicKey) {
      return NextResponse.json({ error: "Public key is required" }, { status: 400 });
    }

    const connection = new Connection(clusterApiUrl("devnet"));
    const address = new PublicKey(publicKey);

    // Fetch the account balance
    const balance = await connection.getBalance(address);
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    // Return the balance as JSON
    return NextResponse.json({ balanceInSol });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
