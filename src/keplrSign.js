import { JsonRpcProvider } from '@ethersproject/providers'
const provider = new JsonRpcProvider('http://localhost:8545/')
const chainId = 'carbon-localhost'

export async function signAndBroadcastEthereumTx() {
  // Enable access to Evmos on Keplr
  await window.keplr.enable(chainId)

  // Get Keplr signer address
  const offlineSigner = window.getOfflineSigner(chainId)
  let wallets = await offlineSigner.getAccounts()
  const signerAddressBech32 = wallets[0].address

  //
  console.log("signerAddressBech32: ",signerAddressBech32)

  // Get Corresponding Eth address in hex
  const signerAddressEth = '0x5161e15Fee8b918d4621703dB75641BbC25301c8'

  // Define Ethereum Tx
  let ethSendTx = {
    from: signerAddressEth,
    chainId: 9999,
    to: '0x1E9Eb8d2320A52DCD91A4016b1471947844ed903',
    value: '0xDE0B6B3A7640000', // 1eth
    accessList: [],
    type: 2,
  }

  // Calculate and set nonce
  const nonce = await provider.getTransactionCount(signerAddressEth)
  ethSendTx['nonce'] = nonce

  // Calculate and set gas fees
  const gasLimit = await provider.estimateGas(ethSendTx)
  console.log("gasLimit: ",gasLimit)
  const gasFee = await provider.getFeeData()

  ethSendTx['gasLimit'] = gasLimit.toHexString()
  if (!gasFee.maxPriorityFeePerGas || !gasFee.maxFeePerGas) {
    // Handle error
    return
  }
  ethSendTx['maxPriorityFeePerGas'] = gasFee.maxPriorityFeePerGas.toHexString()
  ethSendTx['maxFeePerGas'] = gasFee.maxFeePerGas.toHexString()

  if (!window.keplr) {
    // Handle error
    return
  }
  const rlpEncodedTx = await window.keplr.signEthereum(
    //carbon chain id
    chainId,
    // cosmos address
    signerAddressBech32,
    JSON.stringify(ethSendTx),
    'transaction',
  )
  console.log("rlpEncodedTx: ",rlpEncodedTx)
  const res = await provider.sendTransaction(rlpEncodedTx)
  console.log(await res.wait())

  // Result:
  // {
  //   chainId: 1337,
  //   confirmations: 0,
  //   data: '0x',
  //   from: '0x8577181F3D8A38a532Ef8F3D6Fd9a31baE73b1EA',
  //   gasLimit: { BigNumber: "21000" },
  //   gasPrice: { BigNumber: "1" },
  //   hash: '0x200818a533113c00057ceccd3277249871c4a1ac09514214f03c3b96099b6c92',
  //   nonce: 4,
  //   r: '0x1727bd07080a5d3586422edad86805918e9772adda231d51c32870a1f1cabffb',
  //   s: '0x7afc6be528befb79b9ed250356f6eacd63e853685091e9a3987a3d266c6cb26a',
  //   to: '0x5555763613a12D8F3e73be831DFf8598089d3dCa',
  //   type: null,
  //   v: 2709,
  //   value: { BigNumber: "3141590000000000000" },
  //   wait: [Function]
  // }
}
