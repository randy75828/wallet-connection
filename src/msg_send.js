import { createMsgSend as protoMsgSend, createTransaction } from '@evmos/proto'

import {
  createEIP712,
  generateFee,
  generateMessage,
  generateTypes,
  createMsgSend,
  MSG_SEND_TYPES,
} from '@evmos/eip712'


// export type MessageSendParams {
//   destinationAddress: string
//   amount: string
//   denom: string
// }

export function createMessageSend(
  chain,
  sender,
  fee,
  memo,
  params,
) {
  // EIP712
  const feeObject = generateFee(
    fee.amount,
    fee.denom,
    fee.gas,
    sender.accountAddress,
  )
  const types = generateTypes(MSG_SEND_TYPES)
  const msg = createMsgSend(
    params.amount,
    params.denom,
    sender.accountAddress,
    params.destinationAddress,
  )
  const messages = generateMessage(
    sender.accountNumber.toString(),
    sender.sequence.toString(),
    chain.cosmosChainId,
    memo,
    feeObject,
    msg,
  )
  const eipToSign = createEIP712(types, chain.chainId, messages)

  // Cosmos
  const msgSend = protoMsgSend(
    sender.accountAddress,
    params.destinationAddress,
    params.amount,
    params.denom,
  )
  console.log("messages: " ,msgSend)
  const tx = createTransaction(
    msgSend,
    memo,
    fee.amount,
    fee.denom,
    parseInt(fee.gas, 10),
    'ethsecp256',
    sender.pubkey,
    sender.sequence,
    sender.accountNumber,
    chain.cosmosChainId,
  )

console.log("tx bytes" ,tx)

  return {
    signDirect: tx.signDirect,
    legacyAmino: tx.legacyAmino,
    eipToSign,
  }
}

function createMsgSendTxBytes() {
    
}


