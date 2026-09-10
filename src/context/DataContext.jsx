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

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

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
  // 나머지는 현재 값을 그대로 사용해 저장한다.
  const persist = useCallback(
    async (nextState) => {
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
    },
    [configured, orders, inventory, cancelReturns, shippingInfo, eventOrders],
  )

  // parsedEventOrders는 같은 주문 파일에서 교재가 아닌 상품(3+1/10원 이벤트
  // 등)으로 분류된 행들이다. "네이버 이벤트 주문건" 화면에서 확인할 수
  // 있도록 orders와 함께 한 번에 저장한다.
  const uploadOrders = useCallback(
    async (parsedOrders, parsedEventOrders = []) => {
      setOrders(parsedOrders)
      setEventOrders(parsedEventOrders)
      await persist({ orders: parsedOrders, eventOrders: parsedEventOrders })
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
      await persist({ cancelReturns: parsedCancelReturns })
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
  // 기준이라 교재 주문/이벤트 주문 사이에 겹치지 않는다.
  const uploadReviews = useCallback(
    async (reviewRecords) => {
      const reviewedOrderNumbers = new Set(reviewRecords.map((r) => r.orderNumber).filter(Boolean))
      setShippingInfo((prev) => {
        const next = { ...prev }
        for (const order of eventOrders) {
          if (order.orderNumber && reviewedOrderNumbers.has(order.orderNumber)) {
            next[order.id] = {
              ...(next[order.id] || {}),
              reviewWritten: true,
              reviewMatchedAt: new Date().toISOString(),
            }
          }
        }
        persist({ shippingInfo: next })
        return next
      })
    },
    [persist, eventOrders],
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
