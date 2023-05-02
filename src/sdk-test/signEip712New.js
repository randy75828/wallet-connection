import { CarbonSDK, KeplrAccount } from 'carbon-js-sdk'
import {
  CreateOracleProposal,
  MsgUpdateRewardScheme,
  MsgWithdrawFromGroup,
  UpdateRewardSchemeParams,
  registry,
} from 'carbon-js-sdk/lib/codec'
import { MsgGrant } from 'carbon-js-sdk/lib/codec/cosmos/authz/v1beta1/tx'
import utiliseMetamask from './utiliseMetamask'
import converter from 'bech32-converting'
import { CreateTokenParams } from 'carbon-js-sdk/lib/codec'
import BigNumber from 'bignumber.js'
import { ProposalTypes } from 'carbon-js-sdk/lib/util/gov'
import dayjs from 'dayjs'
import Long from 'long'
import { OrderModule } from 'carbon-js-sdk/lib'
import { MsgSend } from 'carbon-js-sdk/lib/codec/cosmos/bank/v1beta1/tx'
import { MsgSubmitProposal } from 'carbon-js-sdk/lib/codec/cosmos/gov/v1beta1/tx'

export async function signEip712New() {
  const { metamask } = utiliseMetamask('localhost')
  const connectedSdk = await CarbonSDK.instanceWithMetamask(metamask, {
    network: 'localhost',
  })
  const evmBech32Address = connectedSdk.wallet.evmBech32Address
  const bech32Address = connectedSdk.wallet.bech32Address
  const evmHexAddress = connectedSdk.wallet.evmHexAddress
  const publicKey = connectedSdk.wallet.publicKey.toString('hex')
  console.log('carbonSDK1: ', connectedSdk)

  // // 1. Merge Account (Self-Merge)

  const result = await connectedSdk.evmmerge.mergeAccount({
    creator: evmBech32Address,
    pubKey: publicKey,
  })
  console.log('result: ', result)

  // // 1b. Sign Public key (For ppl to help u merge later)
  // const pubKeySig = await metamask.signPublicKeyMergeAccount(
  //   publicKey,
  //   evmHexAddress,
  // )
  // console.log('pubKeySig: ', pubKeySig)

  // // 2. Merge Account (Proxy merge, Help Val2 merge account)
  // // Assuming that u got its pubKeySig and pubKey already
  // const publicKeyVal2 =
  //   '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17'
  // // val2 address
  // const pubKeySigVal2 =
  //   '20ecf73f280914a8b518fcfbe83daae882ada6159ef70fd99a4857131f68ab561cc3960ff674f02251482f455352c0b4ee35483e4b215c7b07ea9902ab3aef3e1b'
  // const result = await connectedSdk.evmmerge.mergeAccount({
  //   creator: evmBech32Address,
  //   pubKey: publicKeyVal2,
  //   pubKeySig: pubKeySigVal2,
  // })
  // console.log("result: ",result)
  // console.log('carbonSDK2: ', connectedSdk)

  // //3. Submitting a gov proposal (to test `Any` Type)
  // const result = await connectedSdk.gov.submit({
  //   content: {
  //     typeUrl: '/Switcheo.carbon.oracle.CreateOracleProposal',
  //     value: {
  //       title: 'proposal title',
  //       description: 'proposal desc',
  //       msg: {
  //         id: 'DXBT4',
  //         description: 'Demex XBT Index',
  //         minTurnoutPercentage: 67,
  //         maxResultAge: 100,
  //         securityType: 'SecuredByValidators',
  //         resultStrategy: 'median',
  //         resolution: 1,
  //         spec: '{}',
  //       },
  //     },
  //   },
  //   initialDeposit: [{
  //     denom: 'swth',
  //     amount: '2131231',
  //   }],
  //   proposer: connectedSdk.wallet.bech32Address,
  // })
  // console.log(result)

  //  //3b. Submitting a cosmos gov proposal (to test `Any` Type)
  //  const result = await connectedSdk.gov.submit({
  //   content: {
  //     typeUrl: '/cosmos.gov.v1beta1.TextProposal',
  //     value: {
  //       title: 'textproposal title',
  //       description: 'textproposal desc',
  //     },
  //   },
  //   initialDeposit: [{
  //     denom: 'swth',
  //     amount: '2131231',
  //   }],
  //   proposer: connectedSdk.wallet.bech32Address,
  // })
  // console.log('result: ',result)

  // //4. Send funds (generic tx)
  // const result = await connectedSdk.bank.sendTokens({
  //   fromAddress: bech32Address,
  //   toAddress: 'tswth1mw90en8tcqnvdjhp64qmyhuq4qasvhy2s6st4t',
  //   amount: [
  //     {
  //       amount: '133500000000',
  //       denom: 'swth',
  //     },
  //   ],
  // })
  // console.log(result)

  // //5. CreateRewardScheme
  // const nowDate = dayjs().add(10000000, 'm'); // add delay of 10 seconds to startTime so that ErrRewardSchemeDurationInvalidType error is not thrown
  // const endDate = nowDate.add(2, "w");

  // const response = await connectedSdk.cdp.createRewardScheme({
  //   rewardDenom: "swth",
  //   assetDenom: "cibt/usdc",
  //   rewardType: "lend",
  //   rewardAmountPerSecond: new BigNumber(0.1).shiftedBy(8),
  //   startTime: nowDate.toDate(),
  //   endTime: endDate.toDate(),
  // });
  // console.log("response", response);

  // //6. UpdateRewardScheme
  // const nowDate = dayjs().add(20, 'm');
  // const endDate = nowDate.add(3, "w");
  // const response = await connectedSdk.cdp.updateRewardScheme({
  //   rewardSchemeId: new Long(1),
  //   rewardDenom: 'eth',
  //   // assetDenom: 'usdc',
  //   // rewardType: 'borrow',
  //   rewardAmountPerSecond: new BigNumber(0.01).shiftedBy(8),
  //   startTime: nowDate.toDate(),
  //   endTime: endDate.toDate(),
  // })
  // console.log('response', response)

  // //7. liquidateCollateralWithCollateral
  // const response = await connectedSdk.cdp.liquidateCollateralWithCollateral({
  //   debtor: 'tswth1mw90en8tcqnvdjhp64qmyhuq4qasvhy2s6st4t',
  //   collateralDenom: 'swth',
  //   minCollateralAmount: new BigNumber(0.01).shiftedBy(8),
  //   debtDenom: 'swth',
  //   debtAmount: new BigNumber(0.01).shiftedBy(8),
  //   debtCollateralDenom: 'swth',
  //   debtCollateralAmount: new BigNumber(0.01).shiftedBy(8),
  // })
  // console.log('response', response)

  // //8. Create market
  // const base = 'eth'
  // const quote = 'iusd'
  // const baseUSD = connectedSdk.token.getUSDValue(base) ?? new BigNumber(0)
  // const quoteUSD = connectedSdk.token.getUSDValue(quote) ?? new BigNumber(0)

  // const result = await connectedSdk.admin.createMarket({
  //   marketType: 'futures',
  //   base,
  //   quote,
  //   currentBasePriceUsd: baseUSD,
  //   currentQuotePriceUsd: quoteUSD,
  //   indexOracleId: 'DETH',
  //   expiryTime: new Date('2022-04-22 16:00:00'),
  // })
  // console.log(result)

  // // 9. CreateOrder
  // // Need to remove the validate basic for MsgCreateOrderFirst
  // // create an order using generic
  // // CarbonWallet.sendTx, no type checking
  // // on inputs
  // const genericTxValue = {
  //   creator: connectedSdk.wallet.bech32Address,
  //   isPostOnly: true,
  //   isReduceOnly: true,
  //   market: "usdc_dai",
  //   orderType: 'limit',
  //   price: '1',
  //   quantity: '100',
  //   side: 'buy',
  //   stopPrice: '1',
  //   timeInForce: 'gtc',
  //   triggerType: 'dasdas',
  //   referralAddress: 'sadas',
  //   referralCommission: 2131,
  //   referralKickback: 1,
  // }
  // const result = await connectedSdk.order.create({
  //   market: 'usdc_dai',
  //   orderType: OrderModule.OrderType.Limit,
  //   price: new BigNumber(100),
  //   quantity: new BigNumber(100),
  //   stopPrice: new BigNumber(1),
  //   side: OrderModule.OrderSide.Buy,
  // })
  // console.log('call generic tx', result)

  // //10. Withdraw from group
  // const result = await connectedSdk.wallet.sendTxs([
  //   {
  //     typeUrl: '/Switcheo.carbon.coin.MsgWithdrawFromGroup',
  //     value: MsgWithdrawFromGroup.fromPartial({
  //       creator: connectedSdk.wallet.bech32Address,
  //       sourceCoin: {
  //         denom: 'usdc',
  //         amount: '10000',
  //       },
  //     }),
  //   },
  // ])

  // console.log(result)

  //11. MsgGrant, not working for now as amino is not registered
  // const result = await connectedSdk.wallet.sendTxs([
  //   {
  //     typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
  //     value: MsgGrant.fromPartial({
  //       grant: {
  //         authorization: {
  //           type: 'cosmos-sdk/GenericAuthorization',
  //           value: {
  //             msg: '/Switcheo.carbon.cdp.MsgBorrowAsset',
  //           },
  //         },
  //         expiration: new Date('2022-04-29 16:00:00'),
  //       },
  //       grantee: 'tswth1eaaqa8rmxn6z9uukwkkwltrt7u92hsslyq4dkg',
  //       granter: connectedSdk.wallet.bech32Address,
  //     }),
  //   },
  // ])
  // console.log(result)

  // //12. Add liquidity
  // const result = await connectedSdk.lp.addLiquidity({
  //   poolId: 1,
  //   amountA: new BigNumber(100), // human
  //   amountB: new BigNumber(100), // human
  //   minShares: new BigNumber(10),
  // })
  // console.log(result)

  // // //13. MsgSetRewardsWeights
  // const result = await connectedSdk.admin.setRewardsWeights([
  //   {
  //     poolId: 1,
  //     weight: 3,
  //   },
  //   {
  //     poolId: 2,
  //     weight: 5,
  //   },
  //   {
  //     poolId: 3,
  //     weight: 8,
  //   },
  // ])
  // console.log(result)

  // // // 14. IBCWithdrawal
  // const withdrawResponse = await connectedSdk.ibc.sendIBCTransfer({
  //   sourcePort: 'transfer',
  //   sourceChannel: 'channel-0', // channel of receiving blockchain
  //   denom: 'swth',
  //   amount: new BigNumber(50).shiftedBy(8),
  //   sender: connectedSdk.wallet.bech32Address, // address to send from
  //   receiver: 'tswth1l2yvtmk5ee09c75hn466r2m8vmjf9uq70nuspu', // address to send to
  // })
  // console.log(withdrawResponse)

  //Mulitple Messages Testing

  // //15. Mulitple MsgSend (Same struct) (pass for both legacy and new)
  // const result = await connectedSdk.wallet.sendTxs([
  //   {
  //     typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  //     value: MsgSend.fromPartial({
  //       fromAddress: connectedSdk.wallet.bech32Address,
  //       toAddress:'tswth1lp5tsyq623gxd0q496v5u8jrvpfgu2lcj8tj9k',
  //       amount: [{
  //         denom: 'swth',
  //         amount: '100000000',
  //       }],
  //     }),
  //   },
  //   {
  //     typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  //     value: MsgSend.fromPartial({
  //       fromAddress: connectedSdk.wallet.bech32Address,
  //       toAddress:'tswth1lp5tsyq623gxd0q496v5u8jrvpfgu2lcj8tj9k',
  //       amount: [{
  //         denom: 'swth',
  //         amount: '100000000',
  //       }],
  //     }),
  //   }, {
  //     typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  //     value: MsgSend.fromPartial({
  //       fromAddress: connectedSdk.wallet.bech32Address,
  //       toAddress:'tswth1lp5tsyq623gxd0q496v5u8jrvpfgu2lcj8tj9k',
  //       amount: [{
  //         denom: 'swth',
  //         amount: '100000000',
  //       }],
  //     }),
  //   },
  // ])

  // console.log(result)

  //16. Mulitple MsgUpdateRewardScheme (Diff struct, struct with fewer fields 2nd and 3rd msg) -->
  // fail for legacy (cant even sign), pass for new
  // const nowDate = dayjs().add(20, 'm')
  // const endDate = nowDate.add(3, 'w')
  // const result = await connectedSdk.wallet.sendTxs([
  //   {
  //     typeUrl: '/Switcheo.carbon.cdp.MsgUpdateRewardScheme',
  //     value: MsgUpdateRewardScheme.fromPartial({
  //       updator: connectedSdk.wallet.bech32Address,
  //       updateRewardSchemeParams: {
  //         rewardSchemeId: new Long(1),
  //         rewardDenom: 'eth',
  //         // assetDenom: 'usdc',
  //         // rewardType: 'borrow',
  //         rewardAmountPerSecond: new BigNumber(1).shiftedBy(8).toString(10),
  //         startTime: nowDate.toDate(),
  //         endTime: endDate.toDate(),
  //       },
  //     }),
  //   },
  //   {
  //     typeUrl: '/Switcheo.carbon.cdp.MsgUpdateRewardScheme',
  //     value: MsgUpdateRewardScheme.fromPartial({
  //       updator: connectedSdk.wallet.bech32Address,
  //       updateRewardSchemeParams: {
  //         rewardSchemeId: new Long(1),
  //         rewardDenom: 'eth',
  //         assetDenom: 'usdc',
  //         rewardType: 'borrow',
  //         rewardAmountPerSecond: new BigNumber(1).shiftedBy(8).toString(10),
  //         startTime: nowDate.toDate(),
  //         endTime: endDate.toDate(),
  //       },
  //     }),
  //   },
  //   {
  //     typeUrl: '/Switcheo.carbon.cdp.MsgUpdateRewardScheme',
  //     value: MsgUpdateRewardScheme.fromPartial({
  //       updator: connectedSdk.wallet.bech32Address,
  //       updateRewardSchemeParams: {
  //         rewardSchemeId: new Long(1),
  //         rewardDenom: 'eth',
  //         assetDenom: 'eth',
  //         rewardType: 'lend',
  //         rewardAmountPerSecond: new BigNumber(1).shiftedBy(8).toString(10),
  //         // startTime: nowDate.toDate(),
  //         endTime: endDate.toDate(),
  //       },
  //     }),
  //   },
  // ])

  // console.log(result)

  // //17. Mulitple MsgType (MsgUpdateRewardScheme) -->
  // // fail for legacy (cant even sign), pass for new
  // // may have issue if milliseconds is used for the date
  // // "start_time":"2024-04-20T10:10:36.120Z" will be parsed as "start_time":"2024-04-20T10:10:36.12Z" in carbon

  // const nowDate = dayjs().year(2024).millisecond(12)
  // const endDate = dayjs().year(2025).millisecond(12)
  // // const nowDate = dayjs().year(2024).millisecond(120)
  // // const endDate = dayjs().year(2025).millisecond(120)
  // const result = await connectedSdk.wallet.sendTxs([
  //   {
  //     typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
  //     value: MsgSubmitProposal.fromPartial({
  //       proposer: connectedSdk.wallet.bech32Address,
  //       initialDeposit: [
  //         {
  //           denom: 'swth',
  //           amount: '2131231',
  //         },
  //       ],
  //       content: registry.encodeAsAny({
  //         typeUrl: '/Switcheo.carbon.oracle.CreateOracleProposal',
  //         value: CreateOracleProposal.fromPartial({
  //           title: 'proposal title',
  //           description: 'proposal desc',
  //           msg: {
  //             id: 'DXBT4',
  //             description: 'Demex XBT Index',
  //             minTurnoutPercentage: 67,
  //             maxResultAge: 100,
  //             securityType: 'SecuredByValidators',
  //             resultStrategy: 'median',
  //             resolution: 1,
  //             spec: '{}',
  //           },
  //         }),
  //       }),
  //     }),
  //   },
  //   {
  //     typeUrl: '/Switcheo.carbon.cdp.MsgUpdateRewardScheme',
  //     value: MsgUpdateRewardScheme.fromPartial({
  //       updator: connectedSdk.wallet.bech32Address,
  //       updateRewardSchemeParams: {
  //         rewardSchemeId: new Long(1),
  //         rewardDenom: 'eth',
  //         // assetDenom: 'usdc',
  //         rewardType: 'borrow',
  //         rewardAmountPerSecond: new BigNumber(1).shiftedBy(8).toString(10),
  //         startTime: nowDate.toDate(),
  //         endTime: endDate.toDate(),
  //       },
  //     }),
  //   },
  //   {
  //     typeUrl: '/Switcheo.carbon.cdp.MsgUpdateRewardScheme',
  //     value: MsgUpdateRewardScheme.fromPartial({
  //       updator: connectedSdk.wallet.bech32Address,
  //       updateRewardSchemeParams: {
  //         rewardSchemeId: new Long(1),
  //         rewardDenom: 'eth',
  //         assetDenom: 'eth',
  //         rewardType: 'lend',
  //         rewardAmountPerSecond: new BigNumber(1).shiftedBy(8).toString(10),
  //         startTime: nowDate.toDate(),
  //         endTime: endDate.toDate(),
  //       },
  //     }),
  //   },
  // ])

  // console.log(result)





  // //Keplr sign public key

  // const keplr = window.keplr
  // console.log('keplr: ', keplr)
  // const connectedSdk = await CarbonSDK.instanceWithKeplr(keplr, {
  //   network: 'localhost',
  // })

  // //Keplr sign public key
  // const publicKey = connectedSdk.wallet.publicKey.toString('hex')
  // const address = connectedSdk.wallet.bech32Address
  // const chainId = connectedSdk.wallet.getChainId()
  // console.log(
  //   'response:',
  //   await KeplrAccount.signPublicKeyMergeAccount(
  //     publicKey,
  //     address,
  //     chainId,
  //     keplr,
  //   ),
  // )
}
