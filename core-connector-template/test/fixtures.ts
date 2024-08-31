
export const sdkInitiateTransferResponseDto = (
    payeeFspCommissionAmount: string | undefined,
    payeeFspFeeAmount: string | undefined,
) => ({
    quoteResponse: {
        body: {
            payeeFspCommission: {
                amount: payeeFspCommissionAmount,
            },
            payeeFspFee: {
                amount: payeeFspFeeAmount,
            },
        },
    },
});
