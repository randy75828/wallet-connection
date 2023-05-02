import { JsonRpcProvider } from '@ethersproject/providers'
const provider = new JsonRpcProvider('http://localhost:8545/')
const chainId = 'carbon-localhost'

// EIP-1559
export async function getPubKeySignature() {
  const address = '0xb2bA60f851CDE9eA35bfDA31B449C7c20893B9f6'
  // val2 public key
  const pubKey =
    '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17 '
  const exampleMessage =
    'Sign your public key to merge your Carbon account: ' + pubKey
  const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`
  console.log('message: ', msg)

  const msgWithPrefix =
    '\x19Ethereum Signed Message:\n' + exampleMessage.length + exampleMessage
  const msgWithPrefixHex = `0x${Buffer.from(msgWithPrefix, 'utf8').toString(
    'hex',
  )}`

  console.log('msgWithPrefixHex: ', msgWithPrefixHex)

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [msg, address],
  })

  console.log('signature', signature)
}
