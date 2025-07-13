import '@popperjs/core'

const remCalc = (px, base) => {
  const tempPx = `${px}`.replace('px', '')
  return (1 / base) * parseInt(tempPx) + 'rem'
}

const slideMenu = (menu) => {
  const nav = menu.querySelector('.nav')
  if (!nav) return
  const items = nav.querySelectorAll('li')
  if (items.length === 0) return
  const slideItems = Array.from(items).filter((item) =>
    item.classList.contains('dropdown')
  )
  if (slideItems.length === 0) return
  slideItems.forEach((item) => {
    const link = item.querySelector('a:first-child')
    const submenu = item.querySelector('ul')

    if (!link && !submenu) return

    const textNode = document.createTextNode(link.textContent)
    link.parentNode.replaceChild(textNode, link)
    const linkLi = document.createElement('li')
    linkLi.appendChild(link)
    const linkLiLink = linkLi.querySelector('a')
    const linkLiLinkTextNode = document.createTextNode(
      `Ga naar ${linkLiLink.textContent}`
    )
    link.parentNode.replaceChild(linkLiLinkTextNode, linkLiLink)
    submenu.insertAdjacentElement('afterbegin', linkLi)

    const back = document.createElement('li')
    const backBtn = document.createElement('button')
    backBtn.classList.add('back')
    backBtn.innerHTML = 'Terug'
    back.appendChild(backBtn)
    submenu.insertAdjacentElement('afterbegin', back)

    const toggleSubmenu = () => {
      submenu.classList.toggle('is-active')
    }

    const clickMenu = (e) => {
      e.preventDefault()
      toggleSubmenu()
      item.removeEventListener('click', clickMenu)
    }

    const goBack = (e) => {
      e.preventDefault()
      toggleSubmenu()
      setTimeout(() => {
        item.addEventListener('click', clickMenu)
      }, 300)
    }

    backBtn.addEventListener('click', goBack)
    item.addEventListener('click', clickMenu)
  })
}

const dropdownMenu = (menu) => {
  const nav = menu.querySelector('.nav')
  if (!nav) return
  const items = nav.querySelectorAll('li')
  if (items.length === 0) return
  const slideItems = Array.from(items).filter((item) =>
    item.classList.contains('dropdown')
  )
  if (slideItems.length === 0) return

  const closeOtherSubmenus = (currentItem) => {
    slideItems.forEach((item) => {
      if (item !== currentItem) {
        item.classList.remove('is-active')
        item.style.height = remCalc(68, 16)
      }
    })
  }

  slideItems.forEach((item) => {
    const btn = item.querySelector('.arrow')
    const submenu = item.querySelector('ul')
    const link = item.querySelector('a:first-child')
    const linkHeight = link.offsetHeight
    const submenuHeight = submenu.offsetHeight

    btn.addEventListener('click', () => {
      item.classList.toggle('is-active')
      if (item.classList.contains('is-active')) {
        item.style.height = remCalc(submenuHeight + linkHeight, 16)
        closeOtherSubmenus(item)
      } else {
        item.style.height = remCalc(68, 16)
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('#mobilemenu')
  const hamburger = document.querySelector('#navbar .hamburger')
  if (!menu && !hamburger) return

  hamburger.addEventListener('click', (e) => {
    e.preventDefault()
    menu.dataset.open = true
    if (menu.classList.contains('is-active')) {
      menu.dataset.open = false
    }
    hamburger.classList.toggle('is-active')
    menu.classList.toggle('is-active')
  })

  if (menu.classList.contains('slide')) {
    slideMenu(menu)
  } else if (menu.classList.contains('dropdown')) {
    dropdownMenu(menu)
  }
})
