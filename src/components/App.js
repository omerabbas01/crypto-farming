import React, { useEffect, useState } from "react";
import Web3 from "web3";

import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";

import Main from "./Main";
import Navbar from "./Navbar";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState("");

  const [daiToken, setDaiToken] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState("0");

  const [dappToken, setDappToken] = useState({});
  const [dappTokenBalance, setDappTokenBalance] = useState("0");

  const [tokenFarm, setTokenFarm] = useState({});
  const [stakingBalance, setStakingBalance] = useState("0");

  const [loading, setLoading] = useState(true);

  //Function to connect crypto wallet with the application
  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-ethereum browser detected. You should consider trying Metamask!"
      );
    }
  };

  //Function to get the account details from the connected wallets.
  const loadAccounts = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
  };

  //Function to get blockchain details->accounts, tokens.
  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    console.log("networkId: ", networkId);


    //Load DaiToken.
    const daiTokenData = DaiToken.networks[networkId];
    console.log("daiTokenData: ", daiTokenData);
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      setDaiToken(daiToken);

      let daiTokenBalance = await daiToken.methods.balanceOf(account).call();
      console.log("daiTokenBalance: ", daiTokenBalance)
      setDaiTokenBalance(daiTokenBalance.toString());
    } else {
      window.alert("DaiToken contract not deployed to detect network.");
    }

    //Load DappToken.
    const dappTokenData = DappToken.networks[networkId];
    console.log("dappTokenData: ", dappTokenData);
    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      setDappToken(dappToken);
      let dappTokenBalance = await dappToken.methods.balanceOf(account).call();
      console.log("dappTokenBalance: ", dappTokenBalance)
      setDappTokenBalance(dappTokenBalance.toString());
    } else {
      window.alert("DappToken contract not deployed to detect network.");
    }

    //Load TokenFarm.
    const tokenFarmData = TokenFarm.networks[networkId];
    console.log("tokenFarmData: ", tokenFarmData);
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      console.log("tokenFarm: ", tokenFarm);
      setTokenFarm(tokenFarm);

      const stakingBalance = await tokenFarm.methods
        .stakingBalance(account)
        .call();
      console.log("stakingBalance: ", stakingBalance);

      setStakingBalance(stakingBalance.toString());
    } else {
      window.alert("TokenFarm contract not deployed to detect network.");
    }

    setLoading(false);
  };

  const stakeTokens = async (amount) => {
    console.log("tokenFarm._address: ", tokenFarm._address)
    console.log("amount: ", amount)

    setLoading(true);
    const daiTx =  await daiToken.methods
      .approve(tokenFarm._address, amount)
      .send({ from: account })
      .on("transactionHash", async (hash) => {
        console.log("transactionHash: ", hash)


      })
        .on("error", async function(error, receipt) {
          console.log("Error: ", error)
          console.log("receipt: ", receipt)
        })
        .on('confirmation', async function(confirmationNumber, receipt){
          console.log("confirmation: ", confirmationNumber)
          console.log("receipt: ", receipt)
        })
        .on('receipt', async function(receipt) {
          console.log("receipt: ", receipt)
        });

      await tokenFarm.methods
      .stakeTokens(amount)
      .send({ from: account })
      .on("transactionHash", async (hash) => {
        console.log("transactionHash: ", hash)
        setLoading(false);
      })
        .on("error", async function(error, receipt) {
          console.log("Error: ", error)
          console.log("receipt: ", receipt)
        })
        .on('confirmation', async function(confirmationNumber, receipt){
          console.log("confirmation: ", confirmationNumber)
          console.log("receipt: ", receipt)
        })
        .on('receipt', async function(receipt) {
          console.log("receipt: ", receipt)
          setLoading(false);
        });
  };

  const unstakeTokens = async () => {
    await setLoading(true);
    tokenFarm.methods
      .unstakeTokens()
      .send({ from: account })
      .on("transactionHash", (hash) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWeb3();
    loadAccounts();
  }, []);

  useEffect(() => {
    if (account) {
      loadBlockchainData();
    }
  }, [account]);

  let content = null;
  if (loading) {
    content = (
      <p id="loader" className="text-center">
        Loading...
      </p>
    );
  } else {
    content = (
      <Main
        daiTokenBalance={daiTokenBalance}
        dappTokenBalance={dappTokenBalance}
        stakingBalance={stakingBalance}
        stakeTokens={stakeTokens}
        unstakeTokens={unstakeTokens}
      />
    );
  }

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              {content}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
