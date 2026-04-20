# Reverse Proxy — Horizon

## Basic auth for specific services

Protect a service with a username/password prompt (useful for services without their own auth):

```caddy
@myservice host myservice.{$DOMAIN}
handle @myservice {
  basicauth {
    {$BASIC_AUTH_USER} {$BASIC_AUTH_HASH}
  }
  reverse_proxy localhost:PORT
}
```

Generate the hash: `caddy hash-password --plaintext "yourpassword"`

## IP allowlist (restrict to VPN only)

Block access to a service unless the request comes from a WireGuard VPN IP:

```caddy
@vpn_only {
  remote_ip 10.13.13.0/24
}
handle @vpn_only {
  reverse_proxy localhost:PORT
}
handle {
  respond "Access denied" 403
}
```

## Rate limiting

Caddy v2 supports rate limiting via the `rate_limit` module (requires another plugin in the custom build). For homelab use, this is rarely necessary — the VPN + no public port exposure is sufficient.

## GeoIP blocking

Block requests from specific countries. Requires the `geoip` module and a MaxMind GeoLite2 database. Out of scope for basic homelab.

## Monitoring Caddy

Caddy exposes a Prometheus metrics endpoint at `localhost:2019/metrics`. Add a Gatus check or scrape with a metrics system at Layer 3.
