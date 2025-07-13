/* global Drupal, jQuery */

/**
 * These scripts will run on all pages on the site.
 */

;(function ($) {
  Drupal.behaviors.global = {
    attach: function (context) {
      // Open external links in a new tab
      $('a[href^="http"], a[href^="mailto:"], .external', context)
        .filter(function () {
          const href = $(this).attr('href')
          const same_domain = href.indexOf(document.domain) != -1
          return !same_domain
        })
        .addClass('external')
        .attr({
          target: '_blank',
          rel: 'noopener',
        })
        .attr('title', 'This link will open in a new window.')

      // Add close event to drupal messages.
      const messages = document.querySelectorAll('div[data-drupal-messages]')
      if (messages.length > 0) {
        messages.forEach((message) => {
          const notification = message.querySelector('.notification')
          const close = message.querySelector('.button-message-close')
          const closeMessage = () => {
            notification.classList.remove('fade-in')
            notification.classList.add('fade-out')
            setTimeout(() => {
              notification.classList.remove('show')
            }, 300)
            close.removeEventListener('click', closeMessage)
          }
          close.addEventListener('click', closeMessage)
        })
      }
    },
  }
})(jQuery)
