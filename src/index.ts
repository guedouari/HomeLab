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
  .option("--dns-api-token <token>", "DNS provider API token for DNS-01 ACME (required for layer 2+)")
  .option("--acme-email <email>", "ACME email for TLS certs (required for layer 2+)")
  .option("--vpn-subnet <cidr>", "VPN subnet CIDR (required for layer 1+)", "10.8.0.0/24")
  .option("--out <dir>", "Output directory", "./output")
  .action(async (opts) => {
    const parsed = GeneratorInput.safeParse({
      hardware: opts.hardware,
      layer: opts.layer,
      serverIp: opts.serverIp,
      timezone: opts.timezone,
      domain: opts.domain,
      dnsApiToken: opts.dnsApiToken,
      acmeEmail: opts.acmeEmail,
      vpnSubnet: opts.vpnSubnet,
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
