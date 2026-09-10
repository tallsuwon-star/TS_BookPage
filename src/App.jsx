import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import AppLayout from './layout/AppLayout'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import CancelReturnPage from './pages/CancelReturnPage/CancelReturnPage'
import OrderManagementPage from './pages/OrderManagementPage/OrderManagementPage'
import NaverEventOrdersPage from './pages/NaverEventOrdersPage/NaverEventOrdersPage'

// GitHub Pages는 정적 호스팅이라 클라이언트 라우팅 새로고침 시 404가 발생하기
// 쉬우므로, 서버 설정 없이도 안전하게 동작하는 HashRouter를 사용한다.
// 새 화면이 추가되면 이 Routes에 <Route>만 추가하고, 사이드바 메뉴에도 등록하면 된다.
function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/payment-check" replace />} />
            <Route path="/payment-check" element={<DashboardPage />} />
            <Route path="/order-management" element={<OrderManagementPage />} />
            <Route path="/cancel-return" element={<CancelReturnPage />} />
            <Route path="/naver-events" element={<NaverEventOrdersPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}

export default App
