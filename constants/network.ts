import {Networks} from '@zoralabs/nft-hooks'

export const NETWORK_URL = process.env.NEXT_PUBLIC_NETWORK_URL
if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`NEXT_PUBLIC_NETWORK_URL must be a defined environment variable`)
}
export const NETWORK_CHAIN_ID: number = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1')
export const NETWORK_NAME = NETWORK_CHAIN_ID === 1 ? Networks.MAINNET : Networks.RINKEBY
