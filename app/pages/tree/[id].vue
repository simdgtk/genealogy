<template>
    <div class="tree-page">
        <div class="auth-bar">
            <template v-if="isLoggedIn">
                <button @click="handleDashboard" class="auth-btn">Tableau de bord</button>
                <button @click="handleEditFamily" class="auth-btn highlight">Gérer cette famille</button>
                <button @click="handleLogout" class="auth-btn">Se déconnecter</button>
            </template>
            <template v-else>
                <button @click="handleLogin" class="auth-btn">Se connecter</button>
            </template>
        </div>
        <canvas ref="canvas" class="webgl-canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import type SceneManager from '~/webgl/SceneManager'
import { authClient } from '~/lib/client'

const route = useRoute()
const familyId = route.params.id as string

const session = authClient.useSession()
const isLoggedIn = computed(() => !!session.value?.data)

const canvas = ref<HTMLCanvasElement | null>(null)
let sceneManager: SceneManager | null = null

const handleLogin = () => {
    navigateTo('/login')
}

const handleDashboard = () => {
    navigateTo('/dashboard')
}

const handleEditFamily = () => {
    navigateTo(`/famille/${familyId}`)
}

const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/'
}

const fetchPersons = async () => {
    const res = await fetch(`/api/persons?familyId=${familyId}`)
    const data = await res.json()
    return data
}

const updateTree = async () => {
    if (sceneManager) {
        const persons = await fetchPersons()
        sceneManager.updatePersons(persons)
    }
}

onMounted(async () => {
    if (canvas.value) {
        const SceneManagerModule = await import('~/webgl/SceneManager')
        sceneManager = new SceneManagerModule.default(canvas.value)
        
        await updateTree()
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

.auth-bar {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    gap: 10px;
}

.auth-btn {
    background: white;
    border: 1px solid black;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.auth-btn:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
}

.auth-btn.highlight {
    background: #008412;
    color: white;
    border-color: #006b0f;
}

.auth-btn.highlight:hover {
    background: #00a016;
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
