import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';

const DetailHeader = ({dateTime, navigation}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={30}></Icon>
      </TouchableOpacity>
      <Text style={styles.time}>{dateTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(10),
    paddingHorizontal: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth:1,
    borderBottomColor:'#ACACAC'
  },
  time: {
    fontSize: 14,
  },
  back: {
    position: 'absolute',
    left: 0,
  },
});

export default DetailHeader;
