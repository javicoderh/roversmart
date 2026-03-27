<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const muralImages = [
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-0663-1-66c4ce.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0151-d069e2.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0238-957b25.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-20250829-180240-ca810a.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/foto-muro-portal-oficial-luz-0f77cc.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/nina-morocco-7d834a.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/20230420-155935-f2de1d.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sanpedro-508550.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0621-124fb6.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0623-eeaf5c.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0666-e6ff31.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/copia-de-ilustracion-sin-titulo-18-c1680e.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/20220812-170914-77b35e.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-6855-fea178.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/copia-de-ilustracion-sin-titulo-18-2-4bb358.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-6949-8897d1.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/fotografia-oficial-cuadro-granada-e5c13f.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/fotografia-oficial-granada-big-c58f23.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0533-e2c40e.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-20220401-185912-1-093d05.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/ninogrillo-oficial-30c168.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0881-47483c.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0893-fd6fc8.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/copia-de-ilustracion-sin-titulo-17-3b5a13.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/copia-de-ilustracion-sin-titulo-17-2-4968cf.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/img-7165-afbcbb.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/ilustracion-sin-titulo-18-5cc3cc.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215xx2VVyLY.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/ready1-92c1bb.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/ilustracion-sin-titulo-17-46207f.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/portada2-1ae145.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/muro-chungungo-foto-test-not-yet-1071a1.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0199-a9a1b0.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/farito-d850b5.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/rata-botones-horizontal-big-oficial-410b32.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/garzafull-18cc65.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/tordo1-0f9e58.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/sss-0899-1-337a8d.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215ycrrKMbZ.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215DTNQ7HGp.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215yAxZj1D6.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215yZcluwx7.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215zgBY0Nc1.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215UXgkBSWv.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215eamKGNNU.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215mPIfDYIM.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215CsydyoIR.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215xzHRVnJA.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215peEqxiCn.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602157K352NBz.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Bwy1yKhA.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215lytH7eDF.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215c8eagR0U.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215g8ECg7qb.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602155hXFI3Wv.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602159EvkpA1s.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Cv1Gd4pm.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215AfHI6Eck.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Fa09QoYk.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Igfif2kb.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215TTCdd6tG.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602154GihnHzP.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215tkHQjAHs.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215hShdWmVM.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215MONF616q.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215C5tZDwP8.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Twv2Qnp5.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602152QDiHWC5.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497roy2.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514155nWyP.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215155c0dR.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142JtU2.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151681EFkF.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142crgu.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215mnpRsJ47.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602152cC2oe5m.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215b8xf7MGe.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215EqAwy3hA.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215RqcEs4D6.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Tz2A2L8P.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215shORhpl1.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215sLa8Mlo8.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602152qV5MGEG.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215Y3TEuyki.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215pJfZcI0t.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602159Wpx4zOy.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602157WUsCUtb.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602154dfMcfP3.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151621ejti.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142zkWd.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602158CNDKAiE.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215R6BTSwHd.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142VIFf.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142Gzs7.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215171425okH.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215172nNdt.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142PiDl.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514973vxK.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497xI8K.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517142pN6V.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497kGmk.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215172XbYX.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021517256ee.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021516216VH5T.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215171424kKa.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151621YO06.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151553Bd2.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215155Infu.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151499HwpH.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514979zkC.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497RLhO.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/160215ICzqZziG.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497FbVF.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497zqx0.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151499rfiA.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514992Lm9.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497ItkI.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497MiY7.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497if0s.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514976aQp.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497cC8O.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497uN2i.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151499mm5m.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497EwV8.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497KMd4.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497g52Q.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497gmnt.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/16021514974z7m.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497yVle.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497viRS.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497qHXt.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497SWyI.jpg",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151499xKmx.png",
  "https://dglb26w8rx2ld.cloudfront.net/000_clients/160215/page/1602151497oReT.jpg"
];

const initialPreloadCount = 8;
const visibleCardCount = 4;
const currentIndex = ref(0);
const loadedImages = ref([]);
const isGalleryReady = ref(false);
const isGhostVisible = ref(true);
const isModalOpen = ref(false);
const modalImageIndex = ref(0);
const animatedPreview = ref(null);
const modalImageVisible = ref(false);
const modalDialog = ref(null);
const cardElements = new Map();
const loadedImageSet = new Set();
let intervalId = 0;
let previewTimeoutId = 0;
let ghostTimeoutId = 0;
let revealTimeoutId = 0;

const cards = computed(() => {
  const pool = loadedImages.value.length ? loadedImages.value : muralImages.slice(0, visibleCardCount);

  return Array.from({ length: visibleCardCount }, (_, index) => {
    const imageIndex = (currentIndex.value + index) % pool.length;

    return {
      id: `smart-gallery-slot-${index + 1}`,
      imageKey: `${imageIndex}-${pool[imageIndex]}`,
      src: pool[imageIndex],
      alt: `Mural Rover Smart ${imageIndex + 1}`,
      className: `slot-${index + 1}`
    };
  });
});

const currentModalImage = computed(() => loadedImages.value[modalImageIndex.value] || "");

onMounted(() => {
  void initializeGallery();
});

onBeforeUnmount(() => {
  stopLoop();
  clearPreviewTimeout();
  clearGhostTimeout();
  clearRevealTimeout();
});

function startLoop() {
  stopLoop();

  intervalId = window.setInterval(() => {
    if (!isModalOpen.value && loadedImages.value.length) {
      currentIndex.value = (currentIndex.value + 1) % loadedImages.value.length;
    }
  }, 3000);
}

function stopLoop() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = 0;
  }
}

function clearPreviewTimeout() {
  if (previewTimeoutId) {
    window.clearTimeout(previewTimeoutId);
    previewTimeoutId = 0;
  }
}

function clearGhostTimeout() {
  if (ghostTimeoutId) {
    window.clearTimeout(ghostTimeoutId);
    ghostTimeoutId = 0;
  }
}

function clearRevealTimeout() {
  if (revealTimeoutId) {
    window.clearTimeout(revealTimeoutId);
    revealTimeoutId = 0;
  }
}

function revealGallery() {
  if (isGalleryReady.value || revealTimeoutId) return;

  revealTimeoutId = window.setTimeout(() => {
    isGalleryReady.value = true;
    startLoop();
    clearGhostTimeout();
    ghostTimeoutId = window.setTimeout(() => {
      isGhostVisible.value = false;
      ghostTimeoutId = 0;
    }, 260);
    revealTimeoutId = 0;
  }, 800);
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    image.src = src;
  });
}

function registerLoadedImage(src) {
  if (loadedImageSet.has(src)) return;

  loadedImageSet.add(src);
  loadedImages.value.push(src);

  if (!isGalleryReady.value && loadedImages.value.length >= initialPreloadCount) {
    revealGallery();
  }
}

async function initializeGallery() {
  const initialBatch = muralImages.slice(0, initialPreloadCount);
  const initialResults = await Promise.allSettled(initialBatch.map(preloadImage));

  initialResults.forEach((result) => {
    if (result.status === "fulfilled") {
      registerLoadedImage(result.value);
    }
  });

  void preloadRemainingImages(initialPreloadCount);
}

async function preloadRemainingImages(startIndex) {
  for (const src of muralImages.slice(startIndex)) {
    try {
      const loadedSrc = await preloadImage(src);
      registerLoadedImage(loadedSrc);
    } catch {
      continue;
    }
  }
}

function setCardRef(imageKey, element) {
  if (element instanceof HTMLElement) {
    cardElements.set(imageKey, element);
    return;
  }

  cardElements.delete(imageKey);
}

function openModalFromGallery() {
  if (!isGalleryReady.value || !loadedImages.value.length) return;

  const rightmostCard = cards.value[cards.value.length - 1];
  if (!rightmostCard) return;

  const sourceElement = cardElements.get(rightmostCard.imageKey);
  modalImageIndex.value = (currentIndex.value + cards.value.length - 1) % loadedImages.value.length;
  isModalOpen.value = true;
  modalImageVisible.value = false;
  stopLoop();

  if (!(sourceElement instanceof HTMLElement)) {
    nextTick(() => {
      modalImageVisible.value = true;
      modalDialog.value?.focus();
    });
    return;
  }

  const sourceRect = sourceElement.getBoundingClientRect();
  const targetWidth = Math.min(window.innerWidth * 0.72, 960);
  const targetHeight = targetWidth * (9 / 16);
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;

  animatedPreview.value = {
    src: rightmostCard.src,
    start: {
      top: `${sourceRect.top}px`,
      left: `${sourceRect.left}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`
    },
    end: {
      top: `${targetTop}px`,
      left: `${targetLeft}px`,
      width: `${targetWidth}px`,
      height: `${targetHeight}px`
    }
  };

  requestAnimationFrame(() => {
    if (animatedPreview.value) {
      animatedPreview.value = {
        ...animatedPreview.value,
        active: true
      };
    }
  });

  clearPreviewTimeout();
  previewTimeoutId = window.setTimeout(() => {
    animatedPreview.value = null;
    modalImageVisible.value = true;
    modalDialog.value?.focus();
  }, 460);
}

function closeModal() {
  clearPreviewTimeout();
  isModalOpen.value = false;
  modalImageVisible.value = false;
  animatedPreview.value = null;
  startLoop();
}

function showNextImage() {
  if (!loadedImages.value.length) return;
  modalImageIndex.value = (modalImageIndex.value + 1) % loadedImages.value.length;
}

function showPreviousImage() {
  if (!loadedImages.value.length) return;
  modalImageIndex.value = (modalImageIndex.value - 1 + loadedImages.value.length) % loadedImages.value.length;
}

function handleModalKeydown(event) {
  if (!isModalOpen.value) return;

  if (event.key === "Escape") {
    closeModal();
  } else if (event.key === "ArrowRight") {
    showNextImage();
  } else if (event.key === "ArrowLeft") {
    showPreviousImage();
  }
}
</script>

<template>
  <Teleport to="#smartgallery-root">
    <div class="smart-gallery-overlay" aria-hidden="true">
      <div class="smart-gallery-grid">
        <section
          class="smart-gallery-stack"
          :class="{ 'is-ready': isGalleryReady, 'is-ghost-only': !isGalleryReady }"
          @click="openModalFromGallery"
        >
          <div v-if="isGhostVisible" class="smart-gallery-ghost" aria-hidden="true">
            <div class="smart-gallery-ghost-card slot-1"></div>
            <div class="smart-gallery-ghost-card slot-2"></div>
            <div class="smart-gallery-ghost-card slot-3"></div>
            <div class="smart-gallery-ghost-card slot-4"></div>
          </div>

          <TransitionGroup
            name="smart-gallery-shift"
            tag="div"
            class="smart-gallery-track"
          >
            <article
              v-for="card in cards"
              v-show="isGalleryReady"
              :key="card.imageKey"
              class="smart-gallery-card"
              :class="card.className"
              :ref="(element) => setCardRef(card.imageKey, element)"
            >
              <img :src="card.src" :alt="card.alt" loading="lazy" />
            </article>
          </TransitionGroup>
        </section>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="smart-gallery-modal"
      @keydown="handleModalKeydown"
    >
      <div class="smart-gallery-modal__backdrop" @click="closeModal"></div>
      <div class="smart-gallery-modal__lighthouse"></div>

      <img
        v-if="animatedPreview"
        class="smart-gallery-modal__preview"
        :class="{ 'is-active': animatedPreview.active }"
        :src="animatedPreview.src"
        alt=""
        :style="animatedPreview.active ? animatedPreview.end : animatedPreview.start"
      />

      <div
        ref="modalDialog"
        class="smart-gallery-modal__dialog"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label="Galería de murales Rover Smart"
        @click.self="closeModal"
      >
        <div class="smart-gallery-modal__frame" :class="{ 'is-visible': modalImageVisible }">
          <button class="smart-gallery-modal__close" type="button" aria-label="Cerrar" @click="closeModal">×</button>
          <button class="smart-gallery-modal__nav is-prev" type="button" aria-label="Imagen anterior" @click="showPreviousImage">
            <span aria-hidden="true">‹</span>
          </button>
          <div class="smart-gallery-modal__image-wrap">
            <img :src="currentModalImage" alt="Mural ampliado" />
          </div>
          <button class="smart-gallery-modal__nav is-next" type="button" aria-label="Imagen siguiente" @click="showNextImage">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.smart-gallery-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}

.smart-gallery-grid {
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-columns: repeat(30, minmax(0, 1fr));
  grid-template-rows: repeat(20, minmax(0, 1fr));
}

.smart-gallery-stack {
  grid-column: 22 / span 9;
  grid-row: 13 / span 9;
  position: relative;
  perspective: 1800px;
  transform-style: preserve-3d;
  transform: scale(0.65);
  transform-origin: top left;
  pointer-events: auto;
  cursor: zoom-in;
}

.smart-gallery-stack.is-ghost-only {
  cursor: default;
}

.smart-gallery-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.smart-gallery-ghost {
  position: absolute;
  inset: 0;
  opacity: 1;
  transition: opacity 260ms ease, transform 320ms ease;
}

.smart-gallery-stack.is-ready .smart-gallery-ghost {
  opacity: 0;
  transform: translateY(8px);
}

.smart-gallery-ghost-card,
.smart-gallery-card {
  position: absolute;
  width: clamp(220px, 18vw, 340px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 22px;
  transform-origin: center center;
}

.smart-gallery-ghost-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02)),
    linear-gradient(180deg, rgba(114, 181, 164, 0.08), rgba(140, 115, 80, 0.06));
  box-shadow:
    0 24px 72px rgba(15, 12, 10, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.smart-gallery-card {
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 28px 80px rgba(15, 12, 10, 0.26);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  transition: box-shadow 180ms ease, transform 180ms ease, opacity 260ms ease;
}

.smart-gallery-stack:hover .smart-gallery-card {
  box-shadow: 0 32px 92px rgba(15, 12, 10, 0.34);
}

.smart-gallery-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-1 {
  top: 10px;
  left: 0;
  transform: rotateY(26deg) rotateZ(-8deg) translate3d(0, 18px, -120px);
  z-index: 1;
}

.slot-2 {
  top: 34px;
  left: 124px;
  transform: rotateY(18deg) rotateZ(-4deg) translate3d(0, 2px, -60px);
  z-index: 2;
}

.slot-3 {
  top: 60px;
  left: 252px;
  transform: rotateY(10deg) rotateZ(0deg) translate3d(0, -4px, 0);
  z-index: 3;
}

.slot-4 {
  top: 88px;
  left: 392px;
  transform: rotateY(-6deg) rotateZ(4deg) translate3d(0, -2px, 40px);
  z-index: 4;
}

.smart-gallery-shift-enter-active,
.smart-gallery-shift-leave-active,
.smart-gallery-shift-move {
  transition:
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 700ms ease,
    left 700ms cubic-bezier(0.22, 1, 0.36, 1),
    top 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.smart-gallery-shift-enter-from {
  opacity: 0;
  transform: translateX(150px) scale(0.96);
}

.smart-gallery-shift-leave-to {
  opacity: 0;
  transform: translateX(-150px) scale(0.96);
}

.smart-gallery-shift-leave-active {
  position: absolute;
}

.smart-gallery-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.smart-gallery-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 5, 0.82);
  backdrop-filter: blur(12px);
}

.smart-gallery-modal__lighthouse {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 248, 229, 0.26), rgba(255, 248, 229, 0.08) 18%, rgba(5, 5, 5, 0) 38%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.12), rgba(5, 5, 5, 0) 52%);
  pointer-events: none;
}

.smart-gallery-modal__dialog {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.smart-gallery-modal__dialog:focus {
  outline: none;
}

.smart-gallery-modal__preview {
  position: fixed;
  z-index: 3;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 36px 120px rgba(0, 0, 0, 0.42);
  object-fit: cover;
  transition:
    top 460ms cubic-bezier(0.22, 1, 0.36, 1),
    left 460ms cubic-bezier(0.22, 1, 0.36, 1),
    width 460ms cubic-bezier(0.22, 1, 0.36, 1),
    height 460ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 460ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 460ms ease;
}

.smart-gallery-modal__preview.is-active {
  transform: translateZ(0) scale(1);
}

.smart-gallery-modal__frame {
  position: relative;
  width: min(72vw, 960px);
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  transition: opacity 240ms ease, transform 320ms ease;
}

.smart-gallery-modal__frame.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.smart-gallery-modal__image-wrap {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  box-shadow: 0 30px 110px rgba(0, 0, 0, 0.42);
}

.smart-gallery-modal__image-wrap img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.smart-gallery-modal__close,
.smart-gallery-modal__nav {
  position: absolute;
  z-index: 4;
  border: 0;
  background: transparent;
  color: #ffffff;
  padding: 0;
  box-shadow: none;
  min-height: auto;
  line-height: 1;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.18),
    0 10px 18px rgba(0, 0, 0, 0.34),
    0 18px 32px rgba(0, 0, 0, 0.18);
  transform-style: preserve-3d;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.22));
}

.smart-gallery-modal__close {
  top: -54px;
  right: 0;
  font-size: 2rem;
  transform: translateZ(0) rotateX(10deg);
}

.smart-gallery-modal__nav {
  top: 50%;
  transform: translateY(-50%);
  font-size: 4rem;
}

.smart-gallery-modal__close:hover,
.smart-gallery-modal__nav:hover {
  color: rgba(255, 255, 255, 0.72);
  filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.28));
}

.smart-gallery-modal__nav.is-prev {
  left: -118px;
  transform: translateY(-50%) rotateY(16deg);
}

.smart-gallery-modal__nav.is-next {
  right: -118px;
  transform: translateY(-50%) rotateY(-16deg);
}

@media (max-width: 960px) {
  .smart-gallery-overlay {
    display: none;
  }
}
</style>
