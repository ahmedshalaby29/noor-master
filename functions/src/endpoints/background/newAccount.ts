import * as functions from "firebase-functions";

import http from "axios";


export default functions
  .region("asia-south1")
  .auth.user()
  .onCreate(async (user) => {
    if (!user.email) {
      console.error("new user without email", user);
      return;
    }
   await http.post('',user); 
  });
