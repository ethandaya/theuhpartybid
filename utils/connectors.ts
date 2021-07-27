/*
 * Thanks Uniswap ❤️🦄
 * https://github.com/Uniswap/uniswap-interface/blob/master/src/connectors/index.ts
 */

import {InjectedConnector} from '@web3-react/injected-connector'
import {NETWORK_CHAIN_ID} from 'constants/network'

if (!NETWORK_CHAIN_ID) {
  throw new Error(`NETWORK_CHAIN_ID must be defined environment variables`)
}


export const injectedConnector = new InjectedConnector({
  supportedChainIds: [NETWORK_CHAIN_ID, 4],
})
