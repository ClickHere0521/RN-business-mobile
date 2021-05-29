import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';

import Header from '../components/NavigationHeader';
import * as images from '../assets/images';

function makeid(length) {
  var result = [];
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength)),
    );
  }
  return result.join('');
}

const ReviewWithdrawScreen = props => {
  const withdrawData = useSelector(({data}) => data.withdraw);
  const userData = useSelector(({user}) => user.user);
  const [state, setState] = useState({
    withdrawData: withdrawData,
    clientInfo: {},
    showSuccess: false,
  });

  const onPress = () => {
    props.navigation.goBack();
  };
  const subProps = {
    title: 'Review',
    showButton: true,
    onPress,
    onPressBtn: onPress,
    btnTxt: 'Cancel Request',
    btnColor: '#EC1A17',
  };

  useEffect(() => {
    setState({...state, withdrawData});
  }, [withdrawData]);

  const setRedeem = () => {
    setState({...state, showSuccess: true});
  };

  if (Object.keys(state.withdrawData).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Progress.CircleSnail
          thickness={5}
          size={50}
          strokeCap={'square'}
          color={['#1463A0']}
        />
      </View>
    );
  }

  if (state.showSuccess) {
    return (
      <View style={styles.successContainer}>
        <Image source={images.CompleteImg} />
        <Text style={styles.successTitle}>Request Submitted</Text>
        <Text style={styles.successContent}>
          {`Activity Number: #UA9LSOLP`}
        </Text>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => props.navigation.navigate('QRGenerate')}>
          <Text style={styles.successBtnTxt}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Header {...subProps} {...props} />
      <View style={styles.contianer}>
        <View>
          <View style={styles.orderContainer}>
            <Text style={styles.title}>Amount</Text>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Withdraw Amount :</Text>
              <Text style={styles.txt}>{`$${state.withdrawData.amount}`}</Text>
            </View>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Operation Fee:</Text>
              <Text style={styles.redTxt}>-$0.30</Text>
            </View>
            <View style={styles.inlineTxt}>
              <Text style={styles.txt}>Tax:</Text>
              <Text style={styles.redTxt}>-$12.00</Text>
            </View>
            <View style={styles.inlineTxt}>
              <Text style={styles.title}>TOTAL:</Text>
              <Text style={styles.title}>{`$${parseFloat(
                state.withdrawData.amount - 0.3 - 12.0,
              ).toFixed(2)}`}</Text>
            </View>
          </View>
          <View style={styles.dealContainer}>
            <Text style={styles.title}>Billing Address</Text>
            {/* {Object.keys(state.couponData).includes('Item') &&
              state.couponData.Item.map((item, index) => {
                return ( */}
            <View style={styles.multilineTxt}>
              <Text style={styles.txt}>{state.withdrawData.addressOne}</Text>
            </View>
            {state.withdrawData.addressTwo!=='' && (
              <View style={styles.multilineTxt}>
                <Text style={styles.txt}>{state.withdrawData.addressTwo}</Text>
              </View>
            )}

            <View style={styles.multilineTxt}>
              <Text style={styles.txt}>{state.withdrawData.city}</Text>
            </View>
            <View style={styles.multilineTxt}>
              <Text
                style={
                  styles.txt
                }>{`${state.withdrawData.state}, ${state.withdrawData.zipCode}`}</Text>
            </View>
            {/* );
              })} */}
          </View>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.button} onPress={setRedeem}>
            <Text style={styles.btnTxt}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contianer: {
    height: hp(87),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  orderContainer: {
    width: wp(100),
    padding: wp(5),
    backgroundColor: '#FFF',
    marginBottom: 2,
  },
  dealContainer: {
    width: wp(100),
    padding: wp(5),
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  inlineTxt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: hp(5),
  },
  multilineTxt: {
    justifyContent: 'flex-end',
    height: hp(5),
  },
  txt: {
    fontSize: 14,
  },
  redTxt: {
    color: '#EC1A17',
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
  successContainer: {
    height: hp(100),
    width: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
  },
  successContent: {
    fontSize: 14,
    color: '#ACACAC',
    marginBottom: 25,
  },
  successBtn: {
    width: wp(60),
    height: hp(6),
    backgroundColor: '#1463A0',
    borderRadius: hp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnTxt: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ReviewWithdrawScreen;
