import { CarbonSDK, MetaMask } from 'carbon-js-sdk'

const cache = {}
const networkChangeListeners = {}
const walletChangeListeners = {}

let listenerId = 0
let listenerIdWallet = 0
let networkListener = false
let walletListener = false

const registerListener = (listener) => {
  const id = listenerId++
  networkChangeListeners[id] = listener
  const deregisterListener = () => removeListener(id)
  return deregisterListener
}

const registerListenerWallet = (listener) => {
  const id = listenerIdWallet++
  walletChangeListeners[id] = listener
  const deregisterListener = () => removeListenerWallet(id)
  return deregisterListener
}

const removeListener = (id) => {
  delete networkChangeListeners[id]
}

const removeListenerWallet = (id) => {
  delete walletChangeListeners[id]
}

export default (net) => {
  if (!cache[net]) {
    const network = CarbonSDK.parseNetwork(net)
    cache[net] = new MetaMask(network)
  }
  if (!networkListener) {
    cache[net].getAPI()?.on('chainChanged', (chainId) => {
      cache[net].syncBlockchain()
      Object.values(networkChangeListeners).forEach((listener) => {
        try {
          listener()
        } catch (err) {
          console.error(err)
        }
      })
    })
    networkListener = true
  }

  if (!walletListener) {
    cache[net].getAPI()?.on('accountsChanged', (accounts) => {
      Object.values(walletChangeListeners).forEach((listener) => {
        try {
          listener()
        } catch (err) {
          console.error(err)
        }
      })
    })
    walletListener = true
  }
  return { metamask: cache[net], registerListener, registerListenerWallet }
}
