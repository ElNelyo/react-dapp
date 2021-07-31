# BOLERO DAPP

## Blockchain Technical Test

The goal of this test is to evaluate your ability to architecture a small app connected to Blockchain.

### Instructions

Build a minimal React SPA that can be used as a token swap interface (via Uniswap).

- the app needs to:
  - have a homepage with a Swap Interface similar to [Uniswap](https://app.uniswap.org/#/swap), using a [tokenList](https://tokenlists.org/) for the swappable     tokens.<br>
    *The dAPP will be tested with a fork of the mainnet. You can use ganache-cli to fork it and reproduce the testing env.*
  - have a navbar with a button to connect a wallet using this library [web3-react](https://github.com/NoahZinsmeister/web3-react).
    In addition you can use [web3-modal](https://github.com/web3modal/web3modal).
      *The web3 management must be appwide. (Using Redux or Context).<br>*
      *The app should correctly handle connection, disconnection, switch wallet, switch network.*
  - have a private page for a connected wallet displaying his tokens (name, symbol, image, balance).

### Evaluation Criteria

Please push your code to a public GitHub repository. We'll assess the following in priority:

- the quality of the code;
- the UI & UX of the app;

Contact us at jobs@bolero-music.app if you need more details.



## Technical

Install all depedencies

```yarn install```

Start dev server

```yarn start```

Pass tests

```yarn test```