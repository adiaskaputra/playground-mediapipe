<script setup lang="ts">
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision'

let faceLandmarker
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'
const videoWidth = 480

const RefVidContainer = ref()
const RefVideo = ref()
const RefCanvas = ref()
const RefBlendShapes = ref()

const isRenderCamera = ref(true)
const isCameraLive = ref(false)
const isInProgressStopFaceDetection = ref(false)
const loading = ref(false)

function drawMasking(blendShapes) {
  if (!blendShapes.length) {
    return
  }
  console.log('blendShapes[0]', blendShapes[0])
  let htmlMaker = ''
  blendShapes[0].categories.map((shape) => {
    htmlMaker += `
      <li class="blend-shapes__item">
        <span class="blend-shapes__label">${shape.displayName || shape.categoryName}</span>
        <span class="blend-shapes__value" style="width: calc(${+shape.score * 100}% - 120px)">${(+shape.score).toFixed(4)}</span>
      </li>
    `
  })
  RefBlendShapes.value.innerHTML = htmlMaker
}

async function runMachine() {
  console.log('RUN MACHINE')
  if (isInProgressStopFaceDetection.value) return
  let lastVideoTime = -1
  let results = undefined
  const canvasCtx = RefCanvas.value.getContext('2d')
  const drawingUtils = new DrawingUtils(canvasCtx)

  const radio = RefVideo.value.videoHeight / RefVideo.value.videoWidth
  RefVideo.value.style.width = videoWidth + 'px'
  RefVideo.value.style.height = videoWidth * radio + 'px'
  RefCanvas.value.style.width = videoWidth + 'px'
  RefCanvas.value.style.height = videoWidth * radio + 'px'
  RefCanvas.value.width = RefVideo.value.videoWidth
  RefCanvas.value.height = RefVideo.value.videoHeight
  // Now let's start detecting the stream.
  if (runningMode === 'IMAGE') {
    runningMode = 'VIDEO'
    await faceLandmarker.setOptions({ runningMode: runningMode })
  }
  const startTimeMs = performance.now()
  if (lastVideoTime !== RefVideo.value.currentTime) {
    lastVideoTime = RefVideo.value.currentTime
    results = faceLandmarker.detectForVideo(RefVideo.value, startTimeMs)
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: '#C0C0C070', lineWidth: 1 },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: '#30FF30' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: '#30FF30' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: '#E0E0E0' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: '#E0E0E0' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: '#30FF30' },
      )
    }
  }

  drawMasking(results.faceBlendshapes)
  window.requestAnimationFrame(runMachine)
}

async function closeCam() {
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
    isCameraLive.value = false
    isInProgressStopFaceDetection.value = false
    isRenderCamera.value = false
    nextTick(() => {
      isRenderCamera.value = true
      loading.value = false
    })
  })
}

async function openCam() {
  if (!faceLandmarker) {
    console.log('Wait! faceLandmarker not loaded yet.')
    return
  }

  loading.value = true
  const constraints = { video: true }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      RefVideo.value.srcObject = stream
      RefVideo.value.addEventListener('loadeddata', runMachine)
      isCameraLive.value = true
      loading.value = false
    })
    .catch((err) => {
      isCameraLive.value = false
      loading.value = false
      console.error(err)
    })
}
async function init() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    '/tasks-vision/wasm/',
  )

  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `/models/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  })
}

onMounted(() => {
  nextTick(() => {
    init()
  })
})
</script>

<template>
  <div class="flex gap-6 g-page__content">
    <div class="flex-1">
      <div class="flex justify-center pb-4">
        <UButton
          v-if="isCameraLive"
          label="Close camera"
          color="red"
          :loading="loading"
          @click.stop="closeCam()"
        />
        <UButton
          v-else
          label="Open camera"
          :loading="loading"
          @click.stop="openCam()"
        />
      </div>
      <div
        v-if="isRenderCamera"
        ref="RefVidContainer"
        class="video-container"
        style="width: 480px"
      >
        <video ref="RefVideo" autoplay playsinline style="width: 480px"></video>
        <canvas
          id="output_canvas"
          ref="RefCanvas"
          class="output_canvas"
          style="position: absolute; left: 0px; top: 0px"
        ></canvas>
      </div>
    </div>
    <div class="blend-shapes flex-1">
      <ul ref="RefBlendShapes" class="blend-shapes-list"></ul>
    </div>
  </div>
</template>
