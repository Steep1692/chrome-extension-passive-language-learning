export default {
  authorize: () => {
    let user_signed_in = false;

    const CLIENT_ID = "183599533407-4v0r6qjs8u73a46r8k5lkkubn2kbpank.apps.googleusercontent.com"
    const RESPONSE_TYPE = encodeURIComponent('token')
    const REDIRECT_URI = chrome.identity.getRedirectURL("oauth2");
    const STATE = encodeURIComponent('jsksf3')
    const SCOPE = encodeURIComponent('openid')
    const PROMPT = encodeURIComponent('consent')

    function create_oauth() {
      let auth_url = `https://accounts.google.com/o/oauth2/v2/auth?`

      var auth_params = {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'token',
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
      };

      const url = new URLSearchParams(Object.entries(auth_params));
      url.toString();
      auth_url += url;

      return auth_url;
    }

    function is_user_signedIn() {
      return user_signed_in;
    }

    if (is_user_signedIn()) {
      throw new Error('Implement case when the user is already signed in')
    } else {
      return new Promise((resolve) => {
        chrome.identity.launchWebAuthFlow({
          url: create_oauth(),
          interactive: true
        }, function (redirect_uri) {
          const params = new URLSearchParams('?' + new URL(redirect_uri).hash)
          const access_token = params.get('#access_token')
          resolve(access_token)
        })
      })
    }
  },
  getProfile: (accessToken) => {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + accessToken;

    return fetch(url).then(r => r.json()).then(r => ({
      email: r.email,
      name: r.name,
      picture: r.picture,
      locale: r.locale,
    }))
  }
}