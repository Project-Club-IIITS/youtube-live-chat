const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";
let GoogleAuth;

function init() {
  gapi.load("client:auth2", function () {
    let client_id = document
      .querySelector("meta[name='GOOGLE_CLIENT_ID']")
      .getAttribute("content");
    let api_key = document
      .querySelector("meta[name='GOOGLE_API_KEY']")
      .getAttribute("content");
    gapi.client
      .init({
        apiKey: api_key,
        clientId: client_id,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
        ],
        scope: SCOPE,
      })
      .then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
      })
      .catch((error) => {
        console.error(error);
        document.getElementById("auth-error").innerHTML =
          "Invalid API Key or Client ID";
        document.getElementById("auth").disabled = "true";
      });
  });

  document.getElementById("auth").addEventListener("click", handleAuthClick);
  initApi();
}

function updateSigninStatus() {
  if (!GoogleAuth) {
    return;
  }
  let user = GoogleAuth.currentUser.get();
  let isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    const profile = user.getBasicProfile();
    document.getElementById("auth").innerHTML =
      profile.getName() + " (Sign Out)";
    listStreams();
  } else {
    document.getElementById("auth").innerHTML = "Sign In";
    clearData();
    clearStreams();
    clearComments();
  }
}

function handleAuthClick() {
  document.getElementById("auth-error").innerHTML = "";
  if (!GoogleAuth) {
    document.getElementById(
      "auth-error"
    ).innerHTML = `Authorization Failed. ${error.error}`;
    return;
  }
  if (GoogleAuth.isSignedIn.get()) {
    GoogleAuth.signOut();
  } else {
    GoogleAuth.signIn({
      scope: SCOPE,
    }).catch(function (error) {
      console.error(error);
      document.getElementById(
        "auth-error"
      ).innerHTML = `Authorization Failed. ${error.error}`;
    });
  }
}
