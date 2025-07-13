/* global Drupal */

((Drupal) => {
  Drupal.behaviors.media__video = {
    attach: () => {
      const videoPlayers = document.querySelectorAll('.media')
      if (videoPlayers.length === 0) return
      if (!Drupal?.eu_cookie_compliance?.getAcceptedCategories()) return
      const checkSocialCookie = Drupal.eu_cookie_compliance.getAcceptedCategories().includes('social_cookies')

      const showCookieAlert = (cookieAlert) => {
        cookieAlert.classList.add('is-active')
        const acceptButton = cookieAlert.querySelector('#cookie-accept')

        acceptButton.addEventListener('click', () => {
          let acceptedCookies = Drupal.eu_cookie_compliance.getAcceptedCategories()
          acceptedCookies.push('social_cookies')
          Drupal.eu_cookie_compliance.setAcceptedCategories(acceptedCookies)
          location.reload()
        })
      }

      videoPlayers.forEach((videoPlayer) => {
        const cookieAlert = videoPlayer.querySelector('.cookie-alert')
        if (!checkSocialCookie) return showCookieAlert(cookieAlert)
        const playButton = videoPlayer.querySelector('#play')
        const video = videoPlayer.querySelector('#video')
        const videoSrc = video.dataset.src
        const thumbnail = videoPlayer.querySelector('.media__video--thumbnail')

        if (!playButton || !video || !videoSrc) return

        playButton.addEventListener('click', () => {
          playButton.classList.add('is-hidden')
          thumbnail.classList.add('is-hidden')

          const iframe = document.createElement('iframe')
          iframe.setAttribute('src', videoSrc)
          iframe.src += '&autoplay=1'
          iframe.src += '&disablekb=1'
          iframe.setAttribute('frameborder', '0')
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
          iframe.setAttribute('allowfullscreen', '')
          video.appendChild(iframe)
        })
      })
    },
  }
})(Drupal, drupalSettings)
