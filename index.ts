import { registerRootComponent } from 'expo';

import App from './App';
// Defines the background refresh task at startup. The OS can launch the app
// headlessly to run it without mounting any React component, so the task
// must be defined here at module scope, before registerRootComponent.
import './src/services/BackgroundRefreshTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
