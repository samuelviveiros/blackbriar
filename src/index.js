const toolbarEl = document.getElementById('toolbar')
const designAreaEl = document.getElementById('designArea')
const tbButtonEl = document.getElementById('tbButton')
const tbSourceEl = document.getElementById('tbSource')

let toolbarHeight = 50

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

tbButtonEl.addEventListener('click', () => {
  let button = document.createElement('BUTTON')
  button.appendChild(document.createTextNode('Button1'))
  button.setAttribute('id', 'button1')
  //button.setAttribute('onclick', 'function button1Click(){alert("bar")} button1Click()')
  button.style.position = 'absolute'
  button.style.height = '25px'
  button.style.width = '73px'
  button.style.top = '48px'
  button.style.left = '48px'
  button.style.color = 'red'
  button.style.fontWeight = 'bold'

  makeElementDraggable(document.querySelector('.resizers'), button)
  makeElementResizable(button)

  document.querySelector('.resizers').style.visibility = 'visible'
  designAreaEl.appendChild(button)

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
  const resizers = document.querySelectorAll('.resizer')
  const minimum_size = 20;
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;
  for (let i = 0;i < resizers.length; i++) {
    const currentResizer = resizers[i];
    currentResizer.addEventListener('mousedown', function(e) {
      isResizing = true

      e.preventDefault()
      toolbarHeight = parseFloat(getComputedStyle(toolbarEl, null).getPropertyValue('height').replace('px', ''));
      original_width = parseFloat(getComputedStyle(target, null).getPropertyValue('width').replace('px', ''));
      original_height = parseFloat(getComputedStyle(target, null).getPropertyValue('height').replace('px', ''));
      original_x = target.getBoundingClientRect().left;
      original_y = target.getBoundingClientRect().top;
      original_mouse_x = e.pageX;
      original_mouse_y = e.pageY;
      
      window.onmouseup = stopResize
      window.onmousemove = resize

      //currentResizer.style.backgroundColor = 'red'
    })
    
    function resize(e) {
      if (currentResizer.classList.contains('bottom-right')) {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y)
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
        const height = original_height + (e.pageY - original_mouse_y)
        const width = original_width - (e.pageX - original_mouse_x)
        if (height > minimum_size) {
          target.style.height = height + 'px'
          currentResizer.parentNode.style.height = height + 'px'
        }
        if (width > minimum_size) {
          
          if (temp !== fitToGrid(original_x + (e.pageX - original_mouse_x))) {
            temp = fitToGrid(original_x + (e.pageX - original_mouse_x))

            target.style.left = temp + 'px'
            currentResizer.parentNode.style.left = temp + 'px'

            // _TODO_ Melhorar esse algorítmo.
            // target.style.width = width + 'px'
            // currentResizer.parentNode.style.width = width + 'px'
            target.style.width = fitToGrid(temp + width) - temp + 'px'
            currentResizer.parentNode.style.width = fitToGrid(temp + width) - temp + 'px'
          }
        }
      }
      else if (currentResizer.classList.contains('top-right')) {
        const width = original_width + (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          target.style.width = width + 'px'
          currentResizer.parentNode.style.width = width + 'px'
        }
        if (height > minimum_size) {
          let top = original_y + (e.pageY - original_mouse_y) - toolbarHeight + 'px'
          target.style.height = height + 'px'
          target.style.top = top
          currentResizer.parentNode.style.height = height + 'px'
          currentResizer.parentNode.style.top = top
        }
      }
      else {
        const width = original_width - (e.pageX - original_mouse_x)
        const height = original_height - (e.pageY - original_mouse_y)
        if (width > minimum_size) {
          target.style.width = width + 'px'
          target.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
          currentResizer.parentNode.style.width = width + 'px'
          currentResizer.parentNode.style.left = original_x + (e.pageX - original_mouse_x) + 'px'
        }
        if (height > minimum_size) {
          let top = original_y + (e.pageY - original_mouse_y) - toolbarHeight + 'px'
          target.style.height = height + 'px'
          target.style.top = top
          currentResizer.parentNode.style.height = height + 'px'
          currentResizer.parentNode.style.top = top
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
