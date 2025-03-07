<script setup lang="ts">
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'

const RefContent = ref()
let poseLandmarker
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const images = ref([
  {
    url: 'https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg',
  },
  {
    url: 'https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg',
  },
])

function drawMasking(event, result) {
  try {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('class', 'canvas')
    canvas.setAttribute('width', event.target.naturalWidth + 'px')
    canvas.setAttribute('height', event.target.naturalHeight + 'px')
    canvas.style
      = 'left: 0px;'
        + 'top: 0px;'
        + 'width: '
        + event.target.width
        + 'px;'
        + 'height: '
        + event.target.height
        + 'px;'

    event.target.parentNode.appendChild(canvas)
    const canvasCtx = canvas.getContext('2d')
    const drawingUtils = new DrawingUtils(canvasCtx)

    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      })
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS)
    }
  }
  catch (err) {
    console.info('ERR DRAW MASKING')
    console.error(err)
  }
}

async function runMachine(event) {
  try {
    if (!poseLandmarker) {
      alert('Wait for poseLandmarker to load before clicking!')
      return
    }

    if (runningMode === 'VIDEO') {
      runningMode = 'IMAGE'
      await poseLandmarker.setOptions({ runningMode: 'IMAGE' })
    }

    const allCanvas = event.target.parentNode.getElementsByClassName('canvas')
    for (let i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i]
      n.parentNode.removeChild(n)
    }

    poseLandmarker.detect(event.target, (result) => {
      drawMasking(event, result)
    })
  }
  catch (err) {
    console.info('ERR RUN MACHINE')
    console.error(err)
  }
}

async function init() {
  try {
    const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/pose-recognition.task',
        delegate: 'GPU',
      },
      runningMode,
      numPoses: 2,
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
    <div v-for="(item, i) in images" :key="`image-${i}`" class="max-w-[50%] flex-1">
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
