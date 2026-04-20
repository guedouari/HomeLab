# dynDNS — Horizon

## Multiple domains / zones

The `cloudflare.json` config supports multiple `cloudflare` entries — one per Cloudflare zone. Use this if you manage multiple domains and want all of them to point to the same home IP:

```json
{
  "cloudflare": [
    { "authentication": {...}, "zone_id": "ZONE1", "subdomains": [...] },
    { "authentication": {...}, "zone_id": "ZONE2", "subdomains": [...] }
  ]
}
```

## IPv6 (AAAA record)

Set `"aaaa": true` in `cloudflare.json` to also update the IPv6 record. Requires the server to have a public IPv6 address.

## Webhook notifications

`timothyjmiller/cloudflare-ddns` does not support notifications on IP change. If you need to be notified when your public IP changes, add a script or use a separate monitoring tool.

## Alternatives if not using Cloudflare

For other DNS providers, `ddclient` supports 60+ providers and is the standard tool. The trade-off is a larger image (~50 MB) and more complex config syntax.
