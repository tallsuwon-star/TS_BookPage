import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MENU_TREE } from './menuConfig'
import './Sidebar.css'

function findDefaultOpenKey(pathname) {
  for (const item of MENU_TREE) {
    if (item.children?.some((c) => c.path === pathname)) return item.key
  }
  return null
}

export default function Sidebar() {
  const location = useLocation()
  const [openKey, setOpenKey] = useState(() => findDefaultOpenKey(location.pathname) ?? 'edu-product')

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {MENU_TREE.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0

          if (!hasChildren) {
            return item.path ? (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ) : (
              <span key={item.key} className="sidebar__item sidebar__item--disabled" title="준비중">
                <span className="sidebar__item-icon">{item.icon}</span>
                {item.label}
              </span>
            )
          }

          const isOpen = openKey === item.key
          return (
            <div key={item.key} className="sidebar__group">
              <button
                type="button"
                className={`sidebar__item sidebar__item--toggle${isOpen ? ' sidebar__item--open' : ''}`}
                onClick={() => setOpenKey(isOpen ? null : item.key)}
              >
                <span className="sidebar__item-icon">{item.icon}</span>
                {item.label}
                <span className="sidebar__chevron">{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && (
                <div className="sidebar__submenu">
                  {item.children.map((child, idx) =>
                    child.path ? (
                      <NavLink
                        key={child.key || idx}
                        to={child.path}
                        className={({ isActive }) => `sidebar__subitem${isActive ? ' sidebar__subitem--active' : ''}`}
                      >
                        {child.label}
                      </NavLink>
                    ) : (
                      <span key={child.key || idx} className="sidebar__subitem sidebar__subitem--disabled" title="준비중">
                        {child.label}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
