<script>
    import Spinner from "./Spinner.svelte";
    import PDFJS from "pdfjs-dist";
    import { onMount } from "svelte";
    let canvas;
    let pages = [];
    let ctx;

    export let url = "/cess_officiel.pdf";
    export let page = 1;
    export let pageCount;
    export let focusedWord;

    let pageLoaded = false;

    let canvasWidth = 512;
    let canvasHeight = 512;

    $: changePage(page);
    $: loadDocument(url);
    $: focusWord(focusedWord);

    let mounted = false;

    onMount(async () => {
        mounted = true;
        await loadDocument(url);
    });

    let pdf;

    let lastPage;

    const redrawPage = () => {
        if (!lastPage) return;
        ctx.drawImage(lastPage, 0, 0, canvasWidth, canvasHeight);
    };

    const focusWord = async word => {
        redrawPage();
        if (!word || !ctx) return;
        const {
            Geometry: {
                BoundingBox: { Left, Top, Width, Height }
            }
        } = word;
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = "#f004";
        ctx.fillStyle = "#f004";
        const left = canvasWidth * Left;
        const top = canvasHeight * Top;
        const width = canvasWidth * Width;
        const height = canvasHeight * Height;
        ctx.rect(left - 2, top - 2, width + 4, height + 4);
        ctx.fillRect(left - 2, top - 2, width + 4, height + 4);
        ctx.font = "16px Roboto";
        ctx.fillStyle = "#f00";
        ctx.strokeStyle = "#fff";
        ctx.strokeText(word.Text, left, top + height + 16);
        ctx.fillText(word.Text, left, top + height + 16);
        ctx.stroke();
    };

    const loadDocument = async url => {
        if (!url || !canvas) return;
        ctx = canvas.getContext("2d");
        pdf = await PDFJS.getDocument(url).promise;
        pageCount = pdf.numPages;
        changePage(page);
    };

    const getPage = async index => {
        if (!pdf) return;
        try {
            const pdfPage = await pdf.getPage(index);
            const scale = 1;
            const viewport = pdfPage.getViewport({ scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await pdfPage.render(renderContext).promise;
            return canvas.toDataURL();
        } catch (e) {
            console.error(e);
        }
    };

    const changePage = async index => {
        const pageData = await getPage(index);
        if (!pageData) return;
        await new Promise((resolve, reject) => {
            const img = new Image();
            lastPage = 0;
            img.onerror = reject;
            img.onload = () => {
                const width =
                    ctx.canvas.width < img.width ? ctx.canvas.width : img.width;
                const height =
                    ctx.canvas.width < img.width
                        ? (img.height * ctx.canvas.width) / img.width
                        : img.height;
                canvasHeight = height;
                canvasWidth = width;
                ctx.drawImage(img, 0, 0, width, height);
                lastPage = img;
                pageLoaded = true;
                resolve(true);
            };
            pageLoaded = false;
            img.src = pageData;
        });
    };
</script>

<style>
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
</style>

{#if !pageLoaded}
    <div class="loading">
        <Spinner />
        <span>Loading PDF</span>
    </div>
{/if}
<canvas
    width={512}
    height={512}
    style={`width: ${canvasWidth}px;height: ${canvasHeight}px;`}
    bind:this={canvas} />
