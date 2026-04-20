#!/usr/bin/env bash
# =============================================================================
# HomeLab — Host Firewall Setup Script (Layer 1 WAN)
# =============================================================================
# Run ONCE on the host before starting the WAN compose stack.
# This sets a minimal iptables baseline and (optionally) installs the
# CrowdSec firewall bouncer for automatic IP banning.
#
# Adjust LAN_SUBNET and WIREGUARD_PORT to match your .env values.
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these to match your environment
# ---------------------------------------------------------------------------
LAN_SUBNET="${LAN_SUBNET:-192.168.1.0/24}"
WIREGUARD_PORT="${WIREGUARD_PORT:-51820}"
CROWDSEC_LAPI="${CROWDSEC_LAPI:-http://127.0.0.1:8090}"

# ---------------------------------------------------------------------------
# 1. Baseline INPUT rules
# ---------------------------------------------------------------------------
echo "[*] Applying iptables baseline INPUT rules..."

# Accept established/related connections (stateful firewall)
iptables -C INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT 2>/dev/null \
  || iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Accept loopback
iptables -C INPUT -i lo -j ACCEPT 2>/dev/null \
  || iptables -A INPUT -i lo -j ACCEPT

# Accept all LAN traffic
iptables -C INPUT -s "$LAN_SUBNET" -j ACCEPT 2>/dev/null \
  || iptables -A INPUT -s "$LAN_SUBNET" -j ACCEPT

# Accept WireGuard VPN
iptables -C INPUT -p udp --dport "$WIREGUARD_PORT" -j ACCEPT 2>/dev/null \
  || iptables -A INPUT -p udp --dport "$WIREGUARD_PORT" -j ACCEPT

# HTTP/HTTPS — uncomment if running Caddy (Layer 2)
# iptables -C INPUT -p tcp --dport 80  -j ACCEPT 2>/dev/null \
#   || iptables -A INPUT -p tcp --dport 80 -j ACCEPT
# iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null \
#   || iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Log dropped packets with CrowdSec prefix (feeds iptables scenario)
iptables -C INPUT -j LOG --log-prefix "CS_FIREWALL_DROP " --log-level 7 2>/dev/null \
  || iptables -A INPUT -j LOG --log-prefix "CS_FIREWALL_DROP " --log-level 7

# Drop everything else
iptables -C INPUT -j DROP 2>/dev/null \
  || iptables -A INPUT -j DROP

echo "[+] iptables baseline applied."

# ---------------------------------------------------------------------------
# 2. Persist rules across reboots
# ---------------------------------------------------------------------------
if command -v netfilter-persistent &>/dev/null; then
  netfilter-persistent save
  echo "[+] Rules persisted via netfilter-persistent."
elif command -v iptables-save &>/dev/null; then
  iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
  echo "[+] Rules saved to /etc/iptables/rules.v4 (restore with iptables-restore)."
else
  echo "[!] Could not persist rules — install 'iptables-persistent' (Debian/Ubuntu) or equivalent."
fi

# ---------------------------------------------------------------------------
# 3. Optional: install CrowdSec firewall bouncer (automatic IP banning)
# ---------------------------------------------------------------------------
echo ""
echo "[*] CrowdSec firewall bouncer installation (optional but recommended)"
echo "    Skipping auto-install — run manually if desired:"
echo ""
echo "  # Debian/Ubuntu:"
echo "  curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash"
echo "  sudo apt install crowdsec-firewall-bouncer-iptables"
echo ""
echo "  # Generate an API key in the running CrowdSec container:"
echo "  docker exec crowdsec cscli bouncers add firewall-bouncer"
echo ""
echo "  # Edit bouncer config:"
echo "  sudo nano /etc/crowdsec/bouncers/crowdsec-firewall-bouncer.yaml"
echo "  # Set:  api_url: $CROWDSEC_LAPI"
echo "  # Set:  api_key: <key from above>"
echo ""
echo "  sudo systemctl enable --now crowdsec-firewall-bouncer"
echo ""
echo "[+] Done. Start the WAN stack: docker compose up -d"
