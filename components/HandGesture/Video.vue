<script setup lang="ts">
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision'

let gestureRecognizer
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const RefVidContainer = ref()
const RefVideo = ref()
const RefCanvas = ref()
const RefGesture = ref()

const isRenderCamera = ref(true)
const isCameraLive = ref(false)
const isInProgressStopFaceDetection = ref(false)
const loading = ref(false)

const videoHeight = '360px'
const videoWidth = '480px'

let children: any = []
let lastVideoTime = -1
let results = undefined

function drawMasking(results) {
  try {
    const canvasCtx = RefCanvas.value.getContext('2d')
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, RefCanvas.value.width, RefCanvas.value.height)
    const drawingUtils = new DrawingUtils(canvasCtx)
    RefCanvas.value.style.height = videoHeight
    RefVideo.value.style.height = videoHeight // webcamElement
    RefCanvas.value.style.width = videoWidth
    RefVideo.value.style.width = videoWidth // webcamElement

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5,
        })
        drawingUtils.drawLandmarks(landmarks, {
          color: '#FF0000',
          lineWidth: 2,
        })
      }
    }
    canvasCtx.restore()
    if (results.gestures.length > 0) {
      RefGesture.value.style.display = 'block'
      RefGesture.value.style.width = videoWidth
      const categoryName = results.gestures[0][0].categoryName
      const categoryScore = parseFloat(results.gestures[0][0].score * 100).toFixed(2)
      const handedness = results.handednesses[0][0].displayName
      RefGesture.value.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`
    }
    else {
      RefGesture.value.style.display = 'none'
    }
  }
  catch (err) {
    console.info('ERR DRAW MASKING')
    console.error(err)
  }
}

async function runMachine() {
  try {
    if (isInProgressStopFaceDetection.value) return
    if (runningMode === 'IMAGE') {
      runningMode = 'VIDEO'
      await gestureRecognizer.setOptions({ runningMode: 'VIDEO' })
    }

    const nowInMs = Date.now()
    if (RefVideo.value.currentTime !== lastVideoTime) {
      lastVideoTime = RefVideo.value.currentTime
      results = gestureRecognizer.recognizeForVideo(RefVideo.value, nowInMs)
    }

    drawMasking(results)
    window.requestAnimationFrame(runMachine)
  }
  catch (err) {
    console.info('ERR RUN MACHINE')
    console.error(err)
  }
}

async function closeCam() {
  try {
    if (!isCameraLive.value) return
    loading.value = true
    isInProgressStopFaceDetection.value = true
    await $delay(500)

    const stream = RefVideo.value.srcObject
    const tracks = stream.getTracks()
    tracks.forEach((track) => {
      track.stop()
      RefVideo.value.srcObject = null
    })

    nextTick(() => {
      children = []
      isCameraLive.value = false
      isInProgressStopFaceDetection.value = false
      isRenderCamera.value = false
      nextTick(() => {
        isRenderCamera.value = true
        loading.value = false
      })
    })
  }
  catch (err) {
    console.info('ERR CLOSE CAM')
    console.error(err)
  }
}

async function openCam() {
  if (isCameraLive.value) {
    alert('Camera still live.')
    return
  }
  if (!gestureRecognizer) {
    alert('Gesture Detector is still loading. Please try again..')
    return
  }

  loading.value = true
  const constraints = { video: true }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      RefVideo.value.srcObject = stream
      RefVideo.value.addEventListener('loadeddata', () => {
        isCameraLive.value = true
        runMachine()
      })
      loading.value = false
    })
    .catch((err) => {
      isCameraLive.value = false
      loading.value = false
      console.info('ERR OPEN CAM')
      console.error(err)
    })
}

async function init() {
  try {
    const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode,
    })
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

onBeforeRouteLeave(async () => {
  await closeCam()
})
</script>

<template>
  <div class="g-page__content">
    <div class="flex justify-center pb-4">
      <UButton
        v-if="isCameraLive"
        label="Close camera"
        color="red"
        :loading="loading"
        @click.stop="closeCam"
      />
      <UButton v-else label="Open camera" :loading="loading" @click.stop="openCam" />
    </div>
    <div v-if="isRenderCamera" ref="RefVidContainer" class="video-container">
      <video ref="RefVideo" autoplay playsinline></video>
      <canvas
        ref="RefCanvas"
        class="output_canvas"
        width="1280"
        height="720"
        style="position: absolute; left: 0px; top: 0px"
      ></canvas>
      <p ref="RefGesture" class="output"></p>
    </div>
  </div>
</template>
