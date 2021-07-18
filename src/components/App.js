import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useWalletContext } from "../utils/walletContext.js";
import Loader from "react-loader-spinner";
import axios from "axios";
import { Promise } from "bluebird";
import "./App.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(1),
      width: theme.spacing(25),
      height: theme.spacing(35),
      backgroundColor: "#232323",
    },
  },
}));

const App = (props) => {
  const classes = useStyles();
  const {
    contract,
    walletAddress,
    web3,
    isConnected,
    status,
    connectWallet,
  } = useWalletContext();

  const [totalSupply, setTotalSupply] = useState(0);
  const [tokenInfo, setTokenInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getContractInfo = async () => {
      let tokenSupply = Number(await contract.methods.totalSupply().call());
      console.log(tokenSupply);
      setTotalSupply(tokenSupply);
      await Promise.map(
        Array.apply(null, Array(tokenSupply)),
        (_, i) => {
          axios
            .get(`${process.env.REACT_APP_TOKENURI_API}/${i + 1}`)
            .then((response) => {
              setTokenInfo((tokens) => [...tokens, response]);
            });
        },
        { concurrency: 1 }
      );
    };

    if (contract) {
      getContractInfo();
    }
  }, [contract]);

  useEffect(() => {
    if (tokenInfo.length >= totalSupply && totalSupply !== 0) {
      console.log(tokenInfo.length);
      setIsLoading(false);
    }
  }, [tokenInfo]);

  if (isLoading)
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Loader type="Grid" color="#5f7ffa" height={80} width={80} />
      </div>
    );

  if (!isLoading)
    return (
      <div className="Minter">
        <button
          id="walletButton"
          className={isConnected ? "connected" : "disconnected"}
          onClick={connectWallet}
        >
          {isConnected ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>

        <br></br>
        <h1 id="title">NoPixel Characters</h1>
        <h4>Total Characters - {totalSupply}</h4>
        <div className={classes.root}>
          {tokenInfo.map((token, i) => (
            <Paper
              elevation={3}
              key={i}
              style={{
                padding: 15,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
              }}
            >
              <p>{token.data.name}</p>
              <p>{token.data.description}</p>
            </Paper>
          ))}
        </div>
        <p id="status">{status}</p>
      </div>
    );
};

export default App;
