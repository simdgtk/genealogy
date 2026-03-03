<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authClient } from "~/lib/auth-client";

const { data: families } = await useFetch<any[]>("/api/families");
const session = ref<any>(null);

onMounted(async () => {
    const res = await authClient.getSession();
    session.value = res.data;
});

const handleLogout = async () => {
    await authClient.signOut();
    navigateTo("/login");
};
</script>

<template>
    <div class="genealogy-auth">
        <header class="genealogy-header">
            <div class="genealogy-logo"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.09,72.09,0,0,0,120,192.47V232a8,8,0,0,0,16,0V192.47A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59ZM169.45,184a56.08,56.08,0,0,1-33.45-10v-41l43.58-21.78a8,8,0,1,0-7.16-14.32L136,115.06V88a8,8,0,0,0-16,0v51.06L83.58,120.84a8,8,0,1,0-7.16,14.32L120,156.94v17a56,56,0,0,1-33.45,10C56.9,183.23,31.92,157.52,32,127.84A55.77,55.77,0,0,1,67.11,76a8,8,0,0,0,4.53-4.67,60,60,0,0,1,112.72,0A8,8,0,0,0,188.89,76,55.79,55.79,0,0,1,224,127.84C224.08,157.52,199.1,183.23,169.45,184Z"></path></svg></div>
            <nav class="genealogy-nav">
                <span class="user-email" v-if="session?.user">{{ session.user.email }}</span>
                <button @click="handleLogout" class="nav-btn">Déconnexion</button>
            </nav>
        </header>

        <main class="genealogy-content">
            <div class="auth-box">
                <div class="auth-stage">
                    <h2>Vos Familles</h2>
                    <p class="subtitle">Sélectionnez une famille pour gérer son arbre.</p>
                </div>

                <div class="auth-grid">
                    <div class="family-list" v-if="families && families.length > 0">
                        <NuxtLink v-for="family in families" :key="family._id" :to="`/famille?familyId=${family._id}`"
                            class="family-item">
                            <span class="family-name">{{ family.name }}</span>
                            <span class="family-arrow">→</span>
                        </NuxtLink>
                    </div>

                    <div class="empty-state" v-else>
                        <p>Vous n'avez pas encore crée de famille.</p>
                    </div>

                    <NuxtLink to="/create-family" class="btn-genealogy-primary create-btn">
                        Créer une nouvelle famille
                    </NuxtLink>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.genealogy-auth {
    background-color: #E3E4DD;
    color: #000;
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.genealogy-header {
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    border-bottom: 1px solid #000;
    background: #E3E4DD;
}

.genealogy-logo {
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.05em;
}

.user-email {
    margin-right: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
}

.nav-btn {
    background: transparent;
    border: 1px solid #000;
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}

.nav-btn:hover {
    background: #fff;
}

.genealogy-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.auth-box {
    width: 100%;
    max-width: 600px;
}

.auth-stage {
    margin-bottom: 48px;
    text-align: center;
}

.auth-stage h2 {
    font-size: 48px;
    letter-spacing: -0.04em;
    margin: 0;
    line-height: 1;
}

.subtitle {
    font-size: 16px;
    color: #333333;
    margin-top: 12px;
}

.auth-grid {
    background: #fff;
    border: 1px solid #000;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.family-list {
    display: flex;
    flex-direction: column;
    border: 1px solid #000;
}

.family-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #000;
    text-decoration: none;
    color: inherit;
    transition: background 0.1s;
}

.family-item:last-child {
    border-bottom: none;
}

.family-item:hover {
    background: #f9f9f9;
}

.family-name {
    font-weight: 700;
    font-size: 18px;
}

.family-arrow {
    font-size: 20px;
}

.empty-state {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #666;
}

.btn-genealogy-primary {
    display: block;
    text-align: center;
    padding: 16px;
    background: #008412;
    color: #fff;
    border: 1px solid #000;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.1s;
}

.create-btn:hover {
    filter: brightness(1.1);
}

.create-btn:active {
    transform: translateY(1px);
}

* {
    border-radius: 0 !important;
}

@media (max-width: 600px) {
    .genealogy-header {
        padding: 0 20px;
    }

    .auth-grid {
        padding: 24px;
    }

    .auth-stage h2 {
        font-size: 32px;
    }
}
</style>
