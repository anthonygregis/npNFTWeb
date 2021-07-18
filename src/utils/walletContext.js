import Web3 from "web3";
import NoPixelCharacters from "../abis/NoPixelCharacters.json";
import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [contract, setContract] = useState();
  const [web3, setWeb3] = useState();
  const [isConnected, setConnectedStatus] = useState(false);
  const [networkId, setNetworkId] = useState(-1);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  const getContract = async () => {
    const networkData = NoPixelCharacters.networks[networkId];

    if (networkData) {
      const contract = new web3.eth.Contract(
        NoPixelCharacters.abi,
        networkData.address
      );
      setContract(contract);
    } else {
      setStatus("Smart contract not deployed on this network");
    }
  };

  const checkInfo = async () => {
    if (window.ethereum) {
      //if Metamask installed
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        }); //get Metamask wallet
        if (accounts.length) {
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          web3.eth.net.getId().then((networkId) => {
            //if a Metamask account is connected
            setConnectedStatus(true);
            setWallet(accounts[0]);
            setNetworkId(networkId);
            setStatus("");
          });
        } else {
          setConnectedStatus(false);
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      } catch {
        setConnectedStatus(false);
        setStatus(
          "🦊 Connect to Metamask using the top right button. " + walletAddress
        );
      }
    }
  };

  useEffect(() => {
    checkInfo();
  }, []);

  useEffect(() => {
    if (networkId) {
      getContract();
    }
  }, [networkId]);

  const connectWallet = async () => {
    if (window.ethereum) {
      //check if Metamask is installed
      try {
        await window.ethereum.enable(); //connect Metamask
        checkInfo();
      } catch (error) {
        setConnectedStatus(false);
        setStatus("🦊 Connect to Metamask using the button on the top right.");
      }
    } else {
      setConnectedStatus(false);
      setStatus(
        "🦊 You must install Metamask into your browser: https://metamask.io/download.html"
      );
    }
  };

  return (
    <WalletContext.Provider
      value={{
        contract,
        walletAddress,
        isConnected,
        status,
        web3,
        networkId,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
