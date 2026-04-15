import spawn from 'cross-spawn';
import pc from 'picocolors';

/**
 * Transparent Runner: Injects secrets and spawns the dev command.
 * @param {string} command - The command to run (e.g., 'npm')
 * @param {string[]} args - Arguments for the command (e.g., ['run', 'dev'])
 * @param {Object} secrets - Decrypted key-value pairs from the vault
 */
export function injectAndRun(command, args, secrets) {
    if (!command) {
        console.error(pc.red('✖ Error: No command provided to run.'));
        console.log(pc.dim('Usage: env-vault run -- <command>'));
        process.exit(1);
    }

    // Merge current process env with our decrypted secrets
    // We add VAULT_ACTIVE so the app knows it's running in a secure context
    const enhancedEnv = {
        ...process.env,
        ...secrets,
        CORTLET_VAULT_ACTIVE: 'true'
    };

    console.log(pc.cyan(`🚀 Launching [${command} ${args.join(' ')}] with Vault secrets...`));

    // cross-spawn handles Windows path/shell issues automatically
    const child = spawn(command, args, {
        stdio: 'inherit',
        env: enhancedEnv
    });

    // Ensure the CLI exits with the same code as the child process
    child.on('close', (code) => {
        if (code !== 0) {
            console.log(pc.yellow(`\n⚠️  Process exited with code ${code}`));
        } else {
            console.log(pc.green('\n✔ Process completed successfully.'));
        }
        process.exit(code);
    });

    // Handle sudden termination (Ctrl+C)
    process.on('SIGINT', () => {
        child.kill('SIGINT');
        process.exit();
    });
}
