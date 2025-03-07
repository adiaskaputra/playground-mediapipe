<script setup lang="ts">
import { ImageEmbedder, FilesetResolver } from '@mediapipe/tasks-vision'

let imageEmbedder
let runningMode: 'IMAGE' | 'VIDEO' = 'IMAGE'

const RefContent = ref()
const RefImage1 = ref()
const RefImage2 = ref()

const image1 = ref(
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThNqcZJPySuBlvmNxbmxCpIlJwJeoiFXApwNd0lVHWLjNTKfyGqEaQvVBgUZ3uBr5_MSg&usqp=CAU',
)

const image2 = ref(
  'https://yt3.googleusercontent.com/8SwDqiFsi_u-0UQ74a8wHqPsAYtyGwg6ERrAdCn2PexWR14D348uZcfmfnbZl4KXuKqaO2Ui_Q=s900-c-k-c0x00ffffff-no-rj',
)

const similarity = ref(0)

async function runMachine() {
  try {
    if (!imageEmbedder) {
      alert('Wait for objectDetector to load before clicking')
      return
    }

    if (runningMode === 'VIDEO') {
      runningMode = 'IMAGE'
      await imageEmbedder.setOptions({ runningMode: runningMode })
    }

    const imageEmbedderResult0 = imageEmbedder.embed(RefImage1.value)
    const imageEmbedderResult1 = imageEmbedder.embed(RefImage2.value)

    console.log(imageEmbedderResult0)

    const _similarity = ImageEmbedder.cosineSimilarity(
      imageEmbedderResult0.embeddings[0],
      imageEmbedderResult1.embeddings[0],
    )
    similarity.value = _similarity
  }
  catch (err) {
    console.info('ERR RUN MACHINE')
    console.error(err)
  }
}

async function init() {
  try {
    const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
    imageEmbedder = await ImageEmbedder.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/image-embedding.tflite',
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
    class="g-page__content g-page__content--loading flex flex-wrap justify-center items-start gap-6"
  >
    <div class="text-center flex-1">
      <UButton size="lg" class="mb-10" @click.stop="runMachine">Compare</UButton>
      <div class="img-container">
        <div>
          <div class="font-bold mb-2">Image 1</div>
          <img ref="RefImage1" :src="image1" crossorigin="anonymous" />
        </div>
        <div>
          <div class="font-bold mb-2">Image 2</div>
          <img ref="RefImage2" :src="image2" crossorigin="anonymous" />
        </div>
      </div>
    </div>
    <div class="flex-1">
      <div class="text-lg font-bold">Result</div>
      <div v-if="similarity">Similarity: {{ similarity }}</div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.img-container {
  @apply flex flex-wrap justify-center items-start gap-6;
  img {
    @apply w-[240px];
  }
}
</style>
