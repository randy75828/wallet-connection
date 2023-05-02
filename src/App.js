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

import {
  generateFee,
  generateTypes,
  createMsgSend,
  generateMessage,
  createEIP712,
} from '@evmos/eip712'
import { createMsgSend as protoMsgSend, createTransaction } from '@evmos/proto'
import { MsgMergeAccount } from './codec/tx'
import * as tx from '@evmos/proto/dist/proto/cosmos/tx/v1beta1/tx'
import * as coin from '@evmos/proto/dist/proto/cosmos/base/v1beta1/coin'
import * as google from '@evmos/proto/dist/proto/google/protobuf/any'
import {
  createFee,
  createSignerInfo,
  createAuthInfo,
  createSigDoc,
} from '@evmos/proto/dist/transaction/transaction'
import { Keccak } from 'sha3'
import { editableInputTypes } from '@testing-library/user-event/dist/utils'
import { eip712Default } from './eip712Default'
import { signAndBroadcastEthereumTx } from './keplrSign'
import { signArbitrary } from './pubKeySignatureKeplr'
import { getPubKeySignature } from './pubKeySignature'
import { signEip712EthSignatureCosmosTxGenericKeplr } from './eip712_eth_signature_cosmos_tx_generic_keplr'
import {signEip712EthSignatureCosmosTxMergeMetamask} from './eip712_eth_signature_cosmos_tx_merge_metamask'
import { signEip712EthSignatureCosmosTxGenericMetamask } from './eip712_eth_signature_cosmos_tx_generic_metamask'
import { signEip712New } from './sdk-test/signEip712New'
import { signEvmTransaction } from './sdk-test/signEvmTransaction'
window.Buffer = window.Buffer || require('buffer').Buffer
const LEGACY_AMINO = 127
const SIGN_DIRECT = 1

function App() {
  async function connectWallet() {
    const accounts = await window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .catch((err) => {
        console.log(err)
      })
    console.log('accounts:', accounts)

    // gets uncompressed public key, need to compress it to be usable for msg merged account
    // eth address are gotten from compressed public key
    // const publicKey = await window.ethereum.request({
    //   method: 'eth_getEncryptionPublicKey',
    //   params: [accounts[0]],
    // })
    // console.log('publicKey:', publicKey)
  }

  async function checkBalance() {
    console.log(window)
    const balance = await window.ethereum
      .request({
        method: 'eth_getBalance',
        params: ['0x1E9Eb8d2320A52DCD91A4016b1471947844ed903'],
      })
      .catch((err) => {
        console.log(err)
      })
    console.log(balance)
  }

  async function signTransaction() {
    const response = await window.ethereum
      .request({
        method: 'eth_sendRawTransaction',
        params: [
          {
            data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
            from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
            gas: '0x76c0',
            gasPrice: '0x9184e72a000',
            to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
            value: '0x9184e72a',
          },
        ],
      })
      .catch((err) => {
        console.log(err)
      })
    console.log(response)
  }

  function createFee(fee, denom, gasLimit, payer) {
    return new tx.cosmos.tx.v1beta1.Fee({
      amount: [
        new coin.cosmos.base.v1beta1.Coin({
          denom,
          amount: fee,
        }),
      ],
      gas_limit: gasLimit,
      payer: payer,
    })
  }

  function createTransaction2(
    feePayer,
    message,
    memo,
    fee,
    denom,
    gasLimit,
    algo,
    pubKey,
    sequence,
    accountNumber,
    chainId,
  ) {
    // const timeout_height = 9999
    const body = createBodyWithMultipleMessages([message], memo)
    console.log('body: ', body)
    const feeMessage = createFee(fee, denom, gasLimit, feePayer)
    const pubKeyDecoded = Buffer.from(pubKey, 'base64')

    // AMINO
    const signInfoAmino = createSignerInfo(
      algo,
      new Uint8Array(pubKeyDecoded),
      sequence,
      LEGACY_AMINO,
    )

    const authInfoAmino = createAuthInfo(signInfoAmino, feeMessage)

    const signDocAmino = createSigDoc(
      body.serializeBinary(),
      authInfoAmino.serializeBinary(),
      chainId,
      accountNumber,
    )

    const hashAmino = new Keccak(256)
    hashAmino.update(Buffer.from(signDocAmino.serializeBinary()))
    const toSignAmino = hashAmino.digest('binary')

    // SignDirect
    const signInfoDirect = createSignerInfo(
      algo,
      new Uint8Array(pubKeyDecoded),
      sequence,
      SIGN_DIRECT,
    )

    const authInfoDirect = createAuthInfo(signInfoDirect, feeMessage)

    const signDocDirect = createSigDoc(
      body.serializeBinary(),
      authInfoDirect.serializeBinary(),
      chainId,
      accountNumber,
    )

    const hashDirect = new Keccak(256)
    hashDirect.update(Buffer.from(signDocDirect.serializeBinary()))
    const toSignDirect = hashDirect.digest('binary')

    return {
      legacyAmino: {
        body,
        authInfo: authInfoAmino,
        signBytes: toSignAmino.toString('base64'),
      },
      signDirect: {
        body,
        authInfo: authInfoDirect,
        signBytes: toSignDirect.toString('base64'),
      },
    }
  }

  function createBodyWithMultipleMessages(messages, memo) {
    console.log('messages: ', messages)
    const content = []
    messages.forEach((message) => {
      content.push(createAnyMessage(message))
    })
    return new tx.cosmos.tx.v1beta1.TxBody({
      messages: content,
      memo,
    })
  }

  function createAnyMessage(msg) {
    console.log('msg.message', msg)
    return new google.google.protobuf.Any({
      type_url: `/${msg.path}`,
      value: MsgMergeAccount.encode(msg.message).finish(),
    })
  }

  function createMsgMergeAccount() {
    // return {
    //   type: 'evmmerge/MsgMergeAccount',
    //   value: {
    //     creator: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
    //     pub_key:
    //       '034a1e1f95ebb49bc59b3c2d60afbb4c2fb2b77cd1f1e2322123fdacaa3d12f7a9',
  
    //   },
    // }
  
    // return {
    //   type: 'evmmerge/MsgMergeAccount',
    //   value: {
    //     creator: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
    //     pub_key:
    //       '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17',
    //     pub_key_sig:
    //       '115d15d77dfca49b9b4f73d7d42e017bf2e694ddf5ff75ad92b331043b350f99322afe4341ffda22a4d7f9c3cfe7bb8460d6dc9d3d75d47060083e263b06eece01',
    //   },
    // }
  
    return {
      type: 'evmmerge/MsgMergeAccount',
      value: {
        creator: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
        pub_key:
          '034a1e1f95ebb49bc59b3c2d60afbb4c2fb2b77cd1f1e2322123fdacaa3d12f7a9',
      },
    }
  
    // //proxy merge
    // return {
    //   type: 'evmmerge/MsgMergeAccount',
    //   value: {
    //     creator: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
    //     pub_key:
    //       '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17',
    //     pub_key_sig:
    //       '20ecf73f280914a8b518fcfbe83daae882ada6159ef70fd99a4857131f68ab561cc3960ff674f02251482f455352c0b4ee35483e4b215c7b07ea9902ab3aef3e1b',
    //   },
    // }
  
    // return {
    //   type: 'evmmerge/MsgMergeAccount',
    //   value: {
    //     creator: 'tswth1r60t353jpffdekg6gqttz3ceg7zyakgrv82733',
    //     pub_key:
    //       '031d7b91da4b135b58aaaa61b14c011037a0b52a278808879e83e8ad89ea4a57bf',
    //   },
    // }
  
    // return {
    //   type: 'evmmerge/MsgMergeAccount',
    //   value: {
    //     creator: 'tswth1kyztwgvh7ryq6mwtnz5fgs4wup9hcyr5n8v0xs',
    //     pub_key:
    //       '037e3ec930e5e1a8c5f8aaa4dfed7d409b9d46418eb144279840dc8f294e2e20c5',
    //   },
    // }
  }
  function createMsgMergeProto() {
    // return {
    //   message: {
    //     creator: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
    //     pubKey:
    //       '034a1e1f95ebb49bc59b3c2d60afbb4c2fb2b77cd1f1e2322123fdacaa3d12f7a9',
    //   },
    //   path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    // }
  
    // return {
    //   message: {
    //     creator: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
    //     pubKey:
    //       '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17',
    //     pubKeySig:
    //       '115d15d77dfca49b9b4f73d7d42e017bf2e694ddf5ff75ad92b331043b350f99322afe4341ffda22a4d7f9c3cfe7bb8460d6dc9d3d75d47060083e263b06eece01',
    //   },
    //   path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    // }
  
    // return {
    //   message: {
    //     creator: 'tswth1r60t353jpffdekg6gqttz3ceg7zyakgrv82733',
    //     pubKey:
    //       '031d7b91da4b135b58aaaa61b14c011037a0b52a278808879e83e8ad89ea4a57bf',
    //   },
    //   path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    // }
  
    // //proxy merge
    // return {
    //   message: {
    //     creator: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
    //     pubKey:
    //       '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17',
    //     pubKeySig:
    //       '20ecf73f280914a8b518fcfbe83daae882ada6159ef70fd99a4857131f68ab561cc3960ff674f02251482f455352c0b4ee35483e4b215c7b07ea9902ab3aef3e1b',
    //   },
    //   path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    // }
  
    return {
      message: {
        creator: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
        pubKey:
          '034a1e1f95ebb49bc59b3c2d60afbb4c2fb2b77cd1f1e2322123fdacaa3d12f7a9',
      },
      path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    }
  
    // return {
    //   path: 'Switcheo.carbon.evmmerge.MsgMergeAccount',
    //   message: {
    //     creator: 'tswth1kyztwgvh7ryq6mwtnz5fgs4wup9hcyr5n8v0xs',
    //     pubKey:
    //       '037e3ec930e5e1a8c5f8aaa4dfed7d409b9d46418eb144279840dc8f294e2e20c5',
    //   },
    // }
  }
  function createEIP712(types, chainId, message) {
    return {
      types,
      primaryType: 'Tx',
      domain: {
        name: 'Cosmos Web3',
        version: '1.0.0',
        chainId,
        verifyingContract: 'cosmos',
        salt: '0',
      },
      message,
    }
  }
  
  function createEip712Message(chain, sender, fee, memo, params) {
    // EIP712
    const feeObject = generateFee(
      fee.amount,
      fee.denom,
      fee.gas,
      sender.accountAddress,
    )
    // Struct for the Msg u are sending
    // ORDER U DEFINE IS DAMN IMPT, MUST BE THE SAME AS HOW THE TYPEDDATA IS IN COSMOS! PREFERABLY PUT SAMETYPE TOGETHER FIRST!
    const MSG_MERGE_ACCOUNT = {
      MsgValue: [
        { name: 'creator', type: 'string' },
        { name: 'pub_key', type: 'string' },
      ],
    }
  
    //proxy merge
    // const MSG_MERGE_ACCOUNT = {
    //   MsgValue: [
    //     { name: 'creator', type: 'string' },
    //     { name: 'pub_key', type: 'string' },
    //     { name: 'pub_key_sig', type: 'string' },
    //   ],
    // }
    const types = generateTypes(MSG_MERGE_ACCOUNT)
    console.log('types ', types)
  
    const msg = createMsgMergeAccount()
  
    console.log(msg)
    //Construct eip Msg to sign
    const messages = generateMessage(
      sender.accountNumber.toString(),
      sender.sequence.toString(),
      chain.cosmosChainId,
      memo,
      feeObject,
      msg,
    )
  
    //Create EIP-712 message to be displayed on metamask to be signed
    const eipToSign = createEIP712(types, chain.chainId, messages)
  
    console.log('eipToSign: ', eipToSign)
  
    // Create cosmos MsgSend object to be sent as TxRaw later
    const msgSend = createMsgMergeProto()
    // const msgSend = protoMsgSend(
    //   sender.accountAddress,
    //   params.destinationAddress,
    //   params.amount,
    //   params.denom,
    // )
    //Creates the signDirect and the legacyamino signing and eip712 extension. To be later collated into a rawTx to be broadcasted.
    const tx = createTransaction2(
      sender.accountAddress,
      msgSend,
      memo,
      fee.amount,
      fee.denom,
      parseInt(fee.gas, 10),
      'ethsecp',
      sender.pubkey,
      sender.sequence,
      sender.accountNumber,
      chain.cosmosChainId,
    )
  
    // const tx = createTransaction(
    //   msgSend,
    //   memo,
    //   fee.amount,
    //   fee.denom,
    //   parseInt(fee.gas, 10),
    //   'ethsecp256',
    //   sender.pubkey,
    //   sender.sequence,
    //   sender.accountNumber,
    //   chain.cosmosChainId,
    // )
  
    return {
      signDirect: tx.signDirect,
      legacyAmino: tx.legacyAmino,
      eipToSign,
    }
  }
  
  
  async function eip712() {
    const chain = {
      chainId: 9999,
      cosmosChainId: 'carbon_9999-1',
    }
    // const sender = {
    //   // eth address in bech32
    //   accountAddress: 'tswth1phsut994s4e9apdc25vdln02g9rz7exzw7j4nk',
    //   sequence: 3,
    //   accountNumber: 0,
    //   pubkey: 'A0oeH5XrtJvFmzwtYK+7TC+yt3zR8eIyISP9rKo9Evep',
    // }
  
    const sender = {
      // eth address in bech32
      accountAddress: 'tswth129s7zhlw3wgc633pwq7mw4jph0p9xqwgpxm3ck',
      sequence: 0,
      accountNumber: 27,
      pubkey: 'A0oeH5XrtJvFmzwtYK+7TC+yt3zR8eIyISP9rKo9Evep',
    }
  
    // const sender = {
    //   // eth address in bech32
    //   accountAddress: 'tswth1r60t353jpffdekg6gqttz3ceg7zyakgrv82733',
    //   sequence: 0,
    //   accountNumber: 29,
    //   pubkey: 'Ax17kdpLE1tYqqphsUwBEDegtSoniAiHnoPorYnqSle/',
    // }
  
    //mykey ethermintd
    // const sender = {
    //   // eth address in bech32
    //   accountAddress: 'tswth1kyztwgvh7ryq6mwtnz5fgs4wup9hcyr5n8v0xs',
    //   sequence: 1,
    //   accountNumber: 27,
    //   pubkey: 'A34+yTDl4ajF+Kqk3+19QJudRkGOsUQnmEDcjylOLiDF',
    // }
  
    const fee = {
      amount: '100000000',
      denom: 'swth',
      gas: '100000000',
    }
  
    const memo = ''
  
    const params = {
      destinationAddress: 'tswth1p0px9wrgcdn7hha27edcj62ras43fntgeqq63y',
      amount: '12345',
      denom: 'swth',
    }
  
    const msg = createEip712Message(chain, sender, fee, memo, params)
  
    console.log('message: ', msg)
    console.log('eip712 JSON ', JSON.stringify(msg.eipToSign))
  
    
    console.log("metamask: ",window.ethereum)
    // Request the signature
    let signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [
        //hex representation of eth address
        '0x5161e15Fee8b918d4621703dB75641BbC25301c8',
        JSON.stringify(msg.eipToSign),
      ],
    })
  

    console.log('signature', signature)

    // The chain and sender objects are the same as the previous example
    let extension = signatureToWeb3Extension(chain, sender, signature)

    console.log('eip712 extension:', extension)

    // Create the txRaw
    let rawTx = createTxRawEIP712(
      msg.legacyAmino.body,
      msg.legacyAmino.authInfo,
      extension,
    )

    console.log(rawTx)

    // Broadcast it
    const postOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: generatePostBodyBroadcast(rawTx, 'BROADCAST_MODE_BLOCK'),
    }

    let broadcastPost = await fetch(
      `http://localhost:1317/cosmos/tx/v1beta1/txs`,
      postOptions,
    )
    let response = await broadcastPost.json()
  }

  return (
    <div className="App">
      <button onClick={() => connectWallet()}>Connect Wallet</button>
      {/* <button onClick={() => signTransaction()}>Sign transaction</button> */}
      <button onClick={() => eip712()}>Sign EIP-712 MsgMergeAccount Via EIP-712 Antehandler</button>
      <button onClick={() => eip712Default()}>Sign EIP-712 Generic Via EIP-712 Antehandler</button>
      <button onClick={() => signAndBroadcastEthereumTx()}>
        Sign EVM tx via Keplr Via EVM antehandler
      </button>
      <button onClick={() => getPubKeySignature()}>
        Personal sign PubKey via metamask
      </button>
      <button onClick={() => signArbitrary()}>
        Sign Arbitrary PubKey Via keplr
      </button>
      {/* <button onClick={() => signEip712EthSignatureCosmosTxGenericKeplr()}>
        Sign Cosmos Generic With Eth pubKey (EIP712 Signature) Using Keplr (Failing for now)
      </button> */}
      <button onClick={() => signEip712EthSignatureCosmosTxGenericMetamask()}>
        Sign Cosmos Generic With Eth pubKey (EIP712 Signature) Using Metamask
      </button>
      <button onClick={() => signEip712EthSignatureCosmosTxMergeMetamask()}>
        Sign Cosmos Merge With Eth pubKey (EIP712 Signature) Using Metamask
      </button>
      <hr />
      <h2>Testing with carbon js sdk</h2>
      <button onClick={() => signEip712New()}>
        Sign EIP-712
      </button>
      <div>
      <button onClick={() => signEvmTransaction()}>
        Sign EVM tx
      </button>
      </div>
    
    </div>
  )
}

export default App
