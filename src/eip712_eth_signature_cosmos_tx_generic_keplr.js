import './App.css'
import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
} from '@evmos/provider'
import {
  createTxRawEIP712,
  signatureToWeb3Extension,
  createMessageSend,
} from '@evmos/transactions'
import { EthSignType } from '@keplr-wallet/types';

import {
  generateFee,
  generateTypes,
  createMsgSend,
  generateMessage,
  createEIP712,
} from '@evmos/eip712'
import { createMsgSend as protoMsgSend, createTransaction,createTxRaw } from '@evmos/proto'
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
export async function signEip712EthSignatureCosmosTxGenericKeplr() {

  const chain = {
    chainId: 9999,
    cosmosChainId: 'carbon_9999-1',
}

    const sender = {
      // eth address in bech32
      accountAddress: 'tswth1estc6fdf79l8un64ccz74m27r6gmj2lenu9rd0',
      sequence: 3,
      accountNumber: 30,
      pubkey: 'Ax17kdpLE1tYqqphsUwBEDegtSoniAiHnoPorYnqSle/',
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

    console.log("message cosmos-sdk",msg)


    const eip712Payload = JSON.stringify(msg.eipToSign)
    const signature = await window?.keplr?.signEthereum(
      chain.cosmosChainId,
      sender.accountAddress,
      eip712Payload,
      EthSignType.EIP712,
    )

    console.log("signature cosmos-sdk: ",signature )

    const { signDirect } = msg
    const bodyBytes = signDirect.body.serializeBinary()
    const authInfoBytes = signDirect.authInfo.serializeBinary()
    
    const signedTx = createTxRaw(
      bodyBytes,
      authInfoBytes,
      [signature],
    )
    // Broadcast it
    const postOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: generatePostBodyBroadcast(signedTx),
    }

    let broadcastPost = await fetch(
      `http://localhost:1317${generateEndpointBroadcast()}`,
      postOptions,
    )
    let response = await broadcastPost.json()
  }