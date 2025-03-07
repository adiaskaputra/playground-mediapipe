import type { IMenu } from '@/types/index'

export const MENU: { [key: string]: IMenu[] } = {
  detection: [
    {
      label: 'Face Detection',
      path: 'face-detection',
    },
    {
      label: 'Face Landmark',
      path: 'face-landmark',
    },
    {
      label: 'Gesture Recognition',
      caption: 'Recognize hand gestures in real time.',
      path: 'gesture-recognition',
    },
    {
      label: 'Pose Landmark Detection',
      path: 'pose-landmark-detection',
    },
    {
      label: 'Image Classification',
      path: 'image-classification',
    },
    {
      label: 'Object Detection',
      path: 'object-detection',
    },

  ],
  tool: [
    {
      label: 'Image Embedding',
      caption: 'Image Similarity Checker',
      path: 'image-embedding',
    },
  ],
}
