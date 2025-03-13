import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

export const useMediaPipe = () => {
  const runningMode = ref<'IMAGE' | 'VIDEO'>('IMAGE')
  const loadingModel = ref(false)
  const faceDetector = shallowRef<FaceDetector>()

  const initMediaPipe = async () => {
    try {
      loadingModel.value = true
      const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
      faceDetector.value = await FaceDetector.createFromOptions(vision, {
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
    if (!faceDetector.value) {
      await initMediaPipe()
    }
  })

  return {
    runningMode,
    loadingModel,
    faceDetector,
  }
}
