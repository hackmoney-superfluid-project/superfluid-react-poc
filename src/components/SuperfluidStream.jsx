import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
    Button,
    Form,
    FormGroup,
    FormControl,
    Spinner,
    Card,
} from "react-bootstrap";
import createNewFlow from './../superfluidFunctions/createStream';
import updateExistingFlow from './../superfluidFunctions/updateStream';
import deleteFlow from './../superfluidFunctions/deleteStream';
import "./../SuperfluidStream.css";
import abi from './../utils/SuperApp.json';

const contractABI = abi.abi; // update this if using new contract
const contractAddress = '0xB8879D32532FEc39df52D24d131B014bD9aFdd1c'; // update this if using new contract
const DAIxAddress = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';

const SuperfluidStream = () => {
    const [recipient, setRecipient] = useState("");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [flowRate, setFlowRate] = useState("");
    const [flowRateDisplay, setFlowRateDisplay] = useState("");
    const [currentAccount, setCurrentAccount] = useState("");

    const connectWallet = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            alert("Ensure you have a MetaMask");
        }

        try {
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log("Error connecting to wallet: ", error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            alert("Ensure you have a MetaMask");
        }
        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });
        const chain = await ethereum.request({ method: "eth_chainId" });
        console.log("chain ID:", chain);

        console.log(accounts[0]);
        console.log('0x888D08001F91D0eEc2f16364779697462A9A713D');

        if (accounts.length > 0) {
            console.log("Found an authorized account: ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } else {
            console.log("No authorized account found");
        }
    };

    const unwrapDAIx = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert('Get metamask');
            }

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            // IMPORTANT: If using your own contract, make sure to update the contract address and abi 
            const superApp = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );
    
            const unwrapTxn = await superApp.unwrap(DAIxAddress);
            console.log('Unwrapping DAIx');
            await unwrapTxn.wait();
            console.log('Transaction complete');

        } catch (error) {
            console.log('Error unwrapping DAIx', error);
        }

    }

    useEffect(() => {
        checkIfWalletIsConnected();
    });

    function calculateFlowRate(amount) {
        if (
            typeof Number(amount) !== "number" ||
            isNaN(Number(amount)) === true
        ) {
            alert("You can only calculate a flowRate based on a number");
            return;
        } else if (typeof Number(amount) === "number") {
            if (Number(amount) === 0) {
                return 0;
            }
            const amountInWei = ethers.BigNumber.from(amount);
            const monthlyAmount = ethers.utils.formatEther(
                amountInWei.toString()
            );
            const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
            return calculatedFlowRate;
        }
    }

    function CreateButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    function UpdateButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    function DeleteButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    const handleRecipientChange = (event) => {
        setRecipient(() => ([event.target.name] = event.target.value));
    };

    const handleFlowRateChange = (event) => {
        setFlowRate(() => ([event.target.name] = event.target.value));
        let newFlowRateDisplay = calculateFlowRate(event.target.value);
        setFlowRateDisplay(newFlowRateDisplay.toString());
    };

    return (
        <div>
            {currentAccount === "" ? (
                <button
                    id="connectWallet"
                    className="button"
                    onClick={connectWallet}
                >
                    Connect Wallet
                </button>
            ) : (
                <Card className="connectedWallet">
                    {`${currentAccount.substring(
                        0,
                        4
                    )}...${currentAccount.substring(38)}`}
                </Card>
            )}

            <button
                className="button"
                onClick={unwrapDAIx}
            >
                unwrapDAIx
            </button>

            <h2>Create a flow</h2>
            <p>
                Create a new stream by entering the recipients address and a
                flow rate
            </p>
            <p>
                Go to the SuperfluidStream.jsx component and look at the{" "}
                <b>createNewFlow() </b>
                function to see under the hood
            </p>
            <Form>
                <FormGroup className="mb-3">
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter recipient address"
                    ></FormControl>
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormControl
                        name="flowRate"
                        value={flowRate}
                        onChange={handleFlowRateChange}
                        placeholder="Enter a flowRate in wei/second"
                    ></FormControl>
                </FormGroup>
                <CreateButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        createNewFlow(recipient, flowRate);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                    Click to Create Your Stream
                </CreateButton>
            </Form>

            <h2>Update a Flow</h2>
            <p>
                Adjust an existing flow by entering the ethereum address the
                funds are getting streamed to, and an updated flow rate
            </p>
            <p>
                Go to the SuperfluidStream.jsx component and look at the{" "}
                <b>updateExistingFlow() </b>
                function to see under the hood
            </p>
            <Form>
                <FormGroup className="mb-3">
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter your Ethereum address"
                    ></FormControl>
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormControl
                        name="flowRate"
                        value={flowRate}
                        onChange={handleFlowRateChange}
                        placeholder="Enter a flowRate in wei/second"
                    ></FormControl>
                </FormGroup>
                <UpdateButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        updateExistingFlow(recipient, flowRate);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                    Click to Update Your Stream
                </UpdateButton>
            </Form>

            <h2>Delete a Flow</h2>
            <p>
                Delete an existing flow by entering the ethereum address the funds are getting streamed to
            </p>
            <p>
                Go to the SuperfluidStream.jsx component and look at the{" "}
                <b>deleteFlow() </b>
                function to see under the hood
            </p>
            <Form>
                <FormGroup className="mb-3">
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter your Ethereum address"
                    ></FormControl>
                </FormGroup>
                <DeleteButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        deleteFlow(recipient);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                    Click to Delete Your Stream
                </DeleteButton>
            </Form>

            <div className="description">
                <div className="calculation">
                    <p>Your flow will be equal to:</p>
                    <p>
                        <b>{flowRateDisplay !== " " ? flowRateDisplay : 0}</b>{" "}
                        DAIx/month
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperfluidStream;
