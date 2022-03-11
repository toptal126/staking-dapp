import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

import { BigNumber, ethers } from "ethers";

import {
    StakingTokenAddress,
    RewardTokenAddress,
    StakingRewardsAddress,
    MAX_UINT256,
    MAX_INT,
} from "../utils/constant";

import StakingAbi from "../utils/abi/StakingToken.json";
import RewardAbi from "../utils/abi/RewardToken.json";
import StakingRewardsAbi from "../utils/abi/StakingRewards.json";

export default function Home() {
    const videoRef = useRef(null);

    const [provider, setProvider] = useState();
    const [account, setAccount] = useState("");
    const [stakingTokenBalance, setStakingTokenBalance] = useState();
    const [rewardTokenBalance, setRewardTokenBalance] = useState();
    const [totalStakedBalance, setTotalStakedBalance] = useState();

    const [allowance, setAllowance] = useState();

    const [stakingAmount, setStakingAmount] = useState(0);
    const [withdrawingAmount, setWithdrawingAmount] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(0);
    const [claimableAmount, setClaimableAmount] = useState(0);

    useEffect(() => {
        setInterval(() => {
            if (provider && account) {
                getClaimableAmount();
            }
        }, 15 * 1000);
    }, []);
    useEffect(() => {
        if (provider && account) {
            updateInformation();
        }
    }, [provider, account]);

    const updateInformation = () => {
        getTotalStakedBalance();
        getStakingTokenBalance();
        getStakingTokenAllowAnce();
        getStakedAmount();
        getClaimableAmount();
        getRewardTokenBalance();
    };

    const updateStakingAmount = (e) => {
        if (
            parseFloat(e.target.value) == 0 ||
            Number.isNaN(parseFloat(e.target.value))
        )
            return;
        setStakingAmount(parseFloat(e.target.value));
    };
    const updateWithdrawingAmount = (e) => {
        if (
            parseFloat(e.target.value) == 0 ||
            Number.isNaN(parseFloat(e.target.value))
        )
            return;
        setWithdrawingAmount(parseFloat(e.target.value));
    };

    const connect = async () => {
        if (!window.ethereum?.request) {
            alert("MetaMask is not installed!");
            return;
        }

        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setProvider(_provider);
        setAccount(accounts[0]);
    };

    const allowStakingToken = async () => {
        const stakingTokenContract = stakingToken();
        const tx = await stakingTokenContract.approve(
            StakingRewardsAddress,
            MAX_UINT256
        );
        await tx.wait();
        updateInformation();
    };

    const stakeToken = async () => {
        const stakingRewardsContract = stakingRewards();
        const sa = BigNumber.from(10).pow(18).mul(stakingAmount);
        const tx = await stakingRewardsContract.stake(sa.toHexString());
        await tx.wait();
        updateInformation();
    };

    const withdrawStakedToken = async () => {
        const stakingRewardsContract = stakingRewards();
        const sa = BigNumber.from(10).pow(18).mul(withdrawingAmount);
        // console.log(withdrawingAmount);
        const tx = await stakingRewardsContract.withdraw(sa.toHexString());
        await tx.wait();
        updateInformation();
    };

    const getReward = async () => {
        const stakingRewardsContract = stakingRewards();
        const tx = await stakingRewardsContract.getReward();
        await tx.wait();
        updateInformation();
    };

    const stakingToken = () => {
        const stakingTokenContract = new ethers.Contract(
            StakingTokenAddress,
            StakingAbi,
            provider.getSigner()
        );
        return stakingTokenContract;
    };
    const rewardToken = () => {
        const rewardTokenContract = new ethers.Contract(
            RewardTokenAddress,
            RewardAbi,
            provider.getSigner()
        );
        return rewardTokenContract;
    };

    const stakingRewards = () => {
        const stakingRewards = new ethers.Contract(
            StakingRewardsAddress,
            StakingRewardsAbi,
            provider.getSigner()
        );
        return stakingRewards;
    };

    const getTotalStakedBalance = async () => {
        if (provider && account) {
            const stakingRewardsContract = stakingRewards();
            const totalBalance = await stakingRewardsContract._totalSupply();

            const balance = ethers.utils.formatUnits(totalBalance, 18);
            setTotalStakedBalance(Number(balance).toFixed(2));
        }
    };

    const getStakingTokenBalance = async () => {
        const stakingTokenContract = stakingToken();
        const rawBalance = await stakingTokenContract.balanceOf(account);

        const balance = ethers.utils.formatUnits(rawBalance, 18);
        setStakingTokenBalance(Number(balance).toFixed(2));
    };
    const getRewardTokenBalance = async () => {
        const rewardTokenContract = rewardToken();
        const rawBalance = await rewardTokenContract.balanceOf(account);

        const balance = ethers.utils.formatUnits(rawBalance, 18);
        setRewardTokenBalance(Number(balance).toFixed(2));
    };

    const getStakingTokenAllowAnce = async () => {
        const stakingTokenContract = stakingToken();
        const rawBalance = await stakingTokenContract.allowance(
            account,
            StakingRewardsAddress
        );

        const balance = ethers.utils.formatUnits(rawBalance, 18);
        setAllowance(Number(balance).toFixed(2));
    };

    const getStakedAmount = async () => {
        if (provider && account) {
            const stakingRewardsContract = stakingRewards();
            const totalBalance = await stakingRewardsContract._balances(
                account
            );

            const balance = ethers.utils.formatUnits(totalBalance, 18);
            setStakedAmount(Number(balance).toFixed(2));
        }
    };

    const getClaimableAmount = async () => {
        if (provider && account) {
            const stakingRewardsContract = stakingRewards();
            const totalBalance = await stakingRewardsContract.earned(account);

            const balance = ethers.utils.formatUnits(totalBalance, 18);

            setClaimableAmount(Number(balance).toFixed(2));
        }
    };

    const connectButtonText = () => {
        if (account.length == 0) return "Connect";
        return `${account.slice(0, 5)}...${account.slice(35)}`;
    };

    const videoBackground = () => {
        return (
            <span
                style={{
                    width: "100vw",
                    height: "100vh",
                    position: "fixed",
                    zIndex: "-1",
                }}
            >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((item) => {
                    return <div key={item} className="firefly"></div>;
                })}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    // loop
                    className="w-full object-cover h-full absolute z-[1]"
                >
                    <source src="/splash2.mp4"></source>
                </video>
            </span>
        );
    };
    useEffect(() => {
        // videoRef.current.playbackRate = 0.5;
    }, []);
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <button className="w-64 ml-auto" onClick={connect}>
                    {connectButtonText()}
                </button>
                {videoBackground()}
                {account.length != 0 ? (
                    <div className="flex flex-row pt-8">
                        <div className="stake-panel">
                            <span>StakingToken: $ST{stakingTokenBalance}</span>
                            <span>RewardToken: $RT{rewardTokenBalance}</span>

                            {allowance > 0 && (
                                <>
                                    <input
                                        placeholder="Input Staking Amount"
                                        className="mt-auto mb-2 mx-3"
                                        value={stakingAmount}
                                        onChange={updateStakingAmount}
                                    ></input>
                                    <button
                                        className="bg-violet-600 mb-3 mx-3"
                                        onClick={stakeToken}
                                    >
                                        Stake
                                    </button>
                                    <input
                                        placeholder="Input Staking Amount"
                                        className="mt-5 mb-2 mx-3"
                                        value={withdrawingAmount}
                                        onChange={updateWithdrawingAmount}
                                    ></input>
                                    <button
                                        className="bg-red-600 mb-3 mx-3"
                                        onClick={withdrawStakedToken}
                                    >
                                        Withdraw
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="info-panel">
                            <span>Total Staked: $ST{totalStakedBalance}</span>
                            <span> $RT10 per every block</span>
                            {allowance == 0 && (
                                <button
                                    className="mt-auto mb-3 mx-3"
                                    onClick={allowStakingToken}
                                >
                                    Allow Staking Token
                                </button>
                            )}
                        </div>
                        <div className="reward-panel">
                            <span>Staked Balance: $ST{stakedAmount} </span>
                            <span>Claimable Reward: $RT{claimableAmount}</span>
                            {claimableAmount >= 0 && (
                                <button
                                    className="mt-auto mb-3 mx-3"
                                    onClick={getReward}
                                >
                                    Claim
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="mx-auto mt-10 text-3xl p-5 bg-violet-200 bg-opacity-20 rounded-sm text-center text-pink-700">
                        Connect Wallet
                        <br />
                        <br />
                        You need to have ETH on rinkeby testnet
                        <br />
                        <a href="https://faucets.chain.link/rinkeby">
                            https://faucets.chain.link/rinkeby
                        </a>
                    </span>
                )}
            </main>
        </div>
    );
}
