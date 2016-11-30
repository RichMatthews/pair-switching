const firebase = require('firebase');
var config = {
  apiKey: "AIzaSyAV3X-U-ePHVJkh28-V0fjXtotFIUblTj8",
  authDomain: "pair-switching.firebaseapp.com",
  databaseURL: "https://pair-switching.firebaseio.com",
  storageBucket: "pair-switching.appspot.com",
  messagingSenderId: "883937402545"
};
export const firebase_init = firebase.initializeApp(config);
export const rootRef = firebase.database().ref();
export const storage = firebase.storage();
