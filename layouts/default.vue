<script lang="ts" setup></script>

<template>
  <div class="flex h-full flex-col">
    <ColorPicker />
    <div class="h-full py-6 px-16">
      <slot />
    </div>
  </div>
</template>

<style lang="postcss"></style>
