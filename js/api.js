let onInterval = undefined;

function initApi() {
  document.getElementById("clear").addEventListener("click", clearDetail);
  document.getElementById("default").addEventListener("click", defaultDetail);
  document
    .getElementById("chroma-color")
    .addEventListener("change", changeChromaColor);
  document
    .getElementById("brand-color")
    .addEventListener("change", changeBrandColor);
  document
    .getElementById("brand-text")
    .addEventListener("change", changeBrandTextColor);
}

function changeChromaColor() {
  let value = document.getElementById("chroma-color").value;
  document.documentElement.style.setProperty("--chroma-key", value);
}

function changeBrandColor() {
  let value = document.getElementById("brand-color").value;
  document.documentElement.style.setProperty("--brand", value);
}

function changeBrandTextColor() {
  let value = document.getElementById("brand-text").value;
  document.documentElement.style.setProperty("--brand-text", value);
}

function clearData() {
  if (onInterval !== undefined) {
    clearInterval(onInterval);
    onInterval = undefined;
  }
}

function clearStreams() {
  document.getElementById("streams").innerHTML = "";
}

function clearComments() {
  document.getElementById("comments").innerHTML = "";
}

function errorStreams() {
  clearStreams();
  document.getElementById("streams").innerHTML =
    '<div class="error">Error in getting Live Streams</div>';
}

function displayStreams(streams) {
  clearStreams();
  if (streams.length === 0) {
    document.getElementById("streams").innerHTML =
      '<div class="info">No Active/Upcoming Live Streams</div>';
  } else {
    let HTML = "";
    for (let item of streams) {
      let str = `<div class="list">
      <img src="${item.thumbnail.url}" alt="${item.id}" height="${item.thumbnail.height}" width="${item.thumbnail.width}">
      <a class="youtube" href="https://www.youtube.com/watch?v=${item.id}">YouTube</a>
      <button class="chat-button" onclick="getChat('${item.chatId}')">${item.title}</button>
      </div>`;
      HTML = HTML + str;
    }
    document.getElementById("streams").innerHTML = HTML;
  }
}

function defaultDetail(a) {
  let data = encodeURIComponent(
    JSON.stringify({
      name: "Testing....",
      pic: "favicon/camera.jpg",
      msg:
        "This is a default message. " +
        "It is made for testing purposes. You can use it to setup your stream as well. " +
        "If this looks good in your screen, then comments would as well. All the best for your stream.",
    })
  );
  showDetail(data);
}

function showDetail(a) {
  clearDetail();
  let data = JSON.parse(decodeURIComponent(a));
  setTimeout(function () {
    document.getElementById("highlight-img").style.transition = "opacity 0.3s";
    document.getElementById("highlight-name").style.transition = "opacity 0.3s";
    document.getElementById("highlight-msg").style.transition = "opacity 0.3s";
    document.getElementById("highlight-img").style.opacity = "1";
    document.getElementById("highlight-name").style.opacity = "1";
    document.getElementById("highlight-msg").style.opacity = "1";
    document.getElementById("highlight-img").src = data.pic;
    document.getElementById("highlight-name").innerHTML = data.name;
    document.getElementById("highlight-msg").innerHTML = data.msg;
  }, 10);
}

function clearDetail() {
  document.getElementById("highlight-img").style.opacity = "0";
  document.getElementById("highlight-name").style.opacity = "0";
  document.getElementById("highlight-msg").style.opacity = "0";
  document.getElementById("highlight-img").style.transition = "opacity 0s";
  document.getElementById("highlight-name").style.transition = "opacity 0s";
  document.getElementById("highlight-msg").style.transition = "opacity 0s";
  document.getElementById("highlight-img").src = "";
  document.getElementById("highlight-name").innerHTML = "";
  document.getElementById("highlight-msg").innerHTML = "";
}

function getChat(chatId) {
  clearStreams();
  clearComments();
  clearData();
  const liveChatId = chatId;
  let nextPageToken;
  onInterval = setInterval(function () {
    gapi.client.youtube.liveChatMessages
      .list({
        liveChatId: liveChatId,
        part: ["snippet", "authorDetails"],
        maxResults: 30,
        pageToken: nextPageToken,
        profileImageSize: 160,
      })
      .then(
        function (response) {
          if (response.status === 200) {
            const res = response.result;
            nextPageToken = res.nextPageToken;
            for (let a of res.items) {
              let time = new Date(a.snippet.publishedAt);
              let aName = a.authorDetails.displayName;
              let aMsg = a.snippet.displayMessage;
              let aPic = a.authorDetails.profileImageUrl;
              let str = encodeURIComponent(
                JSON.stringify({
                  name: aName,
                  pic: aPic,
                  msg: aMsg,
                })
              );
              console.log(str);
              document.getElementById(
                "comments"
              ).innerHTML += `<button class="comment-button" onclick="showDetail('${str}')">${aName}: ${aMsg} (${time.toLocaleString()})</button>`;
            }
          } else {
            console.error(response);
          }
        },
        function (error) {
          console.error(error);
        }
      );
  }, 30000);
}

function listStreams() {
  clearComments();
  clearData();
  gapi.client.youtube.liveBroadcasts
    .list({
      part: ["snippet"],
      broadcastStatus: "all",
      broadcastType: "all",
    })
    .then(
      function (response) {
        if (response.status === 200) {
          let data = [];
          let res = response.result;
          for (let item of res.items) {
            if (item.snippet.liveChatId) {
              data.push({
                id: item.id,
                chatId: item.snippet.liveChatId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default,
              });
            }
          }
          displayStreams(data);
        } else {
          console.error(response);
          errorStreams();
        }
      },
      function (err) {
        console.error(err);
        errorStreams();
      }
    );
}
