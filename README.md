# ⚡ env-vault

Sovereign, no-bloat secret management using RSA identities. Zero cloud. Zero configuration.

## 🗝️ Why Sovereign?

Most secret managers force you into a cloud ecosystem. **env-vault** keeps everything local, using the RSA keys already in your `~/.ssh` folder to protect your `.env` files.

* **Zero Cloud:** No accounts, no subscriptions, no internet required.
* **Asymmetric Sharing:** Grant access to teammates via public keys.
* **Secure Injection:** Secrets are injected directly into process memory; plaintext never touches the disk.
* **No Bloat:** Built with Node.js native `crypto`.

---

## 🚀 Quick Start

### 1. Initialize Your Identity
If you don't have RSA keys, generate them natively:

```bash
node -e "const crypto = require('node:crypto'); const fs = require('node:fs'); const path = require('node:path'); const os = require('node:os'); const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 4096, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } }); const sshDir = path.join(os.homedir(), '.ssh'); if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir); fs.writeFileSync(path.join(sshDir, 'id_rsa'), privateKey); fs.writeFileSync(path.join(sshDir, 'id_rsa.pub'), publicKey); console.log('✔ Identity Created.');"
```
### 2. Lock Your Secrets
Encrypt `.env` into `.env.vault`:

npx env-vault lock

### 3. Run Your App
Inject secrets into any command:

```
npx env-vault run -- node app.js
```
---

## 👥 Multi-Member Access

Authorize a teammate by adding their public key:

```
npx env-vault allow ./teammate_id_rsa.pub
```

Your teammate can now run the vault using their own identity:

```bash
npx env-vault -i ./their_keys_folder run -- node app.js
```
---

## 🛠️ Commands

| Command | Description |
| :--- | :--- |
| `lock` | Encrypts `.env` into `.env.vault`. |
| `run -- <cmd>` | Executes command with secrets in `process.env`. |
| `allow <path>` | Adds a teammate's public key to the access list. |
| `-i <path>` | Global flag to specify a custom identity folder. |

**Built for the sovereign developer.** *Part of the Cortlet software brand.*
