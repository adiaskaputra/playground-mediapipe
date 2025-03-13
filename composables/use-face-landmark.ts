import type { FaceDetectorOptions as FaceDetectorOptionsType } from '@mediapipe/tasks-vision'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export const useFaceLandmark = (config: FaceDetectorOptionsType = {}) => {
  const runningMode = ref<'IMAGE' | 'VIDEO'>('IMAGE')
  const loadingModel = ref(false)
  const detector = shallowRef<FaceLandmarker>()

  const loadModel = async () => {
    try {
      loadingModel.value = true
      const vision = await FilesetResolver.forVisionTasks('/tasks-vision/wasm/')
      detector.value = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/face-landmark.task',
          delegate: 'GPU',
        },
        runningMode: runningMode.value,
        outputFaceBlendshapes: true,
        numFaces: 1,
        ...config,
      })
      loadingModel.value = false
    }
    catch (err) {
      loadingModel.value = false
      console.info('ERR LOAD MODEL FACE LANDMARK')
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
