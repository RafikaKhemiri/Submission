const {
    PrivateKey,
    TokenUpdateTransaction,
    TokenType,
    TokenSupplyType,
    CustomRoyaltyFee,
    TokenInfoQuery
} = require("@hashgraph/sdk");


async function UpdateToken(tokenId, myPrivateKey, client) {
    try {
        const tokenUpdateTx = await new TokenUpdateTransaction()
            .setTokenId(tokenId)
            .setTokenMemo("this is the updated memo")
            .freezeWith(client);

        const tokenUpdateTxSigned = await tokenUpdateTx.sign(PrivateKey.fromString(myPrivateKey));

        const tokenUpdateTxResponse = await tokenUpdateTxSigned.execute(client);

        const tokenUpdateTxReceipt = await tokenUpdateTxResponse.getReceipt(client);

        console.log("Token memo updated successfully:", tokenUpdateTxReceipt);

        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);

        return console.log("this is the updated memooooo ! " + tokenInfo.tokenMemo);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports = UpdateToken;
