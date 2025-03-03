<script setup lang="ts">
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

let faceDetector
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const RefVidContainer = ref()
const RefVideo = ref()

const isRenderCamera = ref(true)
const isCameraLive = ref(false)
const isInProgressStopFaceDetection = ref(false)
const loading = ref(false)

let children: any = []
let lastVideoTime = -1

function drawMasking(detections) {
  for (const child of children) {
    RefVidContainer.value.removeChild(child)
  }
  children.splice(0)

  for (const detection of detections) {
    const p = document.createElement('p')
    p.innerText
      = 'Confidence: '
        + Math.round(parseFloat(detection.categories[0].score) * 100)
        + '% .'
    p.style
      = 'left: '
        + (RefVideo.value.offsetWidth
          - detection.boundingBox.width
          - detection.boundingBox.originX)
        + 'px;'
        + 'top: '
        + (detection.boundingBox.originY - 30)
        + 'px; '
        + 'width: '
        + (detection.boundingBox.width - 10)
        + 'px;'

    const highlighter = document.createElement('div')
    highlighter.setAttribute('class', 'highlighter')
    highlighter.style
      = 'left: '
        + (RefVideo.value.offsetWidth
          - detection.boundingBox.width
          - detection.boundingBox.originX)
        + 'px;'
        + 'top: '
        + detection.boundingBox.originY
        + 'px;'
        + 'width: '
        + (detection.boundingBox.width - 10)
        + 'px;'
      + 'height: '
      + detection.boundingBox.height
      + 'px;'

    RefVidContainer.value.appendChild(highlighter)
    RefVidContainer.value.appendChild(p)

    children.push(highlighter)
    children.push(p)
    for (const keypoint of detection.keypoints) {
      const keypointEl = document.createElement('spam')
      keypointEl.className = 'key-point'
      keypointEl.style.top = `${keypoint.y * RefVideo.value.offsetHeight - 3}px`
      keypointEl.style.left = `${
        RefVideo.value.offsetWidth - keypoint.x * RefVideo.value.offsetWidth - 3
      }px`
      RefVidContainer.value.appendChild(keypointEl)
      children.push(keypointEl)
    }
  }
}

async function runMachine() {
  console.log('[ VIDEO ] FACE DETECTION')
  if (isInProgressStopFaceDetection.value) return
  if (runningMode === 'IMAGE') {
    runningMode = 'VIDEO'
    await faceDetector.setOptions({ runningMode: 'VIDEO' })
  }
  const startTimeMs = performance.now()

  if (RefVideo.value.currentTime !== lastVideoTime) {
    lastVideoTime = RefVideo.value.currentTime
    const detections = faceDetector.detectForVideo(
      RefVideo.value,
      startTimeMs,
    ).detections
    drawMasking(detections)
  }
  window.requestAnimationFrame(runMachine)
}

async function closeCam(event) {
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

async function openCam(event) {
  if (!faceDetector) {
    alert('Face Detector is still loading. Please try again..')
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
      console.error(err)
    })
}

//
//  I N I T I A L I Z A T I O N
//
async function init() {
  const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/blaze_face_short_range.tflite',
      delegate: 'GPU',
    },
    runningMode,
  })
}

onMounted(() => {
  nextTick(() => {
    init()
  })
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
      <UButton
        v-else
        label="Open camera"
        :loading="loading"
        @click.stop="openCam"
      />
    </div>
    <div v-if="isRenderCamera" ref="RefVidContainer" class="video-container">
      <video ref="RefVideo" autoplay playsinline></video>
    </div>
  </div>
</template>
