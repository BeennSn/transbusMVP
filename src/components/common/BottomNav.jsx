import { NavLink } from 'react-router-dom'
import {
  IconMap2,
  IconBus,
  IconMapPin,
  IconUser,
} from '@tabler/icons-react'

const NAV_ITEMS = [
  { to: '/mapa',      label: 'Mapa',      Icon: IconMap2    },
  { to: '/rutas',     label: 'Rutas',     Icon: IconBus     },
  { to: '/paraderos', label: 'Paraderos', Icon: IconMapPin  },
  { to: '/perfil',    label: 'Perfil',    Icon: IconUser    },
]

export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      style={{
        position:        'fixed',
        bottom:          0,
        left:            '50%',
        transform:       'translateX(-50%)',
        width:           '100%',
        maxWidth:        '430px',
        height:          '64px',
        backgroundColor: '#ffffff',
        borderTop:       '1px solid #e2e8f0',
        display:         'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        zIndex:          50,
      }}
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          id={`nav-${label.toLowerCase()}`}
          style={({ isActive }) => ({
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '2px',
            textDecoration: 'none',
            color:          isActive ? '#1d6fe8' : '#94a3b8',
            fontFamily:     "'Plus Jakarta Sans', sans-serif",
            fontSize:       '0.6875rem',
            fontWeight:     isActive ? 700 : 500,
            transition:     'color 0.15s',
          })}
        >
          {({ isActive }) => (
            <>
              <span
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  width:           '36px',
                  height:          '24px',
                  borderRadius:    '12px',
                  backgroundColor: isActive ? '#e8f0fd' : 'transparent',
                  transition:      'background-color 0.15s',
                }}
              >
                <Icon size={20} stroke={isActive ? 2.2 : 1.6} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
