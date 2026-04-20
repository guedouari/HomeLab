# Firewall Testing — Layer 1 WAN

## Test environment

- Host: WSL2 (Alpine kernel 6.6, x86_64 emulating ARM64)
- Docker: started via `sudo dockerd &` inside WSL session
- Image: `crowdsecurity/crowdsec:latest`

## Tests performed

### 1. Image pull

```
docker pull crowdsecurity/crowdsec:latest
```

- Size: 343 MB
- ARM64 manifest: ✅
- Result: ✅ pulled successfully

### 2. Container startup — basic

```
docker run -d crowdsecurity/crowdsec:latest
```

- CrowdSec exited: missing acquis.yaml — expected (agent needs log source config)

### 3. Container startup — with data volume

```
docker run -d \
  -v /tmp/cs-test/data:/var/lib/crowdsec/data \
  crowdsecurity/crowdsec:latest
```

- Exited with: `bind: address already in use` on port 8080 — port conflict with Gatus
- Diagnosis confirmed: LAPI defaults to 8080

### 4. Container startup — port override + acquis.yaml

```yaml
# config.yaml.local
api:
  server:
    listen_uri: 0.0.0.0:8090
```

```yaml
# acquis.yaml
filenames:
  - /var/log/syslog
labels:
  type: syslog
```

```
docker run -d --network host \
  -e COLLECTIONS='crowdsecurity/linux crowdsecurity/sshd crowdsecurity/iptables' \
  -v /tmp/cs-test/data:/var/lib/crowdsec/data \
  -v .../acquis.yaml:/etc/crowdsec/acquis.yaml:ro \
  -v .../config.yaml.local:/etc/crowdsec/config.yaml.local:ro \
  crowdsecurity/crowdsec:latest
```

**Result: ✅ running**

Key log lines observed:
```
level=info msg="Crowdsec v1.7.7-981e6166"
level=info msg="Loaded 10 scenarios"
level=info msg="POST /v1/watchers/login HTTP/1.1 200"   ← LAPI up
level=info msg="loading acquisition file: /etc/crowdsec/acquis.yaml"
level=info msg="Starting processing data"
level=info msg="capi/community-blocklist: received 0 new entries (expected if you just installed crowdsec)"
```

Status: `running` (container stayed up, not exited)

### Collections downloaded automatically

```
crowdsecurity/linux
crowdsecurity/sshd       → 11 SSH brute-force scenarios
crowdsecurity/iptables   → port-scan scenario via iptables LOG
crowdsecurity/whitelist-good-actors
```

No manual `cscli collections install` step required — `COLLECTIONS` env var handles it.

## Manual verification steps (for actual server deployment)

```bash
# Check running decisions (should grow after bouncer install)
docker exec crowdsec cscli decisions list

# Check alerts
docker exec crowdsec cscli alerts list

# Check LAPI is reachable from host
curl http://localhost:8090/health

# Simulate SSH brute force (from separate host)
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://SERVER_IP

# Verify CrowdSec detected and banned the source IP
docker exec crowdsec cscli decisions list | grep <attacker_ip>
```
