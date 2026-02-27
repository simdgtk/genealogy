<template>
    <div class="tree-page">
        <canvas ref="canvas" class="webgl-canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type SceneManager from '~/webgl/SceneManager'

const canvas = ref<HTMLCanvasElement | null>(null)
let sceneManager: SceneManager | null = null

onMounted(async () => {
    if (canvas.value) {
        const SceneManagerModule = await import('~/webgl/SceneManager')
        sceneManager = new SceneManagerModule.default(canvas.value)
    }
})

onBeforeUnmount(() => {
    if (sceneManager) {
        sceneManager.destroy()
    }
})
</script>

<style scoped>
.tree-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
}

.webgl-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: none;
}
</style>
