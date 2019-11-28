<template lang="pug">
  section
    .d-flex.justify-content-between.mb-3
      h2
        font-awesome-icon(icon="users").mr-2
        | Members [{{alives}}/{{total}}]
      button.btn.btn-primary(@click="healthCheck") Health-Check
    .card-deck.flex-wrap
      .card(
        v-for="(v,i) in members"
        :key="i"
        :class="{alive: isAlive(v.status), dead: !isAlive(v.status)}"
      )
        .card-body
          .card-title {{v.number}}:{{v.name}}
          .card-text
            p {{v.id}}
            p {{getStatusText(v.status)}}
</template>

<script>
export default {
  props: {
    'alives': {
      type: Number,
      'default': 0
    },
    'total': {
      type: Number,
      'default': 0
    },
    'members': {
      type: Object,
      require: true,
      'default': () => ({})
    }
  },
  methods: {
    healthCheck() {
      this.$emit("check")
    },
    isAlive(status) {
      return (parseInt(status) === 1)
    },
    getStatusText(status) {
      let text = null
      switch (parseInt(status)) {
        case 1:
          text = 'Alive'
          break;
        case 0:
          text = 'Dead'
          break;
        default:
          text = 'Unknown'
          break;
      }
      return text
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  min-width: 200px;
  max-width: 200px;
  margin-bottom: 1em;
  &.alive{
    border: 3px solid var(--success);
  }
  &.dead{
    border: 3px solid var(--danger);
}
}
</style>
