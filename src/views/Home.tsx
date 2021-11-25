import "../styles/views/Home.css";
import * as anchor from "@project-serum/anchor";
import styled from "styled-components";
import Countdown from "react-countdown";
import Alert from "@material-ui/lab/Alert";
import { useEffect, useState } from "react";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import { CandyMachine, awaitTransactionSignatureConfirmation, getCandyMachineState, mintOneToken, shortenAddress } from "../candy-machine";

const ConnectButton = styled(WalletDialogButton)`
  & {
    border: 1px solid #fff !important;
    background-color: transparent !important;
    font-size: 1rem;
    font-family: EB Garamond,serif,sans-serif !important;
    &:hover {
      background-color: #fff !important;
      color: #1a1a1a;
    }
  }
`;
const CounterText = styled.span``; // add your styles here
const MintContainer = styled.div``; // add your styles here
const MintButton = styled(Button)`
  & {
    border: 1px solid #fff !important;
    background-color: transparent !important;
    font-size: 1rem;
    font-family: EB Garamond,serif,sans-serif !important;
    &:hover {
      background-color: #fff !important;
      color: #1a1a1a;
    }
  }
`; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  //const [remainingItems, setRemainingItems] = useState<number>();

  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection
        );

      //Presale code 
      //Total we have :2000
      //Presale:1500 
      //setRemainingItems(itemsRemaining-933);
      //After presale code
      

      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  return (
    <main>
      <section className="">
        <div className="row">
          <div className="col-12">
            <div className="mt-4 text-center">
              <img className="w-50" src="images/brand.png" alt="" />
              <h4>Our Story</h4>
              <img className="w-50" src="images/Banner.png" alt="" />

              <p className="text-white-50"> The underworld is being ruled by a syndicate, known as the Fat Cat Mafia.

These notorious gangsters are known particularly for controlling the economy by distributing and smuggling catnip into what was once a save haven of a country.

Coming together from all around the world, there are many classes of elite fat felines, but none of them compare to the chunkiest of them all.

THE CAT, pioneer of organized crime, inventor of money laundering and the highest up in the familia. </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-center text-center">
              <div className="me-3 text-start">
                {wallet.connected && (<p className="mb-0">Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>)}
                {wallet.connected && (<p className="mb-0">Balance: {(balance || 0).toLocaleString()} SOL</p>)}
              </div>
              <MintContainer>
                {
                  !wallet.connected ?
                    (
                      <ConnectButton>CONNECT WALLET</ConnectButton>
                    ) :
                    (
                      <MintButton
                        disabled={isSoldOut || isMinting || !isActive}
                        onClick={onMint}
                        variant="contained"
                      >
                        {isSoldOut ? (
                          "SOLD OUT"
                        ) : isActive ? (
                          isMinting ? (
                            <CircularProgress size={25} />
                          ) : (
                            "MINT"
                          )
                        ) : (
                          <Countdown
                            date={startDate}
                            onMount={({ completed }) => completed && setIsActive(true)}
                            onComplete={() => setIsActive(true)}
                            renderer={renderCounter}
                          />
                        )}
                      </MintButton>
                    )}
              </MintContainer>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-4">
        <div className="row">
          <div className="col-md-4">
            <img className="w-100" src="images/example-one.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-two.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-three.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-four.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-five.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-six.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-seven.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-eight.png" alt="" />
          </div>
          <div className="col-md-4">
            <img className="w-100" src="images/example-nine.png" alt="" />
          </div>
        </div>
      </section>
      
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;