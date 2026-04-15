import crypto from 'node:crypto';

/**
 * v1 Vault Engine: Multi-tier Sovereignty Logic
 */

const ALGORITHM = 'aes-256-gcm';

/**
 * Tier 1: Data Encryption
 * Encrypts the .env string using a symmetric Data Key (hex).
 */
export function encryptData(text, vaultKey) {
    const iv = crypto.randomBytes(16);
    // Convert hex vaultKey back to Buffer for the cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(vaultKey, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted
    };
}

/**
 * Tier 1: Data Decryption
 * Decrypts the payload using a recovered symmetric Data Key.
 */
export function decryptData(payload, vaultKey) {
    const { iv, tag, data } = payload;
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(vaultKey, 'hex'), Buffer.from(iv, 'hex'));

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

export function wrapKey(vaultKey, publicKey) {
    return crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(vaultKey, 'hex')
    );
}

export function unwrapKey(wrappedKeyBase64, privateKey) {
    const buffer = Buffer.from(wrappedKeyBase64, 'base64');
    return crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        buffer
    ).toString('hex');
}
