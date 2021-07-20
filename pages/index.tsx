import Head from 'next/head'
import {NFTFullPage, NFTPreview} from '@zoralabs/nft-components'
import {useWeb3React} from "@web3-react/core";
import {injectedConnector} from "utils/connectors";
import {useCallback, useState} from "react";
import {parseEther} from '@ethersproject/units'
import {Contract} from "@ethersproject/contracts";
import styles from 'styles/Home.module.css'

const abi = [
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
]

function eth(num: string) {
  return parseEther(num.toString());
}

export default function Home() {

  const {active, activate, deactivate, library} = useWeb3React()
  const [amount, setAmount] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()


  const handleContribute = useCallback(async (e) => {
      e.preventDefault()
      try {
        setError(undefined)
        if (!active || !amount) {
          throw new Error('no wallet brah')
        }

        const PartyBid = new Contract('0xc0469892ad53CBaE9C5A31196866bf0c88d802B5', abi, library.getSigner())
        await PartyBid.contribute({value: eth(amount)})


      } catch (err) {
        setError(err.message || 'Unknown thing ggs ')
      }
    },
    [active, amount, library])

  const handleBid = useCallback(async (e) => {
      e.preventDefault()
      try {
        setError(undefined)
        if (!active) {
          throw new Error('no wallet brah')
        }

        // {
        //   "inputs": [],
        //   "name": "bid",
        //   "outputs": [],
        //   "stateMutability": "nonpayable",
        //   "type": "function"
        // },
        const PartyBid = new Contract('0xc0469892ad53CBaE9C5A31196866bf0c88d802B5', abi, library.getSigner())
        await PartyBid.bid()

      } catch (err) {
        setError(err.message || 'Unknown thing ggs ')
      }
    },
    [active, library])

  return (
    <>
      <Head>
        <title>PartyBid</title>
        <meta name="description" content="So you wanna partybid huh "/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <main className={styles.main}>
        <div className={`${styles.col} ${styles.intro}`}>
          <h1 style={{textTransform: 'uppercase', fontWeight: 'bold', fontSize: 75, padding: '0 20px'}}>
            p0pb0ttl3z
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            padding: '20px 20px 60px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{flex: '1 0 0', textTransform: 'uppercase', fontSize: 20}}>
              By <br/>
              Bottles with <br/>
              Benefits
            </div>
            <div style={{flex: '2 0 0', fontSize: 24}}>
              The official partybid for the FWP Paris party NFT at Eth.CC Paris 2021. Warning this partybid comes with
              major bottle benefits
            </div>
          </div>
          <h2 style={{ fontFamily: 'Playfair Display', fontWeight: '400', padding: '1rem 2rem', fontSize: 40 }}>
            "The world is transforming before our eyes, and irl experiences are proving to be more metamorphic than
            ever. Now releasing the first PartyBid from p0pb0ttl3z’s new community (dank) app – the (un)official partybid
            that comes with major bottle benefits."
          </h2>
        </div>
        <div className={`${styles.col} ${styles.nft}`}>
          <NFTFullPage
            config={{
              allowOffer: false
            }}
            id="4008"
          />
        </div>
        <div className={`${styles.col} ${styles.bidContainer}`}>
          <div>
            {
              active ? <button onClick={() => deactivate()}>Disconnect Wallet</button> :
                <button onClick={() => activate(injectedConnector)}>Connect Wallet</button>
            }
          </div>

          <h1 style={{fontWeight: 'bold'}}>So you wanna party bid huh</h1>

          <h3>gonna party bid on this with us right?</h3>


          <form onSubmit={handleContribute}>
            <label style={{fontWeight: 'normal', marginRight: 10}}>How much Eth</label>
            <input type="number" step={0.01} onChange={(e) => setAmount(e.target.value)}/>
            <button disabled={!amount} type="submit">
              Contribute {amount}
            </button>
          </form>

          <h2>ugh, should we bid now</h2>
          <p>PS you have to be one of us to hid the big red button</p>
          <button style={{fontSize: 40, background: 'red', color: 'white', padding: 10}} onClick={handleBid}>yeah mate
            bid now eh
          </button>

          <h5>I put the errors here</h5>
          <div style={{color: 'red', maxWidth: 400, textAlign: 'center'}}>
            {error}
          </div>
        </div>
      </main>
    </>
  )
}
