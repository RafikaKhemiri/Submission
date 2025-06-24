const {
    PrivateKey,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    CustomRoyaltyFee,
    TokenInfoQuery
} = require("@hashgraph/sdk");


async function CreateToken(myAccountId, myPrivateKey, client, supplyKey, feeScheduleKey) {
    try {
        const nftCreate = await new TokenCreateTransaction()
            .setTokenName("first diploma")
            .setTokenSymbol("FIRST GRAD")
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(myAccountId)
            .setTokenMemo("this is my first token memo")
            .setAdminKey(PrivateKey.fromString(myPrivateKey))
            .setFeeScheduleKey(feeScheduleKey)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(250)
            .setSupplyKey(supplyKey)
            .setCustomFees([
                new CustomRoyaltyFee()
                    .setNumerator(5)
                    .setDenominator(100)
                    .setFeeCollectorAccountId(myAccountId)

            ])
            .freezeWith(client);

        //Sign the transaction with the treasury key
        const nftCreateTxSign = await nftCreate.sign(PrivateKey.fromString(myPrivateKey));

        //Submit the transaction to a Hedera network
        const nftCreateSubmit = await nftCreateTxSign.execute(client);

        //Get the transaction receipt
        const nftCreateRx = await nftCreateSubmit.getReceipt(client);

        //Get the token ID
        const tokenId = nftCreateRx.tokenId;

        //Log the token ID
        console.log(`- Created NFT with Token ID: ${tokenId} \n`);

        console.log("NFT collection created successfully.");
        // Retrieve and display the newly created NFT information
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);

        console.log("Newly Created NFT Information:");
        return tokenInfo;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports = CreateToken;
