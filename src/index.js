const toolbarEl = document.getElementById('toolbar')
const designAreaEl = document.getElementById('designArea')
const tbButtonEl = document.getElementById('tbButton')
const tbDebugEl = document.getElementById('tbDebug')
const tbSourceEl = document.getElementById('tbSource')
const svgDesignArea = document.getElementById('svg')

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

// _TODO_ Melhorar o algorítmo da função makeElementDraggable.
function makeElementDraggable(target, button) {
  let pos1 = 0, pos2 = 0, firstX = 0, firstY = 0
  if (target) {
    target.onmousedown = mouseDown
  } else {
    throw 'makeElementDraggable: Invalid element.'
  }

  function mouseDown(event) {
    if (isResizing) return;

    event = event || designAreaEl.event
    event.preventDefault()

    firstX = event.clientX - target.offsetLeft
    firstY = (event.clientY - toolbarHeight) - target.offsetTop

    designAreaEl.onmouseup = stopDragging
    designAreaEl.onmousemove = startDragging
  }

  function startDragging(event) {
    event = event || designAreaEl.event
    event.preventDefault()
    let clientY = event.clientY - toolbarHeight

    target.style.top = fitToGrid(clientY - firstY) + "px";
    target.style.left = fitToGrid(event.clientX - firstX) + "px";
    button.style.top = fitToGrid(clientY - firstY) + "px";
    button.style.left = fitToGrid(event.clientX - firstX) + "px";
  }

  function stopDragging() {
    designAreaEl.onmouseup = null
    designAreaEl.onmousemove = null
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
svgDesignArea.addEventListener('mousedown', mouseDownEvent => {
  svgDesignArea.onmousemove = performResize
  svgDesignArea.onmouseup = stopResize

  svgDesignArea.resizable = document.querySelector('.resizable')
  svgDesignArea.resizable.initialHeight = svgDesignArea.resizable.getBoundingClientRect().height

  // Calcula posição inicial do ponteiro do mouse dentro do elemento SVG.
  svgDesignArea.initialMouseX = mouseDownEvent.clientX - svgDesignArea.getBoundingClientRect().left
  svgDesignArea.initialMouseY = mouseDownEvent.clientY - svgDesignArea.getBoundingClientRect().top

  svgDesignArea.currentElement = mouseDownEvent.target

  let diff = 0
  let newHeight = 0
  let cssClass = null

  function performResize(mouseMoveEvent) {
    cssClass = svgDesignArea.currentElement.classList
    svgDesignArea.currentMouseY = mouseMoveEvent.clientY - svgDesignArea.getBoundingClientRect().top

    if (cssClass.contains('resizer')) {
      switch (cssClass[1]) {
        case 'north':
          break;
        case 'northwest':
          break;
        case 'west':
          break;
        case 'southwest':
          break;
        case 'south':
          diff = svgDesignArea.currentMouseY - svgDesignArea.initialMouseY
          newHeight = svgDesignArea.resizable.initialHeight + diff
          svgDesignArea.resizable.setAttribute('height', newHeight)
          break;
        case 'southeast':
          break;
        case 'east':
          break;
        case 'northeast':
          break;
      }
    }
    else if (cssClass.contains('resizable')) {
      console.log('center')
    }
  }

  function stopResize(mouseUpEvent) {
    svgDesignArea.onmousemove = null
    svgDesignArea.onmouseup = null
  }
})

tbDebugEl.addEventListener('click', () => {
  let resizable = document.querySelector('.resizable')
  let resizers = document.querySelectorAll('.resizer')
  let initialClientX = 0
  let initialClientY = 0

  resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', event => {
      console.log('mousedown')
      initialClientX = event.clientX
      initialClientY = event.clientY
      resizable.initialX = Number(resizable.getAttribute('x'))
      resizable.initialY = Number(resizable.getAttribute('y'))
      resizable.initialWidth = Number(resizable.getAttribute('width'))
      resizable.initialHeight = Number(resizable.getAttribute('height'))
      resizable.xPlusWidth = resizable.initialX + resizable.initialWidth
      resizable.yPlusHeight = resizable.initialY + resizable.initialHeight

      // alert([
      //   `left: ${resizable.getBoundingClientRect().left}`, // Posição em relação à viewport.
      //   `top: ${resizable.getBoundingClientRect().top}`,
      //   `width: ${resizable.getBoundingClientRect().width}`,
      //   `height: ${resizable.getBoundingClientRect().height}`,
      //   `x: ${resizable.getAttribute('x')}`,
      //   `y: ${resizable.getAttribute('y')}`,
      //   `translateX: ${resizable.transform.baseVal.getItem(0).matrix.e}`,
      //   `translateY: ${resizable.transform.baseVal.getItem(0).matrix.f}`,
      // ].join('\n'))

      window.onmousemove = performResize
      window.onmouseup = stopResize
    })

    function performResize(event) {
      console.info(resizer.classList)
    }

    function stopResize() {
      window.onmousemove = null
      window.onmouseup = null
    }
  })
})

tbButtonEl.addEventListener('click', () => {
  let button = document.createElement('BUTTON')
  button.appendChild(document.createTextNode('Button1'))
  button.setAttribute('id', 'button1')
  //button.setAttribute('onclick', 'function button1Click(){alert("bar")} button1Click()')

  // button.style.position = 'absolute'
  // button.style.height = '24px'
  // button.style.width = '72px'
  // button.style.top = '48px'
  // button.style.left = '48px'
  // button.style.color = 'red'
  // button.style.fontWeight = 'bold'

  With(button.style).Do({
    position: 'absolute',
    height: '24px',
    width: '72px',
    top: '48px',
    left: '48px',
    color: 'red',
    fontWeight: 'bold'
  })

  makeElementDraggable(document.querySelector('.resizers'), button)
  makeElementResizable(button)

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

//----------------------------------------------------------//

let temp = 0
/*Make resizable div by Hung Nguyen*/
function makeElementResizable(target) {
  //const target = document.querySelector(resizable);
  const resizers = document.querySelectorAll('.resizer_')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;

  let leftPlusWidth = 0
  let topPlusHeight = 0
  for (let i = 0;i < resizers.length; i++) {
    const currentResizer = resizers[i];
    currentResizer.addEventListener('mousedown', function(event) {
      isResizing = true

      event.preventDefault()
      toolbarHeight = pixeledValueToInt(toolbarEl, 'height')
      original_x = target.getBoundingClientRect().left;
      original_y = target.getBoundingClientRect().top;
      original_mouse_x = event.clientX;
      original_mouse_y = event.clientY;

      original_width = pixeledValueToInt(target, 'width')
      original_height = pixeledValueToInt(target, 'height')
      leftPlusWidth = target.offsetLeft + original_width
      topPlusHeight = target.offsetTop + original_height

      window.onmouseup = stopResize
      window.onmousemove = resize

      //currentResizer.style.backgroundColor = 'red'
    })
    
    function resize(e) {
      if (currentResizer.classList.contains('bottom-right')) {
        const width = fitToGrid(original_width + (event.clientX - original_mouse_x))
        const height = fitToGrid(original_height + (event.clientY - original_mouse_y))

        if (width > minimum_size) {
          target.style.width = width + 'px'
          currentResizer.parentNode.style.width = width + 'px'
        }

        if (height > minimum_size) {
          target.style.height = height + 'px'
          currentResizer.parentNode.style.height = height + 'px'
        }
      }
      else if (currentResizer.classList.contains('bottom-left')) {
        const left = fitToGrid(original_x + (event.clientX - original_mouse_x))
        const height = fitToGrid(original_height + (event.clientY - original_mouse_y))
        const width = leftPlusWidth - left

        if (height > minimum_size) {
          target.style.height = height + 'px'
          currentResizer.parentNode.style.height = height + 'px'
        }

        if (width > minimum_size) {
            target.style.left = left + 'px'
            currentResizer.parentNode.style.left = left + 'px'
            
            target.style.width = width + 'px'
            currentResizer.parentNode.style.width = width + 'px'
        }
      }
      else if (currentResizer.classList.contains('top-right')) {
        const top = fitToGrid(original_y + (event.clientY - original_mouse_y) - toolbarHeight)
        const width = fitToGrid(original_width + (event.clientX - original_mouse_x))
        const height = topPlusHeight - top

        if (width > minimum_size) {
          target.style.width = width + 'px'
          currentResizer.parentNode.style.width = width + 'px'
        }

        if (height > minimum_size) {
          target.style.height = height + 'px'
          target.style.top = top + 'px'

          currentResizer.parentNode.style.height = height + 'px'
          currentResizer.parentNode.style.top = top + 'px'
        }
      }
      else if (currentResizer.classList.contains('top-left')) {
        const top = fitToGrid(original_y + (event.clientY - original_mouse_y) - toolbarHeight)
        const left = fitToGrid(original_x + (event.clientX - original_mouse_x))

        const width = leftPlusWidth - left
        const height = topPlusHeight - top

        if (width > minimum_size) {
          target.style.width = width + 'px'
          target.style.left = left + 'px'

          currentResizer.parentNode.style.width = width + 'px'
          currentResizer.parentNode.style.left = left + 'px'
        }

        if (height > minimum_size) {
          target.style.height = height + 'px'
          target.style.top = top + 'px'

          currentResizer.parentNode.style.height = height + 'px'
          currentResizer.parentNode.style.top = top + 'px'
        }
      }
    }
    
    function stopResize() {
      isResizing = false

      window.onmouseup = null
      window.onmousemove = null
    }
  }
}
