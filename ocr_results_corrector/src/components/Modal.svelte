<script>
  export let opened = false;
  export let canClose = true;
</script>

<style>
  .popup-container {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: #0009;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-content {
    background: #fff;
    border-radius: 2em;
    padding: 1em;
  }
</style>

<svelte:window
  on:keydown={event => (canClose && opened && event.key === 'Escape' ? (opened = false) : null)} />
{#if opened}
  <div
    class="popup-container"
    on:mousedown={() => (canClose ? (opened = false) : null)}>
    <div class="popup-content" on:mousedown|stopPropagation>
      <slot />
    </div>
  </div>
{/if}
