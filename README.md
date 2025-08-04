# 🧠 Argumint – Debate. Persuade. Win.

Argumint is a **gamified debate platform** where users dive into lively, opinion-driven battles like:

* *Spiderman vs Hulk*
* *Is a hotdog a sandwich?*
* *Taylor Swift vs Kanye?*

Pick your side. Join the live chat. Persuade the enemy. **Switch teams or stay loyal—every move counts.**

---

## 🎮 Gameplay Mechanics

* 💬 **Live Debates:** Join themed chat rooms based on fandom topics.
* ↺ **Switching Sides:** Players can switch teams during the debate—but only if convinced by an opposing player.
* 📈 **Points System:**

  * +1 point: Stay loyal through the debate.
  * +3 points: Successfully convert someone from the opposing team.
* 🏆 **Victory:** The team with the highest score wins.
* 🏱 **Rewards:** Winners earn NFTs unlocking perks, discounts, and rewards.

---

## 🔐 On-Chain Logic

* To **switch teams**, a user must:

  1. Sign a transaction (wallet-authenticated).
  2. Paste the address of the opposing debater who convinced them.
* An **on-chain verifier agent** checks:

  * Transaction validity
  * Argument quality heuristics (coming soon)

---

## 💻 Tech Stack

| Layer           | Tech Used                            |
| --------------- | ------------------------------------ |
| Frontend        | Next.js, Tailwind CSS                |
| Backend         | Node.js, Express, Prisma ORM         |
| Smart Contracts | Solidity, Foundry (Forge), Etherlink |
| Wallet & Auth   | Sequence, Ethers.js                  |
| Indexing        | Goldsky                              |
| DB              | PostgreSQL                           |
| Infra           | Vercel / Railway / Infura / TBD      |
| Misc            | Typescript, dotenv, ESLint           |

---

## 🚀 Getting Started (For Devs)

```bash
git clone https://github.com/your-org/argumint.git
cd Argumint

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install forge dependencies
cd ../contracts
forge install
forge build 
```

> **Note:** Remember to set up your `.env` files with keys for:
>
> * PostgreSQL
> * Contract addresses

---

## 📸 Screenshots

![WhatsApp Image 2025-08-04 at 16 22 22\_c595470c](https://github.com/user-attachments/assets/5b519839-f9f3-41f6-ae28-9271e97774e6)
![WhatsApp Image 2025-08-04 at 16 23 27\_47da9975](https://github.com/user-attachments/assets/96203d14-2616-4e13-a14b-b379b7d7885e)
![WhatsApp Image 2025-08-04 at 16 24 05\_6ba74e6c](https://github.com/user-attachments/assets/fe7b9334-def7-4fb0-98ca-496a1239189f)

---

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend unit
cd ../frontend
npm run test

# Smart contract
cd ../contracts
forge test
```

---

## ✨ Contributing

We love PRs! Open an issue, fork the repo, and contribute. Please follow our style guide (`eslint + prettier` configured).

---

## 📜 License

MIT © Argumint Labs

---

> Argumint – Where debates become battles. And your opinions? Blockchain-worthy.

---

## ✨ Why Etherlink?

We chose **[Etherlink](https://etherlink.com/)** as our smart contract platform because:

* ✅ **Low Fees:** Makes micro-interactions like team switching and reward claims inexpensive.
* ⏱️ **Fast Finality:** Ensures real-time chat-linked updates are validated near instantly.
* ⚖️ **EVM Compatibility:** Seamless Solidity + Forge development and deployment.
* 🫶 **Better UX:** Better fit for interactive and dynamic dApps like ours that depend on low-latency on-chain feedback.

---

## 📊 Why Goldsky?

We use **Goldsky** for indexing debate events and user interactions:

* ✏️ **Custom GraphQL APIs** for fast leaderboard and conversion analytics.
* 🚀 **Real-Time Sync** with on-chain events (e.g., switches, score updates).
* 🔍 **Optimized Queries** for rendering debate room dynamics smoothly.

Goldsky enables us to build a snappy, analytics-rich frontend experience over a fully on-chain backend.
