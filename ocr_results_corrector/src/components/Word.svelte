<script>
    export let word;

    /**
     * A linear interpolator for hexadecimal colors
     * @param {String} a
     * @param {String} b
     * @param {Number} amount
     * @example
     * // returns #7F7F7F
     * lerpColor('#000000', '#ffffff', 0.5)
     * @returns {String}
     */
    function lerpColor(a, b, amount) {
        const ah = +a.replace("#", "0x");
        const ar = ah >> 16;
        const ag = (ah >> 8) & 0xff;
        const ab = ah & 0xff;
        const bh = +b.replace("#", "0x");
        const br = bh >> 16;
        const bg = (bh >> 8) & 0xff;
        const bb = bh & 0xff;
        const rr = ar + amount * (br - ar);
        const rg = ag + amount * (bg - ag);
        const rb = ab + amount * (bb - ab);

        return (
            "#" +
            (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0)
                .toString(16)
                .slice(1)
        );
    }

    $: color = lerpColor("#cc3333", "#33cc33", word.Confidence / 100);
</script>

<style>
    input {
        font-size: 1em;
        padding: 0.5em;
    }
</style>

<input
    bind:value={word.Text}
    style={`color: ${color}; width: ${word.Text.length + 2}ch;`}
    on:focus
    on:input />
