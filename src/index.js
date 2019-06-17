const toolbarEl = document.getElementById('toolbar')
const designAreaEl = document.getElementById('design-area')
const tbButtonEl = document.getElementById('tbButton')
const tbSourceEl = document.getElementById('tbSource')
const elementResizers = document.getElementById('element-resizers')
const mockWinResizers = document.querySelector('.mock-window-resizers')

let toolbarHeight = 50

let body = document.getElementsByTagName('body')[0]
body.addEventListener('click', event => {
  document.title = [
    `${event.target}`,
    `${event.target.nodeName}`,
    `${event.target.getAttribute('class')}`
  ].join(', ')
})

function If(expression) {
  return {
    Then: callbackTrue => {
      return {
        Else: callbackFalse => {
          if (expression) {
            callbackTrue()
          } else {
            callbackFalse()
          }
        }
      }
    }
  }
}

// If(2 + 2 === 4).Then(() => {
//   alert('Ok!')
// }).Else(() => {
//   alert('It\'s not ok!')
// })

// _SNIPPET_ Semelhante ao 'with..do' do pascal.
function With(destination) {
  return {
    Do: source => {
      Object.keys(source).forEach(property => {
        destination[property] = source[property]
      })
    }
  }
}

// _SNIPPET_ Converter um valor '50px' em 50, por exemplo.
function pixeledValueToInt(element, cssProperty) {
  let propValue = getComputedStyle(element, null).getPropertyValue(cssProperty)
  return parseInt(propValue.replace('px', ''))
}

let isResizing = false

function fitToGrid(coordinate, cell) {
  cell = cell || 8
  const half = cell / 2
  if (coordinate <= cell) {
    if (coordinate <= half)
      return 0
    else
      return cell
  } else {
    let remainder = coordinate % cell
    if (remainder <= half)
      return Math.floor(coordinate/cell) * cell
    else
      return Math.floor(coordinate/cell) * cell + cell
  }
}

// _SNIPPET_ window.onerror
window.onerror = (msg, url, line, column, obj) => {
  let fullMsg = [
    `Oops! Sorry about that.\n`,
    `Error: ${msg}`,
    `Script: ${url}`,
    `Line: ${line}`,
    `Column: ${column}`,
    `StackTrace: ${obj}`
  ].join('\n')

  alert(fullMsg)
}

tbSourceEl.addEventListener('click', () => {
  alert(designAreaEl.innerHTML)
})

//http://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
if (elementResizers)
  elementResizers.addEventListener('mousedown', mouseDownEvent => {
    elementResizers.onmousemove = performResize
    elementResizers.onmouseup = stopResize

    elementResizers.resizable = document.querySelector('.resizable')
    elementResizers.resizable.initialWidth = elementResizers.resizable.getBoundingClientRect().width
    elementResizers.resizable.initialHeight = elementResizers.resizable.getBoundingClientRect().height
    elementResizers.resizable.initialX = Number(elementResizers.resizable.getAttribute('x'))
    elementResizers.resizable.initialY = Number(elementResizers.resizable.getAttribute('y'))

    // Calcula posição inicial do ponteiro do mouse dentro do elemento SVG.
    elementResizers.initialMouseX = mouseDownEvent.clientX - elementResizers.getBoundingClientRect().left
    elementResizers.initialMouseY = mouseDownEvent.clientY - elementResizers.getBoundingClientRect().top

    elementResizers.currentElement = mouseDownEvent.target

    elementResizers.resizers = document.querySelectorAll('.element-resizer')

    let minimunSize = 20

    let newHeight
    let newWidth
    let newX
    let newY
    let cssClass

    let resizableX
    let resizableY
    let resizableWidth
    let resizableHeight

    let distanceInitialXtoInitialMouseX
    let distanceInitialYtoInitialMouseY

    let diffMouseX
    let diffMouseY

    let tmp = 5 // 0 = outside, 5 = middle, 9 = inside

    let snapEnabled = true

    function performResize(mouseMoveEvent) {
      cssClass = elementResizers.currentElement.classList
      elementResizers.currentMouseX = mouseMoveEvent.clientX - elementResizers.getBoundingClientRect().left
      elementResizers.currentMouseY = mouseMoveEvent.clientY - elementResizers.getBoundingClientRect().top
      distanceInitialXtoInitialMouseX = elementResizers.resizable.initialX - elementResizers.initialMouseX
      distanceInitialYtoInitialMouseY = elementResizers.resizable.initialY - elementResizers.initialMouseY
      diffMouseX = elementResizers.initialMouseX - elementResizers.currentMouseX
      diffMouseY = elementResizers.initialMouseY - elementResizers.currentMouseY

      // Os algorítmos seguintes permitem redimensionar o resizable.
      function calcNewWidthEast() {
        newWidth = elementResizers.currentMouseX - elementResizers.initialMouseX
        newWidth += elementResizers.resizable.initialWidth
        newWidth = snapEnabled ? fitToGrid(newWidth) : newWidth
      }

      function calcNewHeightSouth() {
        newHeight = elementResizers.currentMouseY - elementResizers.initialMouseY
        newHeight += elementResizers.resizable.initialHeight
        newHeight = snapEnabled ? fitToGrid(newHeight) : newHeight
      }

      function calcNewYandHeightNorth() {
        newHeight = diffMouseY
        if (snapEnabled) {
          newY = fitToGrid(elementResizers.currentMouseY)
          newHeight = elementResizers.resizable.initialY - newY
        } else {
          newY = elementResizers.currentMouseY + distanceInitialYtoInitialMouseY
        }
        newHeight = elementResizers.resizable.initialHeight + newHeight
      }

      function calcNewXandWidthWest() {
        newWidth = diffMouseX
        if (snapEnabled) {
          newX = fitToGrid(elementResizers.currentMouseX)
          newWidth = elementResizers.resizable.initialX - newX
        } else {
          newX = elementResizers.currentMouseX + distanceInitialXtoInitialMouseX
        }
        newWidth = elementResizers.resizable.initialWidth + newWidth
      }

      function setNewYandHeight() {
        if (newHeight > minimunSize) {
          elementResizers.resizable.setAttribute('height', newHeight)
          elementResizers.resizable.setAttribute('y', newY)
        }
      }

      function setNewXandWidth() {
        if (newWidth > minimunSize) {
          elementResizers.resizable.setAttribute('width', newWidth)
          elementResizers.resizable.setAttribute('x', newX)
        }
      }

      function setNewHeight() {
        if (newHeight > minimunSize)
          elementResizers.resizable.setAttribute('height', newHeight)
      }

      function setNewWidth() {
        if (newWidth > minimunSize)
          elementResizers.resizable.setAttribute('width', newWidth)
      }

      if (cssClass.contains('element-resizer')) {
        switch (cssClass[1]) {
          case 'north':
            calcNewYandHeightNorth()
            setNewYandHeight()
            break;
          case 'northwest':
            calcNewXandWidthWest()
            calcNewYandHeightNorth()
            setNewXandWidth()
            setNewYandHeight()
            break;
          case 'west':
            calcNewXandWidthWest()
            setNewXandWidth()
            break;
          case 'southwest':
            calcNewXandWidthWest()
            calcNewHeightSouth()
            setNewXandWidth()
            setNewHeight()
            break;
          case 'south':
            calcNewHeightSouth()
            setNewHeight()
            break;
          case 'southeast':
            calcNewWidthEast()
            calcNewHeightSouth()
            setNewWidth()
            setNewHeight()
            break;
          case 'east':
            calcNewWidthEast()
            setNewWidth()
            break;
          case 'northeast':
            calcNewWidthEast()
            calcNewYandHeightNorth()
            setNewWidth()
            setNewYandHeight()
            break;
        }
      }
      // O algorítmo abaixo permite arrastar o resizable.
      else if (cssClass.contains('resizable')) {
        newX = elementResizers.currentMouseX - elementResizers.initialMouseX
        newX += elementResizers.resizable.initialX

        newY = elementResizers.currentMouseY - elementResizers.initialMouseY
        newY += elementResizers.resizable.initialY

        elementResizers.resizable.setAttribute('x', snapEnabled ? fitToGrid(newX) : newX)
        elementResizers.resizable.setAttribute('y', snapEnabled ? fitToGrid(newY) : newY)
      }

      // Reposiciona os resizers de acordo com as novas dimensões do mockWin.
      elementResizers.resizers.forEach(resizer => {
        cssClass = resizer.classList
        resizableX = Number(elementResizers.resizable.getAttribute('x'))
        resizableY = Number(elementResizers.resizable.getAttribute('y'))
        resizableWidth = elementResizers.resizable.getBoundingClientRect().width
        resizableHeight = elementResizers.resizable.getBoundingClientRect().height

        switch (cssClass[1]) {
          case 'northwest': // ok
            resizer.setAttribute('x', resizableX - 9 + tmp)
            resizer.setAttribute('y', resizableY - 9 + tmp)
            break;
          case 'north': // ok
            resizer.setAttribute('x', resizableX + Math.floor(resizableWidth / 2) - 4)
            resizer.setAttribute('y', resizableY - 9 + tmp)
            break;
          case 'northeast':
            resizer.setAttribute('x', resizableX + resizableWidth + 1 - tmp)
            resizer.setAttribute('y', resizableY - 9 + tmp)
            break;
          case 'east':
            resizer.setAttribute('x', resizableX + resizableWidth + 1 - tmp)
            resizer.setAttribute('y', resizableY + Math.floor(resizableHeight / 2) - 4)
            break;
          case 'southeast':
            resizer.setAttribute('x', resizableX + resizableWidth + 1 - tmp)
            resizer.setAttribute('y', resizableY + resizableHeight + 1 - tmp)
            break;
          case 'south':
            resizer.setAttribute('x', resizableX + Math.floor(resizableWidth / 2) - 4)
            resizer.setAttribute('y', resizableY + resizableHeight + 1 - tmp)
            break;
          case 'southwest':
            resizer.setAttribute('x', resizableX - 9 + tmp)
            resizer.setAttribute('y', resizableY + resizableHeight + 1 - tmp)
            break;
          case 'west': // ok
            resizer.setAttribute('x', resizableX - 9 + tmp)
            resizer.setAttribute('y', resizableY + Math.floor(resizableHeight / 2) - 4)
            break;
        }
      })
    }

    function stopResize() {
      elementResizers.onmousemove = null
      elementResizers.onmouseup = null
    }
  })

mockWinResizers.addEventListener('mousedown', mouseDownEvent => {
  mockWinResizers.onmousemove = performResize
  mockWinResizers.onmouseup = stopResize

  mockWinResizers.mockWin = document.querySelector('.mock-window')
  mockWinResizers.mockWin.initialWidth = mockWinResizers.mockWin.getBoundingClientRect().width
  mockWinResizers.mockWin.initialHeight = mockWinResizers.mockWin.getBoundingClientRect().height

  // Calcula posição inicial do ponteiro do mouse dentro do elemento SVG.
  mockWinResizers.initialMouseX = mouseDownEvent.clientX - mockWinResizers.getBoundingClientRect().left
  mockWinResizers.initialMouseY = mouseDownEvent.clientY - mockWinResizers.getBoundingClientRect().top

  mockWinResizers.currentElement = mouseDownEvent.target

  mockWinResizers.resizers = document.querySelectorAll('.mock-window-resizer')

  let minimunSize = 20

  let newHeight
  let newWidth
  let newX
  let newY
  let cssClass

  let mockWinX
  let mockWinY
  let mockWinWidth
  let mockWinHeight

  let resizerSize = 8

  let snapEnabled = true

  function performResize(mouseMoveEvent) {
    cssClass = mockWinResizers.currentElement.classList
    mockWinResizers.currentMouseX = mouseMoveEvent.clientX - mockWinResizers.getBoundingClientRect().left
    mockWinResizers.currentMouseY = mouseMoveEvent.clientY - mockWinResizers.getBoundingClientRect().top

    // Os algorítmos seguintes permitem redimensionar o mockWin.
    function calcNewWidthEast() {
      newWidth = mockWinResizers.currentMouseX - mockWinResizers.initialMouseX
      newWidth += mockWinResizers.mockWin.initialWidth
      newWidth = snapEnabled ? fitToGrid(newWidth) : newWidth
    }

    function calcNewHeightSouth() {
      newHeight = mockWinResizers.currentMouseY - mockWinResizers.initialMouseY
      newHeight += mockWinResizers.mockWin.initialHeight
      newHeight = snapEnabled ? fitToGrid(newHeight) : newHeight
    }

    function setNewHeight() {
      if (newHeight > minimunSize)
        mockWinResizers.mockWin.setAttribute('height', newHeight)
    }

    function setNewWidth() {
      if (newWidth > minimunSize)
        mockWinResizers.mockWin.setAttribute('width', newWidth)
    }

    if (cssClass.contains('mock-window-resizer')) {
      switch (cssClass[1]) {
        case 'south':
          calcNewHeightSouth()
          setNewHeight()
          break;
        case 'southeast':
          calcNewWidthEast()
          calcNewHeightSouth()
          setNewWidth()
          setNewHeight()
          break;
        case 'east':
          calcNewWidthEast()
          setNewWidth()
          break;
      }
    }

    // Reposiciona os resizers de acordo com as novas dimensões do mockWin.
    mockWinResizers.resizers.forEach(resizer => {
      cssClass = resizer.classList
      mockWinX = Number(mockWinResizers.mockWin.getAttribute('x'))
      mockWinY = Number(mockWinResizers.mockWin.getAttribute('y'))
      mockWinWidth = mockWinResizers.mockWin.getBoundingClientRect().width
      mockWinHeight = mockWinResizers.mockWin.getBoundingClientRect().height

      switch (cssClass[1]) {
        case 'north':
          newX = mockWinX + Math.floor(mockWinWidth / 2) - 4
          resizer.setAttribute('x', newX)
          resizer.setAttribute('y', 0)
          break;
        case 'northeast':
          resizer.setAttribute('x', mockWinWidth + 10)
          resizer.setAttribute('y', 0)
          break;
        case 'east':
          newY = mockWinY + Math.floor(mockWinHeight / 2) - 4
          resizer.setAttribute('x', mockWinWidth + 10)
          resizer.setAttribute('y', newY)
          break;
        case 'southeast':
          resizer.setAttribute('x', mockWinWidth + 10)
          resizer.setAttribute('y', mockWinHeight + 10)
          break;
        case 'south':
          newX = mockWinX + Math.floor(mockWinWidth / 2) - 4
          resizer.setAttribute('x', newX)
          resizer.setAttribute('y', mockWinHeight + 10)
          break;
        case 'southwest':
          resizer.setAttribute('x', 0)
          resizer.setAttribute('y', mockWinHeight + 10)
          break;
        case 'west':
          newY = mockWinY + Math.floor(mockWinHeight / 2) - 4
          resizer.setAttribute('x', 0)
          resizer.setAttribute('y', newY)
          break;
      }
    })
  }

  function stopResize() {
    mockWinResizers.onmousemove = null
    mockWinResizers.onmouseup = null
  }
})

tbButtonEl.addEventListener('click', () => {
  let button = document.createElement('BUTTON')
  button.appendChild(document.createTextNode('Button1'))
  button.setAttribute('id', 'button1')
  //button.setAttribute('onclick', 'function button1Click(){alert("bar")} button1Click()')

  With(button.style).Do({
    position: 'absolute',
    height: '24px',
    width: '72px',
    top: '48px',
    left: '48px',
    color: 'red',
    fontWeight: 'bold'
  })

  //document.querySelector('.resizers').style.visibility = 'visible'
  designAreaEl.appendChild(button)

  //https://stackoverflow.com/questions/10349811/how-to-manipulate-translate-transforms-on-a-svg-element-with-javascript-in-chrom
  document.title = document.getElementById('foo').setAttribute('transform', 'translate(100, 100)')

  // document.getElementById('svg').setAttribute('viewBox', '0 0 200 200')
  // document.getElementById('svg').setAttribute('width', '200')
  // document.getElementById('svg').setAttribute('height', '200')

  // document.addEventListener('mousemove', event => {
  //   let fullText = [
  //     `client: ${event.clientX}, ${event.clientY}`,
  //     `page: ${event.pageX}, ${event.pageY}`,
  //     `offset: ${event.offsetX}, ${event.offsetY}`,
  //     `movement: ${event.movementX}, ${event.movementY}`,
  //     `screen: ${event.screenX}, ${event.screenY}`,
  //     `button: ${event.button}`,
  //     `buttons: ${event.buttons}`,
  //     `altKey: ${event.altKey}`,
  //     `shiftKey: ${event.shiftKey}`,
  //     `region: ${event.region}`,
  //     `relatedTarget: ${event.relatedTarget}`,
  //     `which: ${event.which}`,
  //     `metaKey: ${event.metaKey}`
  //   ].join('\n')
  //   designAreaEl.innerText = fullText
  // })

  // setTimeout(() => {
  //   document.querySelector('body').appendChild(document.getElementById('foo').firstElementChild)
  //   document.querySelector('body').removeChild(document.getElementById('foo'))
  //   alert(document.querySelector('body').innerHTML)
  // }, 5000);

  // setTimeout(() => {
  //   button.parentNode.removeChild(document.getElementById('button1'))
  // }, 5000);
})
