(() => {
  "use strict";

  /*
   * =========================================================
   * CUSTOM PORTFOLIO PDF + IMAGE VIEWER
   * =========================================================
   *
   * - No iframe
   * - No browser PDF toolbar
   * - No Download button
   * - PDFs rendered directly to canvas
   * - Custom page slider
   * - Custom zoom slider
   * - Keyboard navigation
   * - Mouse/touch dragging
   * - Works with GitHub Pages subdirectories
   * - Works with existing data-view-pdf buttons
   */

  const PDFJS_VERSION = "4.10.38";

  const PDFJS_SRC =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`;

  const PDFJS_WORKER =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

  let pdfjsPromise = null;

  let activePdf = null;

  let activeImages = [];

  let imageIndex = 0;

  let currentMode = null;

  let currentPage = 1;

  let pageCount = 0;

  let zoom = 1;

  let fitScale = 1;

  let renderToken = 0;

  let firstOpen = true;

  const pan = {
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    x: 0,
    y: 0
  };


  /* =========================================================
     CREATE VIEWER
     ========================================================= */

  function createViewer() {

    let root = document.querySelector(".viewer-root");

    if (root) {
      return root;
    }

    root = document.createElement("div");

    root.className = "viewer-root";

    root.setAttribute(
      "aria-hidden",
      "true"
    );

    root.innerHTML = `

      <section
        class="viewer-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewerTitle"
      >

        <header class="viewer-topbar">

          <div
            class="viewer-window-dots"
            aria-hidden="true"
          >
            <i></i>
            <i></i>
            <i></i>
          </div>

          <span
            class="viewer-kicker"
            id="viewerKicker"
          >
            DOCUMENT
          </span>

          <strong
            class="viewer-title"
            id="viewerTitle"
          >
            Viewer
          </strong>

          <button
            class="viewer-close"
            type="button"
            aria-label="Close viewer"
          >
            ×
          </button>

        </header>


        <div
          class="viewer-stage"
          id="viewerStage"
        >

          <div
            class="viewer-loading"
            id="viewerLoading"
          >
            <span>Loading</span>
          </div>


          <div
            class="viewer-page-wrap"
            id="viewerPageWrap"
          ></div>


          <div
            class="viewer-nav"
            id="viewerNav"
          >

            <button
              type="button"
              id="viewerPrev"
              aria-label="Previous page"
            >
              ‹
            </button>

            <button
              type="button"
              id="viewerNext"
              aria-label="Next page"
            >
              ›
            </button>

          </div>


          <div class="viewer-swipe-hint">
            Swipe or use the arrow keys
          </div>

        </div>


        <footer
          class="viewer-bottom"
          id="viewerBottom"
        >

          <div
            class="viewer-control-group viewer-page-control"
          >

            <span class="viewer-control-label">
              Page
            </span>

            <input
              class="viewer-range"
              id="viewerPageRange"
              type="range"
              min="1"
              max="1"
              step="1"
              value="1"
              aria-label="Page"
            >

            <span
              class="viewer-value"
              id="viewerPageValue"
            >
              1 / 1
            </span>

          </div>


          <div
            class="viewer-control-group viewer-zoom-control"
          >

            <span class="viewer-control-label">
              Zoom
            </span>

            <input
              class="viewer-range"
              id="viewerZoomRange"
              type="range"
              min="50"
              max="200"
              step="5"
              value="100"
              aria-label="Zoom"
            >

            <span
              class="viewer-value"
              id="viewerZoomValue"
            >
              100%
            </span>

          </div>


          <span
            class="viewer-caption"
            id="viewerCaption"
          ></span>

        </footer>

      </section>
    `;

    document.body.appendChild(root);


    /* CLOSE */

    root
      .querySelector(".viewer-close")
      .addEventListener(
        "click",
        closeViewer
      );


    root.addEventListener(
      "click",
      event => {

        if (event.target === root) {
          closeViewer();
        }

      }
    );


    /* PREVIOUS */

    root
      .querySelector("#viewerPrev")
      .addEventListener(
        "click",
        () => navigate(-1)
      );


    /* NEXT */

    root
      .querySelector("#viewerNext")
      .addEventListener(
        "click",
        () => navigate(1)
      );


    /* PAGE SLIDER */

    root
      .querySelector("#viewerPageRange")
      .addEventListener(
        "input",
        event => {

          currentPage =
            Number(event.target.value);

          resetPan();

          renderPdfPage();

        }
      );


    /* ZOOM SLIDER */

    root
      .querySelector("#viewerZoomRange")
      .addEventListener(
        "input",
        event => {

          zoom =
            Number(event.target.value) / 100;

          updateRange(event.target);

          resetPan();

          if (currentMode === "pdf") {

            renderPdfPage();

          } else if (
            currentMode === "image"
          ) {

            renderImage();

          }

        }
      );


    /* DRAGGING */

    const stage =
      root.querySelector(
        "#viewerStage"
      );

    stage.addEventListener(
      "pointerdown",
      startPan
    );

    stage.addEventListener(
      "pointermove",
      movePan
    );

    stage.addEventListener(
      "pointerup",
      endPan
    );

    stage.addEventListener(
      "pointercancel",
      endPan
    );


    /* MOUSE WHEEL ZOOM */

    stage.addEventListener(
      "wheel",
      event => {

        if (
          !root.classList.contains(
            "is-open"
          )
        ) {
          return;
        }

        event.preventDefault();

        const nextZoom =
          Math.max(
            0.5,
            Math.min(
              2,
              zoom -
                event.deltaY * 0.001
            )
          );

        zoom =
          Math.round(
            nextZoom * 20
          ) / 20;

        const range =
          root.querySelector(
            "#viewerZoomRange"
          );

        range.value =
          Math.round(
            zoom * 100
          );

        updateRange(range);

        resetPan();

        if (currentMode === "pdf") {

          renderPdfPage();

        } else if (
          currentMode === "image"
        ) {

          renderImage();

        }

      },
      {
        passive: false
      }
    );


    return root;
  }


  /* =========================================================
     LOAD PDF.JS
     ========================================================= */

  async function loadPdfJs() {

    if (!pdfjsPromise) {

      pdfjsPromise =
        import(PDFJS_SRC)
          .then(pdfjsLib => {

            pdfjsLib
              .GlobalWorkerOptions
              .workerSrc =
              PDFJS_WORKER;

            return pdfjsLib;

          });

    }

    return pdfjsPromise;
  }


  /* =========================================================
     URL FIX
     ========================================================= */

  function resolveUrl(path) {

    /*
     * This is important for GitHub Pages.
     *
     * Example:
     *
     * https://username.github.io/portfolio/
     *
     * "pdfs/file.pdf"
     *
     * becomes:
     *
     * https://username.github.io/portfolio/pdfs/file.pdf
     */

    try {

      return new URL(
        path,
        document.baseURI
      ).href;

    } catch (error) {

      return path;

    }
  }


  /* =========================================================
     LOADING
     ========================================================= */

  function setLoading(
    show,
    text = "Loading"
  ) {

    const loading =
      document.querySelector(
        "#viewerLoading"
      );

    if (!loading) {
      return;
    }

    loading.style.display =
      show ? "grid" : "none";

    const span =
      loading.querySelector(
        "span"
      );

    if (span) {
      span.textContent = text;
    }
  }


  /* =========================================================
     ERROR
     ========================================================= */

  function showError(
    title,
    message
  ) {

    const wrap =
      document.querySelector(
        "#viewerPageWrap"
      );

    if (!wrap) {
      return;
    }

    wrap.innerHTML = `

      <div class="viewer-error">

        <strong>
          ${escapeHTML(title)}
        </strong>

        ${escapeHTML(message)}

      </div>

    `;

    setLoading(false);
  }


  /* =========================================================
     ESCAPE HTML
     ========================================================= */

  function escapeHTML(value) {

    return String(value).replace(
      /[&<>"']/g,
      character => {

        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        };

        return map[character];

      }
    );
  }


  /* =========================================================
     SLIDER
     ========================================================= */

  function updateRange(input) {

    if (!input) {
      return;
    }

    const min =
      Number(input.min);

    const max =
      Number(input.max);

    const value =
      Number(input.value);

    const percentage =
      max === min
        ? 100
        : (
            (value - min) /
            (max - min)
          ) * 100;

    input.style.setProperty(
      "--fill",
      `${percentage}%`
    );


    if (
      input.id ===
      "viewerZoomRange"
    ) {

      const display =
        document.querySelector(
          "#viewerZoomValue"
        );

      if (display) {

        display.textContent =
          `${Math.round(value)}%`;

      }

    }

  }


  /* =========================================================
     PAN
     ========================================================= */

  function resetPan() {

    pan.x = 0;

    pan.y = 0;

    const wrap =
      document.querySelector(
        "#viewerPageWrap"
      );

    if (wrap) {

      wrap.style.transform =
        "translate(0px, 0px)";

    }

  }


  function startPan(event) {

    if (event.button !== 0) {
      return;
    }

    if (
      event.target.closest("button") ||
      event.target.closest("input")
    ) {
      return;
    }

    const stage =
      event.currentTarget;

    pan.active = true;

    pan.startX =
      event.clientX;

    pan.startY =
      event.clientY;

    pan.originX =
      pan.x;

    pan.originY =
      pan.y;

    stage.classList.add(
      "is-dragging"
    );

    if (
      stage.setPointerCapture
    ) {

      stage.setPointerCapture(
        event.pointerId
      );

    }

  }


  function movePan(event) {

    if (!pan.active) {
      return;
    }

    pan.x =
      pan.originX +
      event.clientX -
      pan.startX;

    pan.y =
      pan.originY +
      event.clientY -
      pan.startY;

    const wrap =
      document.querySelector(
        "#viewerPageWrap"
      );

    if (wrap) {

      wrap.style.transform =
        `translate(${pan.x}px, ${pan.y}px)`;

    }

  }


  function endPan() {

    pan.active = false;

    document
      .querySelector(
        "#viewerStage"
      )
      ?.classList.remove(
        "is-dragging"
      );

  }


  /* =========================================================
     OPEN / CLOSE
     ========================================================= */

  function setOpen(open) {

    const root =
      createViewer();

    root.classList.toggle(
      "is-open",
      open
    );

    root.setAttribute(
      "aria-hidden",
      open
        ? "false"
        : "true"
    );

    document.body.classList.toggle(
      "viewer-lock",
      open
    );


    if (
      open &&
      firstOpen
    ) {

      root.classList.add(
        "is-first-open"
      );

      setTimeout(
        () => {

          root.classList.remove(
            "is-first-open"
          );

        },
        2200
      );

      firstOpen = false;
    }

  }


  /* =========================================================
     OPEN PDF
     ========================================================= */

  async function openPdf(
    url,
    title = "PDF document"
  ) {

    const root =
      createViewer();

    currentMode = "pdf";

    activeImages = [];

    activePdf = null;

    root.querySelector(
      "#viewerKicker"
    ).textContent =
      "PDF / VIEWER";

    root.querySelector(
      "#viewerTitle"
    ).textContent =
      title;


    root.querySelector(
      "#viewerBottom"
    ).classList.remove(
      "is-image"
    );


    root.querySelector(
      "#viewerNav"
    ).style.display =
      "flex";


    root.querySelector(
      ".viewer-page-control"
    ).style.display =
      "flex";


    const zoomRange =
      root.querySelector(
        "#viewerZoomRange"
      );

    zoom = 1;

    zoomRange.value = 100;

    updateRange(
      zoomRange
    );

    resetPan();


    root.querySelector(
      "#viewerPageWrap"
    ).innerHTML =
      "";


    setLoading(
      true,
      "Loading PDF"
    );


    setOpen(true);


    const token =
      ++renderToken;


    /*
     * Resolve the path properly.
     */

    const pdfUrl =
      resolveUrl(url);


    console.log(
      "[Portfolio Viewer] Opening PDF:",
      pdfUrl
    );


    try {

      /*
       * Load PDF.js.
       */

      const pdfjsLib =
        await loadPdfJs();


      if (token !== renderToken) {
        return;
      }


      /*
       * Load the actual PDF.
       */

      const loadingTask =
        pdfjsLib.getDocument({

          url: pdfUrl,

          /*
           * PDFs should not be allowed
           * to execute embedded JavaScript.
           */

          enableScripting: false,

          /*
           * Let PDF.js use browser
           * HTTP caching normally.
           */

          disableAutoFetch: false,

          disableStream: false

        });


      activePdf =
        await loadingTask.promise;


      if (token !== renderToken) {
        return;
      }


      pageCount =
        activePdf.numPages;


      currentPage = 1;


      const pageRange =
        root.querySelector(
          "#viewerPageRange"
        );

      pageRange.min = 1;

      pageRange.max =
        pageCount;

      pageRange.value = 1;


      updateRange(
        pageRange
      );


      root.querySelector(
        "#viewerPageValue"
      ).textContent =
        `1 / ${pageCount}`;


      root.querySelector(
        "#viewerCaption"
      ).textContent =
        url
          .split("/")
          .pop()
          .split("?")[0];


      await renderPdfPage(true);


    } catch (error) {

      console.error(
        "[Portfolio Viewer] PDF error:",
        error
      );


      let message =
        "The PDF could not be loaded.";


      /*
       * Give a more useful error
       * for missing PDFs.
       */

      if (
        error?.name ===
        "MissingPDFException"
      ) {

        message =
          `The PDF was not found at: ${pdfUrl}`;

      } else if (
        error?.message
      ) {

        message =
          error.message;

      }


      showError(
        "PDF could not be opened",
        message
      );

    }

  }


  /* =========================================================
     RENDER PDF PAGE
     ========================================================= */

  async function renderPdfPage(
    firstRender = false
  ) {

    if (!activePdf) {
      return;
    }


    const token =
      ++renderToken;


    const root =
      document.querySelector(
        ".viewer-root"
      );


    const stage =
      root.querySelector(
        "#viewerStage"
      );


    const wrap =
      root.querySelector(
        "#viewerPageWrap"
      );


    setLoading(
      true,
      "Rendering page"
    );


    try {

      const page =
        await activePdf.getPage(
          currentPage
        );


      if (
        token !== renderToken
      ) {
        return;
      }


      const baseViewport =
        page.getViewport({
          scale: 1
        });


      /*
       * Calculate the "fit" size only
       * when first opening / resizing.
       */

      if (firstRender) {

        const availableWidth =
          Math.max(
            260,
            stage.clientWidth - 100
          );


        const availableHeight =
          Math.max(
            260,
            stage.clientHeight - 50
          );


        fitScale =
          Math.min(

            availableWidth /
              baseViewport.width,

            availableHeight /
              baseViewport.height

          );


        fitScale =
          Math.max(
            0.5,
            Math.min(
              1.5,
              fitScale
            )
          );

      }


      const scale =
        fitScale * zoom;


      const viewport =
        page.getViewport({
          scale
        });


      /*
       * Retina / HiDPI rendering.
       */

      const dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );


      const canvas =
        document.createElement(
          "canvas"
        );


      const context =
        canvas.getContext(
          "2d",
          {
            alpha: false
          }
        );


      canvas.width =
        Math.ceil(
          viewport.width * dpr
        );


      canvas.height =
        Math.ceil(
          viewport.height * dpr
        );


      canvas.style.width =
        `${viewport.width}px`;


      canvas.style.height =
        `${viewport.height}px`;


      canvas.className =
        "viewer-page";


      wrap.innerHTML =
        "";


      wrap.appendChild(
        canvas
      );


      await page.render({

        canvasContext:
          context,

        viewport:
          viewport,

        transform:
          dpr !== 1
            ? [
                dpr,
                0,
                0,
                dpr,
                0,
                0
              ]
            : null

      }).promise;


      if (
        token !== renderToken
      ) {
        return;
      }


      root.querySelector(
        "#viewerPageValue"
      ).textContent =
        `${currentPage} / ${pageCount}`;


      updateRange(
        root.querySelector(
          "#viewerPageRange"
        )
      );


      updateRange(
        root.querySelector(
          "#viewerZoomRange"
        )
      );


      updateNavigation();


      setLoading(false);


    } catch (error) {

      console.error(
        "[Portfolio Viewer] Render error:",
        error
      );


      showError(
        "Page render failed",
        "This PDF page could not be rendered."
      );

    }

  }


  /* =========================================================
     NAVIGATION BUTTON STATE
     ========================================================= */

  function updateNavigation() {

    const root =
      document.querySelector(
        ".viewer-root"
      );

    if (!root) {
      return;
    }


    const previous =
      root.querySelector(
        "#viewerPrev"
      );


    const next =
      root.querySelector(
        "#viewerNext"
      );


    if (currentMode === "pdf") {

      previous.disabled =
        currentPage <= 1;

      next.disabled =
        currentPage >= pageCount;

    }


    if (
      currentMode === "image"
    ) {

      previous.disabled =
        imageIndex <= 0;

      next.disabled =
        imageIndex >=
        activeImages.length - 1;

    }

  }


  /* =========================================================
     IMAGE VIEWER
     ========================================================= */

  function openImage(
    items,
    index = 0
  ) {

    const root =
      createViewer();


    currentMode = "image";

    activePdf = null;

    activeImages = items;


    imageIndex =
      Math.max(
        0,
        Math.min(
          index,
          items.length - 1
        )
      );


    root.querySelector(
      "#viewerKicker"
    ).textContent =
      "IMAGE / VIEWER";


    root.querySelector(
      "#viewerBottom"
    ).classList.add(
      "is-image"
    );


    root.querySelector(
      "#viewerNav"
    ).style.display =
      items.length > 1
        ? "flex"
        : "none";


    root.querySelector(
      ".viewer-page-control"
    ).style.display =
      "none";


    zoom = 1;


    const zoomRange =
      root.querySelector(
        "#viewerZoomRange"
      );


    zoomRange.value =
      100;


    updateRange(
      zoomRange
    );


    resetPan();


    root.querySelector(
      "#viewerPageWrap"
    ).innerHTML =
      "";


    setLoading(
      true,
      "Loading image"
    );


    setOpen(true);


    renderImage();

  }


  /* =========================================================
     RENDER IMAGE
     ========================================================= */

  function renderImage() {

    const root =
      document.querySelector(
        ".viewer-root"
      );


    const item =
      activeImages[
        imageIndex
      ];


    if (!item) {
      return;
    }


    const image =
      new Image();


    image.decoding =
      "async";


    image.onload = () => {

      const wrap =
        root.querySelector(
          "#viewerPageWrap"
        );


      wrap.innerHTML =
        "";


      image.className =
        "viewer-image";


      image.alt =
        item.alt || "";


      image.draggable =
        false;


      const stage =
        root.querySelector(
          "#viewerStage"
        );


      const maxWidth =
        Math.max(
          260,
          stage.clientWidth - 80
        );


      const maxHeight =
        Math.max(
          260,
          stage.clientHeight - 50
        );


      const fit =
        Math.min(

          maxWidth /
            image.naturalWidth,

          maxHeight /
            image.naturalHeight,

          1

        );


      image.style.width =
        `${image.naturalWidth * fit * zoom}px`;


      image.style.height =
        `${image.naturalHeight * fit * zoom}px`;


      wrap.appendChild(
        image
      );


      root.querySelector(
        "#viewerTitle"
      ).textContent =
        item.title ||
        "Image";


      root.querySelector(
        "#viewerCaption"
      ).textContent =
        item.caption ||
        item.alt ||
        "";


      updateRange(
        root.querySelector(
          "#viewerZoomRange"
        )
      );


      updateNavigation();


      setLoading(false);

    };


    image.onerror = () => {

      showError(
        "Image could not be opened",
        "The image path is missing or unavailable."
      );

    };


    image.src =
      resolveUrl(
        item.src
      );

  }


  /* =========================================================
     PREVIOUS / NEXT
     ========================================================= */

  function navigate(direction) {

    if (
      currentMode === "pdf"
    ) {

      const nextPage =
        Math.max(
          1,
          Math.min(
            pageCount,
            currentPage +
              direction
          )
        );


      if (
        nextPage !==
        currentPage
      ) {

        currentPage =
          nextPage;

        resetPan();

        renderPdfPage();

      }


      return;
    }


    if (
      currentMode === "image" &&
      activeImages.length > 1
    ) {

      const nextIndex =
        Math.max(
          0,
          Math.min(
            activeImages.length - 1,
            imageIndex +
              direction
          )
        );


      if (
        nextIndex !==
        imageIndex
      ) {

        imageIndex =
          nextIndex;

        resetPan();

        renderImage();

      }

    }

  }


  /* =========================================================
     CLOSE
     ========================================================= */

  function closeViewer() {

    renderToken++;


    activePdf = null;

    activeImages = [];

    currentMode = null;


    const root =
      document.querySelector(
        ".viewer-root"
      );


    if (!root) {
      return;
    }


    root.querySelector(
      "#viewerPageWrap"
    ).innerHTML =
      "";


    setOpen(false);

  }


  /* =========================================================
     AUTOMATIC PDF BUTTON BINDING
     ========================================================= */

  function bindTriggers() {

    document
      .querySelectorAll(
        "[data-view-pdf]"
      )
      .forEach(element => {

        /*
         * Prevent duplicate listeners.
         */

        if (
          element.dataset.viewerBound ===
          "true"
        ) {
          return;
        }


        element.dataset.viewerBound =
          "true";


        element.addEventListener(
          "click",
          event => {

            event.preventDefault();

            event.stopPropagation();


            const url =
              element.getAttribute(
                "data-view-pdf"
              );


            const title =
              element.getAttribute(
                "data-view-title"
              ) ||
              element.textContent.trim() ||
              "PDF document";


            openPdf(
              url,
              title
            );

          }
        );

      });


    /* =======================================================
       IMAGE BUTTONS
       ======================================================= */

    const imageTriggers =
      [
        ...document.querySelectorAll(
          "[data-view-image]"
        )
      ];


    const groups =
      new Map();


    imageTriggers.forEach(
      element => {

        const group =
          element.getAttribute(
            "data-view-group"
          ) ||
          `single-${Math.random()}`;


        if (
          !groups.has(group)
        ) {

          groups.set(
            group,
            []
          );

        }


        groups
          .get(group)
          .push({

            src:
              element.getAttribute(
                "data-view-image"
              ),

            title:
              element.getAttribute(
                "data-view-title"
              ) ||
              element.getAttribute(
                "alt"
              ) ||
              "Image",

            caption:
              element.getAttribute(
                "data-view-caption"
              ) ||
              "",

            alt:
              element.getAttribute(
                "alt"
              ) ||
              ""

          });

      }
    );


    imageTriggers.forEach(
      element => {

        if (
          element.dataset.viewerBound ===
          "true"
        ) {
          return;
        }


        element.dataset.viewerBound =
          "true";


        element.style.cursor =
          "zoom-in";


        element.addEventListener(
          "click",
          event => {

            event.preventDefault();

            event.stopPropagation();


            const group =
              element.getAttribute(
                "data-view-group"
              ) ||
              "";


            const items =
              groups.get(group) ||
              [];


            const source =
              element.getAttribute(
                "data-view-image"
              );


            let index =
              items.findIndex(
                item =>
                  item.src ===
                  source
              );


            if (index < 0) {
              index = 0;
            }


            openImage(
              items.length
                ? items
                : [
                    {
                      src: source,
                      title:
                        element.getAttribute(
                          "data-view-title"
                        ) ||
                        "Image",
                      caption:
                        element.getAttribute(
                          "data-view-caption"
                        ) ||
                        "",
                      alt:
                        element.getAttribute(
                          "alt"
                        ) ||
                        ""
                    }
                  ],
              index
            );

          }
        );

      }
    );

  }


  /* =========================================================
     KEYBOARD CONTROLS
     ========================================================= */

  document.addEventListener(
    "keydown",
    event => {

      const root =
        document.querySelector(
          ".viewer-root"
        );


      if (
        !root?.classList.contains(
          "is-open"
        )
      ) {
        return;
      }


      if (
        event.key ===
        "Escape"
      ) {

        closeViewer();

        return;
      }


      if (
        event.key ===
        "ArrowLeft"
      ) {

        navigate(-1);

        return;
      }


      if (
        event.key ===
        "ArrowRight"
      ) {

        navigate(1);

        return;
      }


      /*
       * Zoom in
       */

      if (
        event.key === "+" ||
        event.key === "="
      ) {

        event.preventDefault();


        zoom =
          Math.min(
            2,
            zoom + 0.1
          );


        const range =
          root.querySelector(
            "#viewerZoomRange"
          );


        range.value =
          Math.round(
            zoom * 100
          );


        updateRange(
          range
        );


        resetPan();


        if (
          currentMode === "pdf"
        ) {

          renderPdfPage();

        } else {

          renderImage();

        }


        return;
      }


      /*
       * Zoom out
       */

      if (
        event.key === "-"
      ) {

        event.preventDefault();


        zoom =
          Math.max(
            0.5,
            zoom - 0.1
          );


        const range =
          root.querySelector(
            "#viewerZoomRange"
          );


        range.value =
          Math.round(
            zoom * 100
          );


        updateRange(
          range
        );


        resetPan();


        if (
          currentMode === "pdf"
        ) {

          renderPdfPage();

        } else {

          renderImage();

        }

      }

    }
  );


  /* =========================================================
     RESIZE
     ========================================================= */

  window.addEventListener(
    "resize",
    () => {

      const root =
        document.querySelector(
          ".viewer-root"
        );


      if (
        !root?.classList.contains(
          "is-open"
        )
      ) {
        return;
      }


      if (
        currentMode === "pdf"
      ) {

        renderPdfPage(true);

      }


      if (
        currentMode === "image"
      ) {

        renderImage();

      }

    }
  );


  /* =========================================================
     START
     ========================================================= */

  function initialize() {

    /*
     * Create the viewer immediately so the
     * page is ready before someone clicks.
     */

    createViewer();

    bindTriggers();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.PortfolioViewer = {

    openPdf,

    openImage,

    close:
      closeViewer,

    bind:
      bindTriggers

  };

})();