import Head from 'next/head'
import {NFTPreview} from '@zoralabs/nft-components'
import {useWeb3React} from "@web3-react/core";
import {injectedConnector} from "utils/connectors";
import {useCallback, useState} from "react";
import {parseEther} from '@ethersproject/units'
import {Contract} from "@ethersproject/contracts";

const abi = [
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
]

function eth(num: string) {
  return parseEther(num.toString());
}

export default function Home() {

  const {active, activate, deactivate, library} = useWeb3React()
  const [ amount, setAmount] = useState<string | undefined>()
  const [ error, setError] = useState<string | undefined>()

  const handleContribute = useCallback(async(e) => {
    e.preventDefault()
    try {
      setError(undefined)
      if(!active || !amount){
        throw new Error('no wallet brah')
      }

      const PartyBid = new Contract('0xc0469892ad53CBaE9C5A31196866bf0c88d802B5', abi, library.getSigner())
      await PartyBid.contribute({ value: eth(amount) })


    } catch (err){
      setError(err.message || 'Unknown thing ggs ')
    }
  },
    [active, amount, library])

  return (
    <>
      <Head>
        <title>PartyBid</title>
        <meta name="description" content="Generated by create next app"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <main>
        <section className="page-wrapper">
          <h1>So you wanna party bid huh</h1>
          <div>
            {
              active ? <button onClick={() => deactivate()}>Disconnect Wallet</button> :
                <button onClick={() => activate(injectedConnector)}>Connect Wallet</button>
            }
          </div>

          <h3>gonna party bid on this with us right?</h3>
          <NFTPreview
            id="4008"
          />

          <form style={{
            padding: 40
          }} onSubmit={handleContribute}>
            <label>How much Eth</label>
            <input type="number" step={0.01} onChange={(e) => setAmount(e.target.value)} />
            <button disabled={!amount} type="submit">
              Contribute {amount}
            </button>
            <div style={{ color: 'red'}}>
              {error}
            </div>
          </form>

        </section>
      </main>
    </>
  )
}