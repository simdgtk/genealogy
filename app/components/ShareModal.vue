<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Gérer les accès</h3>
                <button class="close-btn" @click="close">&times;</button>
            </div>

            <div class="modal-body">
                <p class="subtitle">Membres ayant accès à cet arbre</p>

                <div class="share-list" v-if="localShares && localShares.length > 0">
                    <div v-for="share in localShares" :key="share.userId" class="share-item">
                        <span class="share-email">{{ share.email }}</span>
                        <div class="share-controls">
                            <label class="role-toggle">
                                <input type="checkbox" :checked="share.canEdit"
                                    @change="updateRole(share.userId, !share.canEdit)">
                                <span>Éditeur</span>
                            </label>
                            <button class="remove-btn" @click="removeShare(share.userId)">Retirer</button>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    Personne d'autre n'a accès à cet arbre pour le moment.
                </div>

                <div class="divider"></div>

                <h4>Inviter quelqu'un</h4>
                <form @submit.prevent="addShare" class="invite-form">
                    <input type="email" v-model="newEmail" placeholder="Adresse e-mail de l'invité" required
                        class="invite-input">
                    <label class="role-toggle new-role" :class="{ canEdit: newCanEdit }">
                        <input type="checkbox" v-model="newCanEdit">
                        <span>Peut éditer l'arbre</span>
                    </label>
                    <button type="submit" class="btn-genealogy-primary" :disabled="isLoading">
                        {{ isLoading ? 'En cours...' : 'Inviter' }}
                    </button>
                </form>
                <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
                <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    isOpen: boolean;
    familyId: string;
    sharedWith: any[];
}>();

const emit = defineEmits(['close', 'shares-updated']);

const localShares = ref([...props.sharedWith]);
const newEmail = ref('');
const newCanEdit = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

watch(() => props.sharedWith, (newVal) => {
    localShares.value = [...newVal];
});

watch(() => props.isOpen, () => {
    if (props.isOpen) {
        errorMessage.value = '';
        successMessage.value = '';
        newEmail.value = '';
        newCanEdit.value = false;
    }
});

const close = () => {
    emit('close');
};

const showMessage = (msg: string, isError = false) => {
    if (isError) {
        errorMessage.value = msg;
        successMessage.value = '';
    } else {
        successMessage.value = msg;
        errorMessage.value = '';
        setTimeout(() => { successMessage.value = ''; }, 3000);
    }
};

const addShare = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const res = await $fetch('/api/share', {
            method: 'POST',
            body: {
                familyId: props.familyId,
                email: newEmail.value,
                canEdit: newCanEdit.value
            },
            headers: useRequestHeaders(['cookie']) as Record<string, string>,
            credentials: 'include'
        });

        emit('shares-updated', (res as any).sharedWith);
        newEmail.value = '';
        newCanEdit.value = false;
        showMessage('Invitation envoyée !');
    } catch (err: any) {
        showMessage(err.data?.statusMessage || err.message || 'Erreur lors de l\'invitation', true);
    } finally {
        isLoading.value = false;
    }
};

const updateRole = async (userId: string, canEdit: boolean) => {
    try {
        const res = await $fetch('/api/share', {
            method: 'PUT',
            body: {
                familyId: props.familyId,
                userId,
                canEdit
            },
            headers: useRequestHeaders(['cookie']) as Record<string, string>,
            credentials: 'include'
        });
        emit('shares-updated', (res as any).sharedWith);
        showMessage('Rôle mis à jour');
    } catch (err: any) {
        showMessage('Erreur lors de la mise à jour du rôle', true);
    }
};

const removeShare = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer l\'accès à cette personne ?')) return;

    try {
        const res = await $fetch('/api/share', {
            method: 'DELETE',
            body: {
                familyId: props.familyId,
                userId
            },
            headers: useRequestHeaders(['cookie']) as Record<string, string>,
            credentials: 'include'
        });
        emit('shares-updated', (res as any).sharedWith);
        showMessage('Accès retiré');
    } catch (err: any) {
        showMessage('Erreur lors de la suppression de l\'accès', true);
    }
};
</script>

<style lang="scss" scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: $color-surface;
    border: 1px solid $color-text;
    width: 100%;
    max-width: toRem(500);
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 toRem(10) toRem(30) rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: toRem(20) toRem(24);
    border-bottom: 1px solid $color-text;
    background: $color-bg;

    h3 {
        margin: 0;
        font-size: toRem(20);
        letter-spacing: -0.02em;
    }
}

.close-btn {
    background: none;
    border: none;
    font-size: toRem(24);
    cursor: pointer;
    line-height: 1;
    padding: 0;
}

.modal-body {
    padding: toRem(24);
}

.subtitle {
    margin-top: 0;
    font-size: toRem(14);
    color: $color-gray1;
    margin-bottom: toRem(16);
}

.share-list {
    display: flex;
    flex-direction: column;
    border: 1px solid $color-text;
    margin-bottom: toRem(24);
}

.share-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: toRem(12) toRem(16);
    border-bottom: 1px solid $color-text;

    &:last-child {
        border-bottom: none;
    }
}

.share-email {
    font-family: $font-mono;
    font-size: toRem(12);
}

.share-controls {
    display: flex;
    align-items: center;
    gap: toRem(16);
}

.role-toggle {
    display: flex;
    align-items: center;
    font-size: toRem(12);
    cursor: pointer;
    padding: toRem(8);

    &.canEdit {
        background-color: $color-text;
        color: $color-surface;
    }

    input {
        cursor: pointer;
    }
}

.remove-btn {
    background: transparent;
    border: 1px solid #cc0000;
    color: #cc0000;
    font-size: toRem(10);
    padding: toRem(4) toRem(8);
    cursor: pointer;

    &:hover {
        background: #cc0000;
        color: white;
    }
}

.empty-state {
    text-align: center;
    padding: toRem(20);
    font-style: italic;
    font-size: toRem(13);
    color: $color-gray1;
    border: 1px dashed $color-text;
}

.divider {
    height: 1px;
    background: $color-text;
    margin: toRem(24) 0;
}

h4 {
    margin-top: 0;
    margin-bottom: toRem(16);
    font-size: toRem(16);
}

.invite-form {
    display: flex;
    flex-direction: column;
    gap: toRem(16);
}

.invite-input {
    width: 100%;
    padding: toRem(12);
    border: 1px solid $color-text;
    background: $color-bg;
    font-family: $font-mono;
    font-size: toRem(14);
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: $color-green;
    }
}

.new-role {
    font-size: toRem(14);
    margin-bottom: toRem(8);
}

.btn-genealogy-primary {
    padding: toRem(12);
    background: $color-green;
    color: $color-surface;
    border: 1px solid $color-text;
    font-size: toRem(12);
    font-weight: 800;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        filter: brightness(1.1);
    }
}

.error-msg {
    color: #cc0000;
    font-size: toRem(12);
    margin-top: toRem(12);
}

.success-msg {
    color: $color-green;
    font-size: toRem(12);
    margin-top: toRem(12);
}

* {
    border-radius: 0 !important;
}
</style>
