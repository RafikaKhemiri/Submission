const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar, 
    TokenAssociateTransaction,
    AccountBalanceQuery,
    TransferTransaction
} = require("@hashgraph/sdk");

require("dotenv").config();
const CreateToken = require("./CreateNFT");
const UpdateToken = require("./UpdateNFT");
const MintToken = require("./MintNFT");

async function environmentSetup() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error(
            "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
        );
    }

    //Create your Hedera Testnet client
    const client = Client.forTestnet();

    //Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);

    //Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100));

    //Set the maximum payment for queries (in Hbar)
    client.setMaxQueryPayment(new Hbar(50));

    //Create first account
    const firstAccountPrivateKey = PrivateKey.generateED25519();
    const firstAccountPublicKey = firstAccountPrivateKey.publicKey;

    const firstAccount = await new AccountCreateTransaction()
        .setKey(firstAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const getReceipt = await firstAccount.getReceipt(client);
    const firstAccountId = getReceipt.accountId;

    console.log("The first account ID is: " + firstAccountId);

    //Create second account
    const secondAccountPrivateKey = PrivateKey.generateED25519();
    const secondAccountPublicKey = secondAccountPrivateKey.publicKey;

    const secondAccount = await new AccountCreateTransaction()
        .setKey(secondAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);


    const getSecondReceipt = await secondAccount.getReceipt(client);
    const secondAccountId = getSecondReceipt.accountId;

    console.log("The second account ID is: " + secondAccountId);

    // Create first NFT
    const firstSupplyKey = PrivateKey.generate();
    const firstFeeScheduleKey = PrivateKey.generate(); 

    const firstTokenInfo = await CreateToken(myAccountId, myPrivateKey, client, firstSupplyKey, firstFeeScheduleKey) 
     const firstTokenId = firstTokenInfo.tokenId;

    // Create second NFT  
    // const secondSupplyKey = PrivateKey.generate();
    // const secondFeeScheduleKey = PrivateKey.generate(); 

    // const secondTokenInfo = await CreateToken(myAccountId, myPrivateKey, client, secondSupplyKey, secondFeeScheduleKey) 
    // const secondTokenId = secondTokenInfo.tokenId;

    //     await UpdateToken(secondTokenId, myPrivateKey, client) 
    // await MintToken(secondTokenId, secondSupplyKey, client) 
    
    //Create the associate transaction and sign with Alice's key 
const associateAliceTx = await new TokenAssociateTransaction()
	.setAccountId(firstAccountId)
	.setTokenIds([firstTokenId])
	.freezeWith(client)
	.sign(firstAccountPrivateKey);

//Submit the transaction to a Hedera network
const associateAliceTxSubmit = await associateAliceTx.execute(client);

//Get the transaction receipt
const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

//Confirm the transaction was successful
    console.log(`- NFT association with Alice's account: ${associateAliceRx.status}\n`);
    

    // Check the balance before the transfer for the treasury account
var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(firstTokenId.toString())} NFTs of ID ${firstTokenId}`);

// Check the balance before the transfer for Alice's account
var balanceCheckTx = await new AccountBalanceQuery().setAccountId(firstAccountId).execute(client);
console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(firstTokenId.toString())} NFTs of ID ${firstTokenId}`);

// Transfer the NFT from treasury to Alice
// Sign with the treasury key to authorize the transfer
const tokenTransferTx = await new TransferTransaction()
	.addNftTransfer(firstTokenId, 1, myAccountId, firstAccountId)
	.freezeWith(client)
	.sign(PrivateKey.fromString(myPrivateKey));

const tokenTransferSubmit = await tokenTransferTx.execute(client);
const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

console.log(`\n- NFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`);

// Check the balance of the treasury account after the transfer
var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(firstTokenId.toString())} NFTs of ID ${firstTokenId}`);

// Check the balance of Alice's account after the transfer
var balanceCheckTx = await new AccountBalanceQuery().setAccountId(firstAccountId).execute(client);
console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(firstTokenId.toString())} NFTs of ID ${firstTokenId}`);


}
environmentSetup();
