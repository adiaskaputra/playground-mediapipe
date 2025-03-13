import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

export const useFaceDetection = () => {
  const runningMode = ref<'IMAGE' | 'VIDEO'>('IMAGE')
  const loadingModel = ref(false)
  const detector = shallowRef<FaceDetector>()

  const loadModel = async () => {
    try {
      loadingModel.value = true
      const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
      detector.value = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face-detection.tflite',
          delegate: 'GPU',
        },
        runningMode: runningMode.value,
      })
      loadingModel.value = false
    }
    catch (err) {
      loadingModel.value = false
      console.info('ERR LOAD MODEL FACE DETECTION')
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
