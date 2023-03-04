<template>
    <div class="p-3 container mx-auto h-screen relative pb-5">
        <h1 class="text-4xl font-bold text-center mt-5">Japanese OCR</h1>
        <p class="text-2xl text-center mt-5 mb-10">Recognize Japanese text from any image using OCR (Optical Character Recognition)</p>
        <div
            v-if="!result && !loading"
            class="rounded-md border-2 border-dashed border-blue-500 w-full sm:w-1/2 mx-auto flex flex-col justify-center items-center p-5 cursor-pointer
                   hover:brightness-125 transition duration-150"
            @click="toggleFileSelect()"
            @drop="processImageFileSelect"
            @dragover="e => e.preventDefault()"
        >
            <svg class="w-64 h-64 fill-blue-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 24 24">
                <path
                    d="M11 19h2v-4.175l1.6 1.6L16 15l-4-4l-4 4l1.425 1.4L11 14.825Zm-7 3V2h10l6 6v14Zm9-13V4H6v16h12V9ZM6 4v5v-5v16Z" />
            </svg>
            <p class="text-blue-400">Pick or drop a file!</p>
            <input type="file" accept="image/*" id="imageFilePicker" class="hidden" @change="processImageFileSelect">
        </div>
        <div v-if="loading && !result">
            <svg class="w-32 h-32 fill-blue-400 my-10 mx-auto" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg>
        </div>
        <div v-if="result" class="flex flex-col gap-5 items-center justify-center">
            <h1>Your result is:</h1>
            <p class="p-2 rounded-md bg-neutral-600">{{ result }}</p>
            <button class="p-2 rounded-md bg-blue-500 hover:bg-blue-600 transition duration-150" @click="result = null">Again!</button>
        </div>
        <div id="footer" class="text-center absolute bottom-5 left-[50%] translate-x-[-50%]">
            <i class="text-gray-500">Yes, this is intentionally dumb and simple</i>
            <p>Copyright (c) 2023  <a class="font-bold text-blue-400" href="https://github.com/TibixDev">TibixDev</a></p>
        </div>
    </div>
</template>

<script setup>
import Tesseract from 'tesseract.js';
import { inject } from 'vue';
const swal = inject("$swal");
let result = $ref(null);
let loading = $ref(false);

/**
 * Toggles the file select with a simulated click
 */
function toggleFileSelect() {
    document.querySelector("#imageFilePicker").click();
}

function processImageFileSelect(event) {
    console.log("🚀 ~ file: Home.vue:51 ~ processImageFileSelect ~ event:", event)
    console.log("🚀 ~ file: Home.vue:51 ~ processImageFileSelect ~ eventFiles:", event.target.files[0])
    event.preventDefault();
    loading = true;
    let file;
    try {
        if (event?.dataTransfer?.items) {
            // Use DataTransferItemList interface to access the file(s)
            if (event.dataTransfer.items[0].kind === 'file') {
                const lFile = event.dataTransfer.items[0].getAsFile();
                console.log(`[FileDrop] Type: ${lFile.type}`);
                if (lFile.type.includes("image")) {
                    console.log(`[FileDrop] Setting image source to ${lFile.name}`);
                    file = URL.createObjectURL(lFile);
                }
            }
        } else if (event.dataTransfer?.files) {
            // Use DataTransfer interface to access the file(s)
            const lFile = event.dataTransfer.files[0];
            console.log(`[FileDrop] Type: ${lFile.type}`);
            if (lFile.type.includes("image")) {
                console.log(`[FileDrop] Setting image source to ${lFile.name}`);
                file = URL.createObjectURL(lFile);
            }
        } else {
            // Use target files interface to access the file(s)
            const lFile = event.target.files[0];
            console.log(`[FileDrop] Type: ${lFile.type}`);
            if (lFile.type.includes("image")) {
                console.log(`[FileDrop] Setting image source to ${lFile.name}`);
                file = URL.createObjectURL(lFile);
            }
        }
        console.log(`[ImageFile] Type: ${file.type}`);
        Tesseract.recognize(
            file,
            'jpn',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            console.log("Final:", text);
            result = text;
        }).finally(() => {
            loading = false;
        })
    } catch(e) {
        console.error("An error occured.", e);
        loading = false;
        swal({
            icon: "error",
            title: "Oops...",
            html: `<p>There was an error trying to recognize the characters.</p>
                <p class='font-mono mt-2 bg-gray-700 rounded-md p-2'>${e}</p>`,
        });
    }
}
</script>

<style scoped></style>