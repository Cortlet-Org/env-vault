# Contributing to env-vault

We welcome contributions that align with the Cortlet philosophy: **Security, Sovereignty, and Zero-Bloat.**

## 🛠️ Development Principles
Before submitting a Pull Request, ensure your changes follow these rules:
1. **Zero External Dependencies**: Use Node.js native modules (like `crypto`, `fs`, `path`) whenever possible.
2. **Windows First, Cross-Platform Second**: Ensure all path handling uses `path.join()` or `path.resolve()` to maintain Windows compatibility.
3. **No UI Bloat**: This is a CLI tool. Keep logs clean and utilize `picocolors` for essential status updates only.

## 🚀 Getting Started
1. Fork the repository.
2. Install minimal dev dependencies: `npm install`.
3. Create a feature branch: `git checkout -b feature/amazing-improvement`.

## 🧪 Testing
We use a clean-slate testing approach. Before submitting, ensure your changes pass a manual "Clean Slate" test:
1. Generate a new identity.
2. Lock a dummy `.env`.
3. Verify injection works via `run`.

## 📬 Submitting Changes
- Open a Pull Request with a clear description of the problem and your solution.
- Ensure your code follows the existing style (ESM modules, async/await).
- By contributing, you agree that your code will be licensed under the project's current license.

## ⚖️ Code of Conduct
Please review our [Code of Conduct](https://legal.cortlet.com/code-of-conduct) before interacting with the community.

---
*Thank you for helping build a more sovereign web.*
