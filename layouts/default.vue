<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const getTitle = computed(() => {
  if (route.name === 'index') return ''
  return `${route.name as string}`.replace('-', ' ')
})

function backToMenu() {
  router.push('/')
}
</script>

<template>
  <div class="layout">
    <ColorPicker />
    <div v-if="getTitle" class="layout__header">
      <div class="flex-1">
        <UButton
          :ui="{ rounded: 'rounded-full' }"
          size="md"
          color="black"
          @click.stop="backToMenu()"
        >
          <Icon name="uil:angle-left-b" class="pr-1 text-[20px]" /></UButton>
      </div>
      <div class="layout__header__title flex-1">{{ getTitle }}</div>
      <div class="flex-1"></div>
    </div>
    <div class="layout__content">
      <slot />
    </div>
  </div>
</template>

<style lang="postcss">
.layout {
  @apply flex h-full flex-col;
  &__header {
    @apply flex justify-between items-center;
    @apply rounded-lg py-6 px-16 mt-6;
    &__title {
      @apply text-gray-700 font-bold text-[26px]  text-center;
      @apply capitalize;
    }
  }
  &__content {
    @apply h-full py-6 px-16;
  }
}
</style>
