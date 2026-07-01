# Cloudflare tunnel setup

This repository supports two Cloudflare tunnel modes:

1. Quick tunnel for temporary sharing.
2. Named tunnel for a custom domain like `www.ssneakers.com`.

For a named tunnel, create the tunnel in your Cloudflare account, route DNS for `www.ssneakers.com` to it, then point `CLOUDFLARED_TUNNEL_CONFIG` at your local config file when running `npm run dev`.

Example config lives in `cloudflared/config.yml.example`.