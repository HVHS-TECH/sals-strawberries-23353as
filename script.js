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

    const age =
    document.getElementById("age").value;


  // Get logged-in user
  let user = firebase.auth().currentUser;

  // Make sure user is logged in
  if (!user) {

    alert("Please log in first.");
    return;

  }

  if (!name || !favoriteFruit || !fruitQuantity || !age) {

    alert("Please fill all the boxes.");
    return;

  }

  let userID = user.uid;
  let userImage = user.photoURL;

  console.log(userID);

  // Save data using UID as the key
  firebase.database().ref("fruitForms/" + userID).set({

    name: name,
    favoriteFruit: favoriteFruit,
    fruitQuantity: fruitQuantity,
    age: age

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

      document.getElementById("userPfp").src = user.photoURL;

    } else {

      console.log("Not logged in");

      var provider =
        new firebase.auth.GoogleAuthProvider();

      provider.addScope('profile');
      provider.addScope('email');

      firebase.auth()
        .signInWithPopup(provider)
        .then(function(result) {

          var user = result.user;

          console.log(user);

          document.getElementById("userPfp").src = user.photoURL;

        })
        .catch(function(error) {
          console.log(error);
        });
    }
  });
}

function sendEmail() {

  document.getElementById("reviewSection").style.display = "none";

  let user = firebase.auth().currentUser;

  if (!user) {
    alert("Please log in first.");
    return;
  }

  let userID = user.uid;
  let email = user.email;

  // Read data from Firebase
  firebase.database()
    .ref("fruitForms/" + userID)
    .once("value")
    .then((snapshot) => {

      const data = snapshot.val();

      if (!data) {
        alert("No form data found in database.");
        return;
      }

      const name = data.name;
      const favoriteFruit = data.favoriteFruit;
      const fruitQuantity = data.fruitQuantity;

      document.getElementById('emailMessage').innerHTML = `

        <div>
          <p>To: ${email}</p>
          <p>From: Sal's Strawberry Saloon</p>

          <p>Hello, ${name}</p>

          <p>
            This is Sal's Strawberry Saloon,
            reaching out about your car's extended insurance policy.
          </p>

          <p>
            Also, we are offering a deal on your favorite fruit:
            ${favoriteFruit}
          </p>

          <p>
            You can get ${fruitQuantity} servings per week
            for 27.3% more!
          </p>

          <p>
            Best regards,<br>
            Sal's Strawberry Saloon
          </p>
        </div>

      `;

    })
    .catch((error) => {
      console.log(error);
    });
}

function reviews() {

  let user = firebase.auth().currentUser;

  if (!user) {
    alert("Please log in first.");
    return;
  }

  const reviewText =
    document.getElementById("reviewText").value;

  if (!reviewText) {
    alert("Please write a review.");
    return;
  }

  firebase.database().ref("reviews").push({

    name: user.displayName,
    review: reviewText,
    profilePicture: user.photoURL

  });

  document.getElementById("reviewText").value = "";

  // SHOW reviews immediately
  document.getElementById("reviewSection").style.display = "block";

  loadReviews();

}

function loadReviews() {

  firebase.database()
    .ref("reviews")
    .once("value")
    .then((snapshot) => {

      const data = snapshot.val();

      let html = "";

      for (let id in data) {

        let review = data[id];

        html += `
          <div class="reviewCard">
            <img src="${review.profilePicture}" width="50">
            <h3>${review.name}</h3>
            <p>${review.review}</p>
          </div>
        `;

      }

      document.getElementById("reviewsContainer").innerHTML = html;

    });

}

function showReviews() {


  document.getElementById("emailMessage").innerHTML = "";


  document.getElementById("reviewSection").style.display =

  document.getElementById("statusMessage").innerText = "";


  loadReviews();

}