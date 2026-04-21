# DNS Filtering — Horizon

Ideas that came up during discussion but are out of scope for Layer 0.

---

## DoH / DoT Server (serve encrypted DNS to clients)

AdGuard Home can act as a DoH/DoT **server** — not just a client. Devices that support DNS-over-HTTPS can point directly to it instead of plain port 53.

**AdGuard Home's role:** built-in — enable in Settings → Encryption. Requires a TLS certificate (Let's Encrypt or self-signed). Self-signed works for local clients that trust the CA; Let's Encrypt needs a public domain.

**Scope:** Layer 1 (needs TLS certificate infrastructure, possibly reverse proxy).

---

## Split-Horizon DNS

Different DNS answers depending on whether the query comes from inside the LAN or through VPN. Example: `nextcloud.homelab.local` resolves to `192.168.1.10` on LAN and to the WireGuard IP from outside.

**AdGuard Home's role:** DNS rewrites handle the LAN side. WireGuard peers can use the same DNS server — they already get the LAN IP because they're on the VPN subnet. No extra config needed for basic split-horizon.

**Scope:** Layer 1 (WireGuard needed first).

---

## DHCP Server (replace router DHCP)

AdGuard Home has a built-in DHCP server. Running DHCP from the container means it can automatically set itself as the DNS server for all clients — no router configuration needed.

**AdGuard Home's role:** full DHCP server available, including static leases and hostname registration. Requires the container to be on the LAN (host mode or macvlan).

**Scope:** Optional at Layer 0, but adds risk (if the server is down, DHCP fails for the whole LAN). Evaluate only if the router's DHCP is too limited.

---

## Wildcard Local Domain

Instead of adding individual rewrites (`service1.homelab.local`, `service2.homelab.local`), a single wildcard rewrite (`*.homelab.local → server IP`) combined with a reverse proxy at Layer 1 handles all services automatically.

**AdGuard Home's role:** one DNS rewrite rule covers all services. The reverse proxy (Layer 1) routes by hostname.

**Scope:** Layer 1 (reverse proxy needed first). Set up the wildcard rewrite now, add the reverse proxy at Layer 1.

---

## Filtering by Client / Device Group

Different blocklist profiles per device — stricter filtering on kids' devices, relaxed on the Steam Deck.

**AdGuard Home's role:** native per-client settings and client groups in the UI. No extra tooling needed.

**Scope:** Layer 0 configuration (available now, just a UI task). Low priority until the stack is stable.
