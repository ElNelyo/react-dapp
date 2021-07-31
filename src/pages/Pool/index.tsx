import { Trans } from '@lingui/macro'
import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { SwapPoolTabs } from 'components/NavigationTabs'
import PositionList from 'components/PositionList'
import { RowFixed } from 'components/Row'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { L2_CHAIN_IDS } from 'constants/chains'
import { useV3Positions } from 'hooks/useV3Positions'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { ChevronsRight, Inbox, Layers } from 'react-feather'
import { Link } from 'react-router-dom'
import { useWalletModalToggle } from 'state/application/hooks'
import { useUserHideClosedPositions } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { TYPE } from 'theme'
import { PositionDetails } from 'types/position'
import { LoadingRows } from './styleds'
import CurrencyListNoEmpty from 'components/SearchModal/CurrencyListNoEmpty'
import { Currency, Token } from '@uniswap/sdk-core'
import useDebounce from 'hooks/useDebounce'
import { ExtendedEther } from '../../constants/tokens'
import { filterTokens, useSortedTokensByQueryAndBalanceNotNull } from 'components/SearchModal/filtering'
import { useTokenComparator } from 'components/SearchModal/sorting'
import { useAllTokens, useSearchInactiveTokenLists } from '../../hooks/Tokens'
import { FixedSizeList } from 'react-window'

const PageWrapper = styled(AutoColumn)`
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 500px;
  `};
`

const NoLiquidity = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: 25vh;
`
const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.bg0};
  padding: 8px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`

const ShowInactiveToggle = styled.div`
  display: flex;
  align-items: center;
  justify-items: end;
  grid-column-gap: 4px;
  padding: 0 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 12px;
  `};
`

const ResponsiveRow = styled(RowFixed)`
  justify-content: space-between;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column-reverse;
  `};
`

export default function Pool() {
  const { account, chainId } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const theme = useContext(ThemeContext)
  const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()

  const { positions, loading: positionsLoading } = useV3Positions(account)

  const [openPositions, closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]

  const filteredPositions = [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)]
  const showConnectAWallet = Boolean(!account)
  const showV2Features = !!chainId && !L2_CHAIN_IDS.includes(chainId)

  const allTokens = useAllTokens()
  const [invertSearchOrder] = useState<boolean>(false)
  const tokenComparator = useTokenComparator(invertSearchOrder)
  const ether = useMemo(() => chainId && ExtendedEther.onChain(chainId), [chainId])
  const [searchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), debouncedQuery)
  }, [allTokens, debouncedQuery])
  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator)
  }, [filteredTokens, tokenComparator])

  const filteredSortedTokens = useSortedTokensByQueryAndBalanceNotNull(sortedTokens, debouncedQuery)
  const filteredSortedTokensWithETH: Currency[] = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim()
    if (s === '' || s === 'e' || s === 'et' || s === 'eth') {
      return ether ? [ether, ...filteredSortedTokens] : filteredSortedTokens
    }
    return filteredSortedTokens
  }, [debouncedQuery, ether, filteredSortedTokens])
  const filteredInactiveTokens = useSearchInactiveTokenLists(
    filteredTokens.length === 0 || debouncedQuery.length > 2 ? debouncedQuery : undefined
  )

  const handleCurrencySelect = useCallback((currency: Currency) => {
    console.log(currency)
  }, [])
  const otherSelectedCurrency = null
  const selectedCurrency = null
  const fixedList = useRef<FixedSizeList>()
  function showImportView() {
    console.log('showImportView')
  }
  function setImportToken(token: Token) {
    console.log(token)
  }
  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <MainContentWrapper>
              {positionsLoading ? (
                <LoadingRows>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </LoadingRows>
              ) : filteredPositions && filteredPositions.length > 0 ? (
                <PositionList positions={filteredPositions} />
              ) : (
                <NoLiquidity>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Inbox size={48} strokeWidth={1} style={{ marginBottom: '.5rem' }} />
                    <div>
                      <Trans>Your Wallet</Trans>
                    </div>
                  </TYPE.body>
                  <CurrencyListNoEmpty
                    height={500}
                    currencies={filteredSortedTokensWithETH}
                    otherListTokens={filteredInactiveTokens}
                    onCurrencySelect={handleCurrencySelect}
                    otherCurrency={otherSelectedCurrency}
                    selectedCurrency={selectedCurrency}
                    fixedListRef={fixedList}
                    showImportView={showImportView}
                    setImportToken={setImportToken}
                    showCurrencyAmount={true}
                  />
                  {showConnectAWallet && (
                    <ButtonPrimary style={{ marginTop: '2em', padding: '8px 16px' }} onClick={toggleWalletModal}>
                      <Trans>Connect a wallet</Trans>
                    </ButtonPrimary>
                  )}
                </NoLiquidity>
              )}
            </MainContentWrapper>
            <ResponsiveRow>
              {showV2Features && (
                <RowFixed>
                  <ButtonOutlined
                    as={Link}
                    to="/pool/v2"
                    id="import-pool-link"
                    style={{
                      padding: '8px 16px',
                      margin: '0 4px',
                      borderRadius: '12px',
                      width: 'fit-content',
                      fontSize: '14px',
                    }}
                  >
                    <Layers size={14} style={{ marginRight: '8px' }} />

                    <Trans>View V2 Liquidity</Trans>
                  </ButtonOutlined>
                  {positions && positions.length > 0 && (
                    <ButtonOutlined
                      as={Link}
                      to="/migrate/v2"
                      id="import-pool-link"
                      style={{
                        padding: '8px 16px',
                        margin: '0 4px',
                        borderRadius: '12px',
                        width: 'fit-content',
                        fontSize: '14px',
                      }}
                    >
                      <ChevronsRight size={16} style={{ marginRight: '8px' }} />

                      <Trans>Migrate Liquidity</Trans>
                    </ButtonOutlined>
                  )}
                </RowFixed>
              )}
              {closedPositions.length > 0 ? (
                <ShowInactiveToggle>
                  <label>
                    <TYPE.body onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}>
                      <Trans>Show closed positions</Trans>
                    </TYPE.body>
                  </label>
                  <input
                    type="checkbox"
                    onClick={() => setUserHideClosedPositions(!userHideClosedPositions)}
                    checked={!userHideClosedPositions}
                  />
                </ShowInactiveToggle>
              ) : null}
            </ResponsiveRow>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}
