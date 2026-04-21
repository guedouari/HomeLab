#!/usr/bin/env node
import { Command } from "commander";
import { generate } from "./generate";
import { GeneratorInput } from "./schema";

const program = new Command();

program
  .name("homelab")
  .description("Generate HomeLab Docker Compose + .env configs")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate config files for a given layer and hardware target")
  .requiredOption("--hardware <target>", "Hardware target: x86_64 | arm64 | nas")
  .requiredOption("--layer <n>", "Layer to generate: 0 | 1 | 2 | 3")
  .requiredOption("--server-ip <ip>", "Server LAN IP address")
  .requiredOption("--timezone <tz>", "IANA timezone (e.g. Europe/Paris)")
  .option("--domain <domain>", "Public domain name (required for layer 2+)")
  .option("--cloudflare-token <token>", "Cloudflare API token (required for layer 2+)")
  .option("--acme-email <email>", "ACME email for TLS certs (required for layer 2+)")
  .option("--vpn-subnet <cidr>", "WireGuard VPN subnet (required for layer 1+)", "10.8.0.0/24")
  .option("--nextcloud-admin-user <user>", "Nextcloud admin username (required for layer 3)")
  .option("--nextcloud-admin-password <pass>", "Nextcloud admin password (required for layer 3)")
  .option("--postgres-password <pass>", "PostgreSQL superuser password (required for layer 3)")
  .option("--out <dir>", "Output directory", "./output")
  .action(async (opts) => {
    const parsed = GeneratorInput.safeParse({
      hardware: opts.hardware,
      layer: opts.layer,
      serverIp: opts.serverIp,
      timezone: opts.timezone,
      domain: opts.domain,
      cloudflareToken: opts.cloudflareToken,
      acmeEmail: opts.acmeEmail,
      vpnSubnet: opts.vpnSubnet,
      nextcloudAdminUser: opts.nextcloudAdminUser,
      nextcloudAdminPassword: opts.nextcloudAdminPassword,
      postgresPassword: opts.postgresPassword,
    });

    if (!parsed.success) {
      console.error("Invalid input:");
      for (const issue of parsed.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      process.exit(1);
    }

    await generate(parsed.data, opts.out as string);
  });

program.parse();
