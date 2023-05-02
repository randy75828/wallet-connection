import { CarbonSDK } from 'carbon-js-sdk'
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
import { BigNumber } from 'ethers'
import { ProposalTypes } from 'carbon-js-sdk/lib/util/gov'
import dayjs from 'dayjs'
import Long from 'long'
import { OrderModule } from 'carbon-js-sdk/lib'
import { MsgSend } from 'carbon-js-sdk/lib/codec/cosmos/bank/v1beta1/tx'
import { MsgSubmitProposal } from 'carbon-js-sdk/lib/codec/cosmos/gov/v1beta1/tx'

export async function signEvmTransaction() {
  // const { metamask } = utiliseMetamask('localhost')
  // const connectedSdk = await CarbonSDK.instanceWithMetamask(metamask, {
  //   network: 'localhost',
  // })
  const keplr = window.keplr
  console.log('keplr: ', keplr)
  const connectedSdk = await CarbonSDK.instanceWithKeplr(keplr, {
    network: 'localhost',
  })
  console.log('connectedSdk: ', connectedSdk)

  const senderEvmAddress = connectedSdk.wallet.evmHexAddress
  const val2EvmAddress = '0xb2bA60f851CDE9eA35bfDA31B449C7c20893B9f6'
  const evmChainId = connectedSdk.wallet.getEvmChainId()
  // Define Ethereum Tx
  let ethSendTx = {
    from: senderEvmAddress,
    chainId: 9999,
    to: val2EvmAddress,
    // use BigNumber from ethers
    // value: BigNumber.from("1000000000000000000"), // 1eth
    value: '0x1234444444444444',
    // data: '0xc47f002700000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006796f796f796f0000000000000000000000000000000000000000000000000000',
    accessList: [],
    type: 2,
  }
  const response = await connectedSdk.wallet.signer.sendEvmTransaction(
    connectedSdk,
    ethSendTx,
  )
  console.log('res: ', await response.wait())
}
