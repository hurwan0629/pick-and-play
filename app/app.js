if ("serviceWorker" in navigator) {
    console.log("serviceWorker 존재");
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js")
        .then((reg) => console.log("SW 등록 성공", reg))
        .catch((err) => console.log("SW 등록 실패", err));
    });
  }
  
  let deferredPrompt;
  const installButton = document.getElementById("app-install-button");
  
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("설치 가능");
    e.preventDefault();
    deferredPrompt = e;
    installButton.hidden = false;
  });
  
  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;
  
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    console.log(choice.outcome);
  
    deferredPrompt = null;
    installButton.hidden = true;
  });