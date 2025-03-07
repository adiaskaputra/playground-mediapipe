<script setup lang="ts">
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

const RefContent = ref()
let faceDetector
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const images = ref([
  {
    url: 'https://assets.codepen.io/9177687/female-4572747_640.jpg',
  },
  {
    url: 'https://assets.codepen.io/9177687/idea-gcbe74dc69_1920.jpg',
  },
])

function drawMasking(detections, resultElement) {
  try {
    const ratio = resultElement.height / resultElement.naturalHeight

    for (const detection of detections) {
      const p = document.createElement('p')
      p.setAttribute('class', 'info')
      p.innerText
        = 'Confidence: '
          + Math.round(parseFloat(detection.categories[0].score) * 100)
          + '% .'

      p.style
        = 'left: '
          + detection.boundingBox.originX * ratio
          + 'px;'
          + 'top: '
          + (detection.boundingBox.originY * ratio - 30)
          + 'px; '
          + 'width: '
          + (detection.boundingBox.width * ratio - 10)
          + 'px;'
          + 'hight: '
        + 20
        + 'px;'

      const highlighter = document.createElement('div')
      highlighter.setAttribute('class', 'highlighter')
      highlighter.style
        = 'left: '
          + detection.boundingBox.originX * ratio
          + 'px;'
          + 'top: '
          + detection.boundingBox.originY * ratio
          + 'px;'
          + 'width: '
          + detection.boundingBox.width * ratio
          + 'px;'
          + 'height: '
        + detection.boundingBox.height * ratio
        + 'px;'

      resultElement.parentNode.appendChild(highlighter)
      resultElement.parentNode.appendChild(p)

      for (const keypoint of detection.keypoints) {
        const keypointEl = document.createElement('spam')
        keypointEl.className = 'key-point'
        keypointEl.style.top = `${keypoint.y * resultElement.height - 3}px`
        keypointEl.style.left = `${keypoint.x * resultElement.width - 3}px`
        resultElement.parentNode.appendChild(keypointEl)
      }
    }
  }
  catch (err) {
    console.info('ERR DRAW MASKING')
    console.error(err)
  }
}

async function runMachine(event) {
  try {
    const highlighters = event.target.parentNode.getElementsByClassName('highlighter')
    while (highlighters[0]) {
      highlighters[0].parentNode.removeChild(highlighters[0])
    }

    const infos = event.target.parentNode.getElementsByClassName('info')
    while (infos[0]) {
      infos[0].parentNode.removeChild(infos[0])
    }

    const keyPoints = event.target.parentNode.getElementsByClassName('key-point')
    while (keyPoints[0]) {
      keyPoints[0].parentNode.removeChild(keyPoints[0])
    }

    if (!faceDetector) {
      alert('Wait for objectDetector to load before clicking')
      return
    }
    if (runningMode === 'VIDEO') {
      runningMode = 'IMAGE'
      await faceDetector.setOptions({ runningMode: 'IMAGE' })
    }

    // const ratio = event.target.height / event.target.naturalHeight;
    const detections = faceDetector.detect(event.target).detections
    drawMasking(detections, event.target)
  }
  catch (err) {
    console.info('ERR RUN MACHINE')
    console.error(err)
  }
}

async function init() {
  try {
    const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/face-detection.tflite',
        delegate: 'GPU',
      },
      runningMode,
    })
    RefContent.value.classList.remove('g-page__content--loading')
  }
  catch (err) {
    console.info('ERR INIT')
    console.error(err)
  }
}

onMounted(() => {
  nextTick(() => {
    init()
  })
})
</script>

<template>
  <div
    ref="RefContent"
    class="g-page__content g-page__content--loading flex justify-center gap-6"
  >
    <div v-for="(item, i) in images" :key="`image-i`" class="flex-1 max-w-[50%]">
      <div class="img-label">Click to get classification!</div>
      <div class="image-container" @click.stop="($event) => runMachine($event)">
        <img
          :src="item.url"
          width="100%"
          crossorigin="anonymous"
          title="Click to get classification!"
        />
        <p></p>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped></style>
