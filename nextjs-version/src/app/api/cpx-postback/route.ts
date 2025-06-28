import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userSurveys, transactions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const CPX_CONFIG = {
  APP_ID: '27993',
  SECURE_HASH: process.env.CPX_SECURE_HASH || 'your-secure-hash-here',
};

function logMessage(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CPX Postback: ${message}`);
}

function validateSignature(userId: string, transId: string, reward: string, signature: string): boolean {
  const signatureString = userId + transId + reward + CPX_CONFIG.SECURE_HASH;
  const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
  return signature === expectedSignature;
}

export async function GET(request: NextRequest) {
  return handlePostback(request);
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

async function handlePostback(request: NextRequest) {
  try {
    // Get parameters from URL or body
    const url = new URL(request.url);
    let params: any = {};
    
    if (request.method === 'GET') {
      params = Object.fromEntries(url.searchParams);
    } else {
      const body = await request.text();
      if (request.headers.get('content-type')?.includes('application/json')) {
        params = JSON.parse(body);
      } else {
        // Parse form data
        const formData = new URLSearchParams(body);
        params = Object.fromEntries(formData);
      }
    }

    logMessage(`Received postback: ${JSON.stringify(params)}`);

    // Validate required parameters
    const required = ['app_id', 'user_id', 'trans_id', 'reward', 'signature'];
    for (const field of required) {
      if (!params[field]) {
        logMessage(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate app_id
    if (params.app_id !== CPX_CONFIG.APP_ID) {
      logMessage(`Invalid app_id: ${params.app_id}`);
      return NextResponse.json(
        { error: 'Invalid app_id' },
        { status: 400 }
      );
    }

    // Validate signature
    if (!validateSignature(params.user_id, params.trans_id, params.reward, params.signature)) {
      logMessage(`Invalid signature for user ${params.user_id}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const userId = parseInt(params.user_id);
    const reward = parseFloat(params.reward);
    const transId = params.trans_id;

    // Get user
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      logMessage(`User not found: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = user[0];

    // Check if transaction already processed
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.referenceId, transId))
      .limit(1);

    if (existingTransaction.length > 0) {
      logMessage(`Transaction already processed: ${transId}`);
      return NextResponse.json(
        { success: true, message: 'Transaction already processed' },
        { status: 200 }
      );
    }

    // Convert USD to IDR (approximate rate: 1 USD = 15,000 IDR)
    const rewardIDR = reward * 15000;

    // Update user balance
    const currentBalance = parseFloat(userData.balance || "0");
    const newBalance = (currentBalance + rewardIDR).toFixed(2);

    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId));

    // Create transaction record
    await db.insert(transactions).values({
      userId: userId,
      type: 'survey_completion',
      amount: rewardIDR.toFixed(2),
      description: `Survey completed via CPX Research - Transaction: ${transId}`,
      status: 'completed',
      referenceId: transId,
    });

    // Create or update user survey record
    await db.insert(userSurveys).values({
      userId: userId,
      surveyId: 1, // Default survey ID for CPX surveys
      cpxSurveyId: transId,
      status: 'completed',
      rewardEarned: rewardIDR.toFixed(2),
      completedAt: new Date(),
    });

    logMessage(`Successfully processed postback for user ${userId}, reward: ${rewardIDR} IDR`);

    return NextResponse.json(
      {
        success: true,
        message: 'Postback processed successfully',
        trans_id: transId,
        reward_idr: rewardIDR,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error: any) {
    logMessage(`Error processing postback: ${error.message}`);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}