import '../styles/globals.css'
import type {AppProps} from 'next/app'
import Web3ReactManager from "components/Web3ReactManager";
import React from 'react';
import {Web3ReactProvider} from '@web3-react/core';
import {NETWORK_CHAIN_ID} from "constants/network";
import {Web3Provider} from '@ethersproject/providers'

function getLibrary(provider: any): Web3Provider | undefined {
  const library = new Web3Provider(provider, NETWORK_CHAIN_ID)
  library.pollingInterval = 1000
  return library
}



function MyApp({Component, pageProps}: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ReactManager>
        <Component {...pageProps} />
      </Web3ReactManager>
    </Web3ReactProvider>
  )
}

export default MyApp
