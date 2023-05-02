import './App.css'
import './utils'
import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
} from '@evmos/provider'
import {
  createTxRawEIP712,
  signatureToWeb3Extension,
  createMessageSend,
} from '@evmos/transactions'
import { EthSignType } from '@keplr-wallet/types'

import {
  generateFee,
  generateTypes,
  createMsgSend,
  generateMessage,
  createEIP712,
} from '@evmos/eip712'
import {
  createMsgSend as protoMsgSend,
  createTransaction,
  createTxRaw,
} from '@evmos/proto'
import { MsgMergeAccount } from './codec/tx'
import * as tx from '@evmos/proto/dist/proto/cosmos/tx/v1beta1/tx'
import * as google from '@evmos/proto/dist/proto/google/protobuf/any'
import {
  createFee,
  createSignerInfo,
  createAuthInfo,
  createSigDoc,
} from '@evmos/proto/dist/transaction/transaction'
import { Keccak } from 'sha3'
import { editableInputTypes } from '@testing-library/user-event/dist/utils'
import { hexToBytes } from './utils'
export async function signEip712EthSignatureCosmosTxGenericMetamask() {
  const chain = {
    chainId: 9999,
    cosmosChainId: 'carbon_9999-1',
  }

  // const sender = {
  //   // eth address in bech32
  //   accountAddress: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
  //   sequence: 2,
  //   accountNumber: 0,
  //   pubkey: 'A0oeH5XrtJvFmzwtYK+7TC+yt3zR8eIyISP9rKo9Evep',
  // }
  const sender = {
    // eth address in bech32
    accountAddress: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
    sequence: 4,
    accountNumber: 0,
    pubkey: 'A0oeH5XrtJvFmzwtYK+7TC+yt3zR8eIyISP9rKo9Evep',
  }


  const fee = {
    amount: '100000000',
    denom: 'swth',
    gas: '1000000',
  }

  const memo = ''

  const params = {
    destinationAddress: 'tswth1estc6fdf79l8un64ccz74m27r6gmj2lenu9rd0',
    amount: '100000000',
    denom: 'swth',
  }

  const msg = createMessageSend(chain, sender, fee, memo, params)

  console.log('message cosmos-sdk', msg)
  console.log('message EIP712: ', JSON.stringify(msg.eipToSign))
  msg.eipToSign.domain.chainId = '0x270f'

  // Request the signature
  let signature = await window.ethereum.request({
    method: 'eth_signTypedData_v4',
    params: [
      //hex representation of eth address
      '0x5161e15Fee8b918d4621703dB75641BbC25301c8',
      JSON.stringify(msg.eipToSign),
    ],
  })


  const signatureBz = new Uint8Array(Buffer.from(signature.slice(2), "hex"));

  console.log('signature cosmos-sdk hex: ', signature)
  console.log('signature cosmos-sdk: ', signatureBz)

  const { signDirect } = msg
  const bodyBytes = signDirect.body.serializeBinary()
  const authInfoBytes = signDirect.authInfo.serializeBinary()

  const signedTx = createTxRaw(bodyBytes, authInfoBytes, [signatureBz])
  // Broadcast it
  const postOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: generatePostBodyBroadcast(signedTx,'BROADCAST_MODE_BLOCK'),
  }

  let broadcastPost = await fetch(
    `http://localhost:1317${generateEndpointBroadcast()}`,
    postOptions,
  )
  let response = await broadcastPost.json()
}
