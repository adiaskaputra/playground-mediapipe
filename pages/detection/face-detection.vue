<script setup lang="ts">
const { loadingModel, runningMode, faceDetector } = useMediaPipe()
</script>

<template>
  <div class="face-detection">
    <FaceDetectionVideo
      v-model:running-mode="runningMode"
      :loading-model="loadingModel"
      :face-detector="faceDetector"
    />
    <FaceDetectionImage
      v-model:running-mode="runningMode"
      :loading-model="loadingModel"
      :face-detector="faceDetector"
    />
  </div>
</template>
