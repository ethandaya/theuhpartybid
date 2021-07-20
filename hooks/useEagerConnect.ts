import {useCallback, useEffect, useState} from 'react'
import {useWeb3React} from '@web3-react/core'
import {isClientSide} from 'utils/window'
import {isMobile} from 'react-device-detect'
import {injectedConnector} from 'utils/connectors'
import {delay} from 'utils/time'

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  const attemptEagerInjected = useCallback(async () => {
    const isAuthorized = await injectedConnector.isAuthorized()
    if (isAuthorized) {
      activate(injectedConnector, undefined, true).catch(() => {
        setTried(true)
      })
    } else {
      if (isMobile && window.ethereum) {
        activate(injectedConnector, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    }
  }, [activate])


  useEffect(() => {
    if (!isClientSide || tried) {
      return
    }

    delay(500).then(() => {
      attemptEagerInjected().catch(() => setTried(true))
    })
    setTried(true)
  }, [activate, attemptEagerInjected, tried])

  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}
