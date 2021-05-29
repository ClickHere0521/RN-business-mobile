import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Modal, Portal, Button, Provider} from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';
import {utils} from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Header from '../components/NavigationHeader';
import {TextInput} from 'react-native-paper';
import IconLock from 'react-native-vector-icons/Entypo';
import firebase from '@react-native-firebase/app';
import {Users} from '../api';

const SubAccountCreateScreen = props => {
  const userData = useSelector(({user}) => user.user);
  const subAccounts = useSelector(({data}) => data.subAccounts);
  const dispatch = useDispatch();
  const [showPassword, setShowPasswrod] = useState(false);
  const [showNewPassword, setShowNewPasswrod] = useState(false);
  const [show, setShow] = React.useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState({
    nickName: '',
    email: '',
    password: '',
    emailValidation: false,
    passwordValidation: false,
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Create Sub Account',
    showButton: false,
    onPress,
    btnTxt: 'Remove',
    btnColor: '#EC1A17',
  };

  const hideAlert = () => setShow(false);
  const showAlert = () => setShow(true);

  const validateEmail = email => {
    const re = /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
    return re.test(email);
  };

  const setEmail = email => {
    console.log(email);
    if (validateEmail(email)) {
      setState({...state, email, emailValidation: false});
    } else {
      setState({...state, email, emailValidation: true});
    }
  };

  const setPassword = password => {
    if (password && password.length > 5) {
      setState({...state, password, passwordValidation: false});
    } else {
      setState({...state, password, passwordValidation: true});
    }
  };

  const validate = () => {
    if (
      validateEmail(state.email) &&
      state.password &&
      state.password.length &&
      !state.emailValidation &&
      !state.passwordValidation
    ) {
      return true;
    }
    setState({
      ...state,
      emailValidation: validateEmail(state.email) ? false : true,
      passwordValidation:
        state.password && state.password.length > 5 ? false : true,
    });
    return false;
  };
  const onSave = () => {
    if (validate()) {
      console.log('true');
      Users.createSubaccount({
        email: state.email,
        password: state.password,
        nickName: state.nickName,
      })
        .then(res => {
          console.log(res);
          firestore()
            .collection('Business')
            .doc(userData.businessId)
            .update({
              Sub_account: [
                ...subAccounts,
                {
                  Email: state.email,
                  BusinessId: userData.businessId,
                  Nick_name: state.nickName,
                  SubaccountId: res.uid,
                  Password: state.password,
                  AccountType: 'SUB',
                },
              ],
            })
            .then(() => {
              const businessRef = firestore().collection('Business').doc(userData.businessId);
              firestore()
                .collection('Business')
                .doc(res.uid)
                .set({
                  Business: businessRef,
                  BusinessId: userData.businessId,
                  SubaccountId: res.uid,
                  Nick_name: state.nickName,
                  Email: state.email,
                  AccountType: 'SUB',
                })
                .then(res => {
                  props.navigation.goBack();
                });
            });
        })
        .catch(error => {
          setError('Please use another email!');
        });
    } else {
      console.log('false');
    }
  };

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <View>
            <TextInput
              label="Nick Name"
              value={state.nickName}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setState({...state, nickName: text})}
            />
            <TextInput
              label="Account"
              value={state.email}
              style={styles.input}
              mode="outlined"
              error={state.emailValidation}
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              onChangeText={text => setEmail(text)}
            />

            <TextInput
              label="Current Password"
              value={state.password}
              style={styles.input}
              mode="outlined"
              error={state.passwordValidation}
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              secureTextEntry={!showPassword}
              right={
                !showPassword ? (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye'} size={20} />}
                    onPress={() => setShowPasswrod(true)}
                  />
                ) : (
                  <TextInput.Icon
                    name={() => <IconLock name={'eye-with-line'} size={20} />}
                    onPress={() => setShowPasswrod(false)}
                  />
                )
              }
              onChangeText={text => setPassword(text)}
            />

            <Text style={styles.error}>{error}</Text>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={show}
          onDismiss={hideAlert}
          contentContainerStyle={styles.alert}>
          <Text>
            Please contact CHI+GO to change your business name and account
            email.
          </Text>
          <TouchableOpacity
            onPress={hideAlert}
            style={{alignSelf: 'flex-start'}}>
            <Text style={{color: '#1463A0'}}>GOT IT</Text>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contianer: {
    height: hp(87),
    width: wp(100),
    alignItems: 'center',
    paddingTop: hp(5),
    // justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },

  txt: {
    fontSize: 14,
  },
  btnContainer: {
    height: hp(13),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  button: {
    width: wp(90),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 14,
    color: '#FFF',
  },
  logo: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(20),
  },
  modal: {
    backgroundColor: 'white',
    padding: 40,
    alignSelf: 'center',
    width: wp(70),
    height: hp(30),
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1000,
  },
  alert: {
    backgroundColor: 'white',
    padding: 20,
    alignSelf: 'center',
    width: wp(70),
    height: hp(25),
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderRadius: 10,
    zIndex: 1000,
  },
  cameraButton: {
    width: wp(50),
    height: hp(7),
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: wp(100),
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  error: {
    paddingHorizontal: 20,
    color: 'red',
  },
});

export default SubAccountCreateScreen;
