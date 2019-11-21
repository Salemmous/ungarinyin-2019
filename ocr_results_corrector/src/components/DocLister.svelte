<script>
    import { documents, currentDocument } from "../document.list";
    import Spinner from "./Spinner.svelte";
</script>

<style>
    main {
        display: flex;
        flex-direction: column;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    ul li {
        list-style-type: none;
        color: #333333;
        padding: 1em 0.5em;
        cursor: pointer;
        border-bottom: 1px solid #cc6633;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        padding: 3em;
    }

    .loading > *:not(:first-child) {
        margin-top: 1em;
    }
</style>

<main>
    <ul>
        {#each $documents as doc}
            <li on:click={() => currentDocument.set(doc.Name)}>{doc.Name}</li>
        {:else}
            <div class="loading">
                <Spinner />
                <span>Loading documents</span>
            </div>
        {/each}
    </ul>
</main>
