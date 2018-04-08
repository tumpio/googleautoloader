let pageNumber = 0;
let prevScrollY = 0;
let nextPageLoading = false;

function requestNextPage() {
    let nextPage = new URL(location.href);
    if (!nextPage.searchParams.has("q")) return;

    nextPageLoading = true;
    pageNumber++;

    nextPage.searchParams.set("start", pageNumber * 10 + "");

    document.body.setAttribute("next-page-loading", "true");

    fetch(nextPage.href)
        .then(response => response.text())
        .then(text => {
            const parser = new DOMParser();
            const htmlDocument = parser.parseFromString(text, "text/html");
            const col = document.createElement("div");
            const next_col = htmlDocument.documentElement.querySelector("#center_col");

            next_col.id = "col_" + pageNumber;
            col.className = "next-col";

            const pageMarker = document.createElement("div");
            pageMarker.textContent = pageNumber + 1 + "";
            pageMarker.className = "page-number";
            col.appendChild(pageMarker);
            col.appendChild(next_col);

            document.getElementById("rcnt").appendChild(col);
            nextPageLoading = false;
            document.body.removeAttribute("next-page-loading");
        });
}


function onScrollDocumentEnd() {
    let y = window.scrollY;
    let delta = y - prevScrollY;
    if (!nextPageLoading && delta > 0 && isDocumentEnd(y)) {
        requestNextPage();
    }
    prevScrollY = y;
}

function isDocumentEnd(y) {
    return (window.innerHeight + y) >= (document.body.clientHeight - (window.innerHeight * 0.60));
}

function init() {
    prevScrollY = window.scrollY;
    window.addEventListener("scroll", onScrollDocumentEnd);
}

document.addEventListener("DOMContentLoaded", init);
