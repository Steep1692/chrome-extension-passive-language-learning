(() => {
  const html = ({ t, state }) => {
    let $children

    if (state.profile) {
      $children = (
        `<div class="profile-view">
          <div class="profile-avatar-wrapper">
            <img src="${state.profile.picture}" alt="avatar">
          </div>
          <pll-typography variant="subtitle" text="${state.profile.name}"></pll-typography>
          <pll-typography variant="body" text="${state.profile.email}"></pll-typography>
        </div>`
      )
    } else {
      $children = (
        `<button is="pll-button" data-color="light" data-listen-on-Click="googleO2auth">
            <img src="/popup/app/components/home-screen/google.svg" alt="">
            ${t.signInWithGoogle}
        </button>`
      )
    }

    return (
      `<pll-typography variant="title" text="${t.title}"></pll-typography>
      ${$children}
      <pll-typography variant="title" text="TODO: Add here ability to add done sets to the dictionary"></pll-typography>`
    )
  }

  const translatesEN = {
    title: 'Home page',
    signInWithGoogle: 'Sign In with Google',
  }

  const translatesUK = {
    title: 'Домашня сторінка',
    signInWithGoogle: 'Увійти за допомогою Google',
  }

  const translatesZH = {
    title: '主页',
    signInWithGoogle: '用Google登录',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('home-screen', {
    translates,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      async googleO2auth(ctx) {
        const GoogleServices = await ctx.services.Google
        const accessToken = await GoogleServices.authorize()
        if (accessToken) {
          const profile = await GoogleServices.getProfile(accessToken)
          ctx.stateMutators.setProfile(profile)
        }
        return !!accessToken
      }
    },

    services: ['Google:module'],
    onAfterFirstRender(ctx) {
      // ctx.methods.googleO2auth(ctx)
    },
  })
})()