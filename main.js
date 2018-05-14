const getSize = (el) => ({
  width: el.getAttribute('width') || el.style.width,
  height: el.getAttribute('height') || el.style.height
})

/**
 * Load Youtube API (async)
 * @param  {string?} src
 * @return {Promise}
 */
function apiReady (src = 'https://www.youtube.com/iframe_api') {
  const promise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      if (prev) {
        prev()
      }

      resolve(window.YT)
    }
  })

  const tag = document.createElement('script')
  const firstScriptTag = document.getElementsByTagName('script')[0]

  tag.src = src
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

  return promise
}

const players = []

function onReady (evt) {
  const {
    target
  } = evt
  const videoId = getVideoId(target.getVideoUrl())

  players.push({
    videoId,
    target
  })
}

function onStateChange (evt) {
  const {
    target,
    data
  } = evt
  const videoId = getVideoId(target.getVideoUrl())

  if (data === 1) {
    players.forEach((p) => {
      if (!p.videoId.includes(videoId)) {
        p.target.pauseVideo()
      }
    })
  }
}

/**
 * Get video id from video url
 * @param  {string}  url
 * @return {string?}
 */
function getVideoId (url) {
  const regex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regex)

  return (match[2] && match[2].length === 11)
    ? match[2]
    : ''
}

/**
 * Is Youtube url?
 * @param  {string}  src
 * @return {boolean}
 */
function isYtb (src) {
  const regex = /(http:|https:)?\/\/(www\.)?(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/

  return regex.test(src)
}

apiReady().then((YT) => {
  const iframe = document.querySelectorAll('iframe')

  iframe.forEach((el, index) => {
    const { src } = el
    const id = `ytb-stopper-${index + 1}`

    if (isYtb(src)) {
      const {
        width,
        height
      } = getSize(el)
      const videoId = getVideoId(src)
      const config = {
        width,
        height,
        videoId,
        playerVars: {
          enablejsapi: 1
        },
        events: {
          onReady,
          onStateChange
        }
      }

      const div = document.createElement('div')
      div.id = id

      el.parentNode.insertBefore(div, el)
      el.remove()

      new YT.Player(id, config)
    }
  })
})
