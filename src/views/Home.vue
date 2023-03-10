<template>
    <div class="p-3 container mx-auto min-h-screen relative pb-[10rem]">
        <h1 class="text-4xl font-bold text-center mt-5">Japanese OCR</h1>
        <p class="text-2xl text-center mt-5 mb-10">Recognize Japanese text from any image using OCR (Optical Character
            Recognition)</p>
        <div v-if="!result && !loading" class="rounded-md border-2 border-dashed border-blue-500 w-full sm:w-1/2 mx-auto flex flex-col justify-center items-center p-5 cursor-pointer
                               hover:brightness-125 transition duration-150" @click="toggleFileSelect()"
            @drop="processImageFileSelect" @dragover="e => e.preventDefault()">
            <svg class="w-64 h-64 fill-blue-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 24 24">
                <path
                    d="M11 19h2v-4.175l1.6 1.6L16 15l-4-4l-4 4l1.425 1.4L11 14.825Zm-7 3V2h10l6 6v14Zm9-13V4H6v16h12V9ZM6 4v5v-5v16Z" />
            </svg>
            <p class="text-blue-400">Pick or drop a file!</p>
            <input type="file" accept="image/*" id="imageFilePicker" class="hidden" @change="processImageFileSelect">
        </div>
        <div v-if="loading && !result">
            <svg class="w-32 h-32 fill-blue-400 my-10 mx-auto" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                viewBox="0 0 24 24">
                <path
                    d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                    <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate"
                        values="0 12 12;360 12 12" />
                </path>
            </svg>
        </div>
        <div v-if="result" class="flex flex-col gap-5 items-center justify-center">
            <h1 class="">Your result is:</h1>
            
            <div class="p-2 rounded-md bg-neutral-600">
                <p v-for="line, k in linesObject">{{ line.text }}</p>
            </div>
            <button class="p-2 rounded-md bg-blue-500 hover:bg-blue-600 transition duration-150" @click="reset()">Again!</button>    
        </div>
        <div class="flex justify-center">
            <div v-if="imageObject" class="my-5 relative inline-block">
                <img id="ocrImage" :src="imageObject" alt="OCR candidate">
                <div :style="`opacity: ${overlayOpacity}%`" v-if="linesObject" v-for="line, k in linesObject" :key="k">
                    <div :id="`line-${k}`" class="absolute bg-gray-700/70" :style="getBoxStyle(line.bbox)">
                        <span class="absolute top-[50%] translate-y-[-50%] left-0 leading-none text-gray-700/70 w-full">
                            {{ line.text.replaceAll(" ", "") }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="imageObject" class="flex justify-center">
            <input v-model="overlayOpacity" type="range" min="0" max="100">
        </div>
        <div id="footer" class="text-center absolute bottom-5 left-[50%] translate-x-[-50%]">
            <i class="text-gray-500">Yes, this is intentionally dumb and simple</i>
            <p>Copyright (c) 2023 <a class="font-bold text-blue-400" href="https://github.com/TibixDev">TibixDev</a></p>
        </div>
    </div>
</template>

<script setup>
import Tesseract from 'tesseract.js';
import { inject } from 'vue';
const swal = inject("$swal");
let result = $ref(null);
let loading = $ref(false);
let imageObject = $ref(null);
let imageData = $ref(null);
let linesObject = $ref(null);
let overlayOpacity = $ref(100);

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
        imageObject = file;

        Tesseract.recognize(
            file,
            'jpn',
            { logger: m => console.log(m) }
        ).then(({ data: { text, lines } }) => {
            console.log("Final:", text);
            console.log("Lines:", lines);
            linesObject = lines;
            result = text;
            const imageTag = document.getElementById("ocrImage");
            imageData = { w: imageTag.naturalWidth, h: imageTag.naturalHeight }
            // TODO: Ugly hack please never do this again and remove it
            setTimeout(() => {
                for (let i = 0; i < lines.length; i++) {
                    setMaxFontSize(`line-${i}`)
                }
            }, 100);
        }).finally(() => {
            loading = false;
        })
    } catch (e) {
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

function percentageH(inp) {
    console.log(`${inp} | ${imageData.h} | ${(inp / imageData.h) * 100}`);
    return (inp / imageData.h) * 100;
}

function percentageW(inp) {
    console.log(`${inp} | ${imageData.w} | ${(inp / imageData.w) * 100}`);
    return (inp / imageData.w) * 100;
}

function getBoxStyle(bbox) {
    const boxStart = `top: ${percentageH(bbox.y0)}%; left: ${percentageW(bbox.x0)}%;`;
    const boxSize = `height: ${percentageH(bbox.y1 - bbox.y0)}%; width: ${percentageW(bbox.x1 - bbox.x0)}%;`;
    return [boxStart, boxSize].join(" ");
}

function setMaxFontSize(divId) {
    const div = document.getElementById(divId);
    const maxHeight = div.offsetHeight;
    const fontFamily = window.getComputedStyle(div).fontFamily;
    let fontSize = 20;

    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    span.style.fontSize = fontSize + 'px';
    span.innerText = div.innerText;

    document.body.appendChild(span);

    while (span.offsetHeight <= maxHeight) {
        fontSize++;
        span.style.fontSize = fontSize + 'px';
    }

    const maxFontSize = fontSize - 4;

    document.body.removeChild(span);

    div.style.fontSize = maxFontSize + 'px';
}

function reset() {
    result = null;
    imageData = null;
    imageObject = null;
    imageData = null;
    linesObject = null;
}
</script>

<style scoped></style>