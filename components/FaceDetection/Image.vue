<script setup lang="ts">
import type { FaceDetector as FaceDetectorType } from '@mediapipe/tasks-vision'

const props = defineProps<{
  detector: FaceDetectorType | undefined
  loadingModel: boolean
  runningMode: 'IMAGE' | 'VIDEO'
}>()

const emits = defineEmits<{
  (event: 'update:runningMode', value: 'IMAGE' | 'VIDEO'): void
}>()

const mode = computed({
  get() {
    return props.runningMode
  },
  set(e) {
    emits('update:runningMode', e)
  },
})

const RefContent = ref()

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

    if (!props.detector) {
      alert('Wait for face detector to load before clicking')
      return
    }

    if (mode.value === 'VIDEO') {
      console.info('SETUP RUNNING MODE TO IMAGE')
      mode.value = 'IMAGE'
      await props.detector.setOptions({ runningMode: 'IMAGE' })
    }

    // const ratio = event.target.height / event.target.naturalHeight;
    const detections = props.detector.detect(event.target).detections
    drawMasking(detections, event.target)
  }
  catch (err) {
    console.info('ERR RUN MACHINE')
    console.error(err)
  }
}
</script>

<template>
  <div
    ref="RefContent"
    class="g-page__content flex justify-center gap-6"
    :class="{
      'g-page__content--loading': loadingModel,
    }"
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
