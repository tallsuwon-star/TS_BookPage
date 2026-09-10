import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useData } from '../context/DataContext'
import './AppLayout.css'

export default function AppLayout() {
  const { error, clearError } = useData()

  return (
    <div className="app-layout">
      <Header />
      <div className="app-layout__body">
        <Sidebar />
        <div className="app-layout__main">
          {error && (
            <div className="app-layout__error">
              <span>⚠ {error}</span>
              <button type="button" onClick={clearError}>
                닫기
              </button>
            </div>
          )}
          <main className="app-layout__content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
