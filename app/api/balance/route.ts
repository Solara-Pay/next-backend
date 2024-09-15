// pages/api/getBalance.js
import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function POST(request) {
  try {
    // Parse the request body
    const { publicKey } = await request.json();

    if (!publicKey) {
      return NextResponse.json({ error: "Public key is required" }, { status: 400 });
    }

    const connection = new Connection(clusterApiUrl("devnet"));
    const address = new PublicKey(publicKey);

    // Fetch the account balance
    const balance = await connection.getBalance(address);
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`);

    // Return the balance as JSON
    return NextResponse.json({ balanceInSol });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
