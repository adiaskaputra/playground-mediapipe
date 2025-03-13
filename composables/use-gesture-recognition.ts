import { GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision'

export const useGestureRecognition = () => {
  const runningMode = ref<'IMAGE' | 'VIDEO'>('IMAGE')
  const loadingModel = ref(false)
  const detector = shallowRef<GestureRecognizer>()

  const loadModel = async () => {
    try {
      loadingModel.value = true
      const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
      detector.value = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/gesture-recognition.task',
          delegate: 'GPU',
        },
        runningMode: runningMode.value,
      })
      loadingModel.value = false
    }
    catch (err) {
      loadingModel.value = false
      console.info('ERR LOAD MODEL GESTURE RECOGNITION')
      console.error(err)
    }
  }

  onMounted(async () => {
    if (!detector.value) {
      await loadModel()
    }
  })

  return {
    runningMode,
    loadingModel,
    detector,
  }
}
