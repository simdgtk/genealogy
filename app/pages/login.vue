<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

const email = ref("");
const password = ref("");
const name = ref("");
const isSignUp = ref(false);

const handleEmailAuth = async () => {
    if (isSignUp.value) {
        await authClient.signUp.email({
            email: email.value,
            password: password.value,
            name: name.value,
            callbackURL: "/dashboard"
        }, {
            onSuccess: (ctx) => {
                console.log(ctx)
                navigateTo("/dashboard")
            },
            onError: (ctx) => alert(ctx.error.message),
        });
    } else {
        await authClient.signIn.email({
            email: email.value,
            password: password.value,
            callbackURL: "/dashboard"
        }, {
            onSuccess: (ctx) => {
                console.log(ctx)
                navigateTo("/dashboard")
            },
            onError: (ctx) => alert(ctx.error.message),
        });
    }
};

const handleSocialSignIn = async (provider: 'github' | 'google') => {
    await authClient.signIn.social({
        provider: provider,
        callbackURL: "/dashboard",
        disableRedirect: true,
    }, {
        onSuccess: (ctx) => {
            if (ctx.data?.url) window.location.href = ctx.data.url;
        },
        onError: (ctx) => alert(ctx.error.message)
    });
};
</script>

<template>
    <div class="genealogy-auth">
        <header class="genealogy-header">
            <div class="genealogy-logo"></div>
            <nav class="genealogy-nav">
                <button @click="isSignUp = !isSignUp" class="nav-btn">
                    {{ isSignUp ? "S'inscrire" : "Se connecter" }}
                </button>
            </nav>
        </header>

        <main class="genealogy-content">
            <div class="auth-box">
                <div class="auth-stage">
                    <h2>{{ isSignUp ? 'Créer un compte' : 'Se connecter' }}</h2>
                    <p class="subtitle">{{ isSignUp ? 'Rejoignez le projet genealogique.' : 'Créez votre fresque.' }}
                    </p>
                </div>

                <div class="auth-grid">
                    <div class="social-section">
                        <button @click="handleSocialSignIn('github')" class="btn-genealogy-social">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000"
                                viewBox="0 0 256 256">
                                <path
                                    d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z">
                                </path>
                            </svg>
                            GitHub
                        </button>
                        <button @click="handleSocialSignIn('google')" class="btn-genealogy-social">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000"
                                viewBox="0 0 256 256">
                                <path
                                    d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z">
                                </path>
                            </svg>
                            Google
                        </button>
                    </div>

                    <div class="divider">
                        <span>ou</span>
                    </div>

                    <form @submit.prevent="handleEmailAuth" class="email-form">
                        <div v-if="isSignUp" class="input-genealogy">
                            <label>Nom complet</label>
                            <input type="text" v-model="name" placeholder="Nom complet" required />
                        </div>
                        <div class="input-genealogy">
                            <label>Adresse mail</label>
                            <input type="email" v-model="email" placeholder="mail@entreprise.com" required />
                        </div>
                        <div class="input-genealogy">
                            <label>Mot de passe</label>
                            <input type="password" v-model="password" placeholder="••••••••••" required />
                        </div>
                        <button type="submit" class="btn-genealogy-primary">
                            {{ isSignUp ? 'S\'inscrire' : 'Se connecter' }}
                        </button>
                    </form>
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
    max-width: 500px;
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
}

.social-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn-genealogy-social {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid #000;
    background: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: transform 0.1s;
}

.btn-genealogy-social:hover {
    background: #f5f5f5;
}

.btn-genealogy-social:active {
    transform: translateY(1px);
}

.divider {
    display: flex;
    align-items: center;
    margin: 32px 0;
    font-family: 'JetBrains Mono', monospace;
}

.divider::before,
.divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #000;
}

.divider span {
    margin: 0 16px;
    font-size: 10px;
    font-weight: 600;
    color: #888;
}

.email-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.input-genealogy {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-genealogy label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #000;
}

.input-genealogy input {
    padding: 14px;
    border: 1px solid #000;
    font-size: 14px;
    outline: none;
    background: #fff;
}

.input-genealogy input:focus {
    background: #fdfdfd;
}

.btn-genealogy-primary {
    margin-top: 8px;
    padding: 16px;
    background: #008412;
    color: #fff;
    border: 1px solid #000;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: transform 0.1s;
}

.btn-genealogy-primary:hover {
    filter: brightness(1.1);
}

.btn-genealogy-primary:active {
    transform: translateY(1px);
}

.genealogy-footer {
    margin-top: 24px;
    text-align: center;
}

.genealogy-footer p {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #666;
}

.genealogy-footer a {
    color: #000;
    text-decoration: underline;
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
