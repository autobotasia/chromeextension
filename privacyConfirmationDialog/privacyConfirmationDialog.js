/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
if (
  ("localhost" === location.hostname ||
    "autobot.asia" === location.hostname ||
    "www.autobot.asia" === location.hostname ||
    "autobot.asia" === location.hostname ||
    "www.autobot.asia" === location.hostname ||
    location.protocol.match(/^(chrome|moz)-extension/)) &&
  document.querySelector("meta[name=lt-webextension-install-page]")
) {
  const e = new StorageController(onInit),
    t = document.getElementById("slogan"),
    o = document.getElementById("message"),
    n = document.getElementById("footer"),
    r = document.getElementById("privacyLink"),
    a = document.getElementById("confirm");
  function onInit() {
    const n = e.getSettings();
    n.apiServerUrl === StorageController.DEFAULT_SETTINGS.apiServerUrl
      ? (o.innerHTML = browser.i18n.getMessage("privacyNoteForDefaultServer", [
          "https://autobot.asia",
          "autobot.asia"
        ]))
      : (o.innerHTML = browser.i18n.getMessage(
          "privacyNoteForOtherServer",
          DOMPurify.sanitize(n.apiServerUrl)
        )),
      (r.innerHTML = browser.i18n.getMessage("privacyLinkForDefaultServer", [
        "https://autobot.asia/privacy/"
      ])),
      (t.textContent = browser.i18n.getMessage("privacyNoteSlogan")),
      (a.textContent = browser.i18n.getMessage("continue")),
      Tracker.trackPageView(
        browser.runtime.getURL("privacyConfirmation/privacyConfirmation.html")
      );
  }
  function onConfirmClick() {
    e.updatePrivacySettings({ allowRemoteCheck: !0 }).then(() => {
      let e = `<h2>${browser.i18n.getMessage(
        "onboardingHeadline"
      )}</h2>\n\t\t\t<p>${browser.i18n.getMessage("onboardingIntro")}</p>`;
      BrowserDetector.isFirefox()
        ? (e += `<ul>\n\t\t\t\t\t<li>${browser.i18n.getMessage(
            "onboardingNote2"
          )}</li>\n\t\t\t\t\t<li>${browser.i18n.getMessage(
            "onboardingNote3"
          )}</li>\n\t\t\t\t</ul>`)
        : (e += `<ul>\n\t\t\t\t\t<li>${browser.i18n.getMessage(
            "onboardingNote1"
          )}</li>\n\t\t\t\t\t<li>${browser.i18n.getMessage(
            "onboardingNote2"
          )}</li>\n\t\t\t\t\t<li>${browser.i18n.getMessage(
            "onboardingNote3"
          )}</li>\n\t\t\t\t</ul>`),
        (o.innerHTML = e),
        (a.textContent = browser.i18n.getMessage("close")),
        (a.onclick = closeTab),
        n.remove();
    }),
      Tracker.trackEvent("Action", "accept_privacy_note", "autoCheck:true");
  }
  function closeTab() {
    browser.runtime.sendMessage({ command: "CLOSE_CURRENT_TAB" });
  }
  a.onclick = onConfirmClick;
}
