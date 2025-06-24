const {
    PrivateKey,
    TokenMintTransaction,
    Hbar
} = require("@hashgraph/sdk");


async function MintToken(tokenId, supplyKey, client) {
    try {
        // Max transaction fee as a constant
        const maxTransactionFee = new Hbar(1);

         const CID = [
            "ipfs://bafyreiao6ajgsfji6qsgbqwdtjdu5gmul7tv2v3pd6kjgcw5o65b2ogst4/metadata.json",
            "ipfs://bafyreic463uarchq4mlufp7pvfkfut7zeqsqmn3b2x3jjxwcjqx6b5pk7q/metadata.json",
            "ipfs://bafyreihhja55q6h2rijscl3gra7a3ntiroyglz45z5wlyxdzs6kjh2dinu/metadata.json",
            "ipfs://bafyreidb23oehkttjbff3gdi4vz7mjijcxjyxadwg32pngod4huozcwphu/metadata.json",
            "ipfs://bafyreie7ftl6erd5etz5gscfwfiwjmht3b52cevdrf7hjwxx5ddns7zneu/metadata.json"
        ];

        // Convert CID strings to Uint8Array objects
        const metadataBytesArray = CID.map(str => Uint8Array.from(Buffer.from(str)));

        // MINT NEW BATCH OF NFTs
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata(metadataBytesArray) //Batch minting - UP TO 10 NFTs in single tx
            .setMaxTransactionFee(maxTransactionFee)
            .freezeWith(client);

        //Sign the transaction with the supply key
        const mintTxSign = await mintTx.sign(PrivateKey.fromString(supplyKey.toString()));

        //Submit the transaction to a Hedera network
        const mintTxSubmit = await mintTxSign.execute(client);

        //Get the transaction receipt
        const mintRx = await mintTxSubmit.getReceipt(client);

        //Log the serial number
        return console.log(`- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low}`);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports = MintToken;
