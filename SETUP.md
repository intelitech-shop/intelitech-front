# Setup do ambiente local (oficina de Git)

Arquitetura: tudo roda nesta maquina (Mac). O GitHub dispara a pipeline,
um **self-hosted runner** constroi a imagem e sobe o container, e o
**cloudflared** (repo `intelitech-tf`) expoe a porta publicamente.

```
push dev  ->  runner  ->  docker compose up intelitech-front-dev  (:3501)  ->  dev.intelitech.shop
push main ->  runner  ->  docker compose up intelitech-front-prod (:3500)  ->  prod.intelitech.shop
```

- `dev`  -> `development` -> porta 3501 -> https://dev.intelitech.shop
- `main` -> `production`  -> porta 3500 -> https://prod.intelitech.shop

---

## 1. Pre-requisitos (uma vez)

- Docker Desktop instalado e **em execucao** (`docker info` deve responder).
- Repo `intelitech-tf` clonado ao lado deste, com os tuneis Cloudflare ja
  aplicados (`terraform apply` em `dev/` e `prod/`).

## 2. Subir os tuneis Cloudflare

No repo `intelitech-tf`:

```bash
docker compose up -d           # sobe cloudflare-tunnel-dev e cloudflare-tunnel-prod
docker ps                      # confirme os dois containers "Up"
```

## 3. Instalar o self-hosted runner (uma vez)

No GitHub: repo `intelitech-front` -> **Settings -> Actions -> Runners ->
New self-hosted runner -> macOS**. O GitHub mostra os comandos com um token
unico; use os comandos de la (o token expira rapido). O fluxo e:

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
# baixar o pacote que o GitHub indicar, por exemplo:
curl -o actions-runner-osx.tar.gz -L <URL_DO_PACOTE_MACOS>
tar xzf actions-runner-osx.tar.gz

# configurar (token vem da tela do GitHub)
./config.sh --url https://github.com/intelitech-shop/intelitech-front --token <TOKEN>
```

Aceite os padroes. O label `self-hosted` (usado na pipeline) e aplicado
automaticamente.

### Rodar o runner

Em primeiro plano (bom para a aula, da pra ver os logs):

```bash
cd ~/actions-runner
./run.sh
```

Ou como servico que inicia sozinho:

```bash
cd ~/actions-runner
./svc.sh install
./svc.sh start
./svc.sh status     # conferir
```

## 4. Primeiro deploy

```bash
# na branch dev
git checkout dev
git commit --allow-empty -m "trigger deploy dev"
git push origin dev
```

Acompanhe em **Actions** no GitHub. Ao terminar, abra
https://dev.intelitech.shop. Para producao, faca merge/push em `main` e
abra https://prod.intelitech.shop.

## 5. Subir containers manualmente (sem CI)

```bash
docker compose up -d --build                      # dev + prod
docker compose up -d --build intelitech-front-dev # so dev
docker ps
```

---

## Troubleshooting

- **URL da 404 / Bad Gateway**: container nao esta no ar na porta certa.
  `docker ps` deve mostrar `0.0.0.0:3501->80` (dev) e `0.0.0.0:3500->80` (prod).
- **Tunnel offline**: `docker logs cloudflare-tunnel-dev` no repo `intelitech-tf`.
- **Runner nao pega o job**: confira `./svc.sh status` (ou se o `./run.sh`
  esta aberto) e se o runner aparece "Idle" em Settings -> Actions -> Runners.
- **Porta ocupada**: `lsof -i :3501` / `lsof -i :3500`.
