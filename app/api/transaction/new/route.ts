import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { NextResponse } from 'next/server'; // Use NextResponse for handling responses
import type { NextRequest } from 'next/server'; // Use NextRequest for handling requests

// Create a connection to the Solana Devnet
const connection = new Connection('https://api.devnet.solana.com', 'finalized');

// Define the POST handler for the API route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse the request body

    const { secretKey, toPubKey, lamports } = body;

    // Validate input
    if (!secretKey || !toPubKey || typeof lamports !== 'number') {
      return NextResponse.json({ error: "Missing or invalid secretKey, toPubKey, or lamports" }, { status: 400 });
    }

    // Function to parse and get Keypair from the provided secret key
    const getKeypair = (secretKeyString: string) => {
      try {
        // Parse the secret key string into a number array
        const secretKeyArray = JSON.parse(secretKeyString)
          .map((num: number) => Number(num)) // Convert each piece to a number
          .filter((num: number) => !isNaN(num)); // Filter out any NaNs

        if (secretKeyArray.length !== 64) {
          throw new Error("Invalid secret key length");
        }

        return Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      } catch (error) {
        throw new Error("Invalid secret key format");
      }
    };

    // Get the sender's keypair
    const senderKeypair = getKeypair(secretKey);

    // Check balance of the sender's wallet
    const balance = await connection.getBalance(senderKeypair.publicKey);
    console.log("Balance:", balance);

    // Create a transaction
    const transaction = new Transaction();

    // Define the recipient public key
    const toPublicKey = new PublicKey(toPubKey);

    // Create transfer instruction
    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: lamports, // Ensure lamports is a number
    });

    // Add instruction to transaction
    transaction.add(sendSolInstruction);

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
    const sender = senderKeypair.publicKey.toBase58();
    console.log(`💸 Sent ${lamports} lamports to ${toPubKey}`);
    console.log(`Transaction signature: ${signature}`);

    // Return the transaction signature
    return NextResponse.json({ signature, lamports, toPublicKey,  sender},  { status: 200 });
  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
