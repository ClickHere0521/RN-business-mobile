import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import auth from '@react-native-firebase/auth';
import {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo';
import {useDispatch} from 'react-redux';
import * as Actions from '../Store/actions/type';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = props => {
  const [isSelected, setSelection] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPasswrod] = useState('');
  const [showPassword, setShowPasswrod] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    try {
      auth().signOut();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const storeData = async uid => {
    try {
      await AsyncStorage.setItem('@token', uid);
    } catch (error) {
      // Error saving data
    }
  };

  const doLogin = () => {
    if (password && email) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then(user => {
          firestore()
            .collection('Business')
            .get()
            .then(querySnapshot => {
              let flag = 1;
              const tempUser = user.user;
              console.log({...tempUser._user});
              querySnapshot.forEach(documentSnapshot => {
                if (
                  Object.keys(documentSnapshot.data()).includes('Sub_account')
                ) {
                  
                  const subAccountsData = documentSnapshot.data().Sub_account;
                  console.log('User ID: ', subAccountsData);
                  Object.keys(subAccountsData).map(item => {
                    if (subAccountsData[item].SubaccountId === user.user.uid) {
                      console.log(subAccountsData[item], documentSnapshot.id);
                      dispatch({
                        type: Actions.SET_USER_DATA,
                        payload: {
                          ...tempUser._user,
                          businessId: documentSnapshot.id,
                          subAccount: subAccountsData[item]
                        },
                      });
                      dispatch({
                        type: Actions.SET_ROLE,
                        payload: 'agency',
                      });
                      if (isSelected) {
                        storeData(user.user.uid);
                      }
                      flag = 0;
                      console.log('---------------------check sub account')
                      props.navigation.replace('QRGenerate');
                    }
                  });
                }
              });
              if(flag){
                console.log('---------------------check business account')
                dispatch({
                  type: Actions.SET_USER_DATA,
                  payload: {...tempUser._user, businessId: user.user.uid, subAccount:{}},
                });
                dispatch({
                  type: Actions.SET_ROLE,
                  payload: 'admin',
                });
                if (isSelected) {
                  storeData(user.user.uid);
                }
                props.navigation.replace('QRGenerate');
              }
              
            });

          console.log('User signed in anonymously');
        })
        .catch(error => {
          if (error.code === 'auth/user-not-found') {
            console.log(error);
            setError(
              'There is no user record corresponding to this identifier. The user may have been deleted.',
            );
          }
          if (error.code === 'auth/wrong-password') {
            console.log(error);
            setError(
              'The password is invalid or the user does not have a password.',
            );
          }

          console.log(error);
          // console.error(error);
        });
    }

    // props.navigation.navigate("QRGenerate")
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>LOGIN</Text>
        <TextInput
          label="Account"
          value={email}
          style={styles.input}
          mode="outlined"
          selectionColor={'#1463A0'}
          underlineColor={'#1463A0'}
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          label="Password"
          value={password}
          style={styles.input}
          mode="outlined"
          selectionColor={'#1463A0'}
          underlineColor={'#1463A0'}
          secureTextEntry={!showPassword}
          right={
            !showPassword ? (
              <TextInput.Icon
                name={() => <Icon name={'eye'} size={20} />}
                onPress={() => setShowPasswrod(true)}
              />
            ) : (
              <TextInput.Icon
                name={() => <Icon name={'eye-with-line'} size={20} />}
                onPress={() => setShowPasswrod(false)}
              />
            )
          }
          onChangeText={text => setPasswrod(text)}
        />

        <Text style={styles.error}>{error}</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isSelected}
            onValueChange={setSelection}
            style={styles.checkbox}
          />
          <Text style={styles.label}>Remember me</Text>
        </View>
        <TouchableOpacity
          style={password && email ? styles.button : styles.grayBtn}
          onPress={doLogin}>
          <Text style={styles.btnTxt}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    height: hp(100),
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  formContainer: {
    marginTop: hp(10),
    height: hp(60),
    width: wp(80),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  input: {
    width: wp(90),
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 40,
    alignSelf: 'flex-start',
  },
  button: {
    width: wp(80),
    height: hp(7),
    backgroundColor: '#1463A0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  grayBtn: {
    width: wp(80),
    height: hp(7),
    backgroundColor: 'gray',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  btnTxt: {
    color: '#FFFFFF',
  },
  forgotButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },

  checkboxContainer: {
    width: wp(80),
    flexDirection: 'row',
  },

  checkbox: {
    alignSelf: 'center',
  },

  label: {
    margin: 8,
  },
  error: {
    color: 'red',
  },
});

export default LoginScreen;
