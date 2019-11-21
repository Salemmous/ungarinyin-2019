<script>
    import OCRDoc from "./components/OCRDoc.svelte";
    import Modal from "./components/Modal.svelte";
    import DocLister from "./components/DocLister.svelte";
    import { credentials } from "./aws.config";
    import { currentDocument } from "./document.list";

    let key = "";
    let secret = "";
</script>

<style>
    .modal-content {
        display: flex;
        flex-direction: column;
    }

    nav {
        background-color: #333333;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    nav button {
        background: none;
        border: none;
        color: #fff;
        margin: 0;
        padding: 1em;
        cursor: pointer;
    }
</style>

<nav>
    <button on:click={() => currentDocument.set('')}>Home</button>
    {#if $credentials.key && $credentials.secret}
        <button on:click={() => credentials.set({})}>Logout</button>
    {/if}
</nav>
{#if !$credentials.key && !$credentials.secret}
    <Modal opened={true} canClose={false}>
        <div class="modal-content">
            <h2>Please enter AWS Credentials</h2>
            <span>Key</span>
            <input bind:value={key} placeholder="Key" />
            <span>Secret</span>
            <input bind:value={secret} placeholder="Secret" />
            <button
                on:click={() => credentials.set({ key, secret })}
                disabled={!key || !secret}>
                Set
            </button>
        </div>
    </Modal>
{/if}
{#if $currentDocument}
    <OCRDoc document={$currentDocument} />
{:else}
    <DocLister />
{/if}
