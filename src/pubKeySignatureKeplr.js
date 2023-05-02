const chainId = 'carbon-localhost'

export async function signArbitrary() {
  // Enable access to Evmos on Keplr
  await window.keplr.enable(chainId)

  // Get Keplr signer address
  const offlineSigner = window.getOfflineSigner(chainId)
  let wallets = await offlineSigner.getAccounts()
  console.log('wallets: ', wallets)
  const signerAddressBech32 = wallets[0].address

  console.log('signerAddressBech32: ', signerAddressBech32)

  // val2 public key
  const pubKey =
    '02eec4db2162196fe482933d6f0e4f9cd6bab31980266a8b7372f61e593fc12f17'

  const message = 'Sign your public key to merge your Carbon account: ' + pubKey

  //   const client = new SigningCosmosClient(
  //     "http://localhost:1317",
  //     wallets[0].address,
  //     offlineSigner,
  // );

  const sign = await window.keplr.signArbitrary(
    chainId,
    signerAddressBech32,
    message,
  )
  console.log('sign: ', sign)
  const signatureHex = Buffer.from(sign.signature, 'base64').toString('hex')
  console.log('signatureHex: ', signatureHex)

  // console.log('signedTx: ', Buffer.from(JSON.stringify(stdTx)).toString('hex'))
}
