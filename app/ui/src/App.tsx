import React from 'react';


import { Authenticator } from '@aws-amplify/ui-react'; 
import { ApplicationRoutes } from './routing/ApplicationRoutes'; 

function App() {
  return (
    <Authenticator.Provider>{/* for cognito */} 
          <ApplicationRoutes />
      </Authenticator.Provider>

  );
}

export default App;
