<template>
    <form @submit.prevent="handleSubmit" class="person-form">
        <div class="input-genealogy">
            <label>Nom</label>
            <input type="text" v-model="form.surname" placeholder="Nom de famille" required />
        </div>

        <div class="input-genealogy">
            <label>Prénom</label>
            <input type="text" v-model="form.name" placeholder="Prénom" />
        </div>

        <div class="input-genealogy">
            <label>Date de naissance</label>
            <input type="date" v-model="form.birthDate" />
        </div>

        <div class="input-genealogy">
            <label>Date de décès</label>
            <input type="date" v-model="form.deathDate" />
        </div>

        <div class="input-genealogy">
            <label>Genre</label>
            <select v-model="form.gender">
                <option value="">Sélectionner le genre</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
                <option value="Other">Autre / Inconnu</option>
            </select>
        </div>

        <div class="input-genealogy">
            <label>Parent</label>
            <select v-model="form.parent1Id">
                <option :value="null">Aucun</option>
                <option v-for="person in persons" :key="person._id" :value="person._id">
                    {{ person.surname }} {{ person.name }}
                </option>
            </select>
        </div>

        <div class="input-genealogy">
            <label>Image</label>
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" />
        </div>

        <div class="form-actions">
            <button type="submit" class="submit-btn btn-genealogy-primary">
                {{ person ? 'Modifier la personne' : 'Ajouter la personne' }}
            </button>
            <button v-if="person" type="button" @click="$emit('cancel')" class="cancel-btn">
                Annuler
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Person } from '~/types/person'

const props = defineProps<{
    persons: Person[],
    person?: Person | null
}>()

const emit = defineEmits<{
    submit: [data: Partial<Person> & { image?: File | null }],
    cancel: []
}>()

const form = ref<Partial<Person> & { image: File | null }>({
    surname: "",
    name: "",
    birthDate: "",
    deathDate: "",
    gender: "",
    parent1Id: null,
    relativeId: null,
    image: null,
})

const fileInput = ref<HTMLInputElement | null>(null)

watch(() => props.person, (newPerson) => {
    // Reset le champ fichier visuellement à chaque changement de personne
    if (fileInput.value) {
        fileInput.value.value = ''
    }

    if (newPerson) {
        form.value = {
            surname: newPerson.surname || "",
            name: newPerson.name || "",
            birthDate: newPerson.birthDate ? new Date(newPerson.birthDate).toISOString().split('T')[0] : "",
            deathDate: newPerson.deathDate ? new Date(newPerson.deathDate).toISOString().split('T')[0] : "",
            gender: newPerson.gender || "",
            parent1Id: newPerson.parent1Id || null,
            relativeId: (newPerson as any).relativeId || null,
            image: null,
        }
    } else {
        form.value = {
            surname: "",
            name: "",
            birthDate: "",
            deathDate: "",
            gender: "",
            parent1Id: null,
            relativeId: null,
            image: null,
        }
    }
}, { immediate: true })

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        form.value.image = file
    }
}

const handleSubmit = () => {
    // On envoie les données au parent (index.vue)
    emit('submit', { ...form.value })

    // On remet le formulaire à zéro
    form.value = {
        surname: "",
        name: "",
        birthDate: "",
        deathDate: "",
        gender: "",
        parent1Id: null,
        relativeId: null,
        image: null,
    }

    // On vide l'input de type file visuellement
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>

<style lang="scss" scoped>
.person-form {
    display: flex;
    flex-direction: column;
    gap: toRem(24);
    width: 100%;
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
    color: $color-text;
    text-transform: uppercase;
}

.input-genealogy input,
.input-genealogy select {
    padding: toRem(14);
    border: 1px solid $color-border;
    font-size: toRem(14);
    outline: none;
    background: $color-surface;
    font-family: $font-sans;
}

.input-genealogy input:focus,
.input-genealogy select:focus {
    background: #fdfdfd;
}

.input-genealogy input[type="file"] {
    padding: toRem(10);
}

.form-actions {
    display: flex;
    gap: toRem(12);
    margin-top: toRem(8);
}

.submit-btn,
.cancel-btn {
    padding: toRem(16);
    font-size: toRem(11);
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    border: 1px solid $color-border;
    transition: filter 0.1s, background 0.1s;
    flex: 1;
}

.submit-btn {
    background: $color-accent;
    color: $color-surface;
}

.submit-btn:hover {
    filter: brightness(1.1);
}

.cancel-btn {
    background: transparent;
    color: $color-text;
}

.cancel-btn:hover {
    background: #f5f5f5;
}
</style>