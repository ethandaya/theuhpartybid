import Head from "next/head";
import {
  FullComponents,
  MediaConfiguration,
  NFTDataContext,
  NFTFullPage,
  NFTPreview,
} from "@zoralabs/nft-components";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "utils/connectors";
import {
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { parseEther } from "@ethersproject/units";
import styles from "styles/Home.module.css";
import { Zora, AuctionHouse, addresses } from "@zoralabs/zdk";

function eth(num: number) {
  return parseEther(num.toString());
}

const CheckOwnerComponent = ({ wallet }: { wallet: string }) => {
  const nftData = useContext(NFTDataContext);
  const owner = nftData.nft.data?.nft.owner;
  if (owner === wallet) {
    return <span>Yay, you own the token and can auction it</span>;
  }
  return (
    <span style={{ color: "red", fontWeight: "bold" }}>
      You need to own the token before auctioning it off :(
    </span>
  );
};

export default function Home() {
  const { active, activate, deactivate, library } = useWeb3React();

  const [error, setError] = useState<string | undefined>();
  const [zid, setZid] = useState("");
  const [days, setDays] = useState(1);
  const [curatorFee, setCuratorFee] = useState(0);
  const [curator, setCurator] = useState("");
  const [amount, setAmount] = useState(1.0);
  const [network, setNetwork] = useState<{
    chainId: string | null;
    networkName: string | null;
  }>({ chainId: null, networkName: null });
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    if (library) {
      library.getNetwork().then(({ chainId }: { chainId: string }) => {
        const networkName = {
          "1": "mainnet",
          "4": "rinkeby",
        };
        setNetwork({
          chainId,
          networkName: (networkName as any)[chainId],
        });
      });
    }
  }, [library]);

  const [address, setAddress] = useState<null | {
    media: string;
    makret: string;
    auctionHouse: string;
  }>(null);
  useEffect(() => {
    if (network.networkName !== null) {
      const auctionHouse = {
        mainnet: "0xE468cE99444174Bd3bBBEd09209577d25D1ad673",
        rinkeby: "0xE7dd1252f50B3d845590Da0c5eADd985049a03ce",
      };
      // @ts-ignore
      setAddress({
        ...addresses[network.networkName as any],
        // @ts-ignore
        auctionHouse: auctionHouse[network.networkName],
      });
    }
  }, [active, library, setAddress, network]);

  const getApproved = useCallback(
    async (zid: string) => {
      if (!network.chainId || !zid || !library || !address?.auctionHouse) {
        return;
      }

      try {
        const zdk = new Zora(library, network.chainId as any);
        const owner = await zdk.fetchOwnerOf(zid);
        // @ts-ignore
        const result = await zdk.fetchIsApprovedForAll(
          owner,
          address.auctionHouse
        );
        console.log("updating approved", zid, network.chainId, result);
        setIsApproved(result);
      } catch (e) {
        console.error(e);
      }
      // @ts-ignore
    },
    [library, zid, network, address && address.auctionHouse]
  );

  const setApprove = useCallback(async () => {
    if (!library || !address?.auctionHouse) {
      return;
    }
    const zdk = new Zora(await library.getSigner(), network.chainId as any);
    await zdk.setApprovalForAll(address.auctionHouse, true);
    await getApproved(zid);
  }, [library, zid, network, getApproved, address]);

  const updateZoraToken = useCallback(
    (evt: any) => {
      if (evt.target.value) {
        console.log({ evt, v: evt.target.value });
        const id = evt.target.value.match(/\/([0-9]+)\/?$/);
        if (id && id[1]) {
          setZid(id[1]);
          setTimeout(() => getApproved(id[1]), 1000);
        }
      }
    },
    [setZid, getApproved]
  );

  const setupAuction = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        setError(undefined);
        if (!active) {
          throw new Error("no wallet brah");
        }

        const auctionHouse = new AuctionHouse(
          library.getSigner(),
          network.chainId as any
        );
        await auctionHouse.createAuction(
          parseInt(zid),
          Math.floor(days * 24 * 60 * 60),
          eth(amount),
          curator || "0x0000000000000000000000000000000000000000",
          curatorFee,
          "0x0000000000000000000000000000000000000000",
          (address as any).media
        );
      } catch (err) {
        setError(err.message || "Unknown thing ggs ");
      }
    },
    [active, library, network && network.chainId, zid, amount, curator, days]
  );

  return (
    <>
      <Head>
        <title>ZAUCTIONEER</title>
        <meta
          name="description"
          content="So you wanna do some fancy auctions"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div style={{ padding: 20 }}>
          <h1
            style={{
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: 75,
              padding: "0 20px",
            }}
          >
            zauctioneer
          </h1>
          <h3>
            step 0: connect metamask wallet
            <div>
              {active ? (
                <button onClick={() => deactivate()}>Disconnect Wallet</button>
              ) : (
                <button onClick={() => activate(injectedConnector)}>
                  Connect Wallet
                </button>
              )}
            </div>
            <div>
              Connected to:{" "}
              {library && library.provider.chainId === "0x1" && "mainnet"}
              {library && library.provider.chainId === "0x4" && "rinkeby"}
            </div>
          </h3>
          <h3>
            step 1: paste a link to the zora token you want to auction off
            <input type="text" onChange={updateZoraToken} />
          </h3>
          {zid && library && (
            <MediaConfiguration
              networkId={(network.chainId || 1).toString() as any}
            >
              <NFTFullPage
                config={{
                  allowOffer: false,
                }}
                id={zid}
              >
                <CheckOwnerComponent wallet={"0x00"} />
                <FullComponents.MediaFull />
                <FullComponents.MediaInfo />
              </NFTFullPage>
            </MediaConfiguration>
          )}
        </div>
        {library && zid && (
          <div className={`${styles.approveContainer}`}>
            <h1 style={{ fontWeight: "bold" }}>
              step 2: approve token for auction house
            </h1>
            <div>
              Token is {isApproved ? "approved" : "not approved"} for auction
              house sales.
              <br />
              {!isApproved && (
                <button onClick={setApprove}>Approve token</button>
              )}
            </div>
          </div>
        )}
        {library && zid && isApproved && (
          <div className={`${styles.bidContainer}`}>
            <h1 style={{ fontWeight: "bold" }}>step 3: auction it off!</h1>

            <hr />

            <form style={{ margin: "40px 0" }} onSubmit={setupAuction}>
              <label
                style={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: 14,
                }}
              >
                How many days
              </label>
              <input
                type="number"
                step={1}
                max={90}
                value={days}
                onChange={(e: any) => setDays(e.target.value)}
              />
              <br />
              What is the ETH reserve price:
              <input
                type="number"
                value={amount}
                step={0.01}
                onChange={(e: any) => setAmount(e.target.value)}
              />
              <br />
              Is there a curator? (optional)
              <input
                type="text"
                value={curator}
                onChange={(e) => setCurator(e.target.value)}
              />
              <br />
              {curator && (
                <div>
                  curator fee: (optional)
                  <input
                    type="text"
                    disabled={!curator}
                    step={1}
                    max={100}
                    min={0}
                    value={curatorFee}
                    onChange={(e) => setCuratorFee(parseInt(e.target.value))}
                  />
                  <br />
                </div>
              )}
              <button disabled={!amount || !amount || !zid} type="submit">
                Set reserve price + auction
              </button>
            </form>

            <hr />

            <div style={{ color: "red", maxWidth: 400, textAlign: "center" }}>
              {error}
            </div>

            <div style={{ marginTop: "auto" }}>
              proof of concept.
              <br />
              please verify txns and report bugs on github
              <br />
              <br />
              <a
                rel="noreferrer"
                href="https://github.com/iainnash/zuctioneer"
                target="_blank"
              >
                github.com/iainnash/zuctioneer
              </a>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
