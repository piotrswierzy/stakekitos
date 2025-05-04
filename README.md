# StakeKitOS

**A modular, blockchain-agnostic staking integration API and SDK**

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Provider Integration](#provider-integration)
5. [Deployment Model](#deployment-model)
6. [Example: Ethereum & Example Provider Plugins](#example-ethereum--example-provider-plugins)
7. [Getting Started](#getting-started)
8. [Configuration](#configuration)
9. [Technology Stack](#technology-stack)
10. [Development Roadmap](#development-roadmap)
11. [Contributing](#contributing)
12. [License](#license)

---

## Introduction

StakeKitOS is an open-source, modular API and SDK designed to simplify staking integration for any platform—exchanges, custodial services, fintech apps, or Web3 solutions. The Core API is chain-agnostic, handling routing, configuration, and lifecycle, while all blockchain-specific logic lives in provider plugins. This approach ensures flexibility, extensibility, and no vendor lock-in.

## Features

- **Blockchain-Agnostic Core**: No on-chain logic in the Core—only generic interfaces and routing.  
- **Plugin-Based**: Each PoS network integration lives in a versioned, independently deployable plugin.  
- **Transport Agnostic**: Start with REST/JSON today; migrate to gRPC/Protobuf in the future without rewriting business logic.  
- **Flexible Deployment**: Self-hosted Core; plugins can run in-process or as sidecars.  
- **Observability**: Built for CI/CD, OpenTelemetry tracing, Prometheus/Grafana monitoring.  

## Architecture

StakeKitOS separates concerns into two layers:

1. **Core API**  
   - Defines transport-agnostic service interfaces (e.g., delegate, undelegate, getRewards).  
   - Manages plugin discovery, configuration, and request routing.  
2. **Provider Plugins**  
   - Implement `IStakingProvider` for each chain or third-party service.  
   - Encapsulate RPC/indexer interactions, transaction logic, and reward math.

```text
+----------------+    +------------------+
|  Client App    | -> |   Core API       |
| (REST/gRPC)    |    |  (HTTP/REST &    |
+----------------+    |   Microservices) |
                        |
            +-----------+------------+
            |                        |
     +-------------+          +-------------------+
     | Ethereum    |          | Example Staking Provider  |
     | Plugin      |          | Plugin            |
     +-------------+          +-------------------+
```

## Provider Integration

Plugins must implement a standard interface and lifecycle:

```ts
interface IStakingProvider {
  initialize(config: ProviderConfig): Promise<void>;
  delegate(req: DelegationRequest): Promise<DelegationResponse>;
  undelegate(req: UndelegationRequest): Promise<UndelegationResponse>;
  getRewards(address: string, opts?: QueryOptions): Promise<RewardsResponse>;
  getValidators(opts?: ValidatorQuery): Promise<ValidatorInfo[]>;
  healthCheck(): Promise<HealthStatus>;
}
```

- **Registration**: Core reads a config file listing plugin names, packages, and settings.  
- **Loading**: Dynamically `import()` modules or call sidecar endpoints.  
- **Packaging**: Distribute via npm/OCI registry with signed manifests.  
- **Lifecycle**: Core calls `initialize()`, runs periodic `healthCheck()`, and supports hot-reload of plugin versions.

## Deployment Model

### Integrator-Hosted Core (Recommended)

1. **Platform runs StakeKitOS Core**  
   - Self-hosted in on-prem or cloud.  
   - Loads provider plugins as local modules or Docker sidecars.  
2. **Provider publishes plugins**  
   - Chains or services publish versioned artifacts with manifests on npm registries.  
3. **Platform configures & connects**  
   - Config file lists plugin packages and endpoint settings (RPC, API URLs).  
   - Core routes staking calls to the correct plugin, consolidating responses.


## Example: Ethereum & Example Provider Plugins

### Configuration (YAML)
```yaml
stakekit:
  plugins:
    - name: ethereum-official
      package: "@stakekitos/plugin-ethereum"
      config:
        rpcUrl: "https://mainnet.infura.io/v3/${INFURA_KEY}"
        contractAddress: "0x..."
    - name: example-provider
      package: "@stakekitos/plugin-example-provider"
      config:
        apiUrl: "https://api.example-provider.io/v1"
        network: "ethereum"
```

### Ethereum Official Plugin
```ts
// @stakekitos/plugin-ethereum
export class EthereumProvider implements IStakingProvider {
  async initialize(cfg: ProviderConfig) {
    // Connect to RPC & staking contract
  }
  async delegate(req: DelegationRequest): Promise<DelegationResponse> { 
    // on-chain delegate logic
    const tx = /* build and send tx via ethers.js */;
    return { txHash: tx.hash };
  }
  // ... other methods
}
```

### Example Provider Plugin
```ts
// @stakekitos/plugin-example-provider
export class ExampleProvider implements IStakingProvider {
  private apiUrl: string;

  async initialize(cfg: ProviderConfig) {
    this.apiUrl = cfg.apiUrl;
  }

  async delegate(req: DelegationRequest): Promise<DelegationResponse> {
    const resp = await fetch(`${this.apiUrl}/staking/delegate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network: req.chain, validator: req.validator, amount: req.amount, from: req.from })
    });
    const data = await resp.json();
    return { txHash: data.txHash, providerId: 'example-provider' };
  }

  async getRewards(address: string): Promise<RewardsResponse> {
    const resp = await fetch(`${this.apiUrl}/staking/rewards?network=ethereum&address=${address}`);
    return resp.json();
  }

  // ... other methods
}
```

## Getting Started

### Prerequisites

- Node.js >= 18.x  
- Docker & Docker Compose (optional)

### Installation

```bash
git clone https://github.com/yourorg/stakekitos.git
cd stakekitos
npm install
```

### Run (REST MVP)

```bash
npm run start:rest
# Swagger UI available at http://localhost:3000/api-docs
```

## Configuration

Use a YAML/JSON file or environment variables. Example keys:

- `PORT` – HTTP server port (default: `3000`)  
- `STAKEKIT_PLUGINS` – Path to plugins config file

## Technology Stack

- **Core & Plugins**: TypeScript + NestJS (REST first, future gRPC/Protobuf)  
- **Containerization**: Docker + OCI registries  
- **Config & Secrets**: YAML/`dotenv`, Vault/KMS  
- **Data**: PostgreSQL (history), Redis (cache), NATS/Kafka (events)  
- **CLI**: Node CLI with Commander.js  
- **Observability**: OpenTelemetry, Prometheus, Grafana  
- **CI/CD**: GitHub Actions for lint, tests, build, publish

## Development Roadmap

| Milestone              | Status       |
|------------------------|--------------|
| Proof of Concept (REST)| Planned  |
| MVP (Multi-chain)      | Planned |
| gRPC/Protobuf Adapter  | Planned      |
| Plugin Registry API    | Planned      |
| SDKs (TS, Python)      | Planned      |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License © 2025 Your Organization
