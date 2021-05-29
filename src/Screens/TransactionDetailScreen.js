import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Modal} from 'react-native-paper';

import DetailHeader from './../components/DetailHeader/index';
import DetailBanner from './../components/DetailBanner/index';
import {ADMIN_ROLE} from '../utiles';

const TransactionDetailScreen = props => {
  const selectedTransactionItem = useSelector(
    ({data}) => data.selectedTransactionItem,
  );
  const role = useSelector(({user}) => user.role);
  const user = useSelector(({user}) => user.user);
  const businessData = useSelector(({data})=>data.businessData)
  // const [subAccount]
  const [userData, setUserData] = useState({});
  const [show, setShow] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [subAccount, setSubAccountData] = useState({});
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const showAlert = () => setShow(true);
  const hideAlert = () => setShow(false);
  console.log(selectedTransactionItem);
  useEffect(() => {
    if (selectedTransactionItem.ClientId) {
      firestore()
        .collection('Client')
        .doc(selectedTransactionItem.ClientId)
        .get()
        .then(documentSnapshot => {
          console.log('User exists: ', documentSnapshot.exists);
          if (selectedTransactionItem.SubaccountId) {
            firestore()
              .collection('Business')
              .doc(selectedTransactionItem.SubaccountId)
              .get()
              .then(documentSnapshot => {
                setSubAccountData(documentSnapshot.data());
              });
          }
          if (documentSnapshot.exists) {
            setUserData(documentSnapshot.data());
          }
        });
    }
  }, [selectedTransactionItem]);

  const refund = () => {

    firestore()
      .collection('Client')
      .doc(selectedTransactionItem.ClientId)
      .update({
        Balance: userData.Balance + selectedTransactionItem.Used_cash,
        Points_balance:
          userData.Points_balance + parseFloat(selectedTransactionItem.Used_point * parseFloat(businessData.CashPointRate)).toFixed(2),
        CreditLine_balance:
          userData.CreditLine_balance +
          selectedTransactionItem.Used_creditLine_balance,
      })
      .then(() => {
        firestore()
          .collection('TranscationHistory')
          .doc(user.businessId)
          .collection('TransactionHistory')
          .doc(`${selectedTransactionItem.id}-ref`)
          .set({
            BusinessId: user.uid,
            ClientId: selectedTransactionItem.ClientId,
            Create_date: new Date(),
            Earned_point: selectedTransactionItem.Earned_point,
            Charged_cash: selectedTransactionItem.Used_cash,
            OrderId: selectedTransactionItem.OrderId,
            Final_cash_balance: selectedTransactionItem.Final_cash_balance,
            Final_credit_balance: selectedTransactionItem.Final_credit_balance,
            Final_point_balance: selectedTransactionItem.Final_point_balance,
            Title: selectedTransactionItem.Title,
            ClientName: selectedTransactionItem.ClientName,
            Used_creditLine_balance:
              selectedTransactionItem.Used_creditLine_balance,
            Used_point: selectedTransactionItem.Used_point,
            Subtotal: selectedTransactionItem.Subtotal,
            // SubaccountId: selectedTransactionItem.SubaccountId,
            Note: selectedTransactionItem.Note,
            Type: 'Refund',
          })
          .then(() => {
            hideAlert();
          });
      });
  };

  if (Object.keys(userData).length === 0) {
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
  return (
    <View style={styles.container}>
      <DetailHeader dateTime={selectedTransactionItem.Create_date} {...props} />
      <DetailBanner {...selectedTransactionItem} {...userData} />
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{`+ $${parseFloat(
          selectedTransactionItem.Subtotal,
        ).toFixed(2)}`}</Text>
      </View>
      <View style={styles.listContainer}>
        <View style={styles.list}>
          <Text style={styles.listTitle}>Activity Type</Text>
          <Text style={styles.listItemTxt}>
            {selectedTransactionItem.Type === 'Pay'
              ? 'Direct Pay'
              : selectedTransactionItem.Type}
          </Text>
        </View>
        <View style={styles.list}>
          <Text style={styles.listTitle}>Activity Number</Text>
          <Text style={styles.listItemTxt}>
            #
            {selectedTransactionItem.id.slice(
              selectedTransactionItem.id.length - 8,
              selectedTransactionItem.id.length,
            )}
          </Text>
        </View>
        {Object.keys(subAccount).length>0 && (
          <View style={styles.list}>
            <Text style={styles.listTitle}>From Account</Text>
            <Text style={styles.listItemTxt}>
              
              {`${businessData.Business_name.English}-${subAccount.Nick_name}`}
            </Text>
          </View>
        )}
        {(selectedTransactionItem.Type === 'Pay' || selectedTransactionItem.Type === 'Refund')&& (
          <TouchableOpacity style={styles.inlineList} onPress={showModal}>
            <Text style={styles.listTitle}>Note</Text>
            <Icon name="navigate-next" size={30} color="#ACACAC" />
          </TouchableOpacity>
        )}
        {role === ADMIN_ROLE && selectedTransactionItem.Type === 'Pay' && (
          <TouchableOpacity style={styles.button} onPress={showAlert}>
            <Text style={styles.btnTxt}>Refund</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modal}>
        <Text>{selectedTransactionItem.Note}</Text>
      </Modal>
      <Modal
        visible={show}
        onDismiss={hideAlert}
        contentContainerStyle={styles.alert}>
        <Text style={{alignSelf: 'flex-start', fontSize: 16}}>
          Refund Transaction
        </Text>
        <Text style={{alignSelf: 'flex-start', color: '#666666'}}>
          {`Do you want to refund this transaction? This action can not be undone.`}
        </Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={hideAlert}
            style={{alignSelf: 'flex-start'}}>
            <Text style={{color: '#666666', marginRight: 20}}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refund} style={{alignSelf: 'flex-start'}}>
            <Text style={{color: '#EC1A17'}}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(100),
    width: wp(100),
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  amountContainer: {
    height: hp(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  listContainer: {
    width: wp(100),
    alignItems: 'center',
  },
  list: {
    height: hp(8),
    width: wp(90),
    borderBottomColor: '#ACACAC',
    borderBottomWidth: 1,
    justifyContent: 'space-around',
    paddingVertical: 5,
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
    borderRadius: 10,
  },
  inlineList: {
    height: hp(8),
    width: wp(90),
    borderBottomColor: '#ACACAC',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  listTitle: {
    color: '#ACACAC',
    fontSize: 12,
  },
  listItemTxt: {
    fontSize: 14,
  },
  button: {
    width: wp(90),
    height: hp(7),
    marginTop: 15,
    backgroundColor: '#1463A0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 16,
    color: '#FFF',
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
});

export default TransactionDetailScreen;
