<script setup lang="ts">
const familyName = ref("");
const isLoading = ref(false);

const handleCreateFamily = async () => {
    if (!familyName.value) return;

    isLoading.value = true;
    try {
        const res = await $fetch("/api/family", {
            method: "POST",
            body: { name: familyName.value },
            headers: useRequestHeaders(['cookie']) as Record<string, string>,
            credentials: 'include'
        });

        if (res) {
            navigateTo(`/famille/${res._id}`);
        }
    } catch (error: any) {
        alert(error.statusMessage || "Erreur lors de la création de la famille");
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="genealogy-auth">
        <header class="genealogy-header">
            <div class="genealogy-logo"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000"
                    viewBox="0 0 256 256">
                    <path
                        d="M198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.09,72.09,0,0,0,120,192.47V232a8,8,0,0,0,16,0V192.47A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59ZM169.45,184a56.08,56.08,0,0,1-33.45-10v-41l43.58-21.78a8,8,0,1,0-7.16-14.32L136,115.06V88a8,8,0,0,0-16,0v51.06L83.58,120.84a8,8,0,1,0-7.16,14.32L120,156.94v17a56,56,0,0,1-33.45,10C56.9,183.23,31.92,157.52,32,127.84A55.77,55.77,0,0,1,67.11,76a8,8,0,0,0,4.53-4.67,60,60,0,0,1,112.72,0A8,8,0,0,0,188.89,76,55.79,55.79,0,0,1,224,127.84C224.08,157.52,199.1,183.23,169.45,184Z">
                    </path>
                </svg></div>
            <nav class="genealogy-nav">
                <NuxtLink to="/dashboard" class="nav-btn">Retour</NuxtLink>
            </nav>
        </header>

        <main class="genealogy-content">
            <div class="auth-box">
                <div class="auth-stage">
                    <h2>Nouvelle Famille</h2>
                    <p class="subtitle">Commencez votre fresque généalogique en créant un nouvel arbre.</p>
                </div>

                <div class="auth-grid">
                    <form @submit.prevent="handleCreateFamily" class="email-form">
                        <div class="input-genealogy">
                            <label>Nom de la famille</label>
                            <input type="text" v-model="familyName" placeholder="ex: Famille Dupont"
                                required :disabled="isLoading" />
                        </div>

                        <button type="submit" class="btn-genealogy-primary" :disabled="isLoading">
                            {{ isLoading ? "Création..." : "Créer la famille" }}
                        </button>
                    </form>
                </div>

                <div class="genealogy-footer">
                    <p>Vous pourrez ensuite ajouter des membres</p>
                </div>
            </div>
        </main>
    </div>
</template>

<style lang="scss" scoped>
.genealogy-auth {
    background-color: #E3E4DD;
    color: #000;
    font-family: $font-mono;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.genealogy-header {
    height: toRem(64);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 toRem(40);
    border-bottom: 1px solid #000;
    background: #E3E4DD;
}

.genealogy-logo {
    font-weight: 800;
    font-size: toRem(18);
    letter-spacing: -0.05em;
}

.genealogy-nav {
    display: flex;
    align-items: center;
    gap: toRem(20);
}

.nav-btn {
    background: transparent;
    border: 1px solid #000;
    padding: toRem(8) toRem(16);
    font-size: toRem(11);
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    transition: background 0.2s;
    height: fit-content;
}

.nav-btn:hover {
    background: #fff;
}

.genealogy-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: toRem(40);
}

.auth-box {
    width: 100%;
    max-width: toRem(500);
}

.auth-stage {
    margin-bottom: toRem(48);
    text-align: center;
}

.auth-stage h2 {
    font-size: toRem(48);
    letter-spacing: -0.04em;
    margin: 0;
    line-height: 1;
}

.subtitle {
    font-size: toRem(16);
    color: #333333;
    margin-top: toRem(12);
}

.auth-grid {
    background: #fff;
    border: 1px solid #000;
    padding: toRem(40);
}

.email-form {
    display: flex;
    flex-direction: column;
    gap: toRem(24);
}

.input-genealogy {
    display: flex;
    flex-direction: column;
    gap: toRem(8);
}

.input-genealogy label {
    font-family: $font-mono;
    font-size: toRem(10);
    font-weight: 700;
    color: #000;
}

.input-genealogy input {
    padding: toRem(14);
    border: 1px solid #000;
    font-size: toRem(14);
    outline: none;
    background: #fff;
}

.input-genealogy input:focus {
    background: #fdfdfd;
}

.btn-genealogy-primary {
    margin-top: toRem(8);
    padding: toRem(16);
    background: #008412;
    color: #fff;
    border: 1px solid #000;
    font-size: toRem(11);
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: transform 0.1s;
}

.btn-genealogy-primary:hover:not(:disabled) {
    filter: brightness(1.1);
}

.btn-genealogy-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.genealogy-footer {
    margin-top: toRem(24);
    text-align: center;
}

.genealogy-footer p {
    font-family: $font-mono;
    font-size: toRem(10);
    color: #666;
}

* {
    border-radius: 0 !important;
}

@media (max-width: toRem(600)) {
    .genealogy-header {
        padding: 0 toRem(20);
    }

    .auth-grid {
        padding: toRem(24);
    }

    .auth-stage h2 {
        font-size: toRem(32);
    }
}
</style>
