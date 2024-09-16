import { Connection, PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

// Create a connection to the Solana Devnet
const connection = new Connection('https://api.devnet.solana.com', 'finalized');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicKey } = body; // Expecting publicKey in the request body

    if (!publicKey) {
      return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });
    }

    // Validate the publicKey format
    let walletAddress: PublicKey;
    try {
      walletAddress = new PublicKey(publicKey);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid publicKey format' }, { status: 400 });
    }

    // Fetch the latest signature for the wallet using getSignaturesForAddress
    const signatures = await connection.getSignaturesForAddress(walletAddress, { limit: 1 });

    if (signatures.length > 0) {
      const latestSignature = signatures[0].signature;

      // Fetch the transaction details for the latest signature
      const latestTransaction = await connection.getTransaction(latestSignature);

      if (latestTransaction) {
        return NextResponse.json({ transaction: latestTransaction }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Transaction details not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: 'No transactions found for this wallet' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching latest transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//     // Your GET request handler code here
//     console.log('JSON');
//   }
