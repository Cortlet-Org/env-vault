import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

/**
 * v1 Adaptive Identity
 * Priority: 1. Explicitly provided path | 2. Global ~/.ssh
 */
export function getIdentity(customPath = null) {
    // If customPath is provided, use it; otherwise, default to home .ssh
    const sshDir = customPath
        ? path.resolve(customPath)
        : path.join(os.homedir(), '.ssh');

    const privPath = path.join(sshDir, 'id_rsa');
    const pubPath = path.join(sshDir, 'id_rsa.pub');

    if (!fs.existsSync(privPath)) {
        throw new Error(`Identity missing at: ${sshDir}. Ensure id_rsa exists there.`);
    }

    const privKeyRaw = fs.readFileSync(privPath, 'utf8');
    const pubKeyRaw = fs.readFileSync(pubPath, 'utf8');

    return {
        privateKey: crypto.createPrivateKey(privKeyRaw),
        publicKey: crypto.createPublicKey(pubKeyRaw)
    };
}
