<template>
    <div class="person-list">
        <div v-for="person in persons" :key="person._id" class="person-item">
            <div class="person-info">
                <div class="person-avatar" v-if="person.mediaUrl">
                    <img :src="person.mediaUrl" alt="" />
                </div>
                <div class="person-avatar fallback" v-else>
                    {{ person.name ? person.name.charAt(0) : person.surname.charAt(0) }}
                </div>
                <span class="person-name">{{ person.surname }} {{ person.name }}</span>
            </div>
            <div class="actions">
                <button @click="$emit('edit', person)" class="action-btn btn-edit">Éditer</button>
                <button @click="$emit('delete', person._id!)" class="action-btn btn-delete">Supprimer</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Person } from '~/types/person'

defineProps<{
    persons: Person[]
}>()

defineEmits<{
    delete: [id: string],
    edit: [person: Person]
}>()
</script>

<style lang="scss" scoped>
.person-list {
    display: flex;
    flex-direction: column;
}

.person-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: toRem(16);
    border-bottom: 1px solid $color-border;
    transition: background 0.1s;
}

.person-item:last-child {
    border-bottom: none;
}

.person-item:hover {
    background: #fdfdfd;
}

.person-info {
    display: flex;
    align-items: center;
    gap: toRem(16);
}

.person-avatar {
    width: toRem(40);
    height: toRem(40);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-bg;
    border: 1px solid $color-border;
}

.person-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.person-avatar.fallback {
    font-family: $font-mono;
    font-size: toRem(16);
    font-weight: 700;
    color: $color-muted;
    text-transform: uppercase;
}

.person-name {
    font-weight: 700;
    font-size: toRem(16);
}

.actions {
    display: flex;
    gap: toRem(8);
}

.action-btn {
    padding: toRem(6) toRem(12);
    font-size: toRem(10);
    font-weight: 700;
    cursor: pointer;
    border: 1px solid $color-border;
    transition: background 0.1s, color 0.1s;
}

.btn-edit {
    background: transparent;
    color: $color-text;
}

.btn-edit:hover {
    background: $color-text;
    color: $color-surface;
}

.btn-delete {
    background: $color-danger;
    color: $color-surface;
    border-color: $color-danger-dark;
}

.btn-delete:hover {
    background: $color-danger-dark;
}
</style>
