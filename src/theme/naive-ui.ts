import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

export const theme = darkTheme

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4fc3f7',
    primaryColorHover: '#81d4fa',
    primaryColorPressed: '#29b6f6',
    primaryColorSuppl: '#4fc3f7',
  },
  Tree: {
    nodeHeight: '32px',
    nodeTextColor: '#6b8cae',
    nodeTextColorDisabled: '#3a5068',
    fontSize: '13px',
  },
  Button: {
    textColorPrimary: '#fff',
  },
}
