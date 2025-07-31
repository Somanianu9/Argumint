require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { ethers, Interface } = require('ethers');
const contractAbi = require('./abi.json'); // Adjust path if needed

// --- Configuration ---
const BATCH_SIZE = 100;
const prisma = new PrismaClient();
const iface = new Interface(contractAbi);

/**
 * Fetches a batch of unprocessed logs using Prisma Client.
 */
async function fetchUnprocessedLogs() {
    console.log('Fetching new logs...');
    const logs = await prisma.source_1.findMany({
        where: {
            processed: {
                not: true, // This covers both false and null
            },
        },
        orderBy: [
            { block_number: 'asc' },
            { log_index: 'asc' },
        ],
        take: BATCH_SIZE,
    });
    console.log(`Fetched ${logs.length} new logs to process.`);
    return logs;
}

/**
 * Decodes a single raw log using ethers.js.
 * This function's core logic remains the same.
 */
function decodeLog(log) {
     const topicsArray = log.topics.split(",");
     try {
       const parsed = iface.parseLog({ topics: topicsArray, data: log.data });
       return parsed;
     } catch (err) {
       console.error(`Error decoding log ${log.id}:`, err.message);
       return null;
     }
}

// --- Handler Functions using Prisma Client ---
// Each function now takes the Prisma transaction instance (`tx`)
// to ensure all operations within a single log processing are atomic.

async function handleDebateCreated(tx, args, timestamp) {
    await tx.debate.create({
        data: {
            debateId: Number(args.debateId), // Prisma expects correct types
            title: args.title,
            duration: Number(args.duration),
            createdAt: new Date(timestamp * 1000),
            isActive: true,
        },
    });
}

async function handleDebateStarted(tx, args) {
    await tx.debateStart.create({
        data: {
            debateId: Number(args.debateId),
            actualStartTime: new Date(Number(args.actualStartTime) * 1000),
        },
    });
}

async function handleJoined(tx, args, timestamp) {
    const walletAddress = args.who;
    await tx.user.upsert({
        where: { walletAddress: walletAddress },
        update: {
            debateId: Number(args.debateId),
            team: args.team,
            joinedAt: new Date(timestamp * 1000),
        },
        create: {
            walletAddress: walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`, // Example username
            debateId: Number(args.debateId),
            team: args.team,
            joinedAt: new Date(timestamp * 1000),
        },
    });
}

async function handleFinished(tx, args, timestamp) {
    const debateId = Number(args.debateId);
    // Create the FinishedDebate record
    await tx.finishedDebate.create({
        data: {
            debateId: debateId,
            team1Score: Number(args.team1Score),
            team2Score: Number(args.team2Score),
            endedAt: new Date(timestamp * 1000),
        },
    });
    // Mark the corresponding Debate as inactive
    await tx.debate.update({
        where: { debateId: debateId },
        data: { isActive: false },
    });
}

async function handleFlipped(tx, args, timestamp) {
    const userAddress = args.user;
    const persuaderAddress = args.persuader;

    // Find the internal CUIDs for the user and persuader from their wallet addresses
    const user = await tx.user.findUnique({ where: { walletAddress: userAddress } });
    const persuader = await tx.user.findUnique({ where: { walletAddress: persuaderAddress } });

    if (!user || !persuader) {
        console.warn(`Could not find user or persuader for Flip event. User: ${userAddress}, Persuader: ${persuaderAddress}`);
        return;
    }

    // Simplified flip logic
    const fromTeam = `Team${user.team}`;
    const toTeam = user.team === 1 ? 'Team2' : 'Team1';
    const newTeamNumber = user.team === 1 ? 2 : 1;

    // 1. Create the Flip record
    await tx.flip.create({
        data: {
            debateId: Number(args.debateId),
            userId: user.id, // Use the CUID from the user record
            persuaderId: persuader.id, // Use the CUID from the persuader record
            flippedAt: new Date(timestamp * 1000),
            fromTeam: fromTeam,
            toTeam: toTeam,
        },
    });

    // 2. Update the user's team in the User table
    await tx.user.update({
        where: { id: user.id },
        data: { team: newTeamNumber },
    });
}


/**
 * Main ETL process function using Prisma transactions.
 */
async function runLogProcessor() {
    console.log("Starting log processor job...");
    try {
        const rawLogs = await fetchUnprocessedLogs();

        if (rawLogs.length === 0) {
            console.log("No new logs to process.");
            return;
        }

        for (const log of rawLogs) {
            const decodedLog = decodeLog(log);
            if (!decodedLog) {
                // Mark as processed even if decoding fails to avoid retrying a bad log
                await prisma.source_1.update({
                    where: { id: log.id },
                    data: { processed: true },
                });
                continue;
            }

            const eventName = decodedLog.name;
            const eventArgs = decodedLog.args;
            const blockTimestamp = parseInt(log.block_timestamp, 10);

            try {
                // Use a Prisma transaction to ensure the entire operation is atomic.
                // If any database call inside the transaction fails, all previous ones
                // in the same transaction are rolled back automatically.
                await prisma.$transaction(async (tx) => {
                    console.log(`Processing event: ${eventName} in transaction for log ${log.id}`);
                    switch (eventName) {
                        case 'DebateCreated':
                            await handleDebateCreated(tx, eventArgs, blockTimestamp);
                            break;
                        case 'DebateStarted':
                            await handleDebateStarted(tx, eventArgs);
                            break;
                        case 'Joined':
                            await handleJoined(tx, eventArgs, blockTimestamp);
                            break;
                        case 'Finished':
                            await handleFinished(tx, eventArgs, blockTimestamp);
                            break;
                        case 'Flipped':
                            await handleFlipped(tx, eventArgs, blockTimestamp);
                            break;
                        default:
                            console.log(`No handler for event: ${eventName}`);
                    }

                    // If all handlers succeed, mark the log as processed
                    await tx.source_1.update({
                        where: { id: log.id },
                        data: { processed: true },
                    });
                });
                console.log(`Successfully processed and committed log ${log.id}`);

            } catch (transactionError) {
                console.error(`Transaction failed for log ${log.id}. Prisma rolled back the changes.`, transactionError);
                // Optionally, you could add a field to the log to mark it as 'errored'
            }
        }
    } catch (err) {
        console.error("A critical error occurred in the ETL process:", err);
    } finally {
        await prisma.$disconnect();
        console.log("Log processor job finished.");
    }
}

// Export for use in scheduling
module.exports = { runLogProcessor };

// Allow running directly for testing
if (require.main === module) {
    runLogProcessor();
}
