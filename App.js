/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import {StyleSheet, useColorScheme} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import 'react-native-gesture-handler';
import Navigation from './src/Navigation';
import {Provider} from 'react-redux';
import {store, persistor} from './src/Store';
import {Provider as PaperProvider} from 'react-native-paper';
import PushNotification from 'react-native-push-notification';
import {PersistGate} from 'redux-persist/lib/integration/react';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  PushNotification.createChannel(
    {
      channelId: 'chiplusgo', // (required)
      channelName: 'Chigo channel', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    },
    created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  DeviceEventEmitter.addListener(
    'notificationActionReceived',
    function (action) {
      console.log('Notification action received: ' + action);
      const info = JSON.parse(action.dataJSON);
      if (info.action == 'Accept') {
        // Do work pertaining to Accept action here
      } else if (info.action == 'Reject') {
        console.log('-------------');
        // Do work pertaining to Reject action here
      }
      // Add all the required actions handlers
    },
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <Navigation />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
