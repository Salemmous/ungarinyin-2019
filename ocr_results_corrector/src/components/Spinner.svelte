<script>
    export let size = 128;
</script>

<style>
    .spinner {
        border: 16px solid #cccccc;
        border-top: 16px solid #cc6633;
        border-radius: 50%;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<div class="spinner" style={`width: ${size}px;height: ${size}px;`} />
