import useSWR from 'swr'
import { ContractTransaction } from '@ethersproject/contracts'
import { Erc721Factory } from '@zoralabs/core/dist/typechain'
import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

export function useTokenApproval(contractAddress?: string, spender?: string) {
  const { account, library } = useWeb3React()
  const contract = useMemo(() => {
    if (!library || !contractAddress) {
      return
    }

    return Erc721Factory.connect(contractAddress, library.getSigner())
  }, [contractAddress, library])

  const { data: approved, ...rest } = useSWR(
    contract && contractAddress ? ['isApprovedForAll', contract, account, spender] : null,
    (_, contract, userAddress, spender) => contract.isApprovedForAll(userAddress, spender)
  )

  function approve(): Promise<ContractTransaction> {
    console.log({contract, spender, msg:'at approve'})
    if (!contract || !spender) {
      throw new Error('No connected contract instance || spender address')
    }

    return contract?.setApprovalForAll(spender, true)
  }

  return {
    loading: typeof approved === 'undefined' && !rest.error,
    approved,
    approve,
    ...rest,
  }
}
