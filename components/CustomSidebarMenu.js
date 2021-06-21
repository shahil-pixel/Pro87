import React, { Component } from 'react';
import {Text,View,StyleSheet,TouchableOpacity,TextInput,Image,Alert,Modal,
ScrollView,keyboardAvoidingView,} from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import firebase from 'firebase';
import { Avatar } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import db from '../config';


export default class CustomSidebarMenu extends Component{
  constructor(props) {
    super(props);
    this.state = {
      image: '#',
      name: '',
      userId: firebase.auth().currentUser.email,
      docId: '',
    };
  }

  getUserProfile() {
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            name: doc.data().first_name + ' ' + doc.data().last_name,
            docId: doc.id,
            image: doc.data().image,
          });
        });
      });
  }

  fetchImage = (imageName) => {
    var storageRef = firebase
      .storage()
      .ref()
      .child('user_profiles/' + imageName);
    storageRef
      .getDownloadURL()
      .then((url) => {
        this.setState({
          image: url,
        });
      })
      .catch((error) => {
        this.setState({
          image: '#',
        });
      });
  };

  uploadImage = async (uri, imageName) => {
    var response = await fetch(uri);
    var blob = await response.blob();
    var ref = firebase
      .storage()
      .ref()
      .child('user_profiles/' + imageName);
    return ref.put(blob).then((response) => {
      this.fetchImage(imageName);
    });
  };

  selectPicture = async () => {
    const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!cancelled) {
      this.setState({
        image: uri,
      });
      this.uploadImage(uri, this.state.userId);
    }
  };

  componentDidMount() {
    this.getUserProfile();
    this.fetchImage(this.state.userId);
  }

  render(){
    return(
      <View style={{flex:1}}>
        <DrawerItems {...this.props}/>
        <View style={{flex:1,justifyContent:'flex-end',paddingBottom:30}}>
          <TouchableOpacity style={{justifyContent:'center',padding:10,height:30,width:'100%'}}
          onPress = {() => {
              this.props.navigation.navigate('WelcomeScreen')
              firebase.auth().signOut()
          }}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}
