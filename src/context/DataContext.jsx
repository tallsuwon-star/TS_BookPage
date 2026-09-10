import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchRemoteData, saveRemoteData, isGithubStorageConfigured, EMPTY_DATA } from '../services/githubStorage'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState({})
  const [cancelReturns, setCancelReturns] = useState([])
  const [shippingInfo, setShippingInfo] = useState({})
  const [eventOrders, setEventOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const configured = useMemo(() => isGithubStorageConfigured(), [])
  const mounted = useRef(true)
  // 저장 요청을 한 번에 하나씩만 실행하기 위한 대기열. "일괄 발송처리"처럼
  // 같은 화면에서 저장 함수를 연달아 여러 번 호출하면, 이전 저장이 끝나기
  // 전에 다음 저장이 같은 sha로 PUT을 보내면서 GitHub Contents API가 409로
  // 거부한다(낙관적 동시성 제어). 저장을 이 대기열에 태워 순서대로 하나씩
  // 실행하면 매번 최신 sha로 저장하게 되어 자기 자신과 충돌하지 않는다.
  const persistQueue = useRef(Promise.resolve())

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // 저장이 아직 GitHub에 반영되기 전에 새로고침/탭 닫기를 하면 방금 올린
  // 파일이 사라진 것처럼 보일 수 있다. 저장이 진행 중일 때는 브라우저가
  // 이탈 전 확인창을 띄우게 해서 이런 경우를 막는다.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!syncing) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [syncing])

  const loadRemote = useCallback(async () => {
    if (!configured) {
      setLoading(false)
      setError('GitHub 연동이 설정되지 않았습니다. .env 파일(VITE_GITHUB_TOKEN 등)을 확인해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRemoteData()
      if (!mounted.current) return
      setOrders(data.orders)
      setInventory(data.inventory)
      setCancelReturns(data.cancelReturns)
      setShippingInfo(data.shippingInfo)
      setEventOrders(data.eventOrders)
      setLastSyncedAt(data.updatedAt)
    } catch (err) {
      if (!mounted.current) return
      setError(err.message || String(err))
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [configured])

  useEffect(() => {
    loadRemote()
  }, [loadRemote])

  // nextState에 orders/inventory/cancelReturns 중 바뀐 것만 넘기면 되고,
  // 나머지는 현재 값을 그대로 사용해 저장한다. 실제 저장은 persistQueue에
  // 태워 이전 저장이 끝난 뒤에 실행되도록 순서를 보장한다.
  const persist = useCallback(
    (nextState) => {
      const run = async () => {
        if (!configured) {
          setError('GitHub 연동이 설정되지 않아 저장할 수 없습니다. .env 파일을 확인해주세요.')
          return false
        }
        setSyncing(true)
        setError(null)
        try {
          const saved = await saveRemoteData({
            orders: nextState.orders ?? orders,
            inventory: nextState.inventory ?? inventory,
            cancelReturns: nextState.cancelReturns ?? cancelReturns,
            shippingInfo: nextState.shippingInfo ?? shippingInfo,
            eventOrders: nextState.eventOrders ?? eventOrders,
          })
          if (!mounted.current) return true
          setLastSyncedAt(saved.updatedAt)
          return true
        } catch (err) {
          if (!mounted.current) return false
          setError(err.message || String(err))
          return false
        } finally {
          if (mounted.current) setSyncing(false)
        }
      }
      const result = persistQueue.current.then(run)
      // 이전 저장이 실패해도 대기열 자체는 끊기지 않고 다음 저장을 계속
      // 진행해야 하므로, 대기열에 남기는 프라미스는 항상 성공으로 처리한다.
      persistQueue.current = result.then(
        () => {},
        () => {},
      )
      return result
    },
    [configured, orders, inventory, cancelReturns, shippingInfo, eventOrders],
  )

  // parsedEventOrders는 같은 주문 파일에서 교재가 아닌 상품(3+1/10원 이벤트
  // 등)으로 분류된 행들이다. "네이버 이벤트 주문건" 화면에서 확인할 수
  // 있도록 orders와 함께 한 번에 저장한다. 저장 성공 여부(boolean)를
  // 그대로 반환해서, 업로드 버튼 쪽에서 "저장까지 끝났다"를 확인하고
  // 실패하면 다시 시도할 수 있게 한다.
  const uploadOrders = useCallback(
    async (parsedOrders, parsedEventOrders = []) => {
      setOrders(parsedOrders)
      setEventOrders(parsedEventOrders)
      return persist({ orders: parsedOrders, eventOrders: parsedEventOrders })
    },
    [persist],
  )

  const updateInventoryField = useCallback(
    async (productName, field, value) => {
      setInventory((prev) => {
        const next = {
          ...prev,
          [productName]: {
            ...(prev[productName] || { currentStock: 0, safetyStock: 0 }),
            [field]: value,
          },
        }
        persist({ inventory: next })
        return next
      })
    },
    [persist],
  )

  // productName -> 새 현재재고 값. 초기 재고 일괄 입력 창에서 사용.
  const updateCurrentStockBulk = useCallback(
    async (stockByProductName) => {
      setInventory((prev) => {
        const next = { ...prev }
        for (const [productName, currentStock] of Object.entries(stockByProductName)) {
          next[productName] = {
            ...(prev[productName] || { currentStock: 0, safetyStock: 0 }),
            currentStock,
          }
        }
        persist({ inventory: next })
        return next
      })
    },
    [persist],
  )

  // 담당자가 기록한 현재재고(currentStock)는 그대로 두고, 분실/파손 등으로
  // 판매 불가능해진 수량만 누적으로 더해 실사용 가능 재고를 줄인다.
  const addInventoryLoss = useCallback(
    async (productName, qty) => {
      setInventory((prev) => {
        const current = prev[productName] || { currentStock: 0, safetyStock: 0, lossQty: 0 }
        const next = {
          ...prev,
          [productName]: { ...current, lossQty: (Number(current.lossQty) || 0) + qty },
        }
        persist({ inventory: next })
        return next
      })
    },
    [persist],
  )

  const resetData = useCallback(async () => {
    setOrders([])
    setInventory({})
    setEventOrders([])
    await persist({ orders: EMPTY_DATA.orders, inventory: EMPTY_DATA.inventory, eventOrders: EMPTY_DATA.eventOrders })
  }, [persist])

  const uploadCancelReturns = useCallback(
    async (parsedCancelReturns) => {
      setCancelReturns(parsedCancelReturns)
      return persist({ cancelReturns: parsedCancelReturns })
    },
    [persist],
  )

  const resetCancelReturns = useCallback(async () => {
    setCancelReturns([])
    await persist({ cancelReturns: EMPTY_DATA.cancelReturns })
  }, [persist])

  const updateShippingInfo = useCallback(
    async (orderId, patch) => {
      setShippingInfo((prev) => {
        const next = { ...prev, [orderId]: { ...(prev[orderId] || {}), ...patch } }
        persist({ shippingInfo: next })
        return next
      })
    },
    [persist],
  )

  // 리뷰 파일(네이버 리뷰 관리 다운로드)에 등장하는 주문번호를
  // eventOrders와 대조해서, 일치하는 주문에 reviewWritten:true를 기록한다.
  // shippingInfo를 그대로 재사용한다 — 주문 id는 파일 전체 행 번호
  // 기준이라 교재 주문/이벤트 주문 사이에 겹치지 않는다. 저장 성공 여부를
  // 그대로 반환한다(업로드 버튼에서 실패 시 다시 시도할 수 있도록).
  const uploadReviews = useCallback(
    async (reviewRecords) => {
      const reviewedOrderNumbers = new Set(reviewRecords.map((r) => r.orderNumber).filter(Boolean))
      const next = { ...shippingInfo }
      for (const order of eventOrders) {
        if (order.orderNumber && reviewedOrderNumbers.has(order.orderNumber)) {
          next[order.id] = {
            ...(next[order.id] || {}),
            reviewWritten: true,
            reviewMatchedAt: new Date().toISOString(),
          }
        }
      }
      setShippingInfo(next)
      return persist({ shippingInfo: next })
    },
    [persist, eventOrders, shippingInfo],
  )

  const value = useMemo(
    () => ({
      orders,
      inventory,
      cancelReturns,
      shippingInfo,
      eventOrders,
      loading,
      syncing,
      error,
      lastSyncedAt,
      configured,
      uploadOrders,
      updateInventoryField,
      updateCurrentStockBulk,
      addInventoryLoss,
      resetData,
      uploadCancelReturns,
      resetCancelReturns,
      updateShippingInfo,
      uploadReviews,
      reload: loadRemote,
      clearError: () => setError(null),
    }),
    [
      orders,
      inventory,
      cancelReturns,
      shippingInfo,
      eventOrders,
      loading,
      syncing,
      error,
      lastSyncedAt,
      configured,
      uploadOrders,
      updateInventoryField,
      updateCurrentStockBulk,
      addInventoryLoss,
      resetData,
      uploadCancelReturns,
      resetCancelReturns,
      updateShippingInfo,
      uploadReviews,
      loadRemote,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData는 DataProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
