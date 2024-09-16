import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from 'next';

// Create a connection to the Solana Devnet
const connection = new Connection('https://api.devnet.solana.com', 'finalized');

// Define the POST handler for the API route
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { secretKey, toPubKey, lamports } = req.body;

    // Validate input
    if (!secretKey || !toPubKey || typeof lamports !== 'number') {
      return res.status(400).json({ error: "Missing or invalid secretKey, toPubKey, or lamports" });
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

    console.log(`💸 Sent ${lamports} lamports to ${toPubKey}`);
    console.log(`Transaction signature: ${signature}`);

    return res.status(200).json({ signature });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({ error: error.message });
  }
}
