import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const ListItem = ({data, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.tableItem}
      onPress={onPress ? ()=>onPress(data) : () => {}}>
      <View>
        <Text style={styles.itemTitle}>{data.Type==='Pay'? 'Direct Pay':data.Type}</Text>

        <Text style={styles.itemDate}>{data.Create_date}</Text>
      </View>
      <View>
        {data.Type!=='Refund' ? (
          <Text style={styles.itemGreenTxt}>{`+ $${parseFloat(
            data.Subtotal,
          ).toFixed(2)}`}</Text>
        ) : (
          <Text style={styles.itemRedTxt}>{`- $${parseFloat(
            data.Subtotal,
          ).toFixed(2)}`}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tableItem: {
    height: hp(7),
    borderBottomWidth: 1,
    borderBottomColor: '#ACACAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 12,
    color: '#ACACAC',
  },
  itemGreenTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2FA014',
  },
  itemRedTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC1A17',
  },
});

export default ListItem;
