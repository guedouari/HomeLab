import { z } from "zod";

export const HardwareTarget = z.enum(["x86_64", "arm64", "nas"]);
export const Layer = z.enum(["0", "1", "2", "3"]);

export const GeneratorInput = z.object({
  /** Hardware architecture — affects image selection and resource defaults */
  hardware: HardwareTarget,
  /** Highest layer to generate (0=LAN, 1=WAN, 2=Domain, 3=Services) */
  layer: Layer,
  /** Server IP on the LAN (e.g. "192.168.1.10") */
  serverIp: z.string().ip(),
  /** IANA timezone (e.g. "Europe/Paris") */
  timezone: z.string().min(1),
  /** Public domain name — required for layer >= 2 */
  domain: z.string().optional(),
  /** Cloudflare API token for DNS-01 ACME — required for layer >= 2 */
  cloudflareToken: z.string().optional(),
  /** ACME email for TLS certificate registration — required for layer >= 2 */
  acmeEmail: z.string().email().optional(),
  /** WireGuard VPN subnet (e.g. "10.8.0.0/24") — required for layer >= 1 */
  vpnSubnet: z.string().optional(),
  /** Nextcloud admin credentials — required for layer 3 */
  nextcloudAdminUser: z.string().optional(),
  nextcloudAdminPassword: z.string().optional(),
  /** PostgreSQL superuser password — required for layer 3 */
  postgresPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  const layer = parseInt(data.layer);

  if (layer >= 1 && !data.vpnSubnet) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "vpnSubnet is required for Layer 1+", path: ["vpnSubnet"] });
  }
  if (layer >= 2 && !data.domain) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "domain is required for Layer 2+", path: ["domain"] });
  }
  if (layer >= 2 && !data.cloudflareToken) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "cloudflareToken is required for Layer 2+", path: ["cloudflareToken"] });
  }
  if (layer >= 2 && !data.acmeEmail) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "acmeEmail is required for Layer 2+", path: ["acmeEmail"] });
  }
  if (layer >= 3 && !data.nextcloudAdminUser) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "nextcloudAdminUser is required for Layer 3", path: ["nextcloudAdminUser"] });
  }
  if (layer >= 3 && !data.postgresPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "postgresPassword is required for Layer 3", path: ["postgresPassword"] });
  }
});

export type HardwareTarget = z.infer<typeof HardwareTarget>;
export type Layer = z.infer<typeof Layer>;
export type GeneratorInput = z.infer<typeof GeneratorInput>;
