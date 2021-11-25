import "./App.css";
import { useMemo } from "react";
import Home from "./views/Home";
import Faq from "./views/Faq";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import * as anchor from "@project-serum/anchor";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

const treasury = new anchor.web3.PublicKey(
  process.env.REACT_APP_TREASURY_ADDRESS!
);

const config = new anchor.web3.PublicKey(
  process.env.REACT_APP_CANDY_MACHINE_CONFIG!
);

const candyMachineId = new anchor.web3.PublicKey(
  process.env.REACT_APP_CANDY_MACHINE_ID!
);

const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    []
  );

  return (
    <div className="container">
      <Router>
        <nav className="navbar navbar-expand-lg justify-content-between">
          <Link className="navbar-brand text-white fs-1 fw-bold" to="/">
            <img className="brand-image" src="images/brand.png" alt="" />
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse ms-auto" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item active">
                <Link className="nav-link text-white-50" to="/">Home</Link>
              </li>
              <li className="nav-item active">
                <Link className="nav-link text-white-50" to="/faq">FAQ</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white-50" href="https://twitter.com/fatcatmafia">Twitter</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white-50" href="https://discord.gg/fatcatmafia">Discord</a>
              </li>
            </ul>
          </div>
        </nav>
        <Switch>
          <Route path="/faq">
            <Faq />
          </Route>
          <Route path="/">
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletDialogProvider>
                  <Home
                    candyMachineId={candyMachineId}
                    config={config}
                    connection={connection}
                    startDate={startDateSeed}
                    treasury={treasury}
                    txTimeout={txTimeout}
                  /></WalletDialogProvider>
              </WalletProvider>
            </ConnectionProvider>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;