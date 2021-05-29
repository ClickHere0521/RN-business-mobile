import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Header from '../components/HomeHeader';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector, useDispatch} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import * as Progress from 'react-native-progress';
import moment from 'moment';
import ListItem from '../components/ListItem';
import ListDate from '../components/ListDate';
import Filter from '../components/Filter';
import * as actions from '../Store/actions/type';
import MenuDrawer from 'react-native-side-drawer';
import {ADMIN_ROLE} from '../utiles';

const Transaction = props => {
  const userData = useSelector(store => store.user.user);
  const filterData = useSelector(store => store.filter);
  const role = useSelector(({user}) => user.role);
  const dispatch = useDispatch();
  const [state, setState] = useState({
    data: [],
    transactionTimeFilter: filterData.transactionTimeFilter,
    transactionTypeFilter: filterData.transactionTypeFilter,
    open: false,
  });
  let previousItem = {};

  const toggleOpen = () => {
    setState({...state, open: !state.open});
  };

  useEffect(() => {
    const subscriber = firestore()
      .collection('TranscationHistory')
      .doc(String(userData.businessId))
      .collection('TransactionHistory')
      .where(
        'Create_date',
        '>=',
        filterData.transactionTimeFilter === 'all'
          ? new Date('1990-05-14T01:57:40.000Z')
          : filterData.transactionTimeFilter === 'daily'
          ? new Date(new Date().setDate(new Date().getDate() - 1))
          : filterData.transactionTimeFilter === 'weekly'
          ? new Date(new Date().setDate(new Date().getDate() - 7))
          : new Date(new Date().setDate(new Date().getDate() - 30)),
      )

      .orderBy('Create_date', 'desc')
      .onSnapshot(async documentSnapshot => {
        const snapData = documentSnapshot._docs;
        let data = [];
        documentSnapshot.forEach(item => {
          var date = '';
          if (Object.keys(item.data()).includes('Create_date')) {
            var date1 = new Date(item.data().Create_date.toDate());
            date = moment(date1).format('MMMM Do YYYY, h:mm:ss a');
          }
          if (role === ADMIN_ROLE&&item.data().Type !== 'Purchase') {
            data.push({...item.data(), Create_date: date, id: item.id});
          } else {
            if (item.data().SubaccountId === userData.uid&&item.data().Type !== 'Purchase') {
              data.push({...item.data(), Create_date: date, id: item.id});
            }
          }
        });

        setState({
          ...state,

          data,
        });
      });
    return () => subscriber();
  }, [userData, filterData]);

  const drawerContent = () => {
    return (
      <Filter
        timeFilter={filterData.transactionTimeFilter}
        typeFilter={filterData.transactionTypeFilter}
        onPress={toggleOpen}
      />
    );
  };

  const goDetail = selectedData => {
    dispatch({
      type: actions.SET_SELECTED_TRANSACTION_ITEM,
      payload: {...selectedData},
    });
    console.log(props.navigation);
    props.navigation.navigate('TransactionDetail');
  };

  // if (state.data.length === 0) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Progress.CircleSnail
  //         thickness={5}
  //         size={50}
  //         strokeCap={'square'}
  //         color={['#1463A0']}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <MenuDrawer
        open={state.open}
        drawerContent={drawerContent()}
        drawerPercentage={80}
        animationTime={250}
        overlay={true}
        opacity={0.1}
        position="right">
        <Header
          title="Transaction"
          linkText="Filter"
          navigation={props.navigation}
          onPress={toggleOpen}
        />
        <View style={styles.subContainer}>
          <ScrollView>
            {state.data.map((item, index) => {
              if (
                Object.keys(previousItem).length === 0 ||
                (Object.keys(previousItem).length > 0 &&
                  previousItem.Create_date.split(',')[0] !==
                    item.Create_date.split(',')[0])
              ) {
                previousItem = {...item};

                return (
                  <View key={index}>
                    <ListDate date={item.Create_date} />
                    <ListItem key={index} data={item} onPress={goDetail} />
                  </View>
                );
              } else {
                return <ListItem key={index} data={item} onPress={goDetail} />;
              }
            })}
          </ScrollView>
        </View>
      </MenuDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(90),
    width: wp(100),
    display: 'flex',
    backgroundColor: '#FFF',
  },
  animatedBox: {
    flex: 1,
    backgroundColor: '#38C8EC',
    padding: 10,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F04812',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  subContainer: {
    height: hp(80),
    width: wp(90),
    marginLeft: wp(5),
  },

  header: {
    flex: 0.1,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 10,
  },
  drawerBtnTxt: {
    fontSize: 14,
    color: '#1463A0',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default Transaction;
