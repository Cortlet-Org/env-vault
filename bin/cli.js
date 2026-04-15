#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import pc from 'picocolors';

// Internal Modules
import { encryptData, decryptData, wrapKey, unwrapKey } from '../src/vault.js';
import { getIdentity } from '../src/identity/identity.js';
import { injectAndRun } from '../src/runner/runner.js';

const [,, ...args] = process.argv;

async function main() {
    // 1. Identify Identity Path (-i or --identity)
    let identityPath = null;
    const iIdx = args.indexOf('-i');
    const identIdx = args.indexOf('--identity');
    const flagIdx = iIdx !== -1 ? iIdx : identIdx;

    if (flagIdx !== -1 && args[flagIdx + 1]) {
        identityPath = args[flagIdx + 1];
        args.splice(flagIdx, 2); // Remove from args to keep command parsing clean
    }

    const command = args[0];
    const cmdArgs = args.slice(1);

    try {
        const identity = getIdentity(identityPath);

        switch (command) {
            case 'lock':
                handleLock(identity);
                break;
            case 'run':
                handleRun(identity, cmdArgs);
                break;
            case 'allow':
                handleAllow(identity, cmdArgs);
                break;
            default:
                showHelp();
                break;
        }
    } catch (err) {
        console.error(pc.red(`\n✖ Fatal Error: ${err.message}`));
        process.exit(1);
    }
}

function handleLock(identity) {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) throw new Error('.env not found.');

    const rawContent = fs.readFileSync(envPath, 'utf8');
    const vaultKey = crypto.randomBytes(32).toString('hex');
    const payload = encryptData(rawContent, vaultKey);
    const wrappedKey = wrapKey(vaultKey, identity.publicKey);

    const vaultSchema = {
        version: "1.0.0", // Hard 1.0.0
        createdAt: new Date().toISOString(),
        members: [{
            name: os.userInfo().username,
            role: 'owner',
            wrappedKey: wrappedKey.toString('base64')
        }],
        payload
    };

    fs.writeFileSync('.env.vault', JSON.stringify(vaultSchema, null, 2));
    console.log(pc.green('✔ Vault locked with v1.0 sovereign identity.'));
}

function handleRun(identity, runArgs) {
    const vaultPath = path.resolve(process.cwd(), '.env.vault');
    if (!fs.existsSync(vaultPath)) throw new Error('.env.vault not found.');

    const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    let decryptedVaultKey = null;

    for (const member of vault.members) {
        try {
            decryptedVaultKey = unwrapKey(member.wrappedKey, identity.privateKey);
            if (decryptedVaultKey) break;
        } catch (e) { continue; }
    }

    if (!decryptedVaultKey) throw new Error("Unauthorized identity.");

    const plainText = decryptData(vault.payload, decryptedVaultKey);
    const secrets = dotenv.parse(plainText);

    // Filter out '--' if used
    const actualArgs = runArgs[0] === '--' ? runArgs.slice(1) : runArgs;
    injectAndRun(actualArgs[0], actualArgs.slice(1), secrets);
}

function handleAllow(identity, allowArgs) {
    const pubKeyPath = allowArgs[0];
    if (!pubKeyPath || !fs.existsSync(pubKeyPath)) throw new Error('Specify a valid public key path.');

    const vaultPath = path.resolve(process.cwd(), '.env.vault');
    const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));

    let currentKey = null;
    for (const member of vault.members) {
        try {
            currentKey = unwrapKey(member.wrappedKey, identity.privateKey);
            if (currentKey) break;
        } catch (e) { continue; }
    }

    if (!currentKey) throw new Error("Permission denied.");

    const teammatePubKey = fs.readFileSync(pubKeyPath, 'utf8');
    const wrappedForTeammate = wrapKey(currentKey, teammatePubKey);

    vault.members.push({
        name: path.basename(pubKeyPath).replace('.pub', ''),
        role: 'member',
        wrappedKey: wrappedForTeammate.toString('base64')
    });

    fs.writeFileSync('.env.vault', JSON.stringify(vault, null, 2));
    console.log(pc.green(`✔ Added access for ${path.basename(pubKeyPath)}.`));
}

function showHelp() {
    console.log(pc.cyan(`\n⚡ env-vault v1.0.0 | Cortlet Sovereign Security`));
    console.log(`  -i <path>         Specify identity folder (optional)`);
    console.log(`  lock              Sync .env to vault`);
    console.log(`  run -- <cmd>      Execute with secrets`);
    console.log(`  allow <pubkey>    Grant access to others\n`);
}

main();
