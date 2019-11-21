<script>
    import {
        getPDFDocumentURL,
        getDocumentContent,
        setDocumentContent
    } from "../document.list";
    import { onMount, afterUpdate } from "svelte";
    import PDFViewer from "./PDFViewer.svelte";
    import Spinner from "./Spinner.svelte";
    import Word from "./Word.svelte";
    import Modal from "./Modal.svelte";
    export let document;

    let pdfURL;
    let content;

    let page = 1;
    let pageCount = 1;

    let focusedWord;

    let changed = false;
    let saving = false;

    const precision = 100;

    $: pageContent =
        content &&
        content
            .filter(({ Page }) => Page === page)
            .sort(
                (
                    {
                        Geometry: {
                            BoundingBox: { Top: aTop, Left: aLeft }
                        }
                    },
                    {
                        Geometry: {
                            BoundingBox: { Top: bTop, Left: bLeft }
                        }
                    }
                ) =>
                    Math.floor(aTop * precision) -
                        Math.floor(bTop * precision) ||
                    Math.floor(aLeft * precision) -
                        Math.floor(bLeft * precision)
            );

    const fetchUrl = async name => {
        if (!name) return;
        pdfURL = pdfURL || (await getPDFDocumentURL(`Typescripts/${name}.pdf`));
        content = content || (await getContent(name));
    };

    const getContent = async name => {
        try {
            const content = await getDocumentContent(`OCR/${name}.json`);
            return content
                .reduce(
                    (acc, cur) => [
                        ...acc,
                        ...(Array.isArray(cur) ? cur : [cur])
                    ],
                    []
                )
                .filter(({ BlockType }) => BlockType === "WORD");
        } catch (e) {
            console.error(e);
        }
    };

    onMount(async () => await fetchUrl(document));
    afterUpdate(async () => await fetchUrl(document));

    const save = async () => {
        saving = true;
        await setDocumentContent(
            `OCR/${document}.json`,
            content
                .filter(word => word.Text)
                .sort(
                    (
                        {
                            Geometry: {
                                BoundingBox: { Top: aTop, Left: aLeft }
                            }
                        },
                        {
                            Geometry: {
                                BoundingBox: { Top: bTop, Left: bLeft }
                            }
                        }
                    ) =>
                        Math.floor(aTop * precision) -
                            Math.floor(bTop * precision) ||
                        Math.floor(aLeft * precision) -
                            Math.floor(bLeft * precision)
                )
        );
        saving = false;
        changed = false;
    };
</script>

<style>
    main {
        display: flex;
    }

    .bar {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        background-color: #cc6633;
    }

    .bar button {
        cursor: pointer;
    }

    .bar input {
        text-align: right;
        padding: 0;
    }

    .bar * {
        color: #333333;
        background: none;
        margin: 0;
        border: none;
        outline: none;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
    }

    .loading > *:not(:first-child) {
        margin-top: 1em;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }

    input[type="number"] {
        -moz-appearance: textfield; /* Firefox */
    }
</style>

<Modal opened={saving} canClose={false}>
    <div class="loading">
        <Spinner />
        <span>Saving content...</span>
    </div>
</Modal>
<div class="bar">
    <div>
        <button on:click={() => (page = page === 0 ? page : page - 1)}>
            Previous
        </button>
        <input
            type="number"
            min={1}
            max={pageCount}
            bind:value={page}
            step="1" />
        <span>/ {pageCount}</span>
        <button on:click={() => (page = page === pageCount ? page : page + 1)}>
            Next
        </button>
    </div>
    {#if changed}
        <button on:click={save}>Save</button>
    {/if}
</div>
<main>
    {#if pdfURL}
        <PDFViewer url={pdfURL} bind:page bind:pageCount {focusedWord} />
    {:else}
        <div class="loading">
            <Spinner />
            <span>Loading PDF url</span>
        </div>
    {/if}
    {#if pageContent}
        <div class="words">
            {#each pageContent as word}
                <Word
                    {word}
                    on:focus={() => (focusedWord = word)}
                    on:input={() => (changed = true)} />
            {/each}
        </div>
    {:else}
        <div class="loading">
            <Spinner />
            <span>Loading words</span>
        </div>
    {/if}
</main>
