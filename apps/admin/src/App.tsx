import React from 'react'
import { Admin, AddLogo } from '@webiny/app-serverless-cms'
import { Cognito } from '@webiny/app-admin-users-cognito'
import './App.scss'

// Import your logo image
import logoPng from './logo.png'

export const App: React.FC = () => {
  return (
    <Admin>
      <Cognito />
      <AddLogo logo={<img height="40px" src={logoPng} />} />
    </Admin>
  )
}
