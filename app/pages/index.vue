<template>
    <div class="tree-page">
        <div class="auth-bar">
            <template v-if="isLoggedIn">
                <button @click="handleDashboard" class="auth-btn">Tableau de bord</button>
                <button v-if="currentFamilyId" @click="handleEditFamily" class="auth-btn highlight">Gérer cette famille</button>
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
import type SceneManager from '~/webgl/SceneManager'
import { authClient } from '~/lib/client'

const session = authClient.useSession()
const isLoggedIn = computed(() => !!session.value?.data)

const canvas = ref<HTMLCanvasElement | null>(null)
let sceneManager: SceneManager | null = null
const currentFamilyId = ref<string | null>(null)

const handleLogin = () => {
    navigateTo('/login')
}

const handleDashboard = () => {
    navigateTo('/dashboard')
}

const handleEditFamily = () => {
    if (currentFamilyId.value) {
        navigateTo(`/famille/${currentFamilyId.value}`)
    }
}

const handleLogout = async () => {
    await authClient.signOut()
    window.location.reload()
}

const fetchPersons = async () => {
    let url = "/api/persons"
    
    if (isLoggedIn.value) {
        // Fetch user's families
        const familiesRes = await fetch("/api/families")
        const families = await familiesRes.json()
        
        if (families && families.length > 0) {
            // Take the first family for now
            currentFamilyId.value = families[0]._id
            url += `?familyId=${currentFamilyId.value}`
        }
    }
    
    const res = await fetch(url)
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
        
        // Initial load
        await updateTree()
    }
})

// Watch for login changes to update the tree
watch(isLoggedIn, async () => {
    await updateTree()
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
