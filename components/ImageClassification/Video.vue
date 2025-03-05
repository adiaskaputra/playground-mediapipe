<script setup lang="ts">
import { ImageClassifier, FilesetResolver } from '@mediapipe/tasks-vision'

let imageClassifier
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const RefVidContainer = ref()
const RefVideo = ref()
const RefPredict = ref()

const isRenderCamera = ref(true)
const isCameraLive = ref(false)
const isInProgressStopFaceDetection = ref(false)
const loading = ref(false)

const videoHeight = '360px'
const videoWidth = '480px'

async function runMachine() {
  console.log('[ VIDEO ] FACE DETECTION')
  if (isInProgressStopFaceDetection.value) return
  if (imageClassifier === undefined) {
    return
  }
  // if image mode is initialized, create a new classifier with video runningMode
  if (runningMode === 'IMAGE') {
    runningMode = 'VIDEO'
    await imageClassifier.setOptions({ runningMode: 'VIDEO' })
  }
  const startTimeMs = performance.now()
  const classificationResult = imageClassifier.classifyForVideo(
    RefVideo.value,
    startTimeMs,
  )
  RefVideo.value.style.height = videoHeight
  RefVideo.value.style.width = videoWidth
  RefPredict.value.style.width = videoWidth
  const classifications = classificationResult.classifications
  RefPredict.value.className = 'webcamPredictions'
  RefPredict.value.innerText
    = 'Classification: '
      + classifications[0].categories[0].categoryName
      + '\n Confidence: '
      + Math.round(parseFloat(classifications[0].categories[0].score) * 100)
      + '%'

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
  if (!imageClassifier) {
    alert('Image Classifier is still loading. Please try again..')
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
  imageClassifier = await ImageClassifier.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/efficientnet_lite0.tflite', // float32
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
  <div class="g-page__content flex justify-between items-end gap-6">
    <div>
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
    <p ref="RefPredict"></p>
  </div>
</template>
