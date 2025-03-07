<script setup lang="ts">
import type { IMenu } from '@/types/index'
import { MENU } from '@/constants/menu'

const router = useRouter()

function redirect(label: string | number, item: IMenu) {
  if (item.path) {
    router.push(`/${label}/${item.path}`)
  }
  if (item.url) {
    // @ts-ignore
    window.open(item.url, '_blank').focus()
  }
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <div class="flex flex-wrap items-center justify-center gap-9">
      <div v-for="(items, label) in MENU" :key="`menu-${label}`" class="menu-container">
        <div class="menu-container__label">{{ label }}</div>
        <div
          v-for="(item, n) in items"
          :key="`menu-${n}`"
          class="menu"
          @click.stop="redirect(label, item)"
        >
          <div class="menu__label">{{ item.label }}</div>
          <div v-if="item.caption" class="menu__caption">
            {{ item.caption }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.menu {
  @apply bg-gray-100 py-2 px-4 rounded;
  @apply cursor-pointer;
  @apply hover:bg-zinc-300;
  @apply text-center;
  &-container {
    @apply flex w-[240px] flex-col justify-center gap-3;
    @apply py-4 px-3 bg-zinc-200 rounded;
    &__label {
      @apply font-bold text-center capitalize;
      @apply text-gray-700;
    }
  }
  &__label {
    @apply text-gray-500;
  }
  &__caption {
    @apply text-gray-400 text-sm;
  }
}
</style>
