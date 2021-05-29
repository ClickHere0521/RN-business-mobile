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
import LockIcon from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-paper';
import * as images from '../assets/images';
import * as actions from '../Store/actions/type';

const EditProfileScreen = props => {
  const businessData = useSelector(({data}) => data.businessData);
  const userData = useSelector(({user}) => user.user);
  const dispatch = useDispatch();
  const [visible, setVisible] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [state, setState] = useState({
    logo: '',
    email: userData.email,
    name: businessData.Business_name.English,
    phone: businessData.Phone.replace('-', '').replace('-', ''),
    fileName: '',
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Edit Profile',
    showButton: false,
    onPress,
    btnTxt: 'Cancel',
    btnColor: '#EC1A17',
  };

  const showModal = () => setVisible(true);
  const showAlert = () => setShow(true);
  const hideModal = () => setVisible(false);
  const hideAlert = () => setShow(false);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission given');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const openCamera = () => {
    hideModal();
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
        saveToPhotos: true,
      },
      response => {
        setState({...state, logo: response.uri, fileName: response.fileName});
      },
    );
  };

  const openLibrary = () => {
    hideModal();
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      },
      response => {
        console.log(response);
        setState({...state, logo: response.uri, fileName: response.fileName});
      },
    );
  };

  const onSave = async () => {
    // path to existing file on filesystem
    var data = {};
    if (state.logo) {
      const reference = storage().ref(`logo/${userData.uid}.png`);
      const pathToFile = state.logo;
      // uploads file
      await reference.putFile(pathToFile);
      const url = await storage()
        .ref(`logo/${userData.uid}.png`)
        .getDownloadURL();
      data = {...data, Business_logo: url, Phone: state.phone};
    } else {
      data = {...data, Phone: state.phone};
    }
    firestore()
      .collection('Business')
      .doc(userData.uid)
      .update(data)
      .then(() => {
        console.log('User updated!');
        // props.navigation.replace('Account')
        firestore()
          .collection('Business')
          .doc(userData.uid)
          .get()
          .then(documentSnapshot => {
            console.log('User exists: ', documentSnapshot.exists);

            if (documentSnapshot.exists) {
              dispatch({
                type: actions.SET_BUSINESS_DATA,
                payload: businessData,
              });
              props.navigation.goBack()
            }
          });
      });
  };

  return (
    <View>
      <Header {...subProps} />
      <ScrollView>
        <View style={styles.contianer}>
          <View
            style={{
              padding: wp(5),
              alignSelf: 'flex-start',
              position: 'relative',
            }}>
            {state.logo ? (
              <Image source={{uri: state.logo}} style={styles.logo} />
            ) : (
              <Image
                source={{uri: businessData.Business_logo}}
                style={styles.logo}
              />
            )}
            <View style={{position: 'absolute', bottom: wp(5), right: wp(5)}}>
              <TouchableOpacity
                style={{
                  width: wp(5),
                  height: wp(5),
                  borderRadius: wp(5),
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1463A0',
                }}
                onPress={showModal}>
                <Icon name="pen" color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <TextInput
              label="Business Name"
              value={state.name}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              right={
                <TextInput.Icon
                  name={() => <LockIcon name={'lock'} size={20} />}
                  onPress={showAlert}
                />
              }
              disabled
            />
            <TextInput
              label="Account"
              value={state.email}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              right={
                <TextInput.Icon
                  name={() => <LockIcon name={'lock'} size={20} />}
                  onPress={showAlert}
                />
              }
              disabled
            />
            <TextInput
              label="Phone Number"
              value={state.phone}
              style={styles.input}
              mode="outlined"
              selectionColor={'#1463A0'}
              underlineColor={'#1463A0'}
              render={props => (
                <TextInputMask
                  {...props}
                  onChangeText={(formatted, extracted) => {
                    console.log(extracted); // +1 (123) 456-78-90
                    setState({...state, phone: extracted}); // 1234567890
                  }}
                  mask={'+1 ([000]) [000] [00] [00]'}
                />
              )}
            />
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.button} onPress={onSave}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}>
          <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
            <Text style={{color: '#FFF'}}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={openLibrary}>
            <Text style={{color: '#FFF'}}>Open Library</Text>
          </TouchableOpacity>
        </Modal>
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
});

export default EditProfileScreen;
