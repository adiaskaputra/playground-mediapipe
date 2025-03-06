<script setup lang="ts">
const router = useRouter()
type IMenu = { label: string, caption?: string, path?: string, url?: string }
const menus = shallowRef<IMenu[]>([
  {
    label: 'Face Detection',
    path: 'face-detection',
  },
  {
    label: 'Face Landmark',
    path: 'face-landmark',
  },
  {
    label: 'Image Classification',
    path: 'image-classification',
  },
  // {
  //   label: "Object Detection",
  //   path: "object-detection",
  // },
  {
    label: 'Hand Gesture Recognization',
    path: 'hand-gesture-recognization',
  },
  // {
  //   label: 'Pose Landmark Detection',
  //   path: 'pose-landmark-detection',
  // },
  // {
  //   label: 'Face Stylization',
  //   path: 'face-stylization',
  // },
])

function redirect(item: IMenu) {
  if (item.path) {
    router.push(`/${item.path}`)
  }
  if (item.url) {
    // @ts-ignore
    window.open(item.url, '_blank').focus()
  }
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div class="flex w-[200px] flex-col justify-center gap-4">
      <div
        v-for="(item, i) in menus"
        :key="`menu-${i}`"
        class="menu"
        @click.stop="redirect(item)"
      >
        <div class="menu__label">{{ item.label }}</div>
        <div v-if="item.caption" class="menu__caption">
          ({{ item.caption }})
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.menu {
  @apply bg-gray-100 py-2 px-4 rounded;
  @apply cursor-pointer;
  @apply hover:bg-gray-300;
  @apply text-center;
  &__label {
    @apply text-gray-500 hover:text-gray-700;
  }
  &__caption {
    @apply text-gray-400 text-sm hover:text-gray-600;
  }
}
</style>
