function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

(() => {
  const html = () => {
    return (
      `<button @onClick="signInWithGoogle">Sign In with Google</button><div id="buttonDiv"></div>`
    )
  }

  AbacusLib.createWebComponent('home-screen', {
    dontUseShadowDOM: true,

    html,
    css: `
      :host {
        min-height: 0;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        grid-row-gap: 6px;
      }
    `,
    methods: {
      signInWithGoogle() {
        gapi.signin2.go('signin2');
      },
    },
    plugins: ['GsiClient'],
    async onAfterFirstRender(ctx) {
      await ctx.plugins.GsiClient;

      function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
      }

      google.accounts.id.initialize({
        client_id: "183599533407-e099omkc3ocp2snjbkhpv0ofa36pn6v6.apps.googleusercontent.com",
        callback: handleCredentialResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }  // customization attributes
      );
      google.accounts.id.prompt(); // also display the One Tap dialog
    },
  })
})();