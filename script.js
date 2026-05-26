console.log("Running Sal's Strawberries");

// -----------------------------------
// Form Function
// -----------------------------------
let selectedRating = -1;

function writeForm() {

  const name =
    document.getElementById("name").value;

  const favoriteFruit =
    document.getElementById("fruits").value;

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


      document.getElementById("userPfp").src = user.photoURL;

    } else {

      console.log("Not logged in");

      var provider =
        new firebase.auth.GoogleAuthProvider();

      provider.addScope('profile');
      provider.addScope('email');

      firebase.auth()
        .signInWithPopup(provider)
        .then(function (result) {

          var user = result.user;

          console.log(user);

          document.getElementById("userPfp").src = user.photoURL;

        })
        .catch(function (error) {
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
  document.getElementById("reviewText").value.trim();

if (!reviewText) {
  alert("Please write a review.");
  return;
}

// 200 character limit
if (reviewText.length > 200) {
  alert("Reviews must be 200 characters or less.");
  return;
}

  if (selectedRating < 0) {
    alert("Please choose a strawberry rating.");
    return;
  }

  firebase.database().ref("reviews").push({

    name: user.displayName,
    review: reviewText,
    profilePicture: user.photoURL,


    rating: selectedRating + 1

  });

  document.getElementById("reviewText").value = "";


  selectedRating = -1;

  document.querySelectorAll(".berry").forEach((berry) => {
    berry.src = "IMAGES/BLACK STRAWBERRIES.png";
  });

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

        // Create strawberry rating display
        let strawberries = "";

        for (let i = 0; i < review.rating; i++) {
          strawberries += `
            <img 
              src="IMAGES/STRAWBERRIES.png" 
              width="20"
            >
          `;
        }

        html += `
          <div class="reviewCard">

            <img 
              src="${review.profilePicture}" 
              width="50"
            >

            <div>
              ${strawberries}
            </div>

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

  document.getElementById("reviewSection").style.display = "block";

  document.getElementById("statusMessage").innerText = "";

  loadReviews();

}

function fruitRanks() {

  firebase.database().ref("fruitForms").once("value")
    .then((snapshot) => {

      const data = snapshot.val();

      if (!data) {
        alert("No data found.");
        return;
      }

      let fruitCounts = {};

      // Count fruits
      for (let userID in data) {
        let fruit = data[userID].favoriteFruit;

        if (fruit) {
          fruitCounts[fruit] = (fruitCounts[fruit] || 0) + 1;
        }
      }

      // Convert to array and sort
      let sortedFruits = Object.entries(fruitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Build HTML
      let html = "<h2>Top 5 Fruits</h2>";

      sortedFruits.forEach(([fruit, count], index) => {
        html += `<p>${index + 1}. ${fruit} - ${count} vote(s)</p>`;
      });

      // Display it
      document.getElementById("emailMessage").innerHTML = html;
      document.getElementById("reviewSection").style.display = "none";
      document.getElementById("statusMessage").innerText = "";

    })
    .catch((error) => {
      console.log(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {

  const reviewBox =
  document.getElementById("reviewText");

const charCount =
  document.getElementById("charCount");

reviewBox.addEventListener("input", () => {

  charCount.innerText =
    `${reviewBox.value.length} / 200 characters`;

});

  const berries = document.querySelectorAll(".berry");

  berries.forEach((berry, index) => {

    berry.addEventListener("mouseover", () => {

      berries.forEach((b, i) => {

        if (i <= index) {

          b.src = "IMAGES/PINK STRAWBERRIES.png";

        } else {

          b.src = "IMAGES/BLACK STRAWBERRIES.png";

        }

      });

    });

    berry.addEventListener("click", () => {

      selectedRating = index;

      berries.forEach((b, i) => {

        if (i <= index) {

          b.src = "IMAGES/STRAWBERRIES.png";

        } else {

          b.src = "IMAGES/BLACK STRAWBERRIES.png";

        }

      });

    });

  });


  document.getElementById("strawberryRating")
    .addEventListener("mouseleave", () => {

      berries.forEach((b, i) => {

        if (i <= selectedRating) {

          b.src = "IMAGES/STRAWBERRIES.png";

        } else {

          b.src = "IMAGES/BLACK STRAWBERRIES.png";

        }

      });

    });

});