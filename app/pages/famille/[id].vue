<template>
    <div class="tree-page">
        <div class="auth-bar">
            <template v-if="isLoggedIn">
                <button v-if="isEditor" @click="handleDashboard" class="nav-btn">Tableau de bord</button>
                <button v-if="isEditor" @click="handleEditFamily" class="nav-btn highlight">Gérer cette famille</button>
                <button @click="handleLogout" class="nav-btn">Se déconnecter</button>
            </template>
            <template v-else>
                <button @click="handleLogin" class="nav-btn highlight">Se connecter</button>
            </template>
        </div>
        <canvas ref="canvas" class="webgl-canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type SceneManager from '~/webgl/SceneManager'
import { authClient } from '~/lib/client'

const route = useRoute()
const familyId = route.params.id as string

const session = authClient.useSession()
const isLoggedIn = computed(() => !!session.value?.data)

const canvas = ref<HTMLCanvasElement | null>(null)
let sceneManager: SceneManager | null = null

const isEditor = ref(false)

const checkEditorMode = async () => {
    try {
        const family = await $fetch<any>(`/api/family?id=${familyId}`, {
            headers: useRequestHeaders(['cookie']) as Record<string, string>,
            credentials: 'include'
        });
        const userId = session.value?.data?.user?.id;

        if (userId === family.creatorId) {
            isEditor.value = true;
        } else {
            const share = family.sharedWith?.find((s: any) => s.userId === userId);
            if (share && share.canEdit) {
                isEditor.value = true;
            }
        }
    } catch (err) {
        console.error("Could not load family details", err);
    }
}

const handleLogin = () => {
    navigateTo('/login')
}

const handleDashboard = () => {
    navigateTo('/dashboard')
}

const handleEditFamily = () => {
    navigateTo(`/tree/${familyId}`)
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
    if (isLoggedIn.value) {
        await checkEditorMode()
    }
})

onBeforeUnmount(() => {
    if (sceneManager) {
        sceneManager.destroy()
    }
})
</script>

<style lang="scss" scoped>
.tree-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    background-color: $color-bg;
}

.auth-bar {
    position: fixed;
    bottom: toRem(24);
    right: toRem(24);
    z-index: 100;
    display: flex;
    gap: toRem(12);
    height: fit-content;
}

.nav-btn {
    background: $color-surface;
    border: 1px solid $color-text;
    padding: toRem(10) toRem(20);
    font-size: toRem(11);
    font-family: $font-sans;
    font-weight: 700;
    cursor: pointer;
    color: $color-text;
    transition: all 0.2s ease;
    height: fit-content;
}

.nav-btn:hover {
    background: #f0f0f0;
}

.nav-btn.highlight {
    background: $color-green;
    color: $color-surface;
    border-color: $color-text;
}

.nav-btn.highlight:hover {
    filter: brightness(1.1);
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
