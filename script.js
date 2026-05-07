console.log("Running Sal's Strawberries");

// -----------------------------------
// Form Function
// -----------------------------------

function writeForm() {

  const name =
    document.getElementById("name").value;

  const favoriteFruit =
    document.getElementById("favoriteFruit").value;

  const fruitQuantity =
    document.getElementById("fruitQuantity").value;

  // Get logged-in user
  let user = firebase.auth().currentUser;

  // Make sure user is logged in
  if (!user) {

    alert("Please log in first.");
    return;

  }

  if (!name || !favoriteFruit || !fruitQuantity) {

    alert("Please fill all the boxes.");
    return;

  }

  let userID = user.uid;

  console.log(userID);

  // Save data using UID as the key
  firebase.database().ref("fruitForms/" + userID).set({

    name: name,
    favoriteFruit: favoriteFruit,
    fruitQuantity: fruitQuantity

  });

  console.log("Data sent!");

  document.getElementById("statusMessage").innerText =
    "Form submitted!";
}
// -----------------------------------
// Firebase Login
// -----------------------------------

function fb_login() {

  firebase.auth().onAuthStateChanged((user) => {

    if (user) {

      console.log("Logged in");
      console.log(user);

    } else {

      console.log("Not logged in");

      var provider =
        new firebase.auth.GoogleAuthProvider();

      provider.addScope('profile');
      provider.addScope('email');

      firebase.auth()
        .signInWithPopup(provider)
        .then(function(result) {

          var token =
            result.credential.accessToken;

          var user = result.user;

          console.log(user);

        })
        .catch(function(error) {

          console.log(error);

        });
    }
  });
}

function sendEmail(){
  
}