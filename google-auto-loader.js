const centerElement = "#center_col";
const loadWindowSize = 1.6;
const filtersAll = ["#foot", "#bottomads"];
const filtersCol = filtersAll.concat(["#extrares", "#imagebox_bigimages"]);
const twId = "t3y30m6mtdnac5ndl40i7qxmf8f3zt";
const thumbHeight = "65";
const thumbWidth = "116";

let pageNumber = 1;
let prevScrollY = 0;
let nextPageLoading = false;

function requestNextPage() {
    nextPageLoading = true;
    let nextPage = new URL(location.href);
    if (!nextPage.searchParams.has("q")) return;

    nextPage.searchParams.set("start", String(pageNumber * 10));

    fetch(nextPage.href)
        .then(response => response.text())
        .then(text => {
            let parser = new DOMParser();
            let htmlDocument = parser.parseFromString(text, "text/html");
            let content = htmlDocument.documentElement.querySelector(centerElement);

            content.id = "col_" + pageNumber;
            content.className = "";
            filter(content, filtersCol);

            let pageMarker = document.createElement("div");
            pageMarker.textContent = String(pageNumber + 1);
            pageMarker.className = "page-number";

            let col = document.createElement("div");
            col.className = "next-col";
            col.appendChild(pageMarker);
            col.appendChild(content);
            document.querySelector(centerElement).appendChild(col);
            fetchThumbs(content);

            if (!content.querySelector("#rso")) {
                // end of results
                window.removeEventListener("scroll", onScrollDocumentEnd);
                return;
            }

            pageNumber++;
            nextPageLoading = false;
        });
}

function fetchThumbs(document) {
    let vidThumbs = document.querySelectorAll("[id^='vidthumb']");
    let twHeaders = {
        headers: {
            "Client-ID": twId
        }
    };
    for (let thumb of vidThumbs) {
        let href = thumb.parentNode.parentNode.href;
        let yt = href.match(/https:\/\/www\.youtube\.com\/watch\?v=(.+)&?/);
        if (yt) {
            thumb.src = `https://img.youtube.com/vi/${yt[1]}/default.jpg`;
            continue;
        }
        let twClip = href.match(/https:\/\/www\.twitch\.tv\/.+\/clip\/(.+)/);
        if (twClip) {
            fetch(`https://api.twitch.tv/helix/clips?id=${twClip[1]}&first=1`, twHeaders)
            .then(response => response.json())
            .then(result => {
                thumb.src = result.data[0].thumbnail_url.replace("%{height}", thumbHeight).replace("%{width}", thumbWidth);
            });
            continue;
        }
        let twVideo = href.match(/https:\/\/www\.twitch\.tv\/videos\/(.+)/);
        if (twVideo) {
            fetch(`https://api.twitch.tv/helix/videos?id=${twVideo[1]}`, twHeaders)
            .then(response => response.json())
            .then(result => {
                thumb.src = result.data[0].thumbnail_url.replace("%{height}", thumbHeight).replace("%{width}", thumbWidth);
            });
            continue;
        }
        let twUser = href.match(/https:\/\/www\.twitch\.tv\/(.+)\/videos$/);
        if (twUser) {
            fetch(`https://api.twitch.tv/helix/users?login=${twUser[1]}`, twHeaders)
            .then(response => response.json())
            .then(user => {
                return fetch(`https://api.twitch.tv/helix/videos?user_id=${user.data[0].id}&first=1`, twHeaders);
            })
            .then(response => response.json())
            .then(result => {
                thumb.src = result.data[0].thumbnail_url.replace("%{height}", thumbHeight).replace("%{width}", thumbWidth);
            });
            continue;
        }
        let vimeo = href.match(/https:\/\/vimeo\.com\/(.+)/);
        if (vimeo) {
            fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeo[0])}`)
            .then(response => response.json())
            .then(result => {
                thumb.src = result.thumbnail_url;
            });
            continue;
        }
    }
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
    return y + window.innerHeight * loadWindowSize >= document.body.clientHeight;
}

function filter(node, filters) {
    for (let filter of filters) {
        let child = node.querySelector(filter);
        if (child) {
            child.parentNode.removeChild(child);
        }
    }
}

function init() {
    prevScrollY = window.scrollY;
    window.addEventListener("scroll", onScrollDocumentEnd);
    filter(document, filtersAll);
}

document.addEventListener("DOMContentLoaded", init);
